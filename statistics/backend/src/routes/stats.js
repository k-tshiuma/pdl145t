const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to wrap sqlite queries in promises
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// GET /api/stats/kpi
router.get('/kpi', async (req, res) => {
  const { province_id, territory_id } = req.query;

  let parentWhere = [];
  let childWhere = [];
  let parentParams = [];
  let childParams = [];

  // Robustly handle geographic filters
  if (province_id) {
    parentWhere.push('p.province_id = ?');
    parentParams.push(province_id);
    
    // Pour les enfants, on passe par le health_center du birth, vers territory, vers province (si on l'avait). 
    // Pour simplifier et être robuste avec pdl145t.db, on va filtrer via la sous-requête :
    childWhere.push(`c.id IN (
      SELECT b.child_id FROM births b
      JOIN health_centers hc ON b.health_center_id = hc.id
      JOIN territoire t ON hc.territory_id = t.territoire_id
      WHERE t.province_id = ?
    )`);
    childParams.push(province_id);
  }

  if (territory_id) {
    parentWhere.push('p.territory_id = ?');
    parentParams.push(territory_id);

    childWhere.push(`c.id IN (
      SELECT b.child_id FROM births b
      JOIN health_centers hc ON b.health_center_id = hc.id
      WHERE hc.territory_id = ?
    )`);
    childParams.push(territory_id);
  }

  const pWhereStr = parentWhere.length > 0 ? 'WHERE ' + parentWhere.join(' AND ') : '';
  const cWhereStr = childWhere.length > 0 ? 'WHERE ' + childWhere.join(' AND ') : '';

  try {
    const menResult = await query(`SELECT COUNT(*) as count FROM parents p ${pWhereStr} ${pWhereStr ? 'AND' : 'WHERE'} p.gender = 'M'`, parentParams);
    const womenResult = await query(`SELECT COUNT(*) as count FROM parents p ${pWhereStr} ${pWhereStr ? 'AND' : 'WHERE'} p.gender = 'F'`, parentParams);
    const childrenResult = await query(`SELECT COUNT(*) as count FROM children c ${cWhereStr}`, childParams);

    const men = menResult[0].count;
    const women = womenResult[0].count;
    const children = childrenResult[0].count;
    const total = men + women + children;

    res.json({ population_totale: total, hommes: men, femmes: women, enfants: children });
  } catch (error) {
    console.error('API Error (KPI):', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats/geo
router.get('/geo', async (req, res) => {
  try {
    const provinces = await query("SELECT id, name as province_name, code FROM provinces ORDER BY name ASC");
    const territoires = await query(`
      SELECT t.territoire_id as id, t.territoire_name as name, t.province_id 
      FROM territoire t
      ORDER BY t.territoire_name ASC
    `);
    res.json({ provinces, territoires });
  } catch (error) {
    console.error('API Error (Geo):', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats/pyramid
router.get('/pyramid', async (req, res) => {
  const { province_id, territory_id } = req.query;

  let parentWhere = [];
  let childWhere = [];
  let parentParams = [];
  let childParams = [];

  if (province_id) {
    parentWhere.push('p.province_id = ?'); parentParams.push(province_id);
    childWhere.push(`c.id IN (SELECT b.child_id FROM births b JOIN health_centers hc ON b.health_center_id = hc.id JOIN territoire t ON hc.territory_id = t.territoire_id WHERE t.province_id = ?)`);
    childParams.push(province_id);
  }
  if (territory_id) {
    parentWhere.push('p.territory_id = ?'); parentParams.push(territory_id);
    childWhere.push(`c.id IN (SELECT b.child_id FROM births b JOIN health_centers hc ON b.health_center_id = hc.id WHERE hc.territory_id = ?)`);
    childParams.push(territory_id);
  }

  const pWhereStr = parentWhere.length > 0 ? 'WHERE ' + parentWhere.join(' AND ') : '';
  const cWhereStr = childWhere.length > 0 ? 'WHERE ' + childWhere.join(' AND ') : '';

  try {
    const parentsAge = await query(`
      SELECT gender, CAST((julianday('now') - julianday(birth_date)) / 365.25 AS INTEGER) as age
      FROM parents p ${pWhereStr}
    `, parentParams);

    const childrenAge = await query(`
      SELECT gender, CAST((julianday('now') - julianday(birth_datetime)) / 365.25 AS INTEGER) as age
      FROM children c ${cWhereStr}
    `, childParams);

    const buckets = [
      { ageGroup: '65+', min: 65, max: 999, male: 0, female: 0 },
      { ageGroup: '55-64', min: 55, max: 64, male: 0, female: 0 },
      { ageGroup: '45-54', min: 45, max: 54, male: 0, female: 0 },
      { ageGroup: '35-44', min: 35, max: 44, male: 0, female: 0 },
      { ageGroup: '25-34', min: 25, max: 34, male: 0, female: 0 },
      { ageGroup: '15-24', min: 15, max: 24, male: 0, female: 0 },
      { ageGroup: '05-14', min: 5, max: 14, male: 0, female: 0 },
      { ageGroup: '00-04', min: 0, max: 4, male: 0, female: 0 },
    ];

    const processPerson = (person) => {
      const age = person.age || 0;
      const gender = person.gender === 'F' ? 'female' : 'male'; // Defaulting unknown to male or skipping
      for (let b of buckets) {
        if (age >= b.min && age <= b.max) {
          b[gender] += 1;
          break;
        }
      }
    };

    parentsAge.forEach(processPerson);
    childrenAge.forEach(processPerson);

    // Format for Recharts pyramid: males usually negative for left-side display
    const chartData = buckets.map(b => ({
      ageGroup: b.ageGroup,
      male: -Math.abs(b.male), // Negative for left side of the chart
      female: b.female,
      maleRaw: b.male // Keep raw for tooltips
    }));

    res.json(chartData);
  } catch (error) {
    console.error('API Error (Pyramid):', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats/map
router.get('/map', async (req, res) => {
  // Agrégation simple par province pour la carte choroplèthe
  try {
    const provinceStats = await query(`
      SELECT pr.id, pr.code, pr.name as province_name,
        (SELECT COUNT(*) FROM parents p WHERE p.province_id = pr.id) as parents_count
      FROM provinces pr
    `);
    
    // In a real app we'd also aggregate children via births -> health_centers -> territories -> provinces
    // For MVP, we will send this structure and calculate total if possible.

    res.json(provinceStats);
  } catch (error) {
    console.error('API Error (Map):', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/stats/export
// Nécessite des privilèges d'export (RBAC) - que nous appliquerons via le middleware dans server.js
const { Parser } = require('json2csv');

router.get('/export', async (req, res) => {
  const { province_id, territory_id, format } = req.query;
  
  // Exemple simple d'export CSV pour les KPIs territoriaux
  try {
    const rawData = await query(`
      SELECT pr.name as Province, t.territoire_name as Territoire,
             (SELECT COUNT(*) FROM parents p WHERE p.territory_id = t.territoire_id AND p.gender = 'M') as Hommes,
             (SELECT COUNT(*) FROM parents p WHERE p.territory_id = t.territoire_id AND p.gender = 'F') as Femmes
      FROM territoire t
      JOIN provinces pr ON t.province_id = pr.id
      ${province_id ? 'WHERE pr.id = ?' : ''}
      ORDER BY pr.name, t.territoire_name
    `, province_id ? [province_id] : []);

    if (format === 'csv') {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(rawData);
      
      res.header('Content-Type', 'text/csv');
      res.attachment('statistiques_demographiques.csv');
      return res.send(csv);
    }
    
    // Fallback JSON if not csv
    res.json(rawData);

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de l\'export' });
  }
});

module.exports = router;
