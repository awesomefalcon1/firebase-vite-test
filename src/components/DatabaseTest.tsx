import { useState } from 'preact/hooks'
import { JSX } from 'preact'
import { databaseService } from '../services/database-service'

interface Document {
  id: string
  [key: string]: any
}

export function DatabaseTest(): JSX.Element {
  const [collection, setCollection] = useState<string>('test-collection')
  const [documentData, setDocumentData] = useState<string>('{\n  "name": "Test Document",\n  "timestamp": "' + new Date().toISOString() + '",\n  "value": 42\n}')
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const handleAddDocument = async () => {
    if (!collection.trim()) {
      setError('Please enter a collection name')
      return
    }

    try {
      const data = JSON.parse(documentData)
      setIsLoading(true)
      setError('')
      setSuccess('')

      const docId = await databaseService.addDocument(collection, data)
      setSuccess(`Document added successfully with ID: ${docId}`)
      
      // Refresh the documents list
      await handleGetDocuments()
    } catch (error) {
      console.error('Error adding document:', error)
      if (error instanceof SyntaxError) {
        setError('Invalid JSON format in document data')
      } else {
        setError(`Failed to add document: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetDocuments = async () => {
    if (!collection.trim()) {
      setError('Please enter a collection name')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      const docs = await databaseService.getDocuments(collection)
      setDocuments(docs)
      setSuccess(`Retrieved ${docs.length} documents from ${collection}`)
    } catch (error) {
      console.error('Error getting documents:', error)
      setError(`Failed to get documents: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      await databaseService.deleteDocument(collection, docId)
      setSuccess(`Document ${docId} deleted successfully`)
      
      // Refresh the documents list
      await handleGetDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
      setError(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateDocument = async (docId: string) => {
    try {
      const data = JSON.parse(documentData)
      setIsLoading(true)
      setError('')
      setSuccess('')

      await databaseService.updateDocument(collection, docId, data)
      setSuccess(`Document ${docId} updated successfully`)
      
      // Refresh the documents list
      await handleGetDocuments()
    } catch (error) {
      console.error('Error updating document:', error)
      if (error instanceof SyntaxError) {
        setError('Invalid JSON format in document data')
      } else {
        setError(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  return (
    <div className="database-section">
      <h2>Firebase Firestore Database Test</h2>
      <p className="section-description">
        Test your Firebase Firestore rules and permissions by performing CRUD operations.
      </p>

      {error && (
        <div className="error-message">
          {error}
          <button className="close-btn" onClick={clearMessages}>×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
          <button className="close-btn" onClick={clearMessages}>×</button>
        </div>
      )}

      <div className="database-controls">
        <div className="input-group">
          <label htmlFor="collection-input">Collection Name:</label>
          <input
            id="collection-input"
            type="text"
            value={collection}
            onChange={(e) => setCollection((e.target as HTMLInputElement).value)}
            placeholder="Enter collection name"
            disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="document-data">Document Data (JSON):</label>
          <textarea
            id="document-data"
            value={documentData}
            onChange={(e) => setDocumentData((e.target as HTMLTextAreaElement).value)}
            placeholder="Enter JSON document data"
            rows={8}
            disabled={isLoading}
          />
        </div>

        <div className="button-group">
          <button 
            className="add-btn" 
            onClick={handleAddDocument}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Document'}
          </button>
          <button 
            className="get-btn" 
            onClick={handleGetDocuments}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Get Documents'}
          </button>
        </div>
      </div>

      <div className="documents-section">
        <h3>Documents in Collection: {collection}</h3>
        <div className="documents-list">
          {documents.length === 0 ? (
            <p className="no-documents">No documents found. Click "Get Documents" to load or add some documents first.</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="document-header">
                  <strong>ID: {doc.id}</strong>
                  <div className="document-actions">
                    <button 
                      className="update-btn"
                      onClick={() => handleUpdateDocument(doc.id)}
                      disabled={isLoading}
                    >
                      Update
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteDocument(doc.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="document-content">
                  <pre>{JSON.stringify(doc, null, 2)}</pre>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}