import { useRef } from 'react'
import { toast } from 'react-toastify'
import { CloudUpload, FilePlus, FileCheck, Paperclip, CircleX, Loader2 } from 'lucide-react'
import { fetchFilePresignedUrl, fetchInvoicePresignedUrl, uploadFileToS3WithUrl } from '../api'

const VALID_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
]

export default function UploadFile({
  selectedFiles,
  setSelectedFiles,
  isUploading,
  setIsUploading,
  uploadedFileInfo,
  setUploadedFileInfo,
  handleFileChange,
  isUploadComplete,
  setIsUploadComplete,
  documentType,
  fileKey,
}) {
  const inputRef = useRef(null)

  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== fileName))
  }

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return
    setIsUploading(true)
    setIsUploadComplete(false)
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const isInvoiceType = documentType === 'invoice' || documentType === 'ocr_all_documents'
        const presignedUrl = isInvoiceType
          ? await fetchInvoicePresignedUrl(file.name)
          : await fetchFilePresignedUrl(file.name)

        if (!presignedUrl) {
          toast.error(`No presigned URL for: ${file.name}`)
          return null
        }
        await uploadFileToS3WithUrl(presignedUrl, file)
        const fileLocation = presignedUrl.split('?')[0]
        return { name: file.name, url: fileLocation }
      })

      const results = await Promise.all(uploadPromises)
      const uploaded = results.filter(Boolean)
      setUploadedFileInfo((prev) => [...prev, ...uploaded])
      toast.success('Files uploaded successfully!')
      setIsUploadComplete(true)
    } catch (err) {
      toast.error(err.message || 'Error uploading files.')
    } finally {
      setIsUploading(false)
      setSelectedFiles([])
    }
  }

  return (
    <div className="my-2">
      <h2 className="mb-5 inline-flex items-center text-[19px] font-semibold text-slate-800">
        <CloudUpload className="mr-3 h-5 w-5 text-[#214aa6]" />
        Upload File
      </h2>

      <div className="rounded-[18px] border border-dashed border-[#cfd8e6] bg-white p-5 sm:p-6">
        {selectedFiles.length === 0 && (
          <div className="flex flex-col gap-4 rounded-2xl bg-[#f4f6fa] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex min-h-[68px] flex-1 items-center gap-3 rounded-2xl border border-transparent bg-[#eef2f8] px-4 text-left text-slate-700"
            >
              <FilePlus className="h-6 w-6 shrink-0 text-slate-700" />
              <span className="text-[16px] font-medium">Choose Files</span>
            </button>

            <label
              htmlFor="fileInput"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#214aa6] bg-white px-5 py-3 text-sm font-medium text-[#214aa6] transition hover:bg-[#214aa6] hover:text-white"
            >
              <Paperclip className="h-4 w-4" />
              Browse Files
            </label>
            <input
              ref={inputRef}
              key={fileKey}
              type="file"
              id="fileInput"
              accept=".docx,.pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {selectedFiles.length > 0 && (
          <>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#214aa6]">
              <FileCheck className="h-4 w-4" />
              Selected Files
            </h3>
            <div className="mt-3 space-y-3">
              {selectedFiles.map((file) => (
                <div key={file.name} className="flex flex-col gap-3 rounded-2xl border border-[#d9e1ef] bg-[#f7f9fd] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <FileCheck className="h-4 w-4 text-[#214aa6]" />
                    <span className="truncate font-medium">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.name)}
                    className="inline-flex items-center gap-1 self-start rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 transition hover:border-red-400 hover:text-red-700 sm:self-auto"
                  >
                    <CircleX className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={handleUploadAll}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#214aa6] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#17367c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {isUploadComplete && uploadedFileInfo.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700">
            <CloudUpload className="h-4 w-4" />
            Uploaded
          </h3>
          <div className="space-y-1">
            {uploadedFileInfo.map((file) => (
              <div key={file.name} className="flex items-center gap-2 text-sm text-slate-600">
                <FileCheck className="h-4 w-4 text-green-600" />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
