import { apiClient } from '../lib/api.js'

/**
 * Authentication — `/api/auth/**` (AuthController).
 *
 * The storefront uses the *same* backend auth system as the admin section;
 * only the stored session differs (see `src/lib/tokenStorage.js`). There is no
 * parallel customer auth mechanism.
 *
 * Registration always produces a CUSTOMER account — `RegisterRequest` has no
 * role field, so the storefront cannot ask for anything else.
 */

/** `POST /api/auth/register` → AuthResponse { accessToken, refreshToken, tokenType, expiresIn, user } */
export async function register({ fullName, email, phone, password }) {
  const { data } = await apiClient.post('/api/auth/register', {
    fullName,
    email,
    // Optional on the backend (@Size(max = 30), no @NotBlank) — send undefined
    // rather than "" so an untouched field isn't stored as an empty phone.
    phone: phone || undefined,
    password,
  })
  return data.data
}

/**
 * `POST /api/auth/login` → AuthResponse
 *
 * The backend field is `email` but is deliberately not @Email-validated — it is
 * matched against `users.email` as an opaque string, which is how the seeded
 * admin login (`aelalami`) works.
 */
export async function login({ email, password }) {
  const { data } = await apiClient.post('/api/auth/login', { email, password })
  return data.data
}

/** `GET /api/auth/me` → UserResponse { id, fullName, email, phone, role } */
export async function getCurrentUser() {
  const { data } = await apiClient.get('/api/auth/me')
  return data.data
}

/**
 * MISSING API — there is no `POST /api/auth/logout`.
 *
 * Refresh tokens are revoked only by rotation (`/api/auth/refresh`), so signing
 * out is a client-side session drop: the access token expires on its own within
 * 15 minutes. A server-side revoke endpoint would be the correct fix if a
 * shared-device sign-out needs to be immediate and total.
 */
