import React, { useState } from 'react';
import api from '../utils/api';

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleUpload = async () => {
    if (!file || !title) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    setUploading(true);
    try {
      const response = await api.post('http://localhost:8000/api/videos/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Video uploaded successfully!');
      setUploadedVideo(response.data);
      setFile(null);
      setTitle('');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video');
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-5">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload Video</h2>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Video Title"
        className="border border-gray-300 rounded px-4 py-2 mb-4 w-full max-w-md"
      />
      <input
        type="file"
        onChange={handleFileChange}
        accept="video/*"
        className="border border-gray-300 rounded px-4 py-2 mb-4 w-full max-w-md"
      />
      <button
        onClick={handleUpload}
        disabled={!file || !title || uploading}
        className={`bg-blue-500 text-white px-6 py-2 rounded ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {uploadedVideo && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">Uploaded Video Information:</h3>
          <p><strong>Title:</strong> {uploadedVideo.title}</p>
          <p><strong>File URL:</strong> <a href={uploadedVideo.file_url} className="text-blue-500 hover:text-blue-700">{uploadedVideo.file_url}</a></p>
          <p><strong>File Size:</strong> {uploadedVideo.file_size} bytes</p>
          <p><strong>Uploaded At:</strong> {new Date(uploadedVideo.uploaded_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default VideoUpload;