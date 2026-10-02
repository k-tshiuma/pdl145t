const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Assuming the DB is located relative to the statistics/backend folder
const dbPath = path.resolve(__dirname, '../../../births/backend/data/pdl145t.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database pdl145t.db:', err.message);
  } else {
    console.log('Connected to the PDL-145T SQLite database in READONLY mode.');
  }
});

module.exports = db;
