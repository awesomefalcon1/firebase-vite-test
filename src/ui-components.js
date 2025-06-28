export class UIComponents {
  constructor() {
    this.uploadService = null;
    this.authService = null;
  }

  setServices(uploadService, authService) {
    this.uploadService = uploadService;
    this.authService = authService;
  }

  createFileUploadSection() {
    return `
      <div class="upload-section">
        <h2>Firebase Storage Upload Test</h2>
        
        <div class="auth-status" id="auth-status">
          <p>Authentication Status: <span id="auth-indicator">Not authenticated</span></p>
          <button id="sign-in-btn" class="auth-btn">Sign In Anonymously</button>
        </div>

        <div class="upload-area" id="upload-area">
          <div class="file-input-wrapper">
            <input type="file" id="file-input" multiple accept="*/*" disabled>
            <label for="file-input" class="file-input-label">
              <span>Choose Files or Drag & Drop</span>
            </label>
          </div>
          
          <div class="upload-controls">
            <button id="upload-btn" class="upload-btn" disabled>Upload Files</button>
            <button id="clear-btn" class="clear-btn">Clear Selection</button>
          </div>
        </div>

        <div class="progress-section" id="progress-section" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
          <p class="progress-text" id="progress-text">0% uploaded</p>
        </div>

        <div class="results-section" id="results-section">
          <h3>Upload Results:</h3>
          <div id="results-list"></div>
        </div>

        <div class="selected-files" id="selected-files">
          <h3>Selected Files:</h3>
          <div id="files-list"></div>
        </div>
      </div>
    `;
  }

  updateAuthStatus(user) {
    const authIndicator = document.getElementById('auth-indicator');
    const signInBtn = document.getElementById('sign-in-btn');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');

    if (user) {
      authIndicator.textContent = `Authenticated (${user.uid})`;
      authIndicator.className = 'authenticated';
      signInBtn.style.display = 'none';
      fileInput.disabled = false;
      uploadBtn.disabled = false;
    } else {
      authIndicator.textContent = 'Not authenticated';
      authIndicator.className = 'not-authenticated';
      signInBtn.style.display = 'inline-block';
      fileInput.disabled = true;
      uploadBtn.disabled = true;
    }
  }

  updateProgress(progress) {
    const progressSection = document.getElementById('progress-section');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    progressSection.style.display = 'block';
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}% uploaded`;
  }

  addUploadResult(result) {
    const resultsList = document.getElementById('results-list');
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.innerHTML = `
      <div class="result-info">
        <strong>${result.fileName}</strong>
        <span class="file-size">(${this.formatFileSize(result.size)})</span>
        <span class="file-type">${result.type}</span>
      </div>
      <div class="result-url">
        <a href="${result.downloadURL}" target="_blank" rel="noopener noreferrer">View File</a>
        <button class="copy-url-btn" data-url="${result.downloadURL}">Copy URL</button>
      </div>
    `;
    resultsList.appendChild(resultItem);
  }

  updateSelectedFiles(files) {
    const filesList = document.getElementById('files-list');
    filesList.innerHTML = '';

    if (files.length === 0) {
      filesList.innerHTML = '<p class="no-files">No files selected</p>';
      return;
    }

    files.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <span class="file-name">${file.name}</span>
        <span class="file-size">${this.formatFileSize(file.size)}</span>
        <span class="file-type">${file.type || 'Unknown'}</span>
        <button class="remove-file-btn" data-index="${index}">Remove</button>
      `;
      filesList.appendChild(fileItem);
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const uploadArea = document.getElementById('upload-area');
    uploadArea.insertBefore(errorDiv, uploadArea.firstChild);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  hideProgress() {
    const progressSection = document.getElementById('progress-section');
    progressSection.style.display = 'none';
  }
}