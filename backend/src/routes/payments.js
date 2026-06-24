const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET all payments
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { type, status, from, to } = req.query;
    let query = supabase
      .from('payments')
      .select(`*, students (*, users (full_name)), teachers (*, users (full_name))`)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single payment
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('payments')
      .select(`*, students (*, users (full_name)), teachers (*, users (full_name))`)
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Payment not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create payment
router.post('/', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { type, student_id, teacher_id, amount, currency, description, due_date } = req.body;
    const invoice_number = `INV-${Date.now()}`;

    const { data, error } = await supabase
      .from('payments')
      .insert([{ type, student_id, teacher_id, amount, currency, description, due_date, invoice_number, created_by: req.user.id }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark payment as paid
router.patch('/:id/pay', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    // If student payment, add hours
    if (data.type === 'student_payment' && data.student_id) {
      const { data: student } = await supabase
        .from('students').select('*').eq('id', data.student_id).single();
      if (student) {
        const { data: pkg } = await supabase
          .from('hour_packages')
          .select('*')
          .eq('payment_id', data.id)
          .single();
        if (pkg) {
          await supabase.from('students').update({
            enrolled_hours: student.enrolled_hours + pkg.hours,
            remaining_hours: student.remaining_hours + pkg.hours,
            total_paid: student.total_paid + data.amount
          }).eq('id', data.student_id);
        }
      }
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update payment
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data, error } = await supabase
      .from('payments')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE payment
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { error } = await supabase.from('payments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET financial summary
router.get('/summary/financial', requireAdmin, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { from, to } = req.query;
    let query = supabase.from('payments').select('type, status, amount, currency');
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query;
    if (error) throw error;

    const summary = {
      total_revenue: data.filter(p => p.type === 'student_payment' && p.status === 'paid').reduce((s, p) => s + p.amount, 0),
      total_salaries: data.filter(p => p.type === 'teacher_salary' && p.status === 'paid').reduce((s, p) => s + p.amount, 0),
      total_expenses: data.filter(p => p.type === 'expense' && p.status === 'paid').reduce((s, p) => s + p.amount, 0),
      pending_payments: data.filter(p => p.status === 'pending').length,
      overdue_payments: data.filter(p => p.status === 'overdue').length,
    };
    summary.net_profit = summary.total_revenue - summary.total_salaries - summary.total_expenses;
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
