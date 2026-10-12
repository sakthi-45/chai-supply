
import { useState } from 'react'
import { Icon } from '../../components/Icon.jsx'
import { AuthLayout } from '../../components/AuthLayout.jsx'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../../config/firebase.js'

export function Login({ role, setRole, onSubmit, navigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')

    try {
      const user = await signInWithEmailAndPassword(auth, email, password)
      console.log('Logged in user:', user)
      await onSubmit(role, user.user.uid)
    } catch (error) {
      console.error(error)

      const errorCode =
        error &&
          typeof error === 'object' &&
          'code' in error &&
          typeof error.code === 'string'
          ? error.code
          : ''

      switch (errorCode) {
        case 'auth/user-not-found':
          setAuthError('No account found with this email.')
          break

        case 'auth/invalid-email':
          setAuthError('Enter a valid email address.')
          break

        case 'auth/wrong-password':
          setAuthError('Incorrect password. Please try again.')
          break

        case 'auth/invalid-credential':
          setAuthError('Incorrect email or password.')
          break

        case 'auth/too-many-requests':
          setAuthError('Too many attempts. Please try again later.')
          break

        default:
          setAuthError('Unable to log in. Please try again.')
      }
    }
  }

  return (
    <AuthLayout>
      <form
        className="rounded-[11px] border border-[#eee4d9] bg-white p-[22px] shadow-[0_12px_35px_rgba(71,43,24,.08)] max-[680px]:p-[17px]"
        onSubmit={handleSubmit}
      >
        <div className="mb-[18px] grid grid-cols-2 rounded-md bg-[#f7f3ef] p-[3px]">
          <button
            className="min-h-8 cursor-pointer rounded-[5px] border-0 bg-white text-[9px] font-bold text-[#6f3e25] shadow-[0_1px_3px_#33231213]"
            onClick={() => navigate('login')}
            type="button"
          >
            Login
          </button>

          <button
            className="min-h-8 cursor-pointer rounded-[5px] border-0 bg-transparent text-[9px] text-[#81756a]"
            onClick={() => navigate('createAccount')}
            type="button"
          >
            Create account
          </button>
        </div>

        <span className="inline-block text-[9px] font-extrabold leading-[1.25] tracking-[.65px] text-[#9e642e]">
          WELCOME BACK
        </span>

        <h2 className="my-[5px] font-serif text-[21px] text-[#4c3322]">
          Log in to ChaiSupply
        </h2>

        <p className="text-[#77716c]">
          Pick up where your morning routine left off.
        </p>

        {/* ROLE */}
        <label className="mt-3 flex flex-col gap-[5px] text-[9px] font-bold text-[#62564c]">
          I am a
          <span className="grid grid-cols-2 gap-[3px] rounded-[5px] bg-[#f7f3ef] p-[3px]">
            <button
              className={`min-h-[30px] cursor-pointer rounded border-0 text-[8px] ${role === 'buyer'
                  ? 'bg-white font-bold text-[#6f3e25] shadow-[0_1px_3px_#33231213]'
                  : 'bg-transparent text-[#82776d]'
                }`}
              onClick={() => setRole('buyer')}
              type="button"
            >
              Tea-shop owner
            </button>

            <button
              className={`min-h-[30px] cursor-pointer rounded border-0 text-[8px] ${role === 'supplier'
                  ? 'bg-white font-bold text-[#6f3e25] shadow-[0_1px_3px_#33231213]'
                  : 'bg-transparent text-[#82776d]'
                }`}
              onClick={() => setRole('supplier')}
              type="button"
            >
              Supplier
            </button>
          </span>
        </label>

        {/* EMAIL */}
        <label className="mt-3 flex flex-col gap-[5px] text-[9px] font-bold text-[#62564c]">
          Email
          <input
            className="box-border min-h-9 w-full rounded-[5px] border border-[#e7ded4] px-[10px] py-2 text-[9px] text-[#43382f] outline-[#c79670]"
            placeholder="you@example.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {/* PASSWORD */}
        <label className="mt-3 flex flex-col gap-[5px] text-[9px] font-bold text-[#62564c]">
          Password
          <input
            className="box-border min-h-9 w-full rounded-[5px] border border-[#e7ded4] px-[10px] py-2 text-[9px] text-[#43382f] outline-[#c79670]"
            minLength={6}
            placeholder="Enter your password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {/* ERROR */}
        {authError && (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-[9px] font-medium text-red-600">
            {authError}
          </p>
        )}

        {/* FORGOT PASSWORD */}
        <button
          className="ml-auto mt-[9px] block cursor-pointer border-0 bg-transparent p-0 text-[8px] text-[#6f3e25]"
          onClick={() =>
            alert('Please contact support to reset your password.')
          }
          type="button"
        >
          Forgot password?
        </button>

        {/* LOGIN */}
        <button
          className="mt-[15px] inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-[9px] rounded-[7px] border border-transparent bg-[#6f3e25] px-[17px] text-[12px] font-bold leading-[1.2] text-white shadow-[0_3px_8px_rgba(81,43,23,.13)] transition hover:-translate-y-px hover:bg-[#522d19]"
          type="submit"
        >
          Login to your account
          <Icon name="arrow" />
        </button>

        <small className="mt-[11px] block text-center text-[7px] text-[#90857c]">
          By continuing, you agree to our Terms of Use and Privacy Policy.
        </small>
      </form>
    </AuthLayout>
  )
}