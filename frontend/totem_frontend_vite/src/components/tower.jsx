import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
// Component to load and display the GLTF model
function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ModelViewer({ modelUrl }) {
  return (

       
    <div style={{ height: '100vh', width: '100%', backgroundColor: 'transparent',paddingLeft: "400px",paddingRight: '400px', paddingBottom: '350px' }}>
       <div style={{ textAlign: 'center', transform: 'translateX(-55px)' }}>
          <img
            src={'/let_there_be_light2-removebg-preview.webp'}
            alt="Let there be light" // More descriptive alt text
            style={{ maxWidth: '100%', maxHeight: '400px', height: '300px' }} // Set height to auto for aspect ratio
          />
        </div>
    
      <Canvas className='threeD_canvas_border' camera={{ position: [250, 250, -250], fov: 45 }}> {/* Adjust camera as needed */}
        <ambientLight intensity={2} /> {/* Basic lighting */}
        <directionalLight position={[10, 10, 5]} intensity={5} />
        <Suspense fallback={null}> {/* Shows a fallback while the model is loading */}
          <Model url={modelUrl} />
        </Suspense>
        <OrbitControls /> {/* Allows users to rotate, pan, and zoom the camera */}
      </Canvas>

    </div>

  );
}

export default ModelViewer;