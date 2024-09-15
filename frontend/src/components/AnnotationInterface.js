import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import TagManagement from './TagManagement';
import api from '../utils/api';
import { Select } from 'antd';
const { Option } = Select;

const AnnotationInterface = ({ videoId, videoUrl }) => {
  const [annotations, setAnnotations] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [selectedTag, setSelectedTag] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [videoDimensions, setVideoDimensions] = useState({
    width: 640,
    height: 360,
  });
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [tags, setTags] = useState([]);

  const predefinedTags = ["Car", "Tree", "Building", "Person", "Animal"];

  useEffect(() => {
    fetchAnnotations();
  }, [videoId]);

  const [filter, setFilter] = useState('none');

  const handleChange = (value) => {
    setFilter(value);
  };

  const fetchAnnotations = async () => {
    try {
      const response = await api.get(`http://localhost:8000/api/annotations/`);
      console.log('Fetched Annotations Response:', response);
      console.log('Fetched Annotations:', response.data)
      setAnnotations(response.data);
    } catch (error) {
      console.error("Error fetching annotations:", error);
    }
  };

  const getTagColorById = (tagId) => {
    const tag = tags.find((tag) => tag.id === tagId);
    return tag ? tag.color : "red";
  };

  const getTagNameById = (tagId) => {
    const tag = tags.find((tag) => tag.id === tagId);
    return tag ? tag.name : "Unknown";
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('http://localhost:8000/api/tags/');
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleTagsUpdate = (updatedTags) => {
    setTags(updatedTags);
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const time = e.target.value;
    console.log("Seeking to time:", time);
    if (videoRef.current) {
      videoRef.current.setCurrentTime(time);
    }
  };

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
    drawAnnotations();
  };

  const handleDurationChange = (duration) => {
    setTotalDuration(duration);
  };

  const handleCanvasMouseDown = (e) => {
    if (isPlaying) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    setStartPos({ x, y });
    setEndPos({ x, y });
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || isPlaying) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    setEndPos({ x, y });
    drawAnnotations();
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && selectedTag) {
      addAnnotation();
    }
    setIsDrawing(false);
  };

  const addAnnotation = async () => {
    if (!selectedTag) {
      console.error("No tag selected");
      return;
    }

    const canvas = canvasRef.current;
    const { x, y } = startPos;
    const width = endPos.x - startPos.x;
    const height = endPos.y - startPos.y;

    const selectedTagObject = tags.find((tag) => tag.id === selectedTag);

    const newAnnotation = {
      video: videoId,
      timestamp: currentTime,
      tag: parseInt(selectedTag),
      x: x / canvas.width,
      y: y / canvas.height,
      width: Math.abs(width) / canvas.width,
      height: Math.abs(height) / canvas.height,
    };

    try {
      const response = await api.post('http://localhost:8000/api/annotations/', newAnnotation);
      setAnnotations(prevAnnotations => [...prevAnnotations, response.data]);
      setSelectedTag('');
    } catch (error) {
      console.error("Error adding annotation:", error);
    }
  };

  const deleteAnnotation = async (annotationId) => {
    try {
      await api.delete(`http://localhost:8000/api/annotations/${annotationId}/`);
      setAnnotations(annotations.filter(ann => ann.id !== annotationId));
    } catch (error) {
      console.error("Error deleting annotation:", error);
    }
  };

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach((annotation) => {
      if (Math.abs(annotation.timestamp - currentTime) < 0.1) {
        ctx.strokeStyle = getTagColorById(annotation.tag);
        ctx.lineWidth = 2;
        ctx.strokeRect(
          annotation.x * canvas.width,
          annotation.y * canvas.height,
          annotation.width * canvas.width,
          annotation.height * canvas.height
        );
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        const tagName = getTagNameById(annotation.tag);
        const textWidth = ctx.measureText(tagName).width;
        const textHeight = 20; 
        ctx.fillText(
          tagName,
          annotation.x * canvas.width +
          (annotation.width * canvas.width - textWidth) / 2,
          annotation.y * canvas.height +
          (annotation.height * canvas.height + textHeight) / 2
        );
        ctx.fillStyle = getTagColorById(annotation.tag);
        ctx.font = "20px serif";
        ctx.fillText(getTagNameById(annotation.tag), annotation.x * canvas.width, annotation.y * canvas.height - 5);
      }
    });

    if (isDrawing) {
      const selectedTagObject = tags.find(
        (tag) => tag.id === parseInt(selectedTag)
      );
      const color = selectedTagObject ? selectedTagObject.color : "blue";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        startPos.x,
        startPos.y,
        endPos.x - startPos.x,
        endPos.y - startPos.y
      );
    }
  };

  const handleLoadedMetadata = (dimensions) => {
    setVideoDimensions(dimensions);
    if (canvasRef.current) {
      canvasRef.current.width = dimensions.width;
      canvasRef.current.height = dimensions.height;
    }
  };

  const handleClearAnnotations = async () => {
    try {
      await api.delete(`http://localhost:8000/api/videos/${videoId}/annotations/`);
      setAnnotations([]);
    } catch (error) {
      console.error("Error clearing annotations:", error);
    }
  };

  const handleDownloadAnnotations = () => {
    const annotationsWithTagName = annotations.map((annotation) => ({
      ...annotation,
      tag: getTagNameById(annotation.tag),
    }));
    annotationsWithTagName.forEach((annotation) => {
      delete annotation.id;
      delete annotation.video;
    });
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(annotationsWithTagName));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `video_${videoId}_annotations.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="p-4 flex flex-col items-center">
      Filter : <Select
        defaultValue="none"
        style={{ width: 120 }}
        onChange={handleChange}
        className="mb-4"
      >
        <Option value="none">None</Option>
        <Option value="sepia">Sepia</Option>
        <Option value="grayscale">Grayscale</Option>
      </Select>
      <div className="relative mb-4">
        <VideoPlayer
          videoUrl={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={handleDurationChange}
          filter={filter}
          ref={videoRef}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-auto z-10"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        />
      </div>
      <div className="flex items-center mb-4 justify-center w-full">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <div className="seekbar-container flex-grow relative">

          <input
            type="range"
            min="0"
            max={totalDuration}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full"
          />
          {annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="marker"
              style={{
                left: `${(annotation.timestamp / totalDuration) * 100}%`,
              }}
            />
          ))}
        </div>
        <span className="ml-2">
          {currentTime.toFixed(2)} / {totalDuration.toFixed(2)}
        </span>
      </div>
      <h3 className="mb-4">Use arrow keys to seek forward or backward</h3>
      <div className="mb-4 w-full flex justify-center">
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Select a tag</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>
      <TagManagement onTagsUpdate={handleTagsUpdate} />
      <div className="flex space-x-2 mb-4 justify-center">
        <button
          onClick={handleClearAnnotations}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear All Annotations
        </button>
        <button
          onClick={handleDownloadAnnotations}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Download Annotations
        </button>
      </div>
      <div className="p-6 bg-white rounded-lg shadow-md font-sans flex flex-col items-center">
        <h3 className="text-2xl font-bold mb-6 text-center">Annotations</h3>
        <ul className="space-y-4 w-full">
          {annotations.map((annotation) => (
            <li
              key={annotation.id}
              className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm"
            >
              <span className="text-lg text-gray-800">
                {getTagNameById(annotation.tag)} at{" "}
                {annotation.timestamp.toFixed(2)}s (x:{" "}
                {(annotation.x * 100).toFixed(2)}%, y:{" "}
                {(annotation.y * 100).toFixed(2)}%, width:{" "}
                {(annotation.width * 100).toFixed(2)}%, height:{" "}
                {(annotation.height * 100).toFixed(2)}%)
              </span>
              <button
                onClick={() => deleteAnnotation(annotation.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnnotationInterface;
