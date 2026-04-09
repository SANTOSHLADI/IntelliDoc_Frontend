import { useState } from 'react'
import { toast } from 'react-toastify'
import { ArrowRight, Lock, Mail, UserRound } from 'lucide-react'
import cloudthatLogo from '../../CT_logo.png'

const INITIAL_FORM = {
  fullName: '',
  workEmail: '',
  company: '',
  role: '',
  password: '',
  confirmPassword: '',
}

const INITIAL_LOGIN_FORM = {
  workEmail: '',
  password: '',
}

export default function SignUpPage({ onSignUp, onLogin }) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [loginData, setLoginData] = useState(INITIAL_LOGIN_FORM)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [activeView, setActiveView] = useState('login')

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }))
  }

  const updateLoginField = (field) => (event) => {
    setLoginData((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const values = Object.values(formData).map((value) => value.trim())
    if (values.some((value) => !value)) {
      toast.error('Please fill in all fields.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    if (!acceptedTerms) {
      toast.error('Please accept the terms to continue.')
      return
    }

    const didSignUp = onSignUp?.(formData)
    if (didSignUp) {
      setFormData(INITIAL_FORM)
      setAcceptedTerms(false)
    }
  }

  const handleLogin = (event) => {
    event.preventDefault()

    const values = Object.values(loginData).map((value) => value.trim())
    if (values.some((value) => !value)) {
      toast.error('Please enter email and password.')
      return
    }

    const didLogin = onLogin?.(loginData)
    if (didLogin) {
      setLoginData(INITIAL_LOGIN_FORM)
      setRememberMe(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#eef2f7] px-3 py-3 sm:px-4 sm:py-4">
      <div className="min-h-[calc(100vh-24px)] overflow-hidden rounded-[28px] border border-[#d7dfeb] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="h-14 border-b border-[#e9eef5] bg-[#f3f6fa]" />

        <div className="grid min-h-[calc(100vh-82px)] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden bg-[#1f5c73] px-8 py-10 text-white sm:px-12 lg:px-14 lg:py-12">
            <div className="absolute inset-y-0 right-[-120px] hidden w-[240px] rounded-[50%] border-l-[18px] border-[#dce6ef] bg-white lg:block" />
            <div className="absolute left-[18%] top-[22%] h-2.5 w-2.5 rounded-full bg-white/12" />
            <div className="absolute left-[52%] top-[42%] h-1.5 w-1.5 rounded-full bg-white/20" />
            <div className="relative z-10 flex h-full flex-col">
              <img
                src={cloudthatLogo}
                alt="cloudthat"
                className="h-10 w-auto object-contain sm:h-11"
              />

              <div className="mt-12 flex flex-1 items-center justify-center">
                <div className="relative h-[260px] w-full max-w-[430px]">
                  <div className="absolute left-10 right-10 top-28 h-4 rounded-full bg-[#2d748d]" />
                  <div className="absolute left-6 top-5 h-24 w-24 rounded-full border border-white/10 bg-white/5" />
                  <div className="absolute right-8 top-10 h-16 w-16 rounded-full border border-white/10 bg-white/5" />
                  <div className="absolute left-14 top-28 h-3 w-[230px] rounded-sm bg-[#50627d]" />
                  <div className="absolute left-14 top-[124px] h-[90px] w-3 bg-[#50627d]" />
                  <div className="absolute right-[90px] top-[124px] h-[90px] w-3 bg-[#50627d]" />
                  <div className="absolute left-[120px] top-[36px] h-[92px] w-[126px] rounded-[20px] bg-[#5a6a86] p-2 shadow-[0_14px_24px_rgba(15,23,42,0.18)]">
                    <div className="flex h-full items-center justify-center rounded-[16px] bg-[#e9eef5]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-[4px] border-[#52647f]">
                        <div className="ml-1 h-0 w-0 border-b-[10px] border-l-[16px] border-t-[10px] border-b-transparent border-l-[#52647f] border-t-transparent" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-[185px] top-[62px] h-[120px] w-[20px] rounded-full bg-[#f3b9bd] rotate-[10deg]" />
                  <div className="absolute left-[205px] top-[70px] h-[95px] w-[24px] rounded-full bg-[#f6c8cb] -rotate-[6deg]" />
                  <div className="absolute left-[213px] top-[70px] h-16 w-10 rounded-t-full rounded-b-[18px] bg-[#2d3548]" />
                  <div className="absolute left-[225px] top-[84px] h-11 w-9 rounded-full bg-[#2d3548]" />
                  <div className="absolute left-[208px] top-[126px] h-[58px] w-[54px] rounded-[22px] bg-[#8ea7bc]" />
                  <div className="absolute left-[194px] top-[148px] h-[54px] w-[26px] rounded-full bg-[#2d3548] rotate-[18deg]" />
                  <div className="absolute left-[224px] top-[156px] h-[54px] w-[28px] rounded-full bg-[#49566f] -rotate-[18deg]" />
                  <div className="absolute left-[216px] top-[198px] h-[42px] w-[10px] rounded-full bg-[#f6c8cb]" />
                  <div className="absolute left-[238px] top-[198px] h-[42px] w-[10px] rounded-full bg-[#f6c8cb]" />
                  <div className="absolute left-[208px] top-[234px] h-2.5 w-6 rounded-full bg-white" />
                  <div className="absolute left-[233px] top-[232px] h-2.5 w-7 rounded-full bg-white" />
                  <div className="absolute left-[72px] top-[185px] h-8 w-8 rounded-b-[8px] rounded-t-[12px] bg-[#31455b]" />
                  <div className="absolute left-[80px] top-[178px] h-4 w-4 rounded-full bg-white" />
                </div>
              </div>

              <div className="relative z-10 max-w-[500px] pb-6">
                <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                  A few more clicks to
                  <br />
                  sign in to your account.
                </h1>
                <p className="mt-6 text-xl text-white/70">
                  Manage all your data in one place
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
            <div className="w-full max-w-[575px]">
              {activeView === 'login' ? (
                <form className="space-y-5" onSubmit={handleLogin}>
                  <div>
                    <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[#24324a]">Sign In</h2>
                  </div>

                  <AuthInput
                    type="email"
                    placeholder="Email"
                    value={loginData.workEmail}
                    onChange={updateLoginField('workEmail')}
                    icon={Mail}
                  />

                  <AuthInput
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={updateLoginField('password')}
                    icon={Lock}
                  />

                  <div className="flex flex-col gap-4 text-[#53657e] sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-3 text-[15px]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="h-5 w-5 rounded border border-[#d8e1ee] text-[#1f5c73] focus:ring-[#1f5c73]"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      className="text-[15px] font-medium text-[#53657e] transition hover:text-[#1f5c73]"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                    <button
                      type="submit"
                      className="inline-flex min-w-[160px] items-center justify-center rounded-xl bg-[#1f5c73] px-8 py-3.5 text-base font-semibold text-white shadow-[0_12px_28px_rgba(31,92,115,0.18)] transition hover:bg-[#184c5f]"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('signup')}
                      className="inline-flex min-w-[160px] items-center justify-center rounded-xl border border-[#dbe4ef] bg-white px-8 py-3.5 text-base font-semibold text-[#647891] transition hover:border-[#1f5c73] hover:text-[#1f5c73]"
                    >
                      Register
                    </button>
                  </div>

                  <p className="pt-6 text-[15px] leading-8 text-[#53657e]">
                    By signin up, you agree to our{' '}
                    <button type="button" className="font-medium text-[#f97316]">
                      Terms and Conditions
                    </button>{' '}
                    &amp;{' '}
                    <button type="button" className="font-medium text-[#1f5c73]">
                      Privacy Policy
                    </button>
                  </p>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[#24324a]">Register</h2>
                    <p className="mt-3 text-[15px] leading-7 text-[#6a7c93]">
                      Create your account to access IntelliDoc.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <AuthInput
                      placeholder="Full name"
                      value={formData.fullName}
                      onChange={updateField('fullName')}
                      icon={UserRound}
                    />
                    <AuthInput
                      type="email"
                      placeholder="Work email"
                      value={formData.workEmail}
                      onChange={updateField('workEmail')}
                      icon={Mail}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <AuthInput
                      placeholder="Company"
                      value={formData.company}
                      onChange={updateField('company')}
                    />
                    <AuthInput
                      placeholder="Role"
                      value={formData.role}
                      onChange={updateField('role')}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <AuthInput
                      type="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={updateField('password')}
                      icon={Lock}
                    />
                    <AuthInput
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={updateField('confirmPassword')}
                      icon={Lock}
                    />
                  </div>

                  <label className="flex items-start gap-3 text-[15px] leading-7 text-[#53657e]">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      className="mt-1 h-5 w-5 rounded border border-[#d8e1ee] text-[#1f5c73] focus:ring-[#1f5c73]"
                    />
                    <span>I agree to the Terms and Conditions and Privacy Policy.</span>
                  </label>

                  <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                    <button
                      type="submit"
                      className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-[#1f5c73] px-8 py-3.5 text-base font-semibold text-white shadow-[0_12px_28px_rgba(31,92,115,0.18)] transition hover:bg-[#184c5f]"
                    >
                      Create Account
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('login')}
                      className="inline-flex min-w-[160px] items-center justify-center rounded-xl border border-[#dbe4ef] bg-white px-8 py-3.5 text-base font-semibold text-[#647891] transition hover:border-[#1f5c73] hover:text-[#1f5c73]"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function AuthInput({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#d9e2ee] bg-white px-4 py-4 shadow-[0_6px_16px_rgba(15,23,42,0.03)] transition focus-within:border-[#1f5c73] focus-within:ring-2 focus-within:ring-[#1f5c73]/10">
      {Icon ? <Icon className="h-4 w-4 shrink-0 text-[#95a4b9]" /> : null}
      <input
        {...props}
        className="w-full border-none bg-transparent text-[17px] text-[#24324a] outline-none placeholder:text-[#a2b0c2]"
      />
    </div>
  )
}
