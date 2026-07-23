import React from 'react'
import ReactDOM from 'react-dom/client'

import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/700.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/im-fell-english/400.css'
import '@fontsource/im-fell-english/400-italic.css'
import '@fontsource/im-fell-english-sc/400.css'
import '@fontsource/medievalsharp/400.css'
import '@fontsource/unifrakturmaguntia/400.css'

import './styles/base.css'
import './styles/ledger.css'
import './styles/journal.css'
import './styles/parchment.css'

import { DataProvider } from './state.jsx'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </React.StrictMode>
)
