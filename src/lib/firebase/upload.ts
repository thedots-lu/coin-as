import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from './config'

export type UploadProgress = (percent: number) => void

export async function uploadFile(
  file: File,
  storagePath: string,
  onProgress?: UploadProgress,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, storagePath)
    const task = uploadBytesResumable(storageRef, file)
    task.on(
      'state_changed',
      (snap) => {
        if (onProgress) {
          onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100))
        }
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve(url)
      },
    )
  })
}
