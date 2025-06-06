import SplashCursor from './components/SplashCursor'
import Balatro from './components/Balatro';
import TextPressure from './components/TextPressure';


function Header() {
  const handleAnimationComplete = () => {
  console.log('Animation completed!');
};
  return (
    <div className="header">
      
      <SplashCursor />
          <Balatro
            isRotate={false}
            mouseInteraction={false}
            pixelFilter={2000}
          />

      <div className="blur-text">
  
          <div style={{position: 'relative', height: '300px'}}>
  <TextPressure
    text="TOTEM"
    flex={false}
    alpha={false}
    stroke={true}
    width={true}
    weight={true}
    italic={true}
    textColor="black"
    strokeColor="black"
    minFontSize={14}
  />
</div>
                  
      </div>
    
    
    </div>
  );
}

export default Header;