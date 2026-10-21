import { useState, useEffect } from 'react'
import { getIdTokenResult, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../config/firebase.js'

export const ADMIN_UIDS = [
  'fVQ8A8RLOZOrfjqe9mB3uZU7iJR2',
  'NvdsLwfkpkd4yHgBUaYOm1h8D1D3',
  'Bg7vsno7q8ZGVlZy2SpisDX2Um02',
]

export const ADMIN_EMAILS = [
  'sakthivelmurugadass@gmail.com',
  'admin@chaisupply.com',
  'admin@gmail.com',
  'admin2@gmail.com',
]

export function getDashboardPage(userRole) {
  if (userRole === 'admin') return 'adminDashboard'
  return 'buyerDashboard'
}

export function getStoredUserRole(userId) {
  const storedRole = window.localStorage.getItem(`chai-supply:role:${userId}`)
  return storedRole === 'buyer' || storedRole === 'admin' ? storedRole : null
}

export function useAuth(onUserAuthChanged) {
  const [role, setRole] = useState('buyer')
  const [authUser, setAuthUser] = useState(auth.currentUser)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let active = true

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Restore session if user authenticated via verified database credentials
        try {
          const rawSession = window.localStorage.getItem('chai-supply:session')
          if (rawSession) {
            const parsed = JSON.parse(rawSession)
            if (parsed && (parsed.uid || parsed.email)) {
              setAuthUser(parsed)
              const storedRole = getStoredUserRole(parsed.uid) || 'buyer'
              const isAdmin = ADMIN_UIDS.includes(parsed.uid) || ADMIN_EMAILS.includes(parsed.email)
              const effectiveRole = isAdmin ? 'admin' : storedRole
              setRole(effectiveRole)
              setAuthReady(true)
              if (onUserAuthChanged) onUserAuthChanged(parsed, effectiveRole)
              return
            }
          }
        } catch {}

        setAuthUser(null)
        setRole('buyer')
        setAuthReady(true)
        if (onUserAuthChanged) onUserAuthChanged(null, 'buyer')
        return
      }

      setAuthUser(user)
      setAuthReady(false)

      let effectiveRole = 'buyer'
      try {
        const { claims } = await getIdTokenResult(user, true)
        if (!active || auth.currentUser?.uid !== user.uid) return
        const isAdmin =
          ADMIN_UIDS.includes(user.uid) ||
          ADMIN_EMAILS.includes(user.email) ||
          claims.admin === true
        effectiveRole = isAdmin ? 'admin' : getStoredUserRole(user.uid) || 'buyer'
      } catch (error) {
        console.error('Unable to verify the signed-in user role:', error)
        if (!active || auth.currentUser?.uid !== user.uid) return
        const isAdmin = ADMIN_UIDS.includes(user.uid) || ADMIN_EMAILS.includes(user.email)
        effectiveRole = isAdmin ? 'admin' : getStoredUserRole(user.uid) || 'buyer'
      }

      setRole(effectiveRole)
      if (active && auth.currentUser?.uid === user.uid) {
        setAuthReady(true)
      }
      if (onUserAuthChanged) onUserAuthChanged(user, effectiveRole)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  async function completeAuth(userRole, userId, fallbackUser, navigate, notify) {
    const user = auth.currentUser || fallbackUser
    if (!user || (user.uid !== userId && user.email !== userId)) {
      throw new Error('The signed-in account could not be verified.')
    }

    let isAdmin =
      ADMIN_UIDS.includes(userId) ||
      (user.email && ADMIN_EMAILS.includes(user.email))

    if (user.getIdTokenResult) {
      try {
        const { claims } = await getIdTokenResult(user, true)
        if (claims.admin === true) isAdmin = true
      } catch {}
    }

    const effectiveRole = isAdmin ? 'admin' : userRole
    if (effectiveRole === 'admin') {
      window.localStorage.removeItem(`chai-supply:role:${userId}`)
    } else {
      window.localStorage.setItem(`chai-supply:role:${userId}`, effectiveRole)
    }

    setAuthUser(user)
    setRole(effectiveRole)

    if (onUserAuthChanged) onUserAuthChanged(user, effectiveRole)
    if (navigate) navigate(getDashboardPage(effectiveRole))

    const name = user.displayName || user.email?.split('@')[0] || (effectiveRole === 'admin' ? 'Marketplace admin' : 'User')
    if (notify) notify(`Welcome to ChaiSupply, ${name}`)
  }

  async function logOut(navigate) {
    try {
      window.localStorage.removeItem('chai-supply:session')
      await signOut(auth)
      setAuthUser(null)
      setRole('buyer')
      if (onUserAuthChanged) onUserAuthChanged(null, 'buyer')
      if (navigate) navigate('home')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    role,
    setRole,
    authUser,
    setAuthUser,
    authReady,
    completeAuth,
    logOut,
  }
}
