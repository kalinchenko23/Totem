import "./GradientText.css";

export default function GradientText({
  children,
  className = "",
  colors = ["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"], // Default colors
  animationSpeed = 8, // Default animation speed in seconds
  showBorder = false, // Default overlay visibility
  fontSize, // <<< 1. Add fontSize to the destructured props
}) {
  // This style is for the gradient background and animation, used by both overlay and text
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  // Create a new style object for the text content
  // It will include the gradient styles and, if provided, the fontSize
  const textContentStyle = {
    ...gradientStyle, // Spread the existing gradient styles
  };

  if (fontSize) { // <<< 2. If fontSize prop is provided, add it to the style
    textContentStyle.fontSize = fontSize;
  }

  return (
    <div className={`animated-gradient-text ${className}`}>
      {showBorder && <div className="gradient-overlay" style={gradientStyle}></div>}
      {/* VVV 3. Apply the new textContentStyle to the div that renders the children VVV */}
      <div className="text-content" style={textContentStyle}>
        {children}
      </div>
    </div>
  );
}