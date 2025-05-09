import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ArticleProvider from './contexts/ArticlesContext.tsx'
import DarkModeProvider from './contexts/DarkModeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ArticleProvider>
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </ArticleProvider>    
  </StrictMode>,
)
