import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Rocket, Search, X, Loader2 } from 'lucide-react'
import { processDocument, runOcr, searchDocuments } from '../api'
import PdfDownload from './PdfDownload'
import AadhaarCardView from './AadhaarCardView'

function formatKey(key) {
  if (!key) return ''
  return key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function renderValue(value) {
  if (value === null || value === undefined || value === '') return 'N/A'
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return 'None'

  if (Array.isArray(value)) {
    if (value.length === 0) return 'None'
    return (
      <ul className="list-disc pl-5 space-y-0.5">
        {value.map((item, i) => <li key={i}>{renderValue(item)}</li>)}
      </ul>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== '')
    if (entries.length === 0) return 'None'
    return (
      <table className="min-w-full border-collapse text-sm">
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k}>
              <td className="w-1/3 border bg-slate-50 px-2 py-1 font-medium">{formatKey(k)}</td>
              <td className="border px-2 py-1">{renderValue(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
  try {
    return <span>{value.toString()}</span>
  } catch {
    return 'Unsupported'
  }
}

function DataTable({ items, title }) {
  if (!items) return null
  const arr = (Array.isArray(items) ? items : [items]).filter(
    (i) => i && typeof i === 'object' && Object.keys(i).length > 0
  )
  if (arr.length === 0) return null

  const keys = []
  arr.forEach((item) => Object.keys(item).forEach((k) => { if (!keys.includes(k)) keys.push(k) }))

  return (
    <div className="mb-4 overflow-x-auto rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-700">
        {formatKey(title)} {Array.isArray(items) ? `(${arr.length})` : ''}
      </h2>
      <div className="custom-scroll max-h-96 overflow-y-auto">
        <table className="min-w-full border-collapse text-sm">
          {keys.length > 0 && (
            <>
              <thead>
                <tr className="bg-slate-50">
                  {keys.map((k) => (
                    <th key={k} className="border px-4 py-2 text-left font-semibold text-slate-600">
                      {formatKey(k)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {arr.map((row, i) => (
                  <tr key={i} className="transition-colors hover:bg-slate-50">
                    {keys.map((k) => (
                      <td key={k} className="border px-4 py-2">
                        {row && typeof row === 'object' ? renderValue(row[k]) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </div>
    </div>
  )
}

function tryParseJson(str) {
  if (typeof str !== 'string') return str
  try {
    const match = str.match(/<response>([\s\S]*?)<\/response>/)
    if (match) return JSON.parse(match[1].trim())
    const start = str.indexOf('{')
    const end = str.lastIndexOf('}') + 1
    if (start >= 0 && end > start) return JSON.parse(str.slice(start, end))
  } catch {}
  return str
}

function DynamicData({ data: dynamicData, searchQuery = '' }) {
  // Handle extracted content from /api/process
  if (dynamicData?.isOcrResult) {
    const rawOutput = dynamicData.output
    if (!rawOutput) return <p className="text-sm text-slate-500">No data to display.</p>

    // rawOutput can be object (from /api/process) or string (from /api/ocr)
    const output = typeof rawOutput === 'object' ? rawOutput : tryParseJson(rawOutput)

    if (typeof output === 'object' && output !== null && !Array.isArray(output)) {
      if (output._document_type === 'aadhaar' || output.aadhaar_number) {
        return <AadhaarCardView data={output} />
      }
      const entries = Object.entries(output).filter(([k, v]) =>
        v !== null && v !== undefined && v !== '' && k !== '_document_type'
      )
      if (entries.length === 0) return <p className="text-sm text-slate-500">No data extracted.</p>
      return (
        <div className="my-4 flex flex-col gap-4">
          {entries.map(([k, v]) => {
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
              return (
                <div key={k} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-[#214aa6]">{formatKey(k)}</h3>
                  <table className="min-w-full border-collapse text-sm">
                    <tbody>
                      {Object.entries(v).filter(([,val]) => val !== null && val !== '').map(([sk, sv]) => (
                        <tr key={sk} className="hover:bg-slate-50">
                          <td className="w-1/3 border bg-slate-50 px-4 py-2 font-medium">{formatKey(sk)}</td>
                          <td className="border px-4 py-2">{renderValue(sv)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
            if (Array.isArray(v)) {
              return (
                <div key={k} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-[#214aa6]">{formatKey(k)}</h3>
                  <DataTable items={v} title={k} />
                </div>
              )
            }
            return (
              <div key={k} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="font-semibold text-slate-600">{formatKey(k)}: </span>
                <span className="text-slate-800">{String(v)}</span>
              </div>
            )
          })}
        </div>
      )
    }

    // Plain text output
    return (
      <div className="my-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-700">Extracted Content</h2>
        <pre className="whitespace-pre-wrap text-sm text-slate-700">{String(output)}</pre>
      </div>
    )
  }

  // Handle search results
  if (dynamicData?.isSearchResult) {
    const results = dynamicData.results
    if (!results || results.length === 0) {
      return (
        <div className="my-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
          No documents found. Try searching for a specific value like a name, number, or company.
          For example: <strong>32AABBA790B1ZB</strong> or <strong>Shiv Engineering</strong>
        </div>
      )
    }
    return (
      <div className="my-4 flex flex-col gap-4">
        <p className="text-sm text-slate-500">
          Found <strong>{results.length}</strong> document{results.length > 1 ? 's' : ''} matching your search
        </p>
        {results.map((result, i) => {
          const preview = result.preview || ''
          // Split by | and find all key:value pairs that contain the search term
          const allParts = preview.split('|').map(p => p.trim()).filter(Boolean)
          
          // Parse each part — take only last two colon-separated segments as key:val
          const parsed = allParts.map(part => {
            const segments = part.split(': ')
            if (segments.length >= 2) {
              const val = segments[segments.length - 1]
              const key = segments[segments.length - 2]
              return { key, val, full: part }
            }
            return { key: '', val: part, full: part }
          })

          // Show ONLY parts that match the search query
          const sq = searchQuery.toLowerCase()
          const matched = parsed.filter(p =>
            p.key.toLowerCase().includes(sq) ||
            p.val.toLowerCase().includes(sq) ||
            p.full.toLowerCase().includes(sq)
          )

          // If nothing matched by field, show first 5 as fallback
          const display = matched.length > 0 ? matched : parsed.slice(0, 5)

          // Deduplicate by key+val
          const seen = new Set()
          const unique = display.filter(p => {
            const k = `${p.key}:${p.val}`
            if (seen.has(k)) return false
            seen.add(k)
            return true
          })

          return (
            <div key={i} className="rounded-xl border border-[#d8e0ef] bg-white p-4 shadow-sm">
              <div className="mb-3">
                <p className="text-sm font-semibold text-[#214aa6]">{result.fileName}</p>
                <p className="text-xs text-slate-400">
                  Type: {result.documentType} | Relevance: {result.score} | Indexed: {result.indexedAt ? new Date(result.indexedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="rounded-lg bg-[#f4f6fa] px-4 py-3 text-sm text-slate-700">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Matched Fields</p>
                <div className="flex flex-col gap-1">
                  {unique.map((p, pi) => (
                    <div key={pi} className="flex gap-2 border-b border-slate-100 py-1 last:border-0">
                      <span className="min-w-[140px] font-medium text-slate-500">{p.key || 'Value'}</span>
                      <span className="text-slate-800 font-medium">{p.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Handle standard process response
  if (!dynamicData?.response?.body || Object.keys(dynamicData.response.body).length === 0) {
    return <p className="text-sm text-slate-500">No data to display.</p>
  }

  const data = dynamicData.response.body
  const responseType = dynamicData.responseType

  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => {
      if (v === null || v === undefined) return false
      if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false
      if (Array.isArray(v) && v.length === 0) return false
      return true
    })
  )

  if (Object.keys(filteredData).length === 0) return <p className="text-sm text-slate-500">No valid data.</p>

  if (responseType === 'identity_card') {
    const formatAddress = (addr) => {
      if (!addr) return null
      if (typeof addr === 'string') return addr
      return Object.values(addr).filter(Boolean).join(', ')
    }

    const isPan = data.pan_number
    const isPassport = data.passport_number
    const isDL = data.dl_number
    const isVoter = data.epic_number

    let cardTitle = 'Aadhaar Card'
    let cardSubtitle = 'Government of India'
    let cardBody = 'Unique Identification Authority of India'
    let cardDesc = 'This is an Aadhaar card issued by the Government of India.'

    if (isPan) { cardTitle = 'PAN Card'; cardBody = 'Income Tax Department'; cardDesc = 'Permanent Account Number card issued by the Income Tax Department.' }
    else if (isPassport) { cardTitle = 'Passport'; cardBody = 'Ministry of External Affairs'; cardDesc = 'Passport issued by the Government of India.' }
    else if (isDL) { cardTitle = 'Driving Licence'; cardBody = 'Ministry of Road Transport & Highways'; cardDesc = 'Driving licence issued by the Regional Transport Office.' }
    else if (isVoter) { cardTitle = 'Voter ID Card'; cardBody = 'Election Commission of India'; cardDesc = 'Electoral Photo Identity Card issued by the Election Commission of India.' }

    const fields = []
    const add = (label, value) => { if (value) fields.push({ label, value }) }

    add('Name', data.name || (data.surname ? `${data.surname} ${data.given_names || ''}`.trim() : null))
    add("Father's Name", data.father_name)
    add('Father / Husband Name', data.father_or_husband_name)
    add('Gender', data.gender)
    add('Date of Birth', data.date_of_birth || data.dob)
    add('Nationality', data.nationality)
    add('Place of Birth', data.place_of_birth)
    add('Enrollment No.', data.enrollment_no || (data.aadhaar_number ? 'XXXX/XXXXX/XXXXX' : null))
    add('Aadhaar No.', data.aadhaar_number)
    add('PAN Number', data.pan_number)
    add('Passport Number', data.passport_number)
    add('Issue Date', data.issue_date)
    add('Expiry Date', data.expiry_date)
    add('Issuing Authority', data.issuing_authority)
    add('DL Number', data.dl_number)
    add('EPIC Number', data.epic_number)
    add('Part Number', data.part_number)
    add('Vehicle Classes', Array.isArray(data.vehicle_classes) ? data.vehicle_classes.join(', ') : data.vehicle_classes)
    add('Issuing RTO', data.issuing_rto)
    add('Address', formatAddress(data.address))

    return (
      <div className="my-4 max-w-2xl">
        <div className="rounded border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-800">{cardTitle}</h2>
            <p className="mt-1 text-sm font-semibold text-[#214aa6]">{cardSubtitle}</p>
            <p className="mt-0.5 text-sm font-bold text-[#214aa6]">{cardBody}</p>
            <p className="mt-1 text-xs text-slate-500">{cardDesc}</p>
          </div>
          <div className="divide-y divide-slate-100 px-5 py-2">
            {fields.map(({ label, value }) => (
              <div key={label} className="py-3">
                <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
                <div className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-4 flex flex-col gap-4 rounded-xl bg-slate-50 p-4">
      {Object.entries(filteredData).map(([key, value], i) => {
        if (Array.isArray(value)) return <DataTable key={i} items={value} title={key} />
        if (typeof value === 'object') {
          return (
            <div key={i} className="overflow-x-auto rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold">{formatKey(key)}</h2>
              <table className="min-w-full border-collapse text-sm">
                <tbody>
                  {Object.entries(value).map(([k, v], j) => (
                    <tr key={j} className="hover:bg-slate-50">
                      <td className="w-1/3 border bg-slate-50 px-4 py-2 font-medium">{formatKey(k)}</td>
                      <td className="border px-4 py-2">{renderValue(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        return (
          <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 text-sm shadow-sm">
            <span className="font-semibold">{formatKey(key)}:</span>{' '}
            <span>{String(value)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function CrediqProcessing({
  uploadedFileInfo,
  isProcessing,
  setIsProcessing,
  isUploadComplete,
  selectedOption,
}) {
  const [errorMessage, setErrorMessage] = useState('')
  const [processData, setProcessData] = useState(null)
  const [isButtonHidden, setIsButtonHidden] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [fileQueries, setFileQueries] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const fileNames = uploadedFileInfo.map((f) => f.name)

  useEffect(() => {
    if (fileNames.length === 0) {
      setErrorMessage('No valid file names available.')
      setIsProcessing(false)
    }
  }, [fileNames.length, setIsProcessing])

  const handleStartProcessing = async () => {
    setIsProcessing(true)
    setErrorMessage('')
    setProcessData(null)

    try {
      const userInstruction = fileQueries[fileNames[0]] || 'None'

      // Always use /api/process — auto-classifies if no documentType given
      const responseData = await processDocument({
        fileName: fileNames[0],
        documentType: selectedOption === 'auto' ? undefined : selectedOption,
        userInstruction,
      })
      setProcessData({
        isOcrResult: true,
        output: responseData?.body ?? responseData,
      })

      setIsButtonHidden(true)
      setShowAdvancedSearch(false)
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'An unexpected error occurred.')
      toast.error('Failed to process the document.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAdvancedSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query.')
      return
    }
    setIsSearching(true)
    setErrorMessage('')
    try {
      const currentFile = fileNames[0] || null
      let result = await searchDocuments(searchQuery.trim(), null, 5, currentFile)
      let results = result?.results ?? result?.value ?? []
      setProcessData({
        isSearchResult: true,
        results,
      })
      setIsButtonHidden(true)
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'Search failed.')
      toast.error('Advanced search failed.')
    } finally {
      setIsSearching(false)
    }
  }

  if (!isUploadComplete || uploadedFileInfo.length === 0) return null

  return (
    <div className="mt-6">
      {!isButtonHidden && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="inline-flex items-center text-lg font-semibold text-slate-700">
            <Rocket className="mr-2 h-5 w-5 text-[#214aa6]" />
            Process Document
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAdvancedSearch((p) => !p)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#214aa6] px-4 py-2 text-sm font-medium text-[#214aa6] transition hover:bg-[#214aa6] hover:text-white"
            >
              {showAdvancedSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              {showAdvancedSearch ? 'Close' : 'Advanced Search'}
            </button>
            <button
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#214aa6] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#17367c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Start Processing
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <div className="mb-4 rounded-xl border border-[#d8e0ef] bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-600">
            Search across all processed documents using Azure AI Search
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdvancedSearch()}
              placeholder="e.g. PAN number, invoice amount, name..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#214aa6]"
            />
            <button
              onClick={handleAdvancedSearch}
              disabled={isSearching}
              className="inline-flex items-center gap-2 rounded-xl bg-[#214aa6] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#17367c] disabled:opacity-60"
            >
              {isSearching ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Searching...</>
              ) : (
                <><Search className="h-4 w-4" /> Search</>
              )}
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {processData && (
        <>
          {!processData.isSearchResult && (
            <div className="mb-3 flex justify-end">
              <PdfDownload
                fileName={fileNames[0]}
                documentType={selectedOption}
                data={
                  processData.isOcrResult
                    ? processData.output
                    : processData.response?.body
                }
              />
            </div>
          )}
          <DynamicData data={processData} searchQuery={searchQuery} />
        </>
      )}
    </div>
  )
}
