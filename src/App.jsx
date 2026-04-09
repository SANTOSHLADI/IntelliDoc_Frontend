import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Dashboard from './components/Dashboard'
import SignUpPage from './components/SignUpPage'

const USERS_STORAGE_KEY = 'intellidoc-users'
const SESSION_STORAGE_KEY = 'intellidoc-session'

function readStoredUsers() {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function readStoredSession() {
  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export default function App() {
  const [registeredUsers, setRegisteredUsers] = useState(readStoredUsers)
  const [currentUser, setCurrentUser] = useState(readStoredSession)

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers))
  }, [registeredUsers])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser))
      return
    }

    localStorage.removeItem(SESSION_STORAGE_KEY)
  }, [currentUser])

  const authActions = useMemo(() => ({
    onSignUp: (formData) => {
      const normalizedEmail = formData.workEmail.trim().toLowerCase()
      const alreadyExists = registeredUsers.some((user) => user.workEmail.toLowerCase() === normalizedEmail)

      if (alreadyExists) {
        toast.error('An account with this email already exists.')
        return false
      }

      const nextUser = {
        fullName: formData.fullName.trim(),
        workEmail: normalizedEmail,
        company: formData.company.trim(),
        role: formData.role.trim(),
        password: formData.password,
      }

      setRegisteredUsers((current) => [...current, nextUser])
      setCurrentUser(nextUser)
      toast.success('Account created successfully.')
      return true
    },
    onLogin: (formData) => {
      const normalizedEmail = formData.workEmail.trim().toLowerCase()
      const matchedUser = registeredUsers.find(
        (user) => user.workEmail.toLowerCase() === normalizedEmail && user.password === formData.password,
      )

      if (!matchedUser) {
        toast.error('Invalid email or password.')
        return false
      }

      setCurrentUser(matchedUser)
      toast.success(`Welcome back, ${matchedUser.fullName}.`)
      return true
    },
  }), [registeredUsers])

  const handleLogout = () => {
    setCurrentUser(null)
    toast.info('You have been logged out.')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            currentUser ? (
              <Dashboard currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <SignUpPage {...authActions} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  )
}
