import { storage } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { StorageUploadResult } from '@/types/firestore';

/**
 * Upload file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  folder: 'requests' | 'voice' | 'documents' | 'profiles'
): Promise<StorageUploadResult> {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const path = `${folder}/${fileName}`;
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path,
      fileName,
      size: file.size,
      contentType: file.type
    };
  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * Delete file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('File deletion failed:', error);
    throw new Error('Failed to delete file from storage');
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: 'requests' | 'voice' | 'documents' | 'profiles'
): Promise<StorageUploadResult[]> {
  const uploadPromises = files.map(file => uploadFile(file, folder));
  return Promise.all(uploadPromises);
}
