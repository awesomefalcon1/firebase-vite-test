import { useState } from 'preact/hooks'
import { Navigation } from './components/Navigation'
import { FileUpload } from './components/FileUpload'
import { DatabaseTest } from './components/DatabaseTest'

type Page = 'upload' | 'database'

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('upload')

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'upload' && <FileUpload />}
        {currentPage === 'database' && <DatabaseTest />}
      </main>
    </div>
  )
}