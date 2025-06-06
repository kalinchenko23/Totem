import { useState } from "react";
import "./Folder.css"; // Make sure your existing Folder.css is imported

// darkenColor function remains the same
const darkenColor = (hex, percent) => {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

const Folder = ({
  color = "#00d8ff",
  size = 1,
  items = [], // Expects items like: [{ id: '1', label: 'Google', url: 'https://google.com' }, ...]
  className = "", // For outer wrapper, e.g., for centering
}) => {
  const maxItems = 3; // Display up to 3 papers/links

  // Prepare papers: take up to maxItems, and pad with null if fewer items are provided
  const papersToShow = items.slice(0, maxItems);
  while (papersToShow.length < maxItems) {
    papersToShow.push(null); // Placeholder for empty paper slots
  }

  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );

  // Dynamically set paper colors and folder back color based on the main 'color' prop
  const folderBackColor = darkenColor(color, 0.08); // Slightly darker version of the main color
  const paper1Color = "#e0ffcd"; // Example: slightly off-white
  const paper2Color = "#ffcab0"; // Example: even slighter off-white
  const paper3Color = "white";                     // Example: pure white

  const folderStyleVariables = {
    "--folder-color": color,
    "--folder-back-color": folderBackColor,
    "--paper-1-bg-color": paper1Color, // CSS variable for paper 1 background
    "--paper-2-bg-color": paper2Color, // CSS variable for paper 2 background
    "--paper-3-bg-color": paper3Color, // CSS variable for paper 3 background
  };

  const handleClick = () => {
    setOpen((prev) => !prev);
    if (open) { // If closing, reset paper offsets
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  };

  const handlePaperMouseMove = (e, index) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15; // Magnetic effect strength
    const offsetY = (e.clientY - centerY) * 0.15;
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (index) => { // Removed 'e' as it's not used
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 }; // Reset offset
      return newOffsets;
    });
  };

  const folderClasses = `folder ${open ? "open" : ""}`.trim();
  const scaleStyle = { transform: `scale(${size})`, transformOrigin: 'center center' }; // Ensure scaling is centered

  return (
    <div style={scaleStyle} className={className}> {/* Outer div for scaling and custom class */}
      <div
        className={folderClasses}
        style={folderStyleVariables}
        onClick={handleClick}
        role="button"
        aria-expanded={open}
        tabIndex={0} // Make folder focusable
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }} // Keyboard accessibility
      >
        <div className="folder__back">
          {papersToShow.map((linkItem, i) => (
            <div
              key={linkItem?.id || `paper-${i}`} // Use link ID or index as key
              className={`paper paper-${i + 1}`} // e.g., paper-1, paper-2, paper-3
              onMouseMove={(e) => handlePaperMouseMove(e, i)}
              onMouseLeave={() => handlePaperMouseLeave(i)} // Pass index directly
              style={
                open
                  ? {
                      "--magnet-x": `${paperOffsets[i]?.x || 0}px`,
                      "--magnet-y": `${paperOffsets[i]?.y || 0}px`,
                      // Use CSS variables for individual paper backgrounds
                      backgroundColor: `var(--paper-${i + 1}-bg-color)`,
                    }
                  : {
                      backgroundColor: `var(--paper-${i + 1}-bg-color)`,
                    }
              }
            >
              {open && linkItem ? (
                <a
                  href={linkItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-link"
                  onClick={(e) => e.stopPropagation()} // Important: Prevents folder click when link is clicked
                  // Optional: Add onFocus/onBlur if you want to pause magnetic effect when link is focused
                >
                  {linkItem.label}
                </a>
              ) : (
                <span className="paper-empty-slot"></span> // Placeholder for empty or closed paper
              )}
            </div>
          ))}
          <div className="folder__front"></div>
          <div className="folder__front right"></div> {/* Assuming this is part of your design */}
        </div>
      </div>
    </div>
  );
};

export default Folder;