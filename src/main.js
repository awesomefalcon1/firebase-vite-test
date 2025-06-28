import './style.css'
import { UploadService } from './upload-service.js';
import { AuthService } from './auth-service.js';
import { UIComponents } from './ui-components.js';

class FirebaseUploadApp {
  constructor() {
    this.uploadService = new UploadService();
    this.authService = new AuthService();
    this.uiComponents = new UIComponents();
    this.selectedFiles = [];
    
    this.init();
  }

  init() {
    this.setupServices();
    this.renderApp();
    this.setupEventListeners();
    this.authService.init();
  }

  setupServices() {
    this.uiComponents.setServices(this.uploadService, this.authService);
    
    this.uploadService.setProgressCallback((progress) => {
      this.uiComponents.updateProgress(progress);
    });

    this.uploadService.setCompleteCallback((downloadURL) => {
      console.log('Upload completed:', downloadURL);
    });

    this.uploadService.setErrorCallback((error) => {
      this.uiComponents.showError(`Upload failed: ${error.message}`);
      this.uiComponents.hideProgress();
    });

    this.authService.setAuthStateCallback((user) => {
      this.uiComponents.updateAuthStatus(user);
    });
  }

  renderApp() {
    const app = document.querySelector('#app');
    if (!app) {
      console.error('App element not found');
      return;
    }

    app.innerHTML = this.uiComponents.createFileUploadSection();
  }

  setupEventListeners() {
    // Sign in button
    document.getElementById('sign-in-btn').addEventListener('click', async () => {
      try {
        await this.authService.signInAnonymously();
      } catch (error) {
        this.uiComponents.showError(`Authentication failed: ${error.message}`);
      }
    });

    // File input
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e) => {
      this.selectedFiles = Array.from(e.target.files);
      this.uiComponents.updateSelectedFiles(this.selectedFiles);
    });

    // Drag and drop
    const uploadArea = document.getElementById('upload-area');
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      
      const files = Array.from(e.dataTransfer.files);
      this.selectedFiles = files;
      this.uiComponents.updateSelectedFiles(this.selectedFiles);
      
      // Update file input
      const dt = new DataTransfer();
      files.forEach(file => dt.items.add(file));
      fileInput.files = dt.files;
    });

    // Upload button
    document.getElementById('upload-btn').addEventListener('click', async () => {
      if (this.selectedFiles.length === 0) {
        this.uiComponents.showError('Please select files to upload');
        return;
      }

      if (!this.authService.isAuthenticated()) {
        this.uiComponents.showError('Please sign in first');
        return;
      }

      try {
        const results = await this.uploadService.uploadMultipleFiles(this.selectedFiles);
        results.forEach(result => {
          this.uiComponents.addUploadResult(result);
        });
        
        // Clear selection after successful upload
        this.clearSelection();
      } catch (error) {
        console.error('Upload error:', error);
      }
    });

    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
      this.clearSelection();
    });

    // Copy URL buttons (event delegation)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('copy-url-btn')) {
        const url = e.target.dataset.url;
        navigator.clipboard.writeText(url).then(() => {
          e.target.textContent = 'Copied!';
          setTimeout(() => {
            e.target.textContent = 'Copy URL';
          }, 2000);
        });
      }
    });

    // Remove file buttons (event delegation)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-file-btn')) {
        const index = parseInt(e.target.dataset.index);
        this.selectedFiles.splice(index, 1);
        this.uiComponents.updateSelectedFiles(this.selectedFiles);
        
        // Update file input
        const dt = new DataTransfer();
        this.selectedFiles.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
      }
    });
  }

  clearSelection() {
    this.selectedFiles = [];
    document.getElementById('file-input').value = '';
    this.uiComponents.updateSelectedFiles(this.selectedFiles);
    this.uiComponents.hideProgress();
  }
}

// Initialize the app
new FirebaseUploadApp();