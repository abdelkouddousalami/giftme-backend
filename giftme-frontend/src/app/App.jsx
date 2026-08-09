import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext.jsx'
import { CartProvider } from '../store/CartContext.jsx'
import { ThemeProvider } from '../contexts/ThemeContext.jsx'
import AppRoutes from './routes.jsx'

/**
 * Both providers wrap the router rather than sit inside it, so the session and
 * the cart survive navigation. They are storefront-scoped: the admin area
 * (/admin/*) brings its own AuthContext and never reads these. ThemeProvider
 * is outside them too - the theme choice isn't tied to a session or a cart.
 */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
