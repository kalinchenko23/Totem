import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import GradientText from './GradientText';

// Component to load and display the GLTF model
function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ModelViewer({ modelUrl }) {
  return (

       
    <div style={{backgroundColor: 'transparent',paddingLeft: "100px",paddingRight: '100px' }}>
       <div style={{ textAlign: 'center', transform: 'translateX(-55px)' }}>
          <img
            src={'/let_there_be_light2-removebg-preview.webp'}
            alt="Let there be light" // More descriptive alt text
            style={{ maxWidth: '100%', maxHeight: '400px', height: '300px' }} // Set height to auto for aspect ratio
          />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <GradientText
                          colors={["#ffffff", "#00ff66", "#ff4040", "#00ff66", "#ff4040"]}
                          animationSpeed={3}
                          showBorder={false}
                          className="custom-class"
                        >
                          Explore our device 3D Model (take a couple of seconds to render)
                        </GradientText>
        </div>
      <div style={{ display: 'flex',alignItems:'center', justifyContent: 'center', height: '1200px',marginBottom: '20px' }}>  
      <Canvas className='threeD_canvas_border' camera={{ position: [230, 50, -300], fov: 50 }}> {/* Adjust camera as needed */}
        <ambientLight intensity={2} /> {/* Basic lighting */}
        <directionalLight position={[30, 10, 15]} intensity={5} />
        <Suspense fallback={null}> {/* Shows a fallback while the model is loading */}
          <Model url={modelUrl} />
        </Suspense>
        <OrbitControls /> {/* Allows users to rotate, pan, and zoom the camera */}
      </Canvas>
    </div>
    </div>
  );
}

export default ModelViewer;