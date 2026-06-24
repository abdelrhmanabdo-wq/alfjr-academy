const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET dashboard stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');

    const [students, teachers, sessions, payments] = await Promise.all([
      supabase.from('students').select('id, remaining_hours, total_paid', { count: 'exact' }),
      supabase.from('teachers').select('id, is_available', { count: 'exact' }),
      supabase.from('sessions').select('id, status, duration_hours', { count: 'exact' }),
      supabase.from('payments').select('type, status, amount')
    ]);

    const totalRevenue = (payments.data || [])
      .filter(p => p.type === 'student_payment' && p.status === 'paid')
      .reduce((s, p) => s + parseFloat(p.amount), 0);

    const totalSalaries = (payments.data || [])
      .filter(p => p.type === 'teacher_salary' && p.status === 'paid')
      .reduce((s, p) => s + parseFloat(p.amount), 0);

    const completedSessions = (sessions.data || []).filter(s => s.status === 'completed');
    const totalHoursTaught = completedSessions.reduce((s, sess) => s + parseFloat(sess.duration_hours), 0);

    res.json({
      students: {
        total: students.count || 0,
        active: (students.data || []).filter(s => s.remaining_hours > 0).length
      },
      teachers: {
        total: teachers.count || 0,
        available: (teachers.data || []).filter(t => t.is_available).length
      },
      sessions: {
        total: sessions.count || 0,
        completed: completedSessions.length,
        scheduled: (sessions.data || []).filter(s => s.status === 'scheduled').length,
        cancelled: (sessions.data || []).filter(s => s.status === 'cancelled').length,
        total_hours_taught: totalHoursTaught
      },
      finances: {
        total_revenue: totalRevenue,
        total_salaries: totalSalaries,
        net_profit: totalRevenue - totalSalaries,
        pending_payments: (payments.data || []).filter(p => p.status === 'pending').length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET upcoming sessions
router.get('/upcoming-sessions', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('sessions')
      .select(`*, teachers (*, users (full_name)), students (*, users (full_name))`)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(10);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET low hours students (less than 2 hours remaining)
router.get('/low-hours-students', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('students')
      .select(`*, users (full_name, email, phone)`)
      .lt('remaining_hours', 2)
      .order('remaining_hours', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET overdue payments
router.get('/overdue-payments', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('payments')
      .select(`*, students (*, users (full_name, email)), teachers (*, users (full_name))`)
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
