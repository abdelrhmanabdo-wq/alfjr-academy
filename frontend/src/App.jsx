import { Refine, Authenticated } from '@refinedev/core'
import { dataProvider, liveProvider } from '@refinedev/supabase'
import { AuthPage, ErrorComponent, ThemedLayoutV2, ThemedSiderV2, useNotificationProvider } from '@refinedev/antd'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import routerBindings, { CatchAllNavigate, DocumentTitleHandler, NavigateToResource, UnsavedChangesNotifier } from '@refinedev/react-router-v6'
import { createClient } from '@supabase/supabase-js'
import { App as AntdApp, ConfigProvider } from 'antd'
import arEG from 'antd/locale/ar_EG'
import '@refinedev/antd/dist/reset.css'

import { TeacherList, TeacherCreate, TeacherEdit, TeacherShow } from './pages/teachers'
import { StudentList, StudentCreate, StudentEdit, StudentShow } from './pages/students'
import { SessionList, SessionCreate, SessionEdit, SessionShow } from './pages/sessions'
import { PaymentList, PaymentCreate, PaymentEdit } from './pages/payments'
import { InvoiceList, InvoiceCreate, InvoiceShow } from './pages/invoices'
import { PayrollList, PayrollCreate } from './pages/payroll'
import { Dashboard } from './pages/dashboard'
import { authProvider } from './authProvider'

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider locale={arEG} direction="rtl" theme={{ token: { colorPrimary: '#1677ff' } }}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider(supabaseClient)}
            liveProvider={liveProvider(supabaseClient)}
            authProvider={authProvider(supabaseClient)}
            routerProvider={routerBindings}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: 'teachers',
                list: '/teachers',
                create: '/teachers/create',
                edit: '/teachers/edit/:id',
                show: '/teachers/show/:id',
                meta: { label: 'المعلمون', icon: '👨‍🏫' }
              },
              {
                name: 'students',
                list: '/students',
                create: '/students/create',
                edit: '/students/edit/:id',
                show: '/students/show/:id',
                meta: { label: 'الطلاب', icon: '👩‍🎓' }
              },
              {
                name: 'sessions',
                list: '/sessions',
                create: '/sessions/create',
                edit: '/sessions/edit/:id',
                show: '/sessions/show/:id',
                meta: { label: 'الجلسات', icon: '📅' }
              },
              {
                name: 'payments',
                list: '/payments',
                create: '/payments/create',
                edit: '/payments/edit/:id',
                meta: { label: 'المدفوعات', icon: '💰' }
              },
              {
                name: 'invoices',
                list: '/invoices',
                create: '/invoices/create',
                show: '/invoices/show/:id',
                meta: { label: 'الفواتير', icon: '🧾' }
              },
              {
                name: 'payroll',
                list: '/payroll',
                create: '/payroll/create',
                meta: { label: 'رواتب المعلمين', icon: '💳' }
              },
            ]}
            options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="authenticated-inner" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2 Sider={() => <ThemedSiderV2 Title={() => <span style={{fontWeight:'bold',fontSize:16}}>أكاديمية الفجر</span>} />}>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="teachers" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/teachers">
                  <Route index element={<TeacherList />} />
                  <Route path="create" element={<TeacherCreate />} />
                  <Route path="edit/:id" element={<TeacherEdit />} />
                  <Route path="show/:id" element={<TeacherShow />} />
                </Route>
                <Route path="/students">
                  <Route index element={<StudentList />} />
                  <Route path="create" element={<StudentCreate />} />
                  <Route path="edit/:id" element={<StudentEdit />} />
                  <Route path="show/:id" element={<StudentShow />} />
                </Route>
                <Route path="/sessions">
                  <Route index element={<SessionList />} />
                  <Route path="create" element={<SessionCreate />} />
                  <Route path="edit/:id" element={<SessionEdit />} />
                  <Route path="show/:id" element={<SessionShow />} />
                </Route>
                <Route path="/payments">
                  <Route index element={<PaymentList />} />
                  <Route path="create" element={<PaymentCreate />} />
                  <Route path="edit/:id" element={<PaymentEdit />} />
                </Route>
                <Route path="/invoices">
                  <Route index element={<InvoiceList />} />
                  <Route path="create" element={<InvoiceCreate />} />
                  <Route path="show/:id" element={<InvoiceShow />} />
                </Route>
                <Route path="/payroll">
                  <Route index element={<PayrollList />} />
                  <Route path="create" element={<PayrollCreate />} />
                </Route>
              </Route>
              <Route
                element={
                  <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                    <NavigateToResource />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<AuthPage type="login" title={<div style={{textAlign:'center',padding:'16px 0'}}><h2 style={{color:'#1677ff',margin:0}}>أكاديمية الفجر</h2><p style={{color:'#888',margin:'4px 0 0'}}>دخول لوحة التحكم</p></div>} />} />
              </Route>
              <Route path="*" element={<ErrorComponent />} />
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  )
}
