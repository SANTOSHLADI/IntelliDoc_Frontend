import { useState } from 'react'
import { ArrowLeft, FileSearch } from 'lucide-react'
import Navbar from './Navbar'
import CREDIQ from './CREDIQ'

const TABS = [{ id: 'crediq', label: 'IntelliDoc', sublabel: 'Intelligent Document Processing', icon: FileSearch }]

export default function Dashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('crediq')

  return (
    <div className="min-h-screen bg-[#27489f]">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      <div className="relative overflow-hidden px-3 pb-10 pt-10 sm:px-6 lg:px-10">
        <div className="absolute inset-x-10 top-4 h-28 rounded-[28px] bg-white/10 blur-[1px]" />

        <div className="relative mx-auto max-w-[1820px] rounded-[28px] bg-[#edf2fb] px-5 py-6 shadow-[0_30px_60px_rgba(15,23,42,0.16)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-700 text-slate-700 transition hover:bg-white"
                aria-label="Back"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>

              <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-[#18408f] sm:text-[38px]">
                IntelliDoc
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      active
                        ? 'border-[#214aa6] bg-[#214aa6] text-white shadow-[0_12px_30px_rgba(33,74,166,0.28)]'
                        : 'border-[#ced8eb] bg-white text-slate-600 hover:border-[#214aa6] hover:text-[#214aa6]'
                    }`}
                    title={tab.sublabel}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[22px] bg-white px-4 py-5 shadow-[inset_0_0_0_1px_rgba(214,223,238,0.8)] sm:px-6 sm:py-6 lg:px-7 lg:py-7">
            {activeTab === 'crediq' && <CREDIQ />}
          </div>
        </div>
      </div>
    </div>
  )
}
