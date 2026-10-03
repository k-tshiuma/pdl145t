import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiApp } from './server/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(apiApp);

// Serve static frontend build
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PDL-145T Server running at http://0.0.0.0:${PORT}`);
});
