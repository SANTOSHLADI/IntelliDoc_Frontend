// ─── API Configuration ────────────────────────────────────────────────────────
const AZURE_FUNC_BASE = 'https://func-intellidoc-fafph2dqhzc0a3f4.eastus-01.azurewebsites.net/api'

// ─── CREDIQ / IntelliDoc APIs ────────────────────────────────────────────────

/**
 * Get a SAS URL for direct Blob Storage upload (CREDIQ / OCR flow)
 */
export const fetchFilePresignedUrl = async (fileName) => {
  const response = await fetch(`${AZURE_FUNC_BASE}/presignedurl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ DocumentID: fileName }),
  })
  if (!response.ok) throw new Error('Failed to fetch upload URL')
  const data = await response.json()
  // Backend returns { sasUrl, blobName } — adjust key name if yours differs
  return data?.sasUrl ?? data?.presignedUrl ?? null
}

/**
 * Get a SAS URL for invoice / ocr_all_documents upload
 * (same endpoint — kept as a separate export so callers don't need to change)
 */
export const fetchInvoicePresignedUrl = async (fileName) => {
  return fetchFilePresignedUrl(fileName)
}

/**
 * Upload a file directly to Azure Blob Storage using a SAS URL
 */
export const uploadFileToS3WithUrl = async (sasUrl, file) => {
  const response = await fetch(sasUrl, {
    method: 'PUT',
    headers: { 'x-ms-blob-type': 'BlockBlob' },
    body: file,
  })
  if (!response.ok) throw new Error('File upload to Blob Storage failed')
  return response
}

/**
 * Process a document through the IntelliDoc pipeline
 */
export const processDocument = async ({ fileName, documentType, userInstruction = 'None' }) => {
  const response = await fetch(`${AZURE_FUNC_BASE}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_key: fileName,
      document_type: documentType,
      User_instruction: userInstruction,
    }),
  })

  const responseData = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      responseData?.error || responseData?.message || `Server error (${response.status})`
    )
  }

  // Wrap in the shape the frontend expects: { body: { ... } }
  return { body: responseData }
}

// ─── OCR Endpoint ─────────────────────────────────────────────────────────────

/**
 * Run OCR on an already-uploaded Blob file
 */
export const runOcr = async (fileKey, documentType = 'ocr_all_documents', userInstruction = 'None') => {
  const response = await fetch(`${AZURE_FUNC_BASE}/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_key: fileKey,
      document_type: documentType,
      User_instruction: userInstruction,
    }),
  })
  if (!response.ok) throw new Error('OCR processing failed')
  return response.json()
}

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Semantic / keyword search over indexed documents
 */
export const searchDocuments = async (query, documentType = null, top = 5, fileName = null) => {
  const response = await fetch(`${AZURE_FUNC_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, document_type: documentType, top, file_name: fileName }),
  })
  if (!response.ok) throw new Error('Search failed')
  return response.json()
}
