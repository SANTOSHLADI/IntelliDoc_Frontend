import { useState } from 'react'
import { toast } from 'react-toastify'
import UploadFile from './UploadFile'
import CrediqProcessing from './CrediqProcessing'

const DOCUMENT_OPTIONS = [
  { value: 'identity_card', label: 'Identity Card' },
  { value: 'Loan Application', label: 'Loan Application' },
  { value: 'cdsl_report', label: 'CDSL / NDLS Report' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'ocr_all_documents', label: 'OCR (All Documents)' },
]

export default function CREDIQ() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileInfo, setUploadedFileInfo] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploadComplete, setIsUploadComplete] = useState(false)
  const [fileKey, setFileKey] = useState(0)
  const [selectedOption, setSelectedOption] = useState('identity_card')

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    if (files.length > 10) {
      toast.error('Only 10 files are allowed at a time.')
      return
    }

    const VALID_TYPES = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ]
    const newFiles = files.filter((f) => VALID_TYPES.includes(f.type))
    if (newFiles.length !== files.length) {
      toast.error('Only PDF, DOCX, PNG, JPG files are allowed.')
      return
    }

    const duplicates = newFiles.filter((f) => selectedFiles.some((sf) => sf.name === f.name))
    if (duplicates.length > 0) {
      toast.error('This file has already been selected.')
      return
    }
    if (selectedFiles.length + newFiles.length > 10) {
      toast.error('You can only upload up to 10 files in total.')
      return
    }

    setSelectedFiles((prev) => [...prev, ...newFiles])
    setUploadedFileInfo([])
    setFileKey((k) => k + 1)
  }

  const handleReset = () => {
    setSelectedFiles([])
    setUploadedFileInfo([])
    setIsUploading(false)
    setIsProcessing(false)
    setIsUploadComplete(false)
    setFileKey((k) => k + 1)
  }

  return (
    <div className="rounded-[18px] border border-[#d8e0ef] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6 lg:p-7">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#e8edf6] pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="pt-2">
          <p className="text-[15px] font-medium text-[#214aa6]">Click to see the Generative AI in Action</p>
        </div>

        <div className="w-full max-w-[300px]">
          <select
            value={selectedOption}
            onChange={(e) => {
              setSelectedOption(e.target.value)
              handleReset()
            }}
            className="w-full rounded-xl border border-[#cfd7e6] bg-white px-4 py-3 text-[15px] text-slate-700 shadow-sm outline-none transition focus:border-[#214aa6] focus:ring-2 focus:ring-[#214aa6]/15"
          >
            {DOCUMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-[18px] border border-[#e0e6f2] bg-[#fcfdff] p-4 sm:p-6">
        <div className="rounded-[18px] border border-dashed border-[#cfd8e6] p-4 sm:p-5">
          <UploadFile
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            uploadedFileInfo={uploadedFileInfo}
            setUploadedFileInfo={setUploadedFileInfo}
            handleFileChange={handleFileChange}
            isUploadComplete={isUploadComplete}
            setIsUploadComplete={setIsUploadComplete}
            documentType={selectedOption}
            fileKey={fileKey}
          />

          {uploadedFileInfo.length > 0 && (
            <CrediqProcessing
              uploadedFileInfo={uploadedFileInfo}
              setUploadedFileInfo={setUploadedFileInfo}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              isUploadComplete={isUploadComplete}
              selectedOption={selectedOption}
            />
          )}
        </div>

        {(selectedFiles.length > 0 || uploadedFileInfo.length > 0) && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleReset}
              className="rounded-xl border border-[#214aa6] px-6 py-2.5 text-sm font-medium text-[#214aa6] transition hover:bg-[#214aa6] hover:text-white"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
