import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';

export const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('sessions').select('*, teacher:teachers(name), student:students(name)').order('date', { ascending: false });
    if (!error) setSessions(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    await supabase.from('sessions').delete().eq('id', id);
    fetchSessions();
  };

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>جاري التحميل...</div>;

  return (
    <div style={{padding:'2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h2 style={{margin:0}}>قائمة الحصص</h2>
        <Link to='/sessions/create' style={{background:'#4CAF50',color:'white',padding:'0.5rem 1rem',borderRadius:'6px',textDecoration:'none'}}>+ إضافة حصة</Link>
      </div>
      {sessions.length === 0 ? (
        <p>لا توجد حصص حتى الآن.</p>
      ) : (
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f5f5f5'}}>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>التاريخ</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>الوقت</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>المعلم</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>الطالب</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>عدد الساعات</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>الحالة</th>
              <th style={{padding:'0.75rem',border:'1px solid #ddd',textAlign:'right'}}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id}>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{s.date}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{s.time}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{s.teacher?.name || 'N/A'}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{s.student?.name || 'N/A'}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>{s.hours}</td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>
                  <span style={{background: s.status==='completed'?'#e8f5e9':s.status==='cancelled'?'#fce4ec':'#fff3e0', color: s.status==='completed'?'#388e3c':s.status==='cancelled'?'#c62828':'#f57c00', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.85rem'}}>
                    {s.status === 'completed' ? 'مكتمل' : s.status === 'cancelled' ? 'ملغي' : 'مجدول'}
                  </span>
                </td>
                <td style={{padding:'0.75rem',border:'1px solid #ddd'}}>
                  <Link to={`/sessions/edit/${s.id}`} style={{marginLeft:'0.5rem',color:'#1976d2'}}>تعديل</Link>
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

export const SessionCreate = () => {
  const [form, setForm] = useState({ date: '', time: '', teacher_id: '', student_id: '', hours: 1, status: 'scheduled', notes: '' });
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('teachers').select('id, name').then(({ data }) => setTeachers(data || []));
    supabase.from('students').select('id, name').then(({ data }) => setStudents(data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('sessions').insert([form]);
    if (error) setMsg('خطأ: ' + error.message);
    else { setMsg('تم الإضافة بنجاح!'); setForm({ date: '', time: '', teacher_id: '', student_id: '', hours: 1, status: 'scheduled', notes: '' }); }
    setLoading(false);
  };

  return (
    <div style={{padding:'2rem',maxWidth:'600px'}}>
      <h2>إضافة حصة جديدة</h2>
      {msg && <p style={{color: msg.includes('خطأ') ? 'red' : 'green'}}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <input type='date' placeholder='التاريخ' value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <input type='time' placeholder='الوقت' value={form.time} onChange={e=>setForm({...form,time:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <select value={form.teacher_id} onChange={e=>setForm({...form,teacher_id:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value=''>اختر معلم</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value=''>اختر طالب</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type='number' placeholder='عدد الساعات' value={form.hours} onChange={e=>setForm({...form,hours:parseFloat(e.target.value)})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} min='0.5' step='0.5' />
        <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value='scheduled'>مجدول</option>
          <option value='completed'>مكتمل</option>
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

export const SessionEdit = () => {
  const id = window.location.pathname.split('/').pop();
  const [form, setForm] = useState({ date: '', time: '', teacher_id: '', student_id: '', hours: 1, status: 'scheduled', notes: '' });
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('teachers').select('id, name').then(({ data }) => setTeachers(data || []));
    supabase.from('students').select('id, name').then(({ data }) => setStudents(data || []));
    supabase.from('sessions').select('*').eq('id', id).single().then(({ data }) => { if (data) setForm(data); });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('sessions').update(form).eq('id', id);
    if (error) setMsg('خطأ: ' + error.message);
    else setMsg('تم التحديث بنجاح!');
    setLoading(false);
  };

  return (
    <div style={{padding:'2rem',maxWidth:'600px'}}>
      <h2>تعديل الحصة</h2>
      {msg && <p style={{color: msg.includes('خطأ') ? 'red' : 'green'}}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <input type='date' value={form.date||''} onChange={e=>setForm({...form,date:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <input type='time' value={form.time||''} onChange={e=>setForm({...form,time:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} />
        <select value={form.teacher_id||''} onChange={e=>setForm({...form,teacher_id:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value=''>اختر معلم</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={form.student_id||''} onChange={e=>setForm({...form,student_id:e.target.value})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value=''>اختر طالب</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type='number' value={form.hours||1} onChange={e=>setForm({...form,hours:parseFloat(e.target.value)})} required style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}} min='0.5' step='0.5' />
        <select value={form.status||'scheduled'} onChange={e=>setForm({...form,status:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc'}}>
          <option value='scheduled'>مجدول</option>
          <option value='completed'>مكتمل</option>
          <option value='cancelled'>ملغي</option>
        </select>
        <textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} style={{padding:'0.5rem',borderRadius:'4px',border:'1px solid #ccc',minHeight:'80px'}} />
        <button type='submit' disabled={loading} style={{background:'#1976d2',color:'white',padding:'0.75rem',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'1rem'}}>
          {loading ? 'جاري الحفظ...' : 'تحديث'}
        </button>
      </form>
    </div>
  );
};
