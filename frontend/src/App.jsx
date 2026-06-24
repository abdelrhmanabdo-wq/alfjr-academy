import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

const AuthContext = createContext(null)

function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    return supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{background:'white',padding:'40px',borderRadius:'12px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',width:'100%',maxWidth:'400px'}}>
        <h1 style={{textAlign:'center',marginBottom:'8px',color:'#1a73e8'}}>Alfjr Academy</h1>
        <p style={{textAlign:'center',color:'#666',marginBottom:'32px'}}>أكاديمية الفجر للتعليم</p>
        {error && <div style={{background:'#fdecea',color:'#c62828',padding:'12px',borderRadius:'8px',marginBottom:'16px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',padding:'10px 14px',border:'1px solid #dadce0',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}} placeholder="example@email.com" />
          </div>
          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block',marginBottom:'6px',fontWeight:'600'}}>كلمة المرور</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:'10px 14px',border:'1px solid #dadce0',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}} />
          </div>
          <button type="submit" disabled={loading} style={{width:'100%',padding:'12px',background:'#1a73e8',color:'white',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'600',cursor:'pointer'}}>
            {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  )
}

const navItems = [
  { path: '/dashboard', label: 'لوحة التحكم', icon: '🏠' },
  { path: '/teachers', label: 'المعلمون', icon: '👨‍🏫' },
  { path: '/students', label: 'الطلاب', icon: '👩‍🎓' },
  { path: '/parents', label: 'أولياء الأمور', icon: '👪' },
  { path: '/sessions', label: 'الجلسات', icon: '📅' },
  { path: '/invoices', label: 'الفواتير', icon: '🧾' },
  { path: '/payments', label: 'المدفوعات', icon: '💰' },
  { path: '/payroll', label: 'الرواتب', icon: '💳' },
  { path: '/reports', label: 'التقارير', icon: '📊' },
]

function Sidebar({ onSignOut }) {
  const location = useLocation()
  return (
    <div style={{width:'240px',background:'#1a73e8',minHeight:'100vh',display:'flex',flexDirection:'column',color:'white'}}>
      <div style={{padding:'24px 20px',borderBottom:'1px solid rgba(255,255,255,0.2)'}}>
        <h2 style={{margin:0,fontSize:'18px'}}>Alfjr Academy</h2>
        <p style={{margin:'4px 0 0',opacity:0.8,fontSize:'12px'}}>أكاديمية الفجر</p>
      </div>
      <nav style={{flex:1,padding:'16px 0'}}>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 20px',color:'white',textDecoration:'none',background:location.pathname.startsWith(item.path)?'rgba(255,255,255,0.2)':'transparent',borderLeft:location.pathname.startsWith(item.path)?'3px solid white':'3px solid transparent'}}>
            <span>{item.icon}</span>
            <span style={{fontSize:'14px'}}>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div style={{padding:'16px 20px',borderTop:'1px solid rgba(255,255,255,0.2)'}}>
        <button onClick={onSignOut} style={{background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.3)',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',width:'100%'}}>تسجيل الخروج</button>
      </div>
    </div>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div style={{padding:'32px'}}>
      <h1 style={{color:'#1a73e8',marginBottom:'16px'}}>{title}</h1>
      <div style={{background:'white',borderRadius:'12px',padding:'32px',boxShadow:'0 1px 3px rgba(0,0,0,0.1)',textAlign:'center',color:'#666'}}>
        <p style={{fontSize:'48px',marginBottom:'16px'}}>🚧</p>
        <p>هذه الصفحة قيد التطوير</p>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  return (
    <div style={{padding:'32px'}}>
      <h1 style={{color:'#1a73e8',marginBottom:'8px'}}>لوحة التحكم</h1>
      <p style={{color:'#666',marginBottom:'32px'}}>مرحباً، {user?.email}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px'}}>
        {[{title:'المعلمون',icon:'👨‍🏫',color:'#1a73e8'},{title:'الطلاب',icon:'👩‍🎓',color:'#34a853'},{title:'الجلسات',icon:'📅',color:'#fbbc04'},{title:'الإيرادات',icon:'💰',color:'#ea4335'}].map(card=>(
          <div key={card.title} style={{background:'white',borderRadius:'12px',padding:'24px',boxShadow:'0 1px 3px rgba(0,0,0,0.1)',borderTop:`4px solid ${card.color}`}}>
            <div style={{fontSize:'32px',marginBottom:'8px'}}>{card.icon}</div>
            <div style={{fontSize:'24px',fontWeight:'700',color:card.color}}>0</div>
            <div style={{color:'#666',fontSize:'14px'}}>{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Layout() {
  const { signOut } = useAuth()
  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar onSignOut={signOut} />
      <main style={{flex:1,background:'#f8f9fa',overflow:'auto'}}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teachers" element={<PlaceholderPage title="المعلمون" />} />
          <Route path="/students" element={<PlaceholderPage title="الطلاب" />} />
          <Route path="/parents" element={<PlaceholderPage title="أولياء الأمور" />} />
          <Route path="/sessions" element={<PlaceholderPage title="الجلسات" />} />
          <Route path="/invoices" element={<PlaceholderPage title="الفواتير" />} />
          <Route path="/payments" element={<PlaceholderPage title="المدفوعات" />} />
          <Route path="/payroll" element={<PlaceholderPage title="الرواتب" />} />
          <Route path="/reports" element={<PlaceholderPage title="التقارير" />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedRoute><Layout /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}
