import React from 'react'
import ReactDOM from 'react-dom/client'
import Component from '@aserto/authzen-interop-react'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Component
      vendor="Topaz"
      logo="logo.png"
      url="https://www.topaz.sh"
      pdpurl="https://authzen-topaz-proxy.demo.aserto.com"
    />
  </React.StrictMode>
)
