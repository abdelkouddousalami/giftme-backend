import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext.jsx'
import { CartProvider } from '../store/CartContext.jsx'
import AppRoutes from './routes.jsx'

/**
 * Both providers wrap the router rather than sit inside it, so the session and
 * the cart survive navigation. They are storefront-scoped: the admin area
 * (/admin/*) brings its own AuthContext and never reads these.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
