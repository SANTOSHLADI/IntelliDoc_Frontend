import { useState } from 'react'
import { toast } from 'react-toastify'
import { BadgeCheck, Building2, Lock, LogIn, Mail, ShieldCheck, UserRound } from 'lucide-react'

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
  const [activeView, setActiveView] = useState('signup')

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }))
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

  const updateLoginField = (field) => (event) => {
    setLoginData((current) => ({ ...current, [field]: event.target.value }))
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
    }
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#dbe5f4] bg-[linear-gradient(135deg,#f9fbff_0%,#eef4ff_48%,#f6f9ff_100%)] shadow-[0_20px_50px_rgba(30,58,138,0.08)]">
      <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden border-b border-[#dbe5f4] px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#214aa6]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#60a5fa]/10 blur-3xl" />

          <div className="relative max-w-xl">
            <span className="inline-flex rounded-full border border-[#bfd0ee] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#214aa6]">
              Create Account
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#17367c] sm:text-4xl">
              Sign up or log in before opening IntelliDoc
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
              Access the IntelliDoc workspace only after authentication, then use the profile icon to view the logged-in account and log out.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <FeatureCard
                icon={ShieldCheck}
                title="Secure onboarding"
                description="Role-ready access controls and protected document flows from day one."
              />
              <FeatureCard
                icon={BadgeCheck}
                title="Faster verification"
                description="Bring users, analysts, and operations into one shared workflow."
              />
              <FeatureCard
                icon={Building2}
                title="Built for teams"
                description="Set up your company space with room to scale across departments."
              />
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-xl">
            <div className="flex rounded-2xl border border-[#d9e2f2] bg-[#f7faff] p-1">
              <button
                type="button"
                onClick={() => setActiveView('signup')}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  activeView === 'signup' ? 'bg-[#214aa6] text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => setActiveView('login')}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  activeView === 'login' ? 'bg-[#214aa6] text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Log in
              </button>
            </div>

            {activeView === 'signup' ? (
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-800">Sign up</h3>
                  <p className="mt-2 text-sm text-slate-500">Create your account and open IntelliDoc.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Full name"
                    placeholder="Aarav Sharma"
                    value={formData.fullName}
                    onChange={updateField('fullName')}
                    icon={UserRound}
                  />
                  <InputField
                    label="Work email"
                    type="email"
                    placeholder="aarav@company.com"
                    value={formData.workEmail}
                    onChange={updateField('workEmail')}
                    icon={Mail}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Company"
                    placeholder="CloudThat"
                    value={formData.company}
                    onChange={updateField('company')}
                    icon={Building2}
                  />
                  <InputField
                    label="Role"
                    placeholder="Operations Manager"
                    value={formData.role}
                    onChange={updateField('role')}
                    icon={BadgeCheck}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Password"
                    type="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={updateField('password')}
                    icon={Lock}
                  />
                  <InputField
                    label="Confirm password"
                    type="password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={updateField('confirmPassword')}
                    icon={Lock}
                  />
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-[#e3eaf7] bg-[#f8fbff] px-4 py-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#214aa6] focus:ring-[#214aa6]"
                  />
                  <span>I agree to the terms, privacy policy, and secure document handling guidelines.</span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[linear-gradient(135deg,#1e3a8a_0%,#214aa6_55%,#4c7cf0_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(33,74,166,0.28)] transition hover:translate-y-[-1px]"
                >
                  Create account
                </button>
              </form>
            ) : (
              <form className="mt-6 space-y-5" onSubmit={handleLogin}>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-800">Log in</h3>
                  <p className="mt-2 text-sm text-slate-500">Enter your account details to open IntelliDoc.</p>
                </div>

                <InputField
                  label="Work email"
                  type="email"
                  placeholder="aarav@company.com"
                  value={loginData.workEmail}
                  onChange={updateLoginField('workEmail')}
                  icon={Mail}
                />

                <InputField
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  value={loginData.password}
                  onChange={updateLoginField('password')}
                  icon={Lock}
                />

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1e3a8a_0%,#214aa6_55%,#4c7cf0_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(33,74,166,0.28)] transition hover:translate-y-[-1px]"
                >
                  <LogIn className="h-4 w-4" />
                  Log in
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/70 p-5 shadow-[0_16px_30px_rgba(148,163,184,0.12)] backdrop-blur">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#214aa6] text-white shadow-[0_10px_20px_rgba(33,74,166,0.22)]">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="mt-4 text-base font-semibold text-slate-800">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

function InputField({ label, icon: Icon, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-[#d8e2f0] bg-[#fbfdff] px-4 py-3 shadow-sm transition focus-within:border-[#214aa6] focus-within:ring-2 focus-within:ring-[#214aa6]/10">
        <Icon className="h-4 w-4 text-slate-400" />
        <input
          {...props}
          className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
    </label>
  )
}
