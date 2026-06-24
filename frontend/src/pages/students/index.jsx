import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';

export const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (!error) setStudents(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    await supabase.from('students').delete().eq('id', id);
    fetchStudents();
  };

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>جاري التحميل...</div>;

  return (
    <div style={{padding:'2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h2 style={{margin:0}}>قائمة الطلاب</h2>
        <Link to='/students/create' style={{background:'#4CAF50',color:'white',padding:'0.5rem 1rem',borderRadius:'6px',textDecoration:'none'}}>+ إضافة طالب</Link>
      </div>
      {students.length === 0 ? (
        <p>لا يوجد طلاب حتى الآن.</p>
      ) : (
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f5f5f5'}}>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>الاسم</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>البريد الإلكتروني</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>رقم الهاتف</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>الحالة</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{s.name}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{s.email}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{s.phone}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>
                  <span style={{background: s.status==='active'?'#e8f5e9':'#fce4ec', color: s.status==='active'?'#388e3c':'#c62828', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.85rem'}}>
                    {s.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>
                  <Link to={`/students/edit/${s.id}`} style={{marginLeft:'0.5rem',color:'#1976d2'}}>تعديل</Link>
                  <button onClick={() => handleDelete(s.id)} style={{background:'#e53935',color:'white',border:'none',padding:'0.25rem 0.75rem',borderRadius:'4px',cursor:'pointer'}}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export const StudentCreate = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'active', grade: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('students').insert([form]);
    if (error) setMsg('خطأ: ' + error.message);
    else { setMsg('تم الإضافة بنجاح!'); setForm({ name: '', email: '', phone: '', status: 'active', grade: '', notes: '' }); }
    setLoading(false);
  };

  return (
    <div style={{padding:'2rem',maxWidth:'600px'}}>
      <h2>إضافة طالب جديد</h2>
      {msg && <p style={{color: msg.includes('خطأ') ? 'red' : 'green'}}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <input placeholder='الاسم' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <input placeholder='البريد الإلكتروني' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <input placeholder='رقم الهاتف' value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <input placeholder='الصف/المرحلة' value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value='active'>نشط</option>
          <option value='inactive'>غير نشط</option>
        </select>
        <textarea placeholder='ملاحظات' value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc',minHeight:'80px'}} />
        <button type='submit' disabled={loading} style={{background:'#4CAF50',color:'white',padding:'0.75rem',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'1rem'}}>
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </form>
    </div>
  );
};

export const StudentEdit = () => {
  const id = window.location.pathname.split('/').pop();
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'active', grade: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('students').select('*').eq('id', id).single().then(({ data }) => { if (data) setForm(data); });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('students').update(form).eq('id', id);
    if (error) setMsg('خطأ: ' + error.message);
    else setMsg('تم التحديث بنجاح!');
    setLoading(false);
  };

  return (
    <div style={{padding:'2rem',maxWidth:'600px'}}>
      <h2>تعديل الطالب</h2>
      {msg && <p style={{color: msg.includes('خطأ') ? 'red' : 'green'}}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <input placeholder='الاسم' value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <input placeholder='البريد الإلكتروني' value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <input placeholder='رقم الهاتف' value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <input placeholder='الصف/المرحلة' value={form.grade||''} onChange={e=>setForm({...form,grade:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <select value={form.status||'active'} onChange={e=>setForm({...form,status:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value='active'>نشط</option>
          <option value='inactive'>غير نشط</option>
        </select>
        <textarea placeholder='ملاحظات' value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc',minHeight:'80px'}} />
        <button type='submit' disabled={loading} style={{background:'#1976d2',color:'white',padding:'0.75rem',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'1rem'}}>
          {loading ? 'جاري الحفظ...' : 'تحديث'}
        </button>
      </form>
    </div>
  );
};
