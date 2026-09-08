import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import FacultySignUpPage from './pages/FacultySignUpPage'
import Dashboard from './pages/Dashboard'

type AuthView = 'login' | 'signup'

// Fallback "logged in" state used when the faculty member hits Log In
// without typing an email/password (see LoginPage's onDemoLogin). It's
// shaped like a real Supabase Session/User so the rest of the app (which
// only ever reads session.user.email / user_metadata) can't tell the
// difference.
const DEMO_USER: User = {
  id: 'demo-faculty-user',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'juan.delacruz@demo.appointpro.edu',
  app_metadata: {},
  user_metadata: { full_name: 'Dr. Juan Dela Cruz', role: 'faculty' },
  created_at: new Date().toISOString(),
}

const DEMO_SESSION: Session = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: DEMO_USER,
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [authView, setAuthView] = useState<AuthView>('login')
  // True while the person is browsing the demo/no-credentials session
  // instead of a real Supabase-authenticated one.
  const [isDemoSession, setIsDemoSession] = useState(false)

  useEffect(() => {
    // Restore an existing session on page load/refresh...
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })

    // ...and keep it in sync afterwards (login, logout, token refresh).
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      },
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  if (checkingSession) {
    return null
  }

  if (session || isDemoSession) {
    return (
      <Dashboard
        session={session ?? DEMO_SESSION}
        onLogout={async () => {
          if (session) {
            await supabase.auth.signOut()
          }
          setIsDemoSession(false)
        }}
      />
    )
  }

  if (authView === 'signup') {
    return (
      <FacultySignUpPage
        onLogin={() => setAuthView('login')}
        onSuccess={() => {
          // Sign-up succeeded; FacultySignUpPage shows its own "check your
          // email" confirmation screen and its "Go to Log in" button calls
          // onLogin above, so there's nothing extra to do here.
        }}
      />
    )
  }

  return (
    <LoginPage
      onSignUp={() => setAuthView('signup')}
      onForgotPassword={() => {
        // No dedicated "forgot password" screen exists yet. Wire this up
        // to supabase.auth.resetPasswordForEmail(...) once you add one.
        window.alert("Forgot password isn't set up yet.")
      }}
      onSuccess={() => {
        // onAuthStateChange above already updates `session` the moment
        // Supabase signs the user in, which re-renders into <Dashboard>.
      }}
      onDemoLogin={() => {
        // No credentials were entered — drop straight into the dashboard
        // with a local demo session instead of calling Supabase.
        setIsDemoSession(true)
      }}
    />
  )
}

export default App