// ./components/LightSignalTable.js
import React from 'react';
import LightDisplay from './LightDisplay';

const LightSignalTable = () => {
  const signalData = [
    // ... (Signal data remains the same as before from the PDF)
    {
      condition: "The device is off",
      white: { state: "Off" }, red: { state: "Off" }, green: { state: "Off" }, notes: ""
    },
    {
      condition: "The device is booted",
      white: { state: "Solid" }, red: { state: "Off" }, green: { state: "Off" }, notes: ""
    },
    {
      condition: "Scan is in progress",
      white: { state: "Blinking" }, red: { state: "Off" }, green: { state: "Off" }
    },
    {
      condition: "Something went wrong", // This is the row we are targeting
      white: { state: "3 blinks at a time" }, // [cite: 1] (This state comes from the document)
      red: { state: "Off" }, // [cite: 1]
      green: { state: "Off" }, // [cite: 1]
    },
    {
      condition: "No match found",
      white: { state: "Solid" }, red: { state: "Off" }, green: { state: "Solid" }
    },
    {
      condition: "Match found",
      white: { state: "Solid" }, red: { state: "Solid" }, green: { state: "Off" }
    }
  ];

  const getLightProps = (lightState, lightTypeColor) => {
    const stateString = lightState.state; // e.g., "Off", "Solid", "Blinking", "3 blinks at a time" [cite: 1]

    switch (stateString) {
      case "Off":
        return { color: 'rgba(70, 70, 70, 0.7)', isBlinking: false, isOnInitially: false, specialBlink: null };
      case "Solid":
        return { color: lightTypeColor, isBlinking: false, isOnInitially: true, specialBlink: null };
      case "Blinking":
        return { color: lightTypeColor, isBlinking: true, blinkInterval: 700, isOnInitially: true, specialBlink: null };
      case "3 blinks at a time": // This is the key change [cite: 1]
        return {
          color: lightTypeColor,
          isBlinking: false,       // Ensure normal blinking is off
          isOnInitially: false,    // Initial state will be handled by the special pattern
          specialBlink: "3-pause"  // Activate the special pattern
        };
      default:
        return { color: 'grey', isBlinking: false, isOnInitially: false, specialBlink: null };
    }
  };

  // --- Styles (tableStyle, thStyle, tdStyle, lightCellTdStyle) remain the same ---
  const tableStyle = {
    borderCollapse: 'collapse', margin: '20px auto', backgroundColor: 'black',
    color: 'white', fontSize: '35px', fontFamily: 'Doto',fontWeight: '1000', textAlign: 'center',
  };
  const tdStyle = {
    border: 'none', padding: '8px', textAlign: 'right', verticalAlign: 'middle',
  };
  const lightCellTdStyle = {
    ...tdStyle, textAlign: 'center', width: '100px',
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'black' }}>
        <table style={tableStyle}>
        <tbody>
          {signalData.map((row, index) => (
            <tr key={index}>
              <td style={tdStyle}>{row.condition}</td>
              <td style={lightCellTdStyle}>
                <LightDisplay {...getLightProps(row.white, 'white')} />
              </td>
              <td style={lightCellTdStyle}>
                <LightDisplay {...getLightProps(row.red, 'red')} />
              </td>
              <td style={lightCellTdStyle}>
                <LightDisplay {...getLightProps(row.green, 'lime')} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LightSignalTable;