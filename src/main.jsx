/**
 * @file Browser bootstrap for the React application.
 * Sections: global CSS/imports and the React root render.
 * Application providers normally belong here; routed UI belongs in App/router.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
