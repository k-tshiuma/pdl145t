const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'pdl-145t-super-secret-key-2026';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

const authorize = (permissions = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    let userPerms = [];
    try {
      userPerms = JSON.parse(req.user.permissions);
    } catch (e) {
      // Si ce n'est pas du JSON valide, on suppose un tableau vide ou un string simple
      if (typeof req.user.permissions === 'string') userPerms = [req.user.permissions];
    }
    
    // Check if user has all required permissions or is SUPER_ADMIN
    const hasRole = permissions.every(p => userPerms.includes(p)) || userPerms.includes('ALL_ACCESS') || req.user.roleName === 'SUPER_ADMIN';
    
    if (hasRole) {
      next();
    } else {
      res.status(403).json({ error: 'Privilèges insuffisants' });
    }
  };
};

module.exports = { authenticate, authorize, SECRET_KEY };
