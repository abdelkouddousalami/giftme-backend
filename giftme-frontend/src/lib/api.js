import axios from 'axios'

/** Reaches the same backend as the admin section - the storefront just has no auth to attach. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

/** Pulls the human-readable message out of the backend's ApiResponse error envelope. */
export function extractErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data?.message) return data.message
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
