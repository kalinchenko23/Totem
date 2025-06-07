import React, { useState, useEffect } from 'react';

const ResponsiveBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setShowBanner(window.innerWidth <= 1024);
    };

    handleResize(); // Run once on mount
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!showBanner) return null;

  return (
<div style={{
  display: 'flex',
  flexDirection: 'column',      // Stack message and lights vertically
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100vw',
  backgroundColor: 'black',
  color: 'white',
  fontFamily: 'Doto',
  fontWeight: '1000',
  textAlign: 'center',
  padding: '1rem',
  fontSize: '2rem'
}}>
  Unfortunateley due to it's 3D rendering features and other animation this webpage is only supported on screens that are 1024 pixels wide or higher. The minimum recomended screen is 11ich tablet tilted horizontally.

  {/* LED lights container */}
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '1rem',
    gap: '1rem'
  }}>
    <div style={{
      width: '25px',
      height: '25px',
      borderRadius: '50%',
      backgroundColor: 'white',
      animation: 'blink 3s infinite '
    }}></div>
    <div style={{
      width: '25px',
      height: '25px',
      borderRadius: '50%',
      backgroundColor: 'lime',
      animation: 'blink 3s infinite 1s'
    }}></div>
    <div style={{
      width: '25px',
      height: '25px',
      borderRadius: '50%',
      backgroundColor: 'red',
      animation: 'blink 3s infinite 2s'
    }}></div>
  </div>

  {/* Add keyframes in a <style> tag */}
  <style>
    {`
      @keyframes blink {
        0%, 50%, 100% { opacity: 1; }
        25%, 75% { opacity: 0; }
      }
    `}
  </style>
</div>
  );
};

export default ResponsiveBanner;