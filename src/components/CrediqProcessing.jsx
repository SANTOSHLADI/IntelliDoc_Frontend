import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Rocket, Search, X, Loader2, Download } from 'lucide-react'
import { processDocument } from '../api'

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

function DynamicData({ data: dynamicData }) {
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

  if (responseType === 'Loan Application') {
    return (
      <div className="my-4 flex flex-col gap-4 rounded-xl bg-slate-50 p-4">
        {Object.entries(data).map(([parentKey, children], pi) => (
          <div key={pi} className="overflow-x-auto rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-700">{parentKey}</h2>
            <table className="min-w-full border-collapse text-sm">
              <tbody>
                {Object.entries(children || {}).map(([ck, cv], ci) => (
                  <tr key={ci} className="hover:bg-slate-50">
                    <td className="w-1/3 border bg-slate-50 px-4 py-2 font-medium">{formatKey(ck)}</td>
                    <td className="max-w-lg overflow-auto whitespace-pre-wrap border px-4 py-2">{cv || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    )
  }

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
                  <td
                    className="border px-4 py-2"
                    style={k.toLowerCase().includes('address') ? { maxHeight: 80, overflowY: 'auto' } : {}}
                  >
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

  if (responseType === 'bank_statement' || responseType === 'cdsl_report') {
    return (
      <div className="my-4 flex flex-col gap-4 rounded-xl bg-slate-50 p-4">
        {Object.entries(data).map(([sectionKey, sectionValue], si) => {
          if (sectionValue === null || sectionValue === undefined) return null
          if (typeof sectionValue !== 'object') {
            return (
              <div key={si} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="font-semibold">{formatKey(sectionKey)}:</span>{' '}
                <span>{String(sectionValue)}</span>
              </div>
            )
          }
          if (Array.isArray(sectionValue)) {
            return <DataTable key={si} items={sectionValue} title={sectionKey} />
          }
          return (
            <div key={si} className="overflow-x-auto rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold">{formatKey(sectionKey)}</h2>
              <table className="min-w-full border-collapse text-sm">
                <tbody>
                  {Object.entries(sectionValue).map(([k, v], i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="w-1/3 border bg-slate-50 px-4 py-2 font-medium">{formatKey(k)}</td>
                      <td className="border px-4 py-2">{renderValue(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    )
  }

  if (responseType === 'invoice' || responseType === 'ocr_all_documents') {
    const documents = Array.isArray(data) ? data : [data]
    return (
      <div className="my-4 flex flex-col gap-4 rounded-xl bg-slate-50 p-4">
        {documents.map((doc, di) => {
          if (!doc || typeof doc !== 'object') return null

          if (doc.content && Array.isArray(doc.content)) {
            return (
              <div key={di} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                {doc.title && <h2 className="mb-3 text-base font-semibold">{doc.title}</h2>}
                {doc.content.map((block, bi) => {
                  switch (block.type) {
                    case 'text':
                      return <p key={bi} className="mb-2 text-sm">{block.content}</p>
                    case 'heading':
                      return <h3 key={bi} className="mb-1 mt-3 text-sm font-semibold">{block.content}</h3>
                    case 'list':
                      return (
                        <ul key={bi} className="mb-2 list-disc space-y-1 pl-5 text-sm">
                          {block.items?.map((item, ii) => (
                            <li key={ii}>{item.replace(/^\*/, '').trim()}</li>
                          ))}
                        </ul>
                      )
                    case 'table':
                      return (
                        <div key={bi} className="mb-4 overflow-x-auto">
                          <table className="min-w-full border-collapse text-sm">
                            <thead className="bg-slate-100">
                              <tr>
                                {block.headers?.map((h, hi) => (
                                  <th key={hi} className="border px-4 py-2 font-semibold">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {block.rows?.map((row, ri) => (
                                <tr key={ri} className="hover:bg-slate-50">
                                  {row.map((cell, ci) => (
                                    <td key={ci} className="border px-4 py-2">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    default:
                      return null
                  }
                })}
              </div>
            )
          }

          return (
            <div key={di} className="overflow-x-auto rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold">Document {di + 1}</h2>
              <table className="min-w-full border-collapse text-sm">
                <tbody>
                  {Object.entries(doc).map(([k, v]) => (
                    <tr key={k} className="hover:bg-slate-50">
                      <td className="w-1/3 border bg-slate-50 px-4 py-2 font-medium">{formatKey(k)}</td>
                      <td className="border px-4 py-2">{renderValue(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
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
      const responseData = await processDocument({
        fileName: fileNames[0],
        documentType: selectedOption,
        userInstruction: fileQueries[fileNames[0]] || 'None',
      })
      setProcessData({ responseType: selectedOption, response: responseData })
      setIsButtonHidden(true)
      setShowAdvancedSearch(false)
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'An unexpected error occurred.')
      toast.error('Failed to process the document.')
      setShowAdvancedSearch(false)
    } finally {
      setIsProcessing(false)
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

      {showAdvancedSearch && (
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fileNames.map((file) => (
            <div key={file} className="rounded-xl border border-[#d8e0ef] bg-white p-4 shadow-sm">
              <p className="mb-1 truncate text-xs text-slate-500">{file}</p>
              <input
                type="text"
                value={fileQueries[file] || ''}
                onChange={(e) => setFileQueries((p) => ({ ...p, [file]: e.target.value }))}
                placeholder="Enter your custom query..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#214aa6]"
              />
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {processData?.response?.body && (
        <>
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => {
                toast.info('Connect PdfDownload component for PDF export.')
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#214aa6] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#17367c]"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
          <DynamicData data={processData} />
        </>
      )}
    </div>
  )
}
