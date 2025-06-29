import { JSX } from 'preact'

interface NavigationProps {
  currentPage: 'upload' | 'database'
  onPageChange: (page: 'upload' | 'database') => void
}

export function Navigation({ currentPage, onPageChange }: NavigationProps): JSX.Element {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>Firebase Test App</h1>
        </div>
        <div className="nav-links">
          <button
            className={`nav-link ${currentPage === 'upload' ? 'active' : ''}`}
            onClick={() => onPageChange('upload')}
          >
            File Upload
          </button>
          <button
            className={`nav-link ${currentPage === 'database' ? 'active' : ''}`}
            onClick={() => onPageChange('database')}
          >
            Database Test
          </button>
        </div>
      </div>
    </nav>
  )
}