import './App.css';
import SpotlightCard from './components/SpotlightCard';
import image1 from '/image1.png';
import image2 from '/image2.png';
import image3 from '/image3.png';
import GradientText from './components/GradientText';
import Folder from './components/Folder';
import ScrollVelocity from './components/ScrollVelocity';
import InfiniteScroll from './components/InfiniteScroll'
import Aurora from './components/Aurora';
import CircularGallery from './components/CircularGallery.jsx'
import ScrollableScene from './components/tower.jsx';
import ProfileCard from './components/ProfileCard'
import LightSignalTable from './components/LightSignalTable'; 

  function App() {
    const folderLinks = [
    { id: 'link1', label: 'MICS', url: 'https://www.ischool.berkeley.edu/programs/mics' },
    { id: 'link2', label: 'MVT project', url: 'https://github.com/mvt-project/mvt' },
    { id: 'link3', label: 'Totem', url: 'https://github.com/kalinchenko23/Totem' },]
    const velocity = 30; 

  
    const items = [
    { content: <p>Person 1</p> },
    { content: <p>Person 2</p> },
    { content: <p>Person 3</p> },
    { content: <p>Person 4</p> },
    { content: <p>Person 5</p> },

  ];
   

  return (
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />,

    <div className="App">
      <div className="vertical-stack">
        
        <SpotlightCard className="custom-spotlight-card" > 
              <div className="aurora-container">
              <Aurora
              colorStops={["#FF0000", "#7CFC00", "#FF3232"]}
              blend={0.3}
              amplitude={1}
              speed={0.3}
            />
            </div>
            <div className="text-style" style={{ color: 'white' /* Assuming white text from previous context */ }}>
  We created our digital forensics device with one clear goal: make advanced cybersecurity tools accessible to everyone. Traditional forensics solutions are often complex, technical, and intimidating. We wanted to change that. Our device is designed to be simple, intuitive, and effective. With just connecting a phone, it scans, analyzes, and communicates the results clearly using a universally understood system of lights.
        </div>
           <ScrollableScene modelUrl="/sather-cover.glb" />
          
        </SpotlightCard>
        <div>
          <LightSignalTable />
        </div>
        {/* Images with gradient text */}
          <div className="container-style">
            <div  className="image-container-style">
              <img src={image2} alt="Spyware warning" className="image-style" />
              <GradientText
                colors={["#ffffff", "#00ff66", "#ff4040", "#00ff66", "#ff4040"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
              >
                There is always evolving spyware!
              </GradientText>
            </div>

            <div className="image-container-style">
              <img src={image1} alt="Compromise risks" className="image-style" />
              <GradientText
                colors={["#ffffff", "#00ff66", "#ff4040", "#00ff66", "#ff4040"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
              >
                Lots of ways to get compromised!
              </GradientText>
            </div>

            <div className="image-container-style">
              <img src={image3} alt="Undetected threats" className="image-style" />
              <GradientText
                colors={["#ffffff", "#00ff66", "#ff4040", "#00ff66", "#ff4040"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
              >
                Can stay undetected for a long time!
              </GradientText>
            </div>
          </div>
          {/* Links */}
          <div style={{
          height: '600px',
          width: '100%', 
          backgroundColor: 'black', 
          position: 'relative',    
        }}>

          {/* Layer 1: ScrollVelocity (Background) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex', // To center the ScrollVelocity component's content
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,       // Lower z-index, so it's behind the folder
            overflow: 'hidden', // Recommended to clip the running text within this area
          }}>
            <ScrollVelocity
              texts={['Check out our links', 'Check out our links']} 
              velocity={velocity}
            />
          </div>

          {/* Layer 2: Folder (Foreground) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex', // To center the Folder component
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,      // Higher z-index, so it's on top
          }}>
            <Folder
              items={folderLinks}
              color="#dc2f2f"
              size={3}              
            />
            </div>
          </div>
           {/* --- New YouTube Video Section --- */}
        <div className="youtube-section">
          <h2 className="youtube-section-title"><GradientText
                colors={["#ffffff", "#00ff66", "#ff4040", "#00ff66", "#ff4040"]}
                animationSpeed={3}
                showBorder={false}
                fontSize="2.4em" 
              >
                Check out instructions video!
              </GradientText></h2> 
          <div className="video-container"> {/* For sizing and centering the video player */}
            <div className="video-responsive-wrapper"> {/* For responsive aspect ratio */}
              <iframe
                src={`https://www.youtube.com/embed/qYGH6CmYzEE?autoplay=0&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
                <GradientText
                colors={["#ffffff", "#00ff66", "#ff4040", "#00ff66", "#ff4040"]}
                animationSpeed={3}
                showBorder={false}
                fontSize="3em" 
              >
               Meet the team!
              </GradientText>
        {/* Team Cards Section */}
         <div className="pixel-transitions-section">
            <div className="pixel-transitions-container"> {/* This is the flex container */}
              <ProfileCard
              name="Max"
              title="Software Engineer"
              contactText="Contact Me"
              avatarUrl="/Max_no_background.png"
              showUserInfo={true}
              enableTilt={true}
              contactUrl='https://www.linkedin.com/in/maksym-kalinchenko-146746183/'
              onContactClick={() => console.log('Contact clicked')}
            />
            <ProfileCard
              name="Luis"
              title="Networking Guru"
              contactText="Contact Me"
              avatarUrl="/Luis_no_background.png"
              contactUrl="https://www.linkedin.com/in/lignaciovalencia/"
              showUserInfo={true}
              enableTilt={true}
              onContactClick={() => console.log('Contact clicked')}
            />
            <ProfileCard
              name="Matt"
              title="Chief Panic Officer"
              handle="javicodes"
              status="Online"
              contactText="Contact Me"
              avatarUrl="/Matt_no_background.png"
              contactUrl='https://www.ischool.berkeley.edu/people/matt-campbell'
              showUserInfo={true}
              enableTilt={true}
              onContactClick={() => console.log('Contact clicked')}
            />
            <ProfileCard
              name="Charles"
              title="Future CEO"
              contactText="Contact Me"
              avatarUrl="/Charles_no_background.png"
              contactUrl='https://www.ischool.berkeley.edu/people/charles-keith'
              showUserInfo={true}
              enableTilt={true}
              onContactClick={() => console.log('Contact clicked')}
            />
            <ProfileCard
              name="Alex"
              title="Software Engineer"
              handle="javicodes"
              status="Online"
              contactText="Contact Me"
              avatarUrl="/Alex_no_background.png"
              contactUrl='https://www.linkedin.com/in/alexander-radetsky/'
              showUserInfo={true}
              enableTilt={true}
              onContactClick={() => console.log('Contact clicked')}
            />
            </div>
          </div>
          <div >
            <GradientText
                colors={["#ffffff", "#00ff66", "#ff4040", "#00ff66", "#ff4040"]}
                animationSpeed={3}
                showBorder={false}
                fontSize="3em" 
              >
               Our thank you to the following contributors
              </GradientText>
            </div>
            <InfiniteScroll
              items={items}
              isTilted={false}
              tiltDirection='left'
              autoplay={true}
              autoplaySpeed={1}
              autoplayDirection="down"
              pauseOnHover={true}
            />

         


          {/* Photo Gallery */}
          <div style={{height: '600px', position: 'relative',backgroundColor:'black'}}>
             <GradientText
                colors={["#ffffff", "#00ff66", "#ff4040", "#00ff66", "#ff4040"]}
                animationSpeed={3}
                showBorder={false}
                fontSize="3em" 
              >
               Our project gallery
              </GradientText>
          
          <div style={{ height: '600px', position: 'relative', paddingTop: '50px'}}>
              <CircularGallery bend={0} textColor="#ffffff" borderRadius={0.05} />

            </div>
          
          </div>
          
          {/* Footer starts */}
          <div style={{
                position: 'relative', height: '400px',width: '100%', padding: '200px'}}>

                   <div style={{ textAlign: 'center', transform: 'translateX(0px)' }}>
                          <img
                            src={'/University_of_California_Logo.png'}
                            alt="Let there be light" // More descriptive alt text
                            style={{ maxWidth: '100%', maxHeight: '400px', height: '300px' }} // Set height to auto for aspect ratio
                          />
                        </div>

                      <div className="text-style">
                        <p>Contact: kalinchenko_m@berkeley.edu</p>
                        <p>© 2025 Totem. All Rights Reserved.</p>
                      </div>

                <div style={{
                  position: 'relative',
                  bottom: '0px',  // Pushes it to the bottom (respecting parent's padding if set, or use bottom:0)
                  left: '-200px',   // Aligns to the left (respecting parent's padding)
                  right: '0px',
                  width: '100%',  // Stretches to the right (respecting parent's padding)
                  transform: 'scaleY(-1)' // Optional: keeps it upside down
                        }}>
                          <Aurora
                          colorStops={["#FF0000", "#7CFC00", "#FF3232"]}
                          blend={0.3}
                          amplitude={1}
                          speed={0.3}
                        />

                </div>
              </div>
                    
        </div>
        </div>
        
  );
}

export default App;