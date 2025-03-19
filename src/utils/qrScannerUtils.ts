
export const stopCameraStream = (videoElement: HTMLVideoElement | null) => {
  if (!videoElement) return;
  
  try {
    // Stop all tracks
    if (videoElement.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log("Track stopped:", track.kind);
        });
      }
      videoElement.srcObject = null;
    }
    
    // Pause the video element
    try {
      videoElement.pause();
    } catch (e) {
      console.log("Error pausing video:", e);
    }
    
    // Only attempt to remove if it has a parent and it's actually attached to the DOM
    if (videoElement.parentNode && document.contains(videoElement)) {
      try {
        // Use a safer removeChild approach
        videoElement.parentNode.removeChild(videoElement);
      } catch (e) {
        console.log("Could not remove video element from DOM:", e);
      }
    }
  } catch (e) {
    console.log("Error in stopCameraStream:", e);
  }
};

export const stopAllVideoStreams = () => {
  console.log("Stopping all video streams");
  const stopInProgressRef = { current: false };
  
  try {
    // Avoid duplicate stop calls
    if (stopInProgressRef.current) {
      console.log("Stop already in progress, skipping duplicate call");
      return;
    }
    
    stopInProgressRef.current = true;
    
    // First collect all video elements
    const videoElements = document.querySelectorAll('video');
    
    // First detach media streams from all videos before removing them
    videoElements.forEach(video => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => {
            try {
              track.stop();
            } catch (e) {
              console.log("Error stopping track:", e);
            }
          });
        }
        video.srcObject = null;
      }
      
      // Then pause the video element
      try {
        video.pause();
      } catch (e) {
        console.log("Error pausing video:", e);
      }
    });
    
    // Also try to release any existing camera if possible
    try {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          stream.getTracks().forEach(track => {
            track.stop();
          });
        })
        .catch(() => {
          // Silently ignore any errors here
        })
        .finally(() => {
          // Mark stop as complete no matter what
          stopInProgressRef.current = false;
        });
    } catch (e) {
      // Ignore errors here, just trying to be thorough
    }
    
    // Then attempt to safely remove video elements in a separate pass
    setTimeout(() => {
      videoElements.forEach(video => {
        // Only remove if actually in the DOM
        if (video.parentNode && document.contains(video)) {
          try {
            video.parentNode.removeChild(video);
          } catch (e) {
            console.log("Error removing video element:", e);
          }
        }
      });
      
      // Remove any HTML5QrCode scanner UI elements that might be orphaned
      try {
        const scannerElements = document.querySelectorAll('.html5-qrcode-element');
        scannerElements.forEach(element => {
          if (element.parentNode && document.contains(element)) {
            try {
              element.parentNode.removeChild(element);
            } catch (e) {
              console.log("Error removing scanner UI element:", e);
            }
          }
        });
      } catch (e) {
        console.log("Error removing scanner UI elements:", e);
      }
      
      console.log("All video streams stopped");
      stopInProgressRef.current = false;
    }, 300);
  } catch (e) {
    console.log("Error in stopAllVideoStreams:", e);
    stopInProgressRef.current = false;
  }
};

// Check if camera is already in use by checking for active video tracks
export const isCameraInUse = (): boolean => {
  let inUse = false;
  
  // Check video elements first
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach(video => {
    if (video.srcObject) {
      inUse = true;
    }
  });
  
  return inUse;
};
