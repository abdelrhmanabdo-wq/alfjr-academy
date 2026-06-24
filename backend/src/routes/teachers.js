const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET all teachers
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        users (id, full_name, email, phone, avatar_url, is_active)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single teacher
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('teachers')
      .select(`*, users (id, full_name, email, phone, avatar_url)`)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Teacher not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create teacher
router.post('/', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { user_id, subjects, levels, hourly_rate, bio, experience_years } = req.body;

    const { data, error } = await supabase
      .from('teachers')
      .insert([{ user_id, subjects, levels, hourly_rate, bio, experience_years }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update teacher
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { subjects, levels, hourly_rate, bio, experience_years, is_available } = req.body;

    const { data, error } = await supabase
      .from('teachers')
      .update({ subjects, levels, hourly_rate, bio, experience_years, is_available })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE teacher
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET teacher sessions
router.get('/:id/sessions', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('sessions')
      .select(`*, students (*, users (full_name, email))`)
      .eq('teacher_id', req.params.id)
      .order('scheduled_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
