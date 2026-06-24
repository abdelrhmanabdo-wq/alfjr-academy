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
import { StudentList, StudentCreate, StudentEdit } from './pages/students'
import { SessionList, SessionCreate, SessionEdit } from './pages/sessions'
import { InvoiceList, InvoiceCreate, InvoiceEdit } from './pages/invoices'
import { PayrollList, PayrollCreate, PayrollEdit } from './pages/payroll'
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
                meta: { label: 'المعلمون', icon: '👨‍🏫' }
              },
              {
                name: 'students',
                list: '/students',
                create: '/students/create',
                edit: '/students/edit/:id',
                meta: { label: 'الطلاب', icon: '👩‍🎓' }
              },
              {
                name: 'sessions',
                list: '/sessions',
                create: '/sessions/create',
                edit: '/sessions/edit/:id',
                meta: { label: 'الحصص', icon: '📅' }
              },
              {
                name: 'invoices',
                list: '/invoices',
                create: '/invoices/create',
                edit: '/invoices/edit/:id',
                meta: { label: 'الفواتير', icon: '💵' }
              },
              {
                name: 'payroll',
                list: '/payroll',
                create: '/payroll/create',
                edit: '/payroll/edit/:id',
                meta: { label: 'الرواتب', icon: '💰' }
              }
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              useNewQueryKeys: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2 Sider={() => <ThemedSiderV2 />}>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="teachers" />} />
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
                </Route>
                <Route path="/sessions">
                  <Route index element={<SessionList />} />
                  <Route path="create" element={<SessionCreate />} />
                  <Route path="edit/:id" element={<SessionEdit />} />
                </Route>
                <Route path="/invoices">
                  <Route index element={<InvoiceList />} />
                  <Route path="create" element={<InvoiceCreate />} />
                  <Route path="edit/:id" element={<InvoiceEdit />} />
                </Route>
                <Route path="/payroll">
                  <Route index element={<PayrollList />} />
                  <Route path="create" element={<PayrollCreate />} />
                  <Route path="edit/:id" element={<PayrollEdit />} />
                </Route>
                <Route path="*" element={<ErrorComponent />} />
              </Route>
              <Route
                element={
                  <Authenticated fallback={<Outlet />}>
                    <NavigateToResource />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<AuthPage type="login" />} />
                <Route path="/register" element={<AuthPage type="register" />} />
              </Route>
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  )
}
