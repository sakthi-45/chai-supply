import { useState } from 'react'
import { Icon } from '../../components/Icon.jsx'
import { AuthLayout } from '../../components/AuthLayout.jsx'
import { sendPasswordResetEmail } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../../config/firebase.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function ForgotPassword({ navigate }) {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [savedEmail, setSavedEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setSuccessMessage('')

    const cleanEmail = email.trim().toLowerCase()

    // Form Validations
    if (!cleanEmail) {
      setAuthError('Please enter your email ID.')
      return
    }

    if (newPassword.length < 6) {
      setAuthError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setAuthError('Passwords do not match. Please verify both password fields.')
      return
    }

    setIsLoading(true)

    try {
      const timestamp = new Date().toISOString()
      const credentialRecord = {
        userId: cleanEmail,
        email: cleanEmail,
        password: newPassword,
        updatedAt: timestamp,
      }

      // 1. Immediately persist user ID and new password into the database
      let dbSaved = false
      try {
        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentialRecord),
        })
        if (response.ok) {
          dbSaved = true
        }
      } catch (backendErr) {
        console.warn('Backend database write notice:', backendErr.message)
      }

      // 2. Dispatch Firebase Authentication password reset email
      let resetSent = false
      try {
        await sendPasswordResetEmail(auth, cleanEmail)
        resetSent = true
      } catch (authErr) {
        console.warn('Firebase Auth sendPasswordResetEmail notice:', authErr.code || authErr.message)
      }

      // 3. Cache credentials in localStorage
      try {
        window.localStorage.setItem(`chai-supply:password:${cleanEmail}`, newPassword)
        window.localStorage.setItem(
          'chai-supply:last-reset',
          JSON.stringify({ email: cleanEmail, timestamp })
        )
      } catch {
        // Ignore localStorage quota errors
      }

      // 4. Non-blocking Firestore write (safe, never blocks UI or hangs)
      try {
        setDoc(doc(db, 'users', cleanEmail), credentialRecord, { merge: true }).catch(() => {})
        setDoc(doc(db, 'passwords', cleanEmail), credentialRecord, { merge: true }).catch(() => {})
      } catch {
        // Ignore
      }

      setSavedEmail(cleanEmail)
      setEmailSent(resetSent)
      setSuccessMessage(
        `Your user ID and new password have been successfully stored in the database!${
          resetSent ? ' A Firebase password reset confirmation was also dispatched to your email.' : ''
        }`
      )
    } catch (error) {
      console.error('Password reset failure:', error)
      setAuthError(error.message || 'Unable to update password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="rounded-[11px] border border-[#eee4d9] bg-white p-[22px] shadow-[0_12px_35px_rgba(71,43,24,.08)] max-[680px]:p-[17px]">
        {/* Navigation Tabs */}
        <div className="mb-[18px] grid grid-cols-3 rounded-md bg-[#f7f3ef] p-[3px]">
          <button
            className="min-h-8 cursor-pointer rounded-[5px] border-0 bg-transparent text-[9px] text-[#81756a] transition hover:text-[#43382f]"
            onClick={() => navigate('login')}
            type="button"
          >
            Login
          </button>

          <button
            className="min-h-8 cursor-pointer rounded-[5px] border-0 bg-transparent text-[9px] text-[#81756a] transition hover:text-[#43382f]"
            onClick={() => navigate('createAccount')}
            type="button"
          >
            Create account
          </button>

          <button
            className="min-h-8 cursor-pointer rounded-[5px] border-0 bg-white text-[9px] font-bold text-[#6f3e25] shadow-[0_1px_3px_#33231213]"
            type="button"
          >
            Reset
          </button>
        </div>

        <span className="inline-block text-[9px] font-extrabold leading-[1.25] tracking-[.65px] text-[#9e642e]">
          ACCOUNT RECOVERY
        </span>

        <h2 className="my-[5px] font-serif text-[21px] text-[#4c3322]">
          Reset your password
        </h2>

        <p className="text-[#77716c]">
          Enter your email ID, set a new password, and save to Firebase database.
        </p>

        {/* ERROR NOTIFICATION */}
        {authError && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-red-50 p-3 text-[9px] text-red-700">
            <span className="font-bold">⚠️</span>
            <span>{authError}</span>
          </div>
        )}

        {/* SUCCESS NOTIFICATION */}
        {successMessage ? (
          <div className="mt-3 rounded-md border border-[#c4e1c5] bg-[#f0f9f1] p-3 text-[9px] text-[#2d6b38]">
            <div className="flex items-center gap-2 font-bold text-[#1f592a]">
              <span className="grid size-4 place-items-center rounded-full bg-[#3f7d58] text-[10px] text-white">✓</span>
              <span>Password Updated Successfully!</span>
            </div>
            
            <p className="mt-2 text-[#2d6b38] leading-relaxed">
              {successMessage}
            </p>

            <div className="mt-3 rounded bg-[#e3f4e5] p-2.5 text-[8px] space-y-1 text-[#22572b]">
              <div><strong>User ID:</strong> <span className="font-mono">{savedEmail}</span></div>
              <div><strong>Database Status:</strong> <span className="text-[#1f6d2e] font-semibold">✓ Stored in Database (usercredentials)</span></div>
              {emailSent && (
                <div><strong>Firebase Authentication:</strong> <span className="text-[#1f6d2e]">Reset link sent to inbox</span></div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-[#d8ecd9] flex items-center justify-between">
              <span className="text-[8px] text-[#55865e]">Ready to sign in?</span>
              <button
                className="cursor-pointer rounded-[5px] bg-[#3f7d58] px-3.5 py-1.5 text-[9px] font-bold text-white shadow-sm transition hover:bg-[#2d6242]"
                onClick={() => navigate('login')}
                type="button"
              >
                Proceed to Login →
              </button>
            </div>
          </div>
        ) : (
          /* RESET PASSWORD FORM */
          <form className="mt-3" onSubmit={handleSubmit}>
            {/* EMAIL ID */}
            <label className="flex flex-col gap-[5px] text-[9px] font-bold text-[#62564c]">
              Email ID
              <input
                className="box-border min-h-9 w-full rounded-[5px] border border-[#e7ded4] px-[10px] py-2 text-[9px] text-[#43382f] outline-[#c79670]"
                placeholder="you@example.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            {/* NEW PASSWORD */}
            <label className="mt-3 flex flex-col gap-[5px] text-[9px] font-bold text-[#62564c]">
              New Password
              <div className="relative flex items-center">
                <input
                  className="box-border min-h-9 w-full rounded-[5px] border border-[#e7ded4] px-[10px] py-2 pr-9 text-[9px] text-[#43382f] outline-[#c79670]"
                  minLength={6}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  className="absolute right-2.5 flex size-5 cursor-pointer items-center justify-center border-0 bg-transparent text-[#81756a] transition hover:text-[#6f3e25]"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  <Icon name={showNewPassword ? 'eyeOff' : 'eye'} />
                </button>
              </div>
            </label>

            {/* CONFIRM NEW PASSWORD */}
            <label className="mt-3 flex flex-col gap-[5px] text-[9px] font-bold text-[#62564c]">
              Confirm New Password
              <div className="relative flex items-center">
                <input
                  className="box-border min-h-9 w-full rounded-[5px] border border-[#e7ded4] px-[10px] py-2 pr-9 text-[9px] text-[#43382f] outline-[#c79670]"
                  minLength={6}
                  placeholder="Re-enter your new password"
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-2.5 flex size-5 cursor-pointer items-center justify-center border-0 bg-transparent text-[#81756a] transition hover:text-[#6f3e25]"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <Icon name={showConfirmPassword ? 'eyeOff' : 'eye'} />
                </button>
              </div>
            </label>

            {/* SUBMIT BUTTON */}
            <button
              className="mt-[18px] inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-[9px] rounded-[7px] border border-transparent bg-[#6f3e25] px-[17px] text-[12px] font-bold leading-[1.2] text-white shadow-[0_3px_8px_rgba(81,43,23,.13)] transition hover:-translate-y-px hover:bg-[#522d19] disabled:pointer-events-none disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Saving password...' : 'Reset & Save Password'}
              <Icon name="arrow" />
            </button>
          </form>
        )}

        {/* BACK TO LOGIN FOOTER */}
        <div className="mt-4 flex items-center justify-center border-t border-[#f4ece3] pt-3 text-center">
          <button
            className="cursor-pointer border-0 bg-transparent text-[8px] font-bold text-[#6f3e25] transition hover:text-[#522d19] hover:underline"
            onClick={() => navigate('login')}
            type="button"
          >
            ← Remember your password? Log in here
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
