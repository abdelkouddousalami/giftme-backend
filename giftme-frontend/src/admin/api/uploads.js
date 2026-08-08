import { apiClient } from './client.js'

export async function uploadImage(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post('/api/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    },
  })
  return data.data
}
