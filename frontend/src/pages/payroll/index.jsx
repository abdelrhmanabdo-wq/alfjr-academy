import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';

export const PayrollList = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('payroll').select('*, teacher:teachers(name)').order('created_at', { ascending: false });
    if (!error) setPayrolls(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    await supabase.from('payroll').delete().eq('id', id);
    fetchPayrolls();
  };

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>جاري التحميل...</div>;

  return (
    <div style={{padding:'2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h2 style={{margin:0}}>قائمة الرواتب</h2>
        <Link to='/payroll/create' style={{background:'#4CAF50',color:'white',padding:'0.5rem 1rem',borderRadius:'6px',textDecoration:'none'}}>+ إضافة راتب</Link>
      </div>
      {payrolls.length === 0 ? (
        <p>لا توجد رواتب حتى الآن.</p>
      ) : (
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f5f5f5'}}>              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>المعلم</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>الفترة</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>المبلغ</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>الحالة</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(p => (
              <tr key={p.id}>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{p.teacher?.name || 'N/A'}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{p.period}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{p.amount} جنيه</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>
                  <span style={{background: p.status==='paid'?'#e8f5e9':'#fff3e0', color: p.status==='paid'?'#388e3c':'#f57c00', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.85rem'}}>
                    {p.status === 'paid' ? 'مدفوع' : 'معلق'}
                  </span>
                </td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>
                  <Link to={`/payroll/edit/${p.id}`} style={{marginLeft:'0.5rem',color:'#1976d2'}}>تعديل</Link>
                  <button onClick={() => handleDelete(p.id)} style={{background:'#e53935',color:'white',border:'none',padding:'0.25rem 0.75rem',borderRadius:'4px',cursor:'pointer'}}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export const PayrollCreate = () => {
  const [form, setForm] = useState({ teacher_id: '', period: '', amount: 0, status: 'pending', notes: '' });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('teachers').select('id, name').then(({ data }) => setTeachers(data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('payroll').insert([form]);
    if (error) setMsg('خطأ: ' + error.message);
    else { setMsg('تم الإضافة بنجاح!'); setForm({ teacher_id: '', period: '', amount: 0, status: 'pending', notes: '' }); }
    setLoading(false);
  };

  return (
    <div style={{padding:'2rem',maxWidth:'600px'}}>
      <h2>إضافة راتب جديد</h2>
      {msg && <p style={{color: msg.includes('خطأ') ? 'red' : 'green'}}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <select value={form.teacher_id} onChange={e=>setForm({...form,teacher_id:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value=''>اختر معلم</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input placeholder='الفترة (مثل: يناير 2025)' value={form.period} onChange={e=>setForm({...form,period:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <input type='number' placeholder='المبلغ' value={form.amount} onChange={e=>setForm({...form,amount:parseFloat(e.target.value)})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value='pending'>معلق</option>
          <option value='paid'>مدفوع</option>
        </select>
        <textarea placeholder='ملاحظات' value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc',minHeight:'80px'}} />
        <button type='submit' disabled={loading} style={{background:'#4CAF50',color:'white',padding:'0.75rem',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'1rem'}}>
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </form>
    </div>
  );
};

export const PayrollEdit = () => {
  const id = window.location.pathname.split('/').pop();
  const [form, setForm] = useState({ teacher_id: '', period: '', amount: 0, status: 'pending', notes: '' });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('teachers').select('id, name').then(({ data }) => setTeachers(data || []));
    supabase.from('payroll').select('*').eq('id', id).single().then(({ data }) => { if (data) setForm(data); });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('payroll').update(form).eq('id', id);
    if (error) setMsg('خطأ: ' + error.message);
    else setMsg('تم التحديث بنجاح!');
    setLoading(false);
  };

  return (
    <div style={{padding:'2rem',maxWidth:'600px'}}>
      <h2>تعديل الراتب</h2>
      {msg && <p style={{color: msg.includes('خطأ') ? 'red' : 'green'}}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <select value={form.teacher_id||''} onChange={e=>setForm({...form,teacher_id:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value=''>اختر معلم</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input placeholder='الفترة (مثل: يناير 2025)' value={form.period||''} onChange={e=>setForm({...form,period:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <input type='number' placeholder='المبلغ' value={form.amount||0} onChange={e=>setForm({...form,amount:parseFloat(e.target.value)})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <select value={form.status||'pending'} onChange={e=>setForm({...form,status:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value='pending'>معلق</option>
          <option value='paid'>مدفوع</option>
        </select>
        <textarea placeholder='ملاحظات' value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc',minHeight:'80px'}} />
        <button type='submit' disabled={loading} style={{background:'#1976d2',color:'white',padding:'0.75rem',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'1rem'}}>
          {loading ? 'جاري الحفظ...' : 'تحديث'}
        </button>
      </form>
    </div>
  );
};
