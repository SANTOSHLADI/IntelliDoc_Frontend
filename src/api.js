// ─── API Configuration ───────────────────────────────────────────────────────
// Replace these with your actual backend URLs
export const API_BASE_URL = 'https://bj3n1ia0m6.execute-api.ap-south-1.amazonaws.com/demo'
export const INVOICE_API_URL = 'https://bj3n1ia0m6.execute-api.ap-south-1.amazonaws.com/dev/invoice'
export const PRESIGNED_URL_BASE = 'https://v1lt5g08mb.execute-api.ap-south-1.amazonaws.com/dev'
export const OCR_PROCESS_URL = 'https://67h9czr42i.execute-api.ap-south-1.amazonaws.com/ocr_aws_dev/'
export const OCR_UPLOAD_BASE = 'https://v1lt5g08mb.execute-api.ap-south-1.amazonaws.com/dev'

// ─── CREDIQ / IntelliDoc APIs ────────────────────────────────────────────────

/**
 * Get a presigned S3 upload URL for a document (CREDIQ flow)
 */
export const fetchFilePresignedUrl = async (fileName) => {
  const response = await fetch(`${API_BASE_URL}/bedrock_ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: 'presignedurl', DocumentID: fileName }),
  })
  if (!response.ok) throw new Error('Failed to fetch presigned URL')
  const data = await response.json()
  return data?.body?.presignedUrl ?? null
}

/**
 * Get a presigned S3 upload URL for invoice / ocr_all_documents
 */
export const fetchInvoicePresignedUrl = async (fileName) => {
  const response = await fetch(INVOICE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: 'presignedurl', DocumentID: fileName }),
  })
  if (!response.ok) throw new Error('Failed to fetch presigned URL')
  const data = await response.json()
  return data?.body?.presignedUrl ?? null
}

/**
 * Upload a file to S3 using a presigned PUT URL
 */
export const uploadFileToS3WithUrl = async (presignedUrl, file) => {
  const response = await fetch(presignedUrl, { method: 'PUT', body: file })
  if (!response.ok) throw new Error('File upload failed')
  return response
}

/**
 * Process a document through the CREDIQ pipeline
 */
export const processDocument = async ({ fileName, documentType, userInstruction = 'None' }) => {
  const isInvoiceType = documentType === 'invoice' || documentType === 'ocr_all_documents'
  const endpoint = isInvoiceType
    ? INVOICE_API_URL
    : `${API_BASE_URL}/dev_env`

  const payload = {
    file_key: fileName,
    document_type: documentType,
    User_instruction: userInstruction,
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const responseData = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(responseData?.body?.message || responseData?.message || `Server error (${response.status})`)
  }
  if (!responseData.body || Object.keys(responseData.body).length === 0) {
    throw new Error('Server returned empty response')
  }
  return responseData
}

// ─── OCR Dashboard APIs ───────────────────────────────────────────────────────

/**
 * Get a generic presigned URL (get or put) for the OCR flow
 */
export const fetchOcrPresignedUrl = async (key, method) => {
  const response = await fetch(`${OCR_UPLOAD_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, method }),
  })
  if (!response.ok) throw new Error('Failed to fetch presigned URL')
  return response.text()
}

/**
 * Upload image to S3 for OCR processing
 */
export const uploadImageForOcr = async (file) => {
  const key = `input-for-ocr/${file.name}`
  const presignedUrl = await fetchOcrPresignedUrl(key, 'put_object_presigned_url')
  const uploadResponse = await fetch(presignedUrl, { method: 'PUT', body: file })
  if (!uploadResponse.ok) throw new Error('Image upload failed')
  return key
}

/**
 * Run OCR on an uploaded image
 */
export const runOcr = async (s3Key, language) => {
  const response = await fetch(OCR_PROCESS_URL, {
    method: 'POST',
    body: JSON.stringify({ s3_uri: s3Key, lang: language }),
  })
  if (!response.ok) throw new Error('OCR processing failed')
  return response.json()
}

/**
 * Fetch a text file via presigned GET URL
 */
export const fetchTextFromKey = async (key) => {
  const url = await fetchOcrPresignedUrl(key, 'get_object_presigned_url')
  const res = await fetch(url)
  return res.text()
}

/**
 * Fetch a blob via presigned GET URL, return { url, width, height } for images
 */
export const fetchImageFromKey = async (key) => {
  const url = await fetchOcrPresignedUrl(key, 'get_object_presigned_url')
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve) => {
    const img = new Image()
    img.src = URL.createObjectURL(blob)
    img.onload = () => resolve({ url: img.src, width: img.width, height: img.height })
  })
}
