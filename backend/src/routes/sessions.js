const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET all sessions
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { status, teacher_id, student_id, from, to } = req.query;
    let query = supabase
      .from('sessions')
      .select(`
        *,
        teachers (*, users (full_name, email)),
        students (*, users (full_name, email))
      `)
      .order('scheduled_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (teacher_id) query = query.eq('teacher_id', teacher_id);
    if (student_id) query = query.eq('student_id', student_id);
    if (from) query = query.gte('scheduled_at', from);
    if (to) query = query.lte('scheduled_at', to);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single session
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('sessions')
      .select(`*, teachers (*, users (full_name, email)), students (*, users (full_name, email))`)
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Session not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create session
router.post('/', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { teacher_id, student_id, subject, scheduled_at, duration_hours, notes, meeting_link } = req.body;

    const { data, error } = await supabase
      .from('sessions')
      .insert([{ teacher_id, student_id, subject, scheduled_at, duration_hours, notes, meeting_link }])
      .select()
      .single();
    if (error) throw error;

    // Deduct hours from student remaining_hours
    await supabase.rpc('deduct_student_hours', {
      p_student_id: student_id,
      p_hours: duration_hours
    }).catch(() => {}); // Ignore if function not exists

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update session
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const updates = req.body;
    const { data, error } = await supabase
      .from('sessions')
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

// PATCH mark session as completed
router.patch('/:id/complete', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { teacher_notes } = req.body;
    const { data, error } = await supabase
      .from('sessions')
      .update({ status: 'completed', teacher_notes })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    // Update teacher total hours
    if (data) {
      await supabase
        .from('teachers')
        .update({ total_hours: supabase.raw('total_hours + ' + data.duration_hours) })
        .eq('id', data.teacher_id)
        .catch(() => {});
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH cancel session
router.patch('/:id/cancel', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { cancelled_reason } = req.body;
    const { data, error } = await supabase
      .from('sessions')
      .update({ status: 'cancelled', cancelled_reason })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE session
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { error } = await supabase.from('sessions').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
