import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import AnnotationInterface from './AnnotationInterface';

function Video() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await api.get(`http://localhost:8000/api/videos/${id}/`);
        setVideo(response.data);
        console.log('Video data:', response.data);
        console.log('Full video URL:', `http://localhost:8000${response.data.file}`);
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };
  
    fetchVideo();
  }, [id]);
  
  if (!video) return <div className="text-center">Loading...</div>;

  // Construct the full URL for the video file
  const fullVideoUrl = `${video.file}`;
  console.log('Full Video URL:', fullVideoUrl);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      <h2 className="text-2xl font-bold mb-4 text-center">{video.title}</h2>
      <AnnotationInterface videoId={id} videoUrl={fullVideoUrl} />
    </div>
  );
}

export default Video;