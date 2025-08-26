import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, getIdTokenResult } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// TODO: copy config from web .env or firebase.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
getFirestore(app)

function AdminGate({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }
      try {
        const token = await getIdTokenResult(user, true)
        const hasAdmin = token.claims?.role === 'Admin' || token.claims?.admin === true
        setIsAdmin(!!hasAdmin)
      } catch (e) {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  if (loading) return <div style={{padding:20}}>Loading...</div>
  if (!isAdmin) return <Navigate to="/login" replace />
  return children
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setStatus('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const token = await getIdTokenResult(cred.user, true)
      const isAdmin = token.claims?.role === 'Admin' || token.claims?.admin === true
      if (!isAdmin) {
        setStatus('Access denied: Admin role required')
        await signOut(auth)
        return
      }
      navigate('/')
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div style={{maxWidth:420, margin:'80px auto', padding:24, border:'1px solid #e5e7eb', borderRadius:12}}>
      <h2>Domio Admin</h2>
      <p>Admin access only. Sign in with admin account.</p>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="email" value={email} onChange={(e)=>setEmail(e.target.value)} style={{width:'100%',padding:10,marginBottom:10}} />
        <input type="password" placeholder="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{width:'100%',padding:10,marginBottom:10}} />
        <button type="submit" style={{padding:'10px 16px'}}>Sign In</button>
      </form>
      {status && <div style={{marginTop:8, color:'#dc2626'}}>{status}</div>}
    </div>
  )
}

function Shell() {
  const navigate = useNavigate()
  const doLogout = async () => { await signOut(auth); navigate('/login') }
  return (
    <div style={{maxWidth:1200, margin:'0 auto', padding:20}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h1>Admin Dashboard</h1>
        <nav style={{display:'flex',gap:12}}>
          <Link to="/">Overview</Link>
          <Link to="/users">Users</Link>
          <Link to="/system">System</Link>
          <button onClick={doLogout}>Logout</button>
        </nav>
      </header>
      <Routes>
        <Route index element={<div>Overview</div>} />
        <Route path="users" element={<div>Users</div>} />
        <Route path="system" element={<div>System</div>} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<AdminGate><Shell /></AdminGate>} />
    </Routes>
  )
}

