import { useState, useRef } from 'preact/hooks'
import { JSX } from 'preact'
import { uploadService } from '../services/upload-service'

interface UploadResult {
  downloadURL: string
  fileName: string
  size: number
  type: string
}

export function FileUpload(): JSX.Element {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files) {
      setSelectedFiles(Array.from(target.files))
      setError('')
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    target.classList.add('drag-over')
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
    
    if (e.dataTransfer?.files) {
      const files = Array.from(e.dataTransfer.files)
      setSelectedFiles(files)
      setError('')
      
      // Update file input
      if (fileInputRef.current) {
        const dt = new DataTransfer()
        files.forEach(file => dt.items.add(file))
        fileInputRef.current.files = dt.files
      }
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload')
      return
    }

    setIsUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      uploadService.setProgressCallback(setUploadProgress)
      
      const results = await uploadService.uploadMultipleFiles(selectedFiles)
      setUploadResults(prev => [...prev, ...results])
      
      // Clear selection after successful upload
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleClear = () => {
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setError('')
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    
    // Update file input
    if (fileInputRef.current) {
      const dt = new DataTransfer()
      newFiles.forEach(file => dt.items.add(file))
      fileInputRef.current.files = dt.files
    }
  }

  const copyToClipboard = async (url: string, buttonElement: HTMLButtonElement) => {
    try {
      await navigator.clipboard.writeText(url)
      const originalText = buttonElement.textContent
      buttonElement.textContent = 'Copied!'
      setTimeout(() => {
        buttonElement.textContent = originalText
      }, 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="upload-section">
      <h2>Firebase Storage Upload Test</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div 
        className="upload-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="file-input-wrapper">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="*/*"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <label className="file-input-label">
            <span>Choose Files or Drag & Drop</span>
          </label>
        </div>
        
        <div className="upload-controls">
          <button 
            className="upload-btn" 
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </button>
          <button 
            className="clear-btn" 
            onClick={handleClear}
            disabled={isUploading}
          >
            Clear Selection
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="progress-text">{Math.round(uploadProgress)}% uploaded</p>
        </div>
      )}

      <div className="selected-files">
        <h3>Selected Files:</h3>
        <div className="files-list">
          {selectedFiles.length === 0 ? (
            <p className="no-files">No files selected</p>
          ) : (
            selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
                <span className="file-type">{file.type || 'Unknown'}</span>
                <button 
                  className="remove-file-btn" 
                  onClick={() => handleRemoveFile(index)}
                  disabled={isUploading}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="results-section">
        <h3>Upload Results:</h3>
        <div className="results-list">
          {uploadResults.map((result, index) => (
            <div key={index} className="result-item">
              <div className="result-info">
                <strong>{result.fileName}</strong>
                <span className="file-size">({formatFileSize(result.size)})</span>
                <span className="file-type">{result.type}</span>
              </div>
              <div className="result-url">
                <a href={result.downloadURL} target="_blank" rel="noopener noreferrer">
                  View File
                </a>
                <button 
                  className="copy-url-btn"
                  onClick={(e) => copyToClipboard(result.downloadURL, e.currentTarget)}
                >
                  Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}