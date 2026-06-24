export const authProvider = (supabaseClient) => ({
  login: async ({ email, password }) => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error }
    return { success: true, redirectTo: '/' }
  },
  logout: async () => {
    await supabaseClient.auth.signOut()
    return { success: true, redirectTo: '/login' }
  },
  check: async () => {
    const { data } = await supabaseClient.auth.getSession()
    if (data.session) return { authenticated: true }
    return { authenticated: false, redirectTo: '/login' }
  },
  getPermissions: async () => {
    const { data } = await supabaseClient.auth.getUser()
    return data?.user?.role ?? null
  },
  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser()
    if (data?.user) return { id: data.user.id, name: data.user.email, avatar: null }
    return null
  },
  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) return { logout: true }
    return { error }
  },
})
