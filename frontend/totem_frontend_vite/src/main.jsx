import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Header from './Header.jsx'
import Lanyard from './components/Lanyard';



createRoot(document.getElementById('root')).render(
  <StrictMode>
     {/* <div className="lanyard-overlay">
       <Lanyard position={[0, 0, 25]} gravity={[0, -40, 0]} />
    </div> */}
    <Header />
    <App />

  </StrictMode>,
)
