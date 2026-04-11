import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Rocket, Search, X, Loader2 } from 'lucide-react'
import { processDocument, runOcr, searchDocuments } from '../api'
import PdfDownload from './PdfDownload'

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
    const flatten = (obj, prefix = '') =>
      Object.keys(obj).reduce((acc, key) => {
        const pk = prefix ? `${prefix}_${key}` : key
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(acc, flatten(obj[key], pk))
        } else {
          acc[pk] = typeof obj[key] === 'boolean' ? obj[key].toString() : obj[key]
        }
        return acc
      }, {})

    const flat = flatten(data)
    const keys = Object.keys(flat)

    return (
      <div className="my-4 rounded-xl bg-slate-50 p-4">
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-700">ID Details</h2>
          <table className="min-w-full border-collapse text-sm">
            <tbody>
              {keys.map((k) => (
                <tr key={k} className="hover:bg-slate-50">
                  <td className="w-1/3 border bg-slate-50 px-4 py-2 font-medium">{formatKey(k)}</td>
                  <td className="border px-4 py-2">
                    {Array.isArray(flat[k]) ? flat[k].join(', ') : flat[k] || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      // Always use /api/process — it extracts ALL pages and handles all document types
      const responseData = await processDocument({
        fileName: fileNames[0],
        documentType: selectedOption,
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
      const result = await searchDocuments(searchQuery.trim(), selectedOption)
      const results = result?.results ?? result?.value ?? []
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
