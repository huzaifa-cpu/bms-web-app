import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './core/store/store'
import { ThemeService } from './core/ui/theme/theme_service'
import App from './app'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

// Apply persisted theme before render
ThemeService.applyStoredTheme()

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
