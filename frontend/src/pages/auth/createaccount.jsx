
import { useState } from 'react'
import { Icon } from '../../components/Icon.jsx'
import { AuthLayout } from '../../components/AuthLayout.jsx'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../../config/firebase.js'

export function CreateAccount({ onCreateAccount, navigate }) {
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')

    try {
      const cleanEmail = email.trim().toLowerCase()
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password)
      await updateProfile(credential.user, { displayName: businessName.trim() })

      // Save user record to database
      try {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: credential.user.uid,
            email: cleanEmail,
            displayName: businessName.trim(),
            password,
          }),
        }).catch(() => {})

        setDoc(
          doc(db, 'users', cleanEmail),
          {
            userId: credential.user.uid,
            email: cleanEmail,
            displayName: businessName.trim(),
            password,
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {})
      } catch {
        // Ignore background sync errors
      }

      await onCreateAccount('buyer', credential.user.uid)
    } catch (error) {
      const errorCode =
        error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
          ? error.code
          : ''

      switch (errorCode) {
        case 'auth/operation-not-allowed':
          setAuthError('Email/password sign-up is disabled. Enable it in Firebase Console under Authentication > Sign-in method.')
          break
        case 'auth/invalid-api-key':
          setAuthError('Firebase rejected the API key. Check the Firebase configuration and API key restrictions.')
          break
        case 'auth/invalid-email':
          setAuthError('Enter a valid email address.')
          break
        case 'auth/email-already-in-use':
          setAuthError('An account already exists with this email. Try logging in instead.')
          break
        case 'auth/weak-password':
          setAuthError('Choose a stronger password with at least 6 characters.')
          break
        default: {
          const message = error instanceof Error ? error.message : 'Unable to create your account.'
          setAuthError(errorCode ? `${message} (${errorCode})` : message)
        }
      }
    }
  }

  return (
    <AuthLayout>
      <form
        className="rounded-[11px] border border-[#eee4d9] bg-white p-[22px] shadow-[0_12px_35px_rgba(71,43,24,.08)] max-[680px]:p-[17px] [&_>_.muted]:mb-[13px] [&_>_.muted]:text-[9px] [&_>_label]:mt-3 [&_>_label]:flex [&_>_label]:flex-col [&_>_label]:gap-[5px] [&_>_label]:text-[9px] [&_>_label]:font-bold [&_>_label]:text-[#62564c]"
        onSubmit={handleSubmit}
      >
        <div className="mb-[18px] grid grid-cols-2 rounded-md bg-[#f7f3ef] p-[3px]">
          <button
            className="min-h-8 cursor-pointer rounded-[5px] border-0 bg-transparent text-[9px] text-[#81756a]"
            onClick={() => navigate('login')}
            type="button"
          >
            Login
          </button>
          <button
            className="min-h-8 cursor-pointer rounded-[5px] border-0 bg-white text-[9px] font-bold text-[#6f3e25] shadow-[0_1px_3px_#33231213]"
            onClick={() => navigate('createAccount')}
            type="button"
          >
            Create account
          </button>
        </div>
        <span className="inline-block text-[9px] font-extrabold leading-[1.25] tracking-[.65px] text-[#9e642e]">
          JOIN THE LOCAL NETWORK
        </span>
        <h2 className="my-[5px] font-serif text-[21px] text-[#4c3322]">
          Create your account
        </h2>
        <p className="text-[#77716c]">
          Get started with your local wholesale market.
        </p>
        {authError && (
          <p className="mt-3 text-[10px] text-red-700" role="alert">
            {authError}
          </p>
        )}

        <label className="mt-3 flex flex-col gap-[5px] text-[9px] font-bold text-[#62564c]">
          Your name or business name
          <input
            className="box-border min-h-9 w-full rounded-[5px] border border-[#e7ded4] px-[10px] py-2 text-[9px] text-[#43382f] outline-[#c79670]"
            placeholder="Your name or business name"
            required
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
          />
        </label>
        <label className="mt-3 flex flex-col gap-[5px] text-[9px] font-bold text-[#62564c]">
          Email or mobile number
          <input
            className="box-border min-h-9 w-full rounded-[5px] border border-[#e7ded4] px-[10px] py-2 text-[9px] text-[#43382f] outline-[#c79670]"
            placeholder="you@example.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mt-3 flex flex-col gap-[5px] text-[9px] font-bold text-[#62564c]">
          Password
          <input
            className="box-border min-h-9 w-full rounded-[5px] border border-[#e7ded4] px-[10px] py-2 text-[9px] text-[#43382f] outline-[#c79670]"
            minLength="6"
            placeholder="Create a password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          className="mt-[15px] inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-[9px] rounded-[7px] border border-transparent bg-[#6f3e25] px-[17px] text-[12px] font-bold leading-[1.2] text-white shadow-[0_3px_8px_rgba(81,43,23,.13)] transition hover:-translate-y-px hover:bg-[#522d19] [&_.icon]:size-[15px]"
          type="submit"
        >
          Create account
          <Icon name="arrow" />
        </button>
        <small className="mt-[11px] block text-center text-[7px] text-[#90857c]">
          By continuing, you agree to our Terms of Use and Privacy Policy.
        </small>
      </form>
    </AuthLayout>
  )
}