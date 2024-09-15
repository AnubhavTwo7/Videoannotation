import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get('http://localhost:8000/api/videos/');
        setVideos(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch videos');
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center p-5">
      <h2 className="text-2xl font-bold mb-4 text-center">Video List</h2>
      {videos.length === 0 ? (
        <p className="text-center">No videos uploaded yet.</p>
      ) : (
        <ul className="w-full max-w-2xl">
          {videos.map((video) => (
            <li key={video.id} className="mb-4">
              <Link to={`/video/${video.id}`} className="text-blue-500 hover:text-blue-700">
                {video.title} - Uploaded on {new Date(video.uploaded_at).toLocaleDateString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VideoList;