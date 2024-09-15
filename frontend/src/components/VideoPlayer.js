import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const VideoPlayer = forwardRef(({ videoUrl, onTimeUpdate, onLoadedMetadata, onDurationChange, filter }, ref) => {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    get videoWidth() {
      return videoRef.current?.videoWidth;
    },
    get videoHeight() {
      return videoRef.current?.videoHeight;
    },
    play: () => {
      console.log('Playing video'); // Debugging log
      videoRef.current.play();
    },
    pause: () => {
      console.log('Pausing video'); // Debugging log
      videoRef.current.pause();
    },
    getCurrentTime: () => videoRef.current.currentTime,
    setCurrentTime: (time) => {
      console.log('Setting current time to:', time); // Debugging log
      videoRef.current.currentTime = time;
    },
  }));

  const getVideoStyle = (filter) => {
    switch (filter) {
      case 'sepia':
        return { filter: 'sepia(100%)' };
      case 'grayscale':
        return { filter: 'grayscale(100%)' };
      default:
        return {};
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;

    const handleTimeUpdate = () => {
      if (onTimeUpdate) {
        onTimeUpdate(videoElement.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (onLoadedMetadata) {
        onLoadedMetadata({
          width: videoElement.videoWidth,
          height: videoElement.videoHeight,
        });
      }
      if (onDurationChange) {
        onDurationChange(videoElement.duration);
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onTimeUpdate, onLoadedMetadata, onDurationChange]);

  return (
    <video style={getVideoStyle(filter)} ref={videoRef} src={videoUrl} />
  );
});

export default VideoPlayer;