const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// POST /api/auth/login - Login with email/password via Supabase Auth
router.post('/login', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Use Supabase Auth to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile from our users table
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active, phone')
      .eq('email', email.toLowerCase())
      .single();

    if (!userProfile || !userProfile.is_active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    res.json({
      token: data.session.access_token,
      user: userProfile
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register - Create new user (admin only in prod)
router.post('/register', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { email, password, full_name, phone, role } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full_name required' });
    }

    // Create auth user via Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    // Create profile in users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: email.toLowerCase(),
        full_name,
        phone,
        role: role || 'student'
      }])
      .select()
      .single();

    if (profileError) throw profileError;

    res.status(201).json({ user: userProfile });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    const supabase = req.app.get('supabase');

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
