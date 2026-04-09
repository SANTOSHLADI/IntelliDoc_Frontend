import { useEffect, useRef, useState } from 'react'
import { LogOut, User } from 'lucide-react'
import cloudthatLogo from '../../CT_logo.png'

export default function Navbar({ currentUser, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <nav className="relative z-20 border-b border-white/10 bg-[linear-gradient(135deg,#1e3a8a_0%,#25439c_55%,#2948a8_100%)] text-white shadow-[0_10px_30px_rgba(15,23,42,0.16)]">
      <div className="mx-auto flex h-[88px] max-w-[1880px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <div className="flex min-w-0 items-center gap-5">
          <div className="flex items-center pr-5 sm:border-r sm:border-white/15">
            <div className="flex items-center rounded-2xl px-1 py-1">
              <img
                src={cloudthatLogo}
                alt="cloudthat"
                className="h-10 w-auto shrink-0 object-contain"
              />
            </div>
          </div>

          <div className="hidden items-center gap-2 text-white/90 sm:flex">
            <span className="text-[15px] font-medium">Application</span>
            <span className="text-white/55">&gt;</span>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#0b3f97] text-white shadow-[0_8px_18px_rgba(2,6,23,0.2)] transition hover:bg-[#124baa]"
            aria-label="Profile"
            aria-expanded={isMenuOpen}
          >
            <User className="h-5 w-5" />
          </button>

          {isMenuOpen && currentUser && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-72 rounded-3xl border border-[#d9e2f3] bg-white p-4 text-slate-700 shadow-[0_24px_50px_rgba(15,23,42,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#214aa6]">Logged in as</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{currentUser.fullName}</p>
              <p className="mt-1 text-sm text-slate-500">{currentUser.workEmail}</p>
              {currentUser.company && (
                <p className="mt-1 text-sm text-slate-500">
                  {currentUser.company}
                  {currentUser.role ? ` • ${currentUser.role}` : ''}
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  onLogout?.()
                }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d6e0f2] px-4 py-3 text-sm font-medium text-[#214aa6] transition hover:border-[#214aa6] hover:bg-[#214aa6] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
