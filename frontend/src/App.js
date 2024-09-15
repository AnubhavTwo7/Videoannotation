import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";
import Video from "./components/Video";
import LoginPage from "./Pages/LoginPage";

function Home() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl font-bold mb-4 text-center">
        Video Annotation Tool
      </h1>
      <div className="flex flex-row w-full">
        <div className="flex-1 flex items-center justify-center p-2">
          <VideoUpload />
        </div>
        <div className="flex-1 flex items-center justify-center p-2">
          <VideoList />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="w-full flex justify-center">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/videoslist" element={<VideoList />} />
          <Route path="/upload" element={<VideoUpload />} />
          <Route path="/video/:id" element={<Video />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
