import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { TeacherList, TeacherCreate, TeacherEdit } from './pages/teachers';
import { StudentList, StudentCreate, StudentEdit } from './pages/students';
import { SessionList, SessionCreate, SessionEdit } from './pages/sessions';
import { InvoiceList, InvoiceCreate, InvoiceEdit } from './pages/invoices';
import { PayrollList, PayrollCreate, PayrollEdit } from './pages/payroll';
import './index.css';

function Dashboard() {
  const [stats, setStats] = useState({ teachers: 0, students: 0, sessions: 0, invoices: 0 });
  useEffect(() => {
    const fetchStats = async () => {
      const [t, s, sess, i] = await Promise.all([
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('sessions').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('*', { count: 'exact', head: true })
      ]);
      setStats({ teachers: t.count || 0, students: s.count || 0, sessions: sess.count || 0, invoices: i.count || 0 });
    };
    fetchStats();
  }, []);
  return (
    <div style={{padding:'2rem'}}>
      <h2 style={{marginBottom:'1.5rem'}}>لوحة التحكم</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1.5rem'}}>
        <div style={{background:'white',padding:'1.5rem',borderRadius:'12px',border:'1px solid #e0e0e0',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>👨‍🏫</div>
          <h3 style={{fontSize:'2rem',margin:'0.5rem 0',color:'#1976d2'}}>{stats.teachers}</h3>
          <p style={{margin:0,color:'#666'}}>المعلمون</p>
        </div>
        <div style={{background:'white',padding:'1.5rem',borderRadius:'12px',border:'1px solid #e0e0e0',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>👩‍🎓</div>
          <h3 style={{fontSize:'2rem',margin:'0.5rem 0',color:'#388e3c'}}>{stats.students}</h3>
          <p style={{margin:0,color:'#666'}}>الطلاب</p>
        </div>
        <div style={{background:'white',padding:'1.5rem',borderRadius:'12px',border:'1px solid #e0e0e0',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>📅</div>
          <h3 style={{fontSize:'2rem',margin:'0.5rem 0',color:'#f57c00'}}>{stats.sessions}</h3>
          <p style={{margin:0,color:'#666'}}>الجلسات</p>
        </div>
        <div style={{background:'white',padding:'1.5rem',borderRadius:'12px',border:'1px solid #e0e0e0',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>💰</div>
          <h3 style={{fontSize:'2rem',margin:'0.5rem 0',color:'#d32f2f'}}>{stats.invoices}</h3>
          <p style={{margin:0,color:'#666'}}>الفواتير</p>
        </div>
      </div>
    </div>
  );
}

function Layout({ children, user }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f5f5f5',direction:'rtl'}}>
      <div style={{width:'280px',background:'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',color:'white',padding:'1.5rem',display:'flex',flexDirection:'column'}}>
        <h1 style={{fontSize:'1.5rem',marginBottom:'0.5rem',fontWeight:'600'}}>Alfjr Academy</h1>
        <p style={{fontSize:'0.9rem',opacity:0.9,marginBottom:'2rem'}}>أكاديمية الفجر</p>
        {user && <p style={{fontSize:'0.85rem',marginBottom:'2rem',opacity:0.8}}>مرحباً، {user.email}</p>}
        <nav style={{flex:1}}>
          <Link to="/dashboard" style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 1rem',marginBottom:'0.5rem',borderRadius:'8px',textDecoration:'none',color:'white',transition:'background 0.2s'}}>
            <span style={{fontSize:'1.25rem'}}>🏠</span><span>لوحة التحكم</span>
          </Link>
          <Link to="/teachers" style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 1rem',marginBottom:'0.5rem',borderRadius:'8px',textDecoration:'none',color:'white',transition:'background 0.2s'}}>
            <span style={{fontSize:'1.25rem'}}>👨‍🏫</span><span>المعلمون</span>
          </Link>
          <Link to="/students" style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 1rem',marginBottom:'0.5rem',borderRadius:'8px',textDecoration:'none',color:'white',transition:'background 0.2s'}}>
            <span style={{fontSize:'1.25rem'}}>👩‍🎓</span><span>الطلاب</span>
          </Link>
          <Link to="/sessions" style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 1rem',marginBottom:'0.5rem',borderRadius:'8px',textDecoration:'none',color:'white',transition:'background 0.2s'}}>
            <span style={{fontSize:'1.25rem'}}>📅</span><span>الجلسات</span>
          </Link>
          <Link to="/invoices" style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 1rem',marginBottom:'0.5rem',borderRadius:'8px',textDecoration:'none',color:'white',transition:'background 0.2s'}}>
            <span style={{fontSize:'1.25rem'}}>🧾</span><span>الفواتير</span>
          </Link>
          <Link to="/payroll" style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 1rem',marginBottom:'0.5rem',borderRadius:'8px',textDecoration:'none',color:'white',transition:'background 0.2s'}}>
            <span style={{fontSize:'1.25rem'}}>💳</span><span>الرواتب</span>
          </Link>
        </nav>
        <button onClick={handleLogout} style={{background:'rgba(255,255,255,0.2)',color:'white',border:'none',padding:'0.75rem',borderRadius:'8px',cursor:'pointer',fontSize:'0.95rem',fontWeight:'500'}}>تسجيل الخروج</button>
      </div>
      <div style={{flex:1,overflow:'auto'}}>{children}</div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/dashboard');
    setLoading(false);
  };
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',direction:'rtl'}}>
      <div style={{background:'white',padding:'3rem',borderRadius:'16px',boxShadow:'0 10px 40px rgba(0,0,0,0.2)',maxWidth:'400px',width:'100%'}}>
        <h1 style={{textAlign:'center',marginBottom:'0.5rem',color:'#333'}}>Alfjr Academy</h1>
        <p style={{textAlign:'center',color:'#666',marginBottom:'2rem'}}>أكاديمية الفجر</p>
        {error && <p style={{color:'#d32f2f',background:'#ffebee',padding:'0.75rem',borderRadius:'8px',marginBottom:'1rem',fontSize:'0.9rem'}}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',padding:'0.75rem',marginBottom:'1rem',border:'1px solid #ddd',borderRadius:'8px',fontSize:'1rem',textAlign:'right'}} />
          <input type="password" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:'0.75rem',marginBottom:'1.5rem',border:'1px solid #ddd',borderRadius:'8px',fontSize:'1rem',textAlign:'right'}} />
          <button type="submit" disabled={loading} style={{width:'100%',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',color:'white',border:'none',padding:'0.875rem',borderRadius:'8px',fontSize:'1rem',fontWeight:'600',cursor:'pointer'}}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>جاري التحميل...</div>;
  if (!session) return <Navigate to="/login" />;
  return <Layout user={session.user}>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/teachers" element={<PrivateRoute><TeacherList /></PrivateRoute>} />
        <Route path="/teachers/create" element={<PrivateRoute><TeacherCreate /></PrivateRoute>} />
        <Route path="/teachers/edit/:id" element={<PrivateRoute><TeacherEdit /></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><StudentList /></PrivateRoute>} />
        <Route path="/students/create" element={<PrivateRoute><StudentCreate /></PrivateRoute>} />
        <Route path="/students/edit/:id" element={<PrivateRoute><StudentEdit /></PrivateRoute>} />
        <Route path="/sessions" element={<PrivateRoute><SessionList /></PrivateRoute>} />
        <Route path="/sessions/create" element={<PrivateRoute><SessionCreate /></PrivateRoute>} />
        <Route path="/sessions/edit/:id" element={<PrivateRoute><SessionEdit /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute><InvoiceList /></PrivateRoute>} />
        <Route path="/invoices/create" element={<PrivateRoute><InvoiceCreate /></PrivateRoute>} />
        <Route path="/invoices/edit/:id" element={<PrivateRoute><InvoiceEdit /></PrivateRoute>} />
        <Route path="/payroll" element={<PrivateRoute><PayrollList /></PrivateRoute>} />
        <Route path="/payroll/create" element={<PrivateRoute><PayrollCreate /></PrivateRoute>} />
        <Route path="/payroll/edit/:id" element={<PrivateRoute><PayrollEdit /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
