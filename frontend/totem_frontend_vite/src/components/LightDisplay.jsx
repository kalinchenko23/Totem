// ./components/LightDisplay.js
import React, { useState, useEffect } from 'react';

const LightDisplay = ({
  color = 'grey',
  size = 20,
  isBlinking = false,
  blinkInterval = 1000,
  isOnInitially = true,
  specialBlink = null, // New prop for specific patterns like "3-pause"
  // description prop is removed as it was for text inside LED, which we are not using for this pattern
}) => {
  const [isOn, setIsOn] = useState(isOnInitially);

  useEffect(() => {
    // Clear previous timers or intervals when props change
    let timeoutId;

    if (specialBlink === "3-pause") {
      const onDuration = 250;  // Duration for each "on" part of a blink
      const offDuration = 250; // Duration for each "off" part of a blink
      const pauseDuration = 1000; // Duration of the pause after 3 blinks
      let cycleStep = 0;
      // 0: Blink 1 ON, 1: Blink 1 OFF
      // 2: Blink 2 ON, 3: Blink 2 OFF
      // 4: Blink 3 ON, 5: Blink 3 OFF (this is also the start of the pause)

      const executeCycle = () => {
        switch (cycleStep) {
          case 0: // Blink 1 ON
            setIsOn(true);
            timeoutId = setTimeout(executeCycle, onDuration);
            cycleStep = 1;
            break;
          case 1: // Blink 1 OFF
            setIsOn(false);
            timeoutId = setTimeout(executeCycle, offDuration);
            cycleStep = 2;
            break;
          case 2: // Blink 2 ON
            setIsOn(true);
            timeoutId = setTimeout(executeCycle, onDuration);
            cycleStep = 3;
            break;
          case 3: // Blink 2 OFF
            setIsOn(false);
            timeoutId = setTimeout(executeCycle, offDuration);
            cycleStep = 4;
            break;
          case 4: // Blink 3 ON
            setIsOn(true);
            timeoutId = setTimeout(executeCycle, onDuration);
            cycleStep = 5;
            break;
          case 5: // Blink 3 OFF (Start of Pause after this)
            setIsOn(false);
            timeoutId = setTimeout(executeCycle, pauseDuration); // Wait for pauseDuration
            cycleStep = 0; // Reset to start the 3-blink sequence again
            break;
          default: // Should not happen, reset
            cycleStep = 0;
            timeoutId = setTimeout(executeCycle, 100);
            break;
        }
      };

      executeCycle(); // Start the pattern

      return () => {
        clearTimeout(timeoutId); // Cleanup the timeout when component unmounts or props change
      };

    } else if (isBlinking) {
      setIsOn(true); // Start in "on" state for blinking
      const intervalId = setInterval(() => {
        setIsOn(prevIsOn => !prevIsOn);
      }, blinkInterval);
      return () => clearInterval(intervalId); // Cleanup the interval
    } else {
      // Solid state
      setIsOn(isOnInitially);
    }
  }, [color, isBlinking, blinkInterval, isOnInitially, specialBlink]); // Added dependencies

  // --- Styling ---
  let backgroundColor;
  let boxShadow = 'none';

  // Determine visual state based on isOn, similar to before
  if (isOn) {
    backgroundColor = color;
    boxShadow = `0 0 ${size / 1.5}px ${size / 3}px ${color}`;
  } else {
    // Off state for blinking, or explicitly off for solid
    backgroundColor = 'rgba(50, 50, 50, 0.5)'; // Dark grey for off
  }
  // If it's a solid light that is initially off AND not blinking and no special blink.
  if (!isBlinking && specialBlink === null && !isOnInitially) {
     backgroundColor = 'rgba(50, 50, 50, 0.5)'; // Dark grey for explicitly off solid light
     boxShadow = 'none';
  }


  const lightStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor: backgroundColor,
    boxShadow: boxShadow,
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease', // Faster transition
    border: `1px solid rgba(0,0,0,0.2)`,
    margin: 'auto',
  };

  return (
    <div style={lightStyle} aria-label={`Light: ${specialBlink || (isBlinking ? 'blinking' : (isOnInitially ? 'solid' : 'off'))} ${color}`}>
    </div>
  );
};

export default LightDisplay;