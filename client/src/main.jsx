import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './theme/ThemeContext.jsx'
import { TimerProvider } from './timer/TimerContext.jsx'
import { ToastProvider } from './toast/ToastContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Global providers wrap the app with theme, timer, toast, and routing state. */}
    <ThemeProvider>
      <TimerProvider>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </TimerProvider>
    </ThemeProvider>
  </StrictMode>,
)
