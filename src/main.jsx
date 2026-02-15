import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './Pages/App/'
import './index.css'

const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  const traceTargets = ['localhost']
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl) {
    try {
      traceTargets.push(new URL(apiUrl).origin)
    } catch (error) {
      console.warn('Invalid VITE_API_URL for Sentry tracing:', error.message)
    }
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0),
    tracePropagationTargets: traceTargets
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
