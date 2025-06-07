import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Header from './Header.jsx';
import ResponsiveBanner from './components/SmallScreenBanner';

// Create a wrapper component to handle the logic:
const MainApp = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize(); // Run once on mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <ResponsiveBanner />;
  }

  return (
    <>
      <Header />
      <App />
    </>
  );
};

// Render the wrapper component:
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainApp />
  </StrictMode>
);