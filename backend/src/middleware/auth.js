const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Auth middleware - verifies JWT token
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token using Supabase service client
    const supabase = req.app.get('supabase');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user profile from our users table
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('email', user.email)
      .single();

    if (!userProfile || !userProfile.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = userProfile;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Admin-only middleware
const requireAdmin = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

// Teacher or admin middleware
const requireTeacher = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (!['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Teacher access required' });
    }
    next();
  });
};

module.exports = { requireAuth, requireAdmin, requireTeacher };
