const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log('Auth middleware - headers:', req.headers);
    
    const token = req.headers.authorization.split(' ')[1];
    console.log('Token received:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}; 