const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET all students
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('students')
      .select(`*, users (id, full_name, email, phone, avatar_url, is_active)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('students')
      .select(`*, users (id, full_name, email, phone, avatar_url)`)
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Student not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create student
router.post('/', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { user_id, parent_name, parent_phone, parent_email, grade, level, subjects, notes } = req.body;
    const { data, error } = await supabase
      .from('students')
      .insert([{ user_id, parent_name, parent_phone, parent_email, grade, level, subjects, notes }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update student
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const updates = req.body;
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { error } = await supabase.from('students').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET student sessions
router.get('/:id/sessions', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('sessions')
      .select(`*, teachers (*, users (full_name, email))`)
      .eq('student_id', req.params.id)
      .order('scheduled_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET student payments
router.get('/:id/payments', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', req.params.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
