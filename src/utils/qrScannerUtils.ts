
export const stopCameraStream = (videoElement: HTMLVideoElement | null) => {
  if (videoElement && videoElement.srcObject) {
    const stream = videoElement.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log("Track stopped:", track.kind);
      });
    }
    videoElement.srcObject = null;
    
    // Remove from DOM if possible
    try {
      if (videoElement.parentNode) {
        videoElement.parentNode.removeChild(videoElement);
      }
    } catch (e) {
      console.log("Could not remove video element from DOM:", e);
    }
  }
};

export const stopAllVideoStreams = () => {
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach(video => {
    // First stop all tracks
    if (video.srcObject) {
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log("Track stopped:", track.kind);
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
  
  // Also stop any active MediaStream tracks that might not be attached to video elements
  try {
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
      .then(stream => {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log("Additional track stopped:", track.kind);
        });
      })
      .catch(err => {
        // Ignore errors, as they might just mean no camera is available
        console.log("No additional camera tracks to stop");
      });
  } catch (error) {
    // Ignore any errors in this cleanup
  }
  
  // Remove any HTML5QrCode scanner UI elements that might be orphaned
  try {
    const scannerElements = document.querySelectorAll('.html5-qrcode-element');
    scannerElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  } catch (e) {
    console.log("Error removing scanner UI elements:", e);
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
