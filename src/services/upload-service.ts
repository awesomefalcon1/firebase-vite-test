import { storage } from './firebase-config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface UploadResult {
  downloadURL: string;
  fileName: string;
  size: number;
  type: string;
}

class UploadService {
  private uploadProgress: number = 0;
  private onProgressCallback: ((progress: number) => void) | null = null;
  private onCompleteCallback: ((downloadURL: string) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  setProgressCallback(callback: (progress: number) => void): void {
    this.onProgressCallback = callback;
  }

  setCompleteCallback(callback: (downloadURL: string) => void): void {
    this.onCompleteCallback = callback;
  }

  setErrorCallback(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  async uploadFile(file: File, path: string = 'uploads/'): Promise<UploadResult> {
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

  async uploadMultipleFiles(files: File[], path: string = 'uploads/'): Promise<UploadResult[]> {
    const uploadPromises = Array.from(files).map(file => this.uploadFile(file, path));
    return Promise.all(uploadPromises);
  }
}

export const uploadService = new UploadService();