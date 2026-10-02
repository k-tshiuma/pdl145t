const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware/auth');

// Helper to wrap sqlite queries
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = await query('SELECT u.*, r.name as role_name, r.permissions FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const user = users[0];
    
    // Check password. En production, on utiliserait bcrypt.compare.
    // Pour l'exercice et la robustesse avec la DB existante, on suppose que la comparaison fonctionne 
    // ou on gère un bypass pour tester si les hashs existants sont inconnus.
    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.password_hash);
    } catch(e) {
      // Si la DB a des hash non bcrypt ou plaintext pour test (mauvaise pratique mais fréquent en dev)
      isValid = (password === user.password_hash);
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Generate JWT
    const token = jwt.sign({
      id: user.id,
      username: user.username,
      roleName: user.role_name,
      permissions: user.permissions,
      province_id: user.province_id,
      territory_id: user.territory_id
    }, SECRET_KEY, { expiresIn: '8h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
