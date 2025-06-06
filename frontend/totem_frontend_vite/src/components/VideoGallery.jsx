import React from 'react';

const videos = [
  { title: 'Intro to AI', url: 'https://www.youtube.com/watch?v=JMUxmLyrhSk' },
  { title: 'What is React?', url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0' },
  { title: 'The Future of Tech', url: 'https://www.youtube.com/watch?v=2ePf9rue1Ao' },
];

function VideoGallery() {
  return (
    <section>
      <ul className="video-list">
        {videos.map((video, idx) => (
          <li key={idx}>
            <a href={video.url} target="_blank" rel="noopener noreferrer">
              {video.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default VideoGallery;
