import { storage } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

export class UploadService {
  constructor() {
    this.uploadProgress = 0;
    this.onProgressCallback = null;
    this.onCompleteCallback = null;
    this.onErrorCallback = null;
  }

  setProgressCallback(callback) {
    this.onProgressCallback = callback;
  }

  setCompleteCallback(callback) {
    this.onCompleteCallback = callback;
  }

  setErrorCallback(callback) {
    this.onErrorCallback = callback;
  }

  async uploadFile(file, path = 'uploads/') {
    try {
      // Create a reference to the file location
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `${path}${fileName}`);

      // Create upload task for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Progress tracking
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.uploadProgress = progress;
            
            if (this.onProgressCallback) {
              this.onProgressCallback(progress);
            }
            
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            // Handle upload errors
            console.error('Upload failed:', error);
            if (this.onErrorCallback) {
              this.onErrorCallback(error);
            }
            reject(error);
          },
          async () => {
            // Upload completed successfully
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('File available at:', downloadURL);
              
              if (this.onCompleteCallback) {
                this.onCompleteCallback(downloadURL);
              }
              
              resolve({
                downloadURL,
                fileName,
                size: file.size,
                type: file.type
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files, path = 'uploads/') {
    const uploadPromises = Array.from(files).map(file => this.uploadFile(file, path));
    return Promise.all(uploadPromises);
  }
}