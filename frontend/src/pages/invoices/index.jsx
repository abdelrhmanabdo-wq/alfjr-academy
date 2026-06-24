import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('invoices').select('*, student:students(name)').order('created_at', { ascending: false });
    if (!error) setInvoices(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    await supabase.from('invoices').delete().eq('id', id);
    fetchInvoices();
  };

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>جاري التحميل...</div>;

  return (
    <div style={{padding:'2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h2 style={{margin:0}}>قائمة الفواتير</h2>
        <Link to='/invoices/create' style={{background:'#4CAF50',color:'white',padding:'0.5rem 1rem',borderRadius:'6px',textDecoration:'none'}}>+ إضافة فاتورة</Link>
      </div>
      {invoices.length === 0 ? (
        <p>لا توجد فواتير حتى الآن.</p>
      ) : (
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f5f5f5'}}>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>رقم الفاتورة</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>الطالب</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>المبلغ</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>الحالة</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{inv.invoice_number}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{inv.student?.name || 'N/A'}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{inv.amount} جنيه</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>
                  <span style={{background: inv.status==='paid'?'#e8f5e9':inv.status==='cancelled'?'#fce4ec':'#fff3e0', color: inv.status==='paid'?'#388e3c':inv.status==='cancelled'?'#c62828':'#f57c00', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.85rem'}}>
                    {inv.status === 'paid' ? 'مدفوع' : inv.status === 'cancelled' ? 'ملغي' : 'معلق'}
                  </span>
                </td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>
                  <Link to={`/invoices/edit/${inv.id}`} style={{marginLeft:'0.5rem',color:'#1976d2'}}>تعديل</Link>
                  <button onClick={() => handleDelete(inv.id)} style={{background:'#e53935',color:'white',border:'none',padding:'0.25rem 0.75rem',borderRadius:'4px',cursor:'pointer'}}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export const InvoiceCreate = () => {
  const [form, setForm] = useState({ invoice_number: '', student_id: '', amount: 0, status: 'pending', notes: '' });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('students').select('id, name').then(({ data }) => setStudents(data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('invoices').insert([form]);
    if (error) setMsg('خطأ: ' + error.message);
    else { setMsg('تم الإضافة بنجاح!'); setForm({ invoice_number: '', student_id: '', amount: 0, status: 'pending', notes: '' }); }
    setLoading(false);
  };

  return (
    <div style={{padding:'2rem',maxWidth:'600px'}}>
      <h2>إضافة فاتورة جديدة</h2>
      {msg && <p style={{color: msg.includes('خطأ') ? 'red' : 'green'}}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <input placeholder='رقم الفاتورة' value={form.invoice_number} onChange={e=>setForm({...form,invoice_number:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <select value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value=''>اختر طالب</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type='number' placeholder='المبلغ' value={form.amount} onChange={e=>setForm({...form,amount:parseFloat(e.target.value)})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value='pending'>معلق</option>
          <option value='paid'>مدفوع</option>
          <option value='cancelled'>ملغي</option>
        </select>
        <textarea placeholder='ملاحظات' value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc',minHeight:'80px'}} />
        <button type='submit' disabled={loading} style={{background:'#4CAF50',color:'white',padding:'0.75rem',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'1rem'}}>
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </form>
    </div>
  );
};

export const InvoiceEdit = () => {
  const id = window.location.pathname.split('/').pop();
  const [form, setForm] = useState({ invoice_number: '', student_id: '', amount: 0, status: 'pending', notes: '' });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('students').select('id, name').then(({ data }) => setStudents(data || []));
    supabase.from('invoices').select('*').eq('id', id).single().then(({ data }) => { if (data) setForm(data); });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('invoices').update(form).eq('id', id);
    if (error) setMsg('خطأ: ' + error.message);
    else setMsg('تم التحديث بنجاح!');
    setLoading(false);
  };

  return (
    <div style={{padding:'2rem',maxWidth:'600px'}}>
      <h2>تعديل الفاتورة</h2>
      {msg && <p style={{color: msg.includes('خطأ') ? 'red' : 'green'}}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <input placeholder='رقم الفاتورة' value={form.invoice_number||''} onChange={e=>setForm({...form,invoice_number:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <select value={form.student_id||''} onChange={e=>setForm({...form,student_id:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value=''>اختر طالب</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type='number' placeholder='المبلغ' value={form.amount||0} onChange={e=>setForm({...form,amount:parseFloat(e.target.value)})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <select value={form.status||'pending'} onChange={e=>setForm({...form,status:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value='pending'>معلق</option>
          <option value='paid'>مدفوع</option>
          <option value='cancelled'>ملغي</option>
        </select>
        <textarea placeholder='ملاحظات' value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc',minHeight:'80px'}} />
        <button type='submit' disabled={loading} style={{background:'#1976d2',color:'white',padding:'0.75rem',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'1rem'}}>
          {loading ? 'جاري الحفظ...' : 'تحديث'}
        </button>
      </form>
    </div>
  );
};
