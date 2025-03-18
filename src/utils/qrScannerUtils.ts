
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
    
    // Only attempt to remove if it has a parent
    if (videoElement.parentNode) {
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
  
  try {
    // First collect all video elements
    const videoElements = document.querySelectorAll('video');
    
    // First detach media streams from all videos before removing them
    videoElements.forEach(video => {
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
    
    // Then attempt to safely remove video elements in a separate pass
    // This avoids issues with modifying the DOM while iterating
    setTimeout(() => {
      videoElements.forEach(video => {
        if (video.parentNode) {
          try {
            video.parentNode.removeChild(video);
          } catch (e) {
            console.log("Error removing video element:", e);
          }
        }
      });
    }, 50);
    
    // Also stop any active MediaStream tracks that might not be attached to video elements
    try {
      navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        .then(stream => {
          stream.getTracks().forEach(track => {
            track.stop();
            console.log("Additional track stopped:", track.kind);
          });
        })
        .catch(() => {
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
  } catch (e) {
    console.log("Error in stopAllVideoStreams:", e);
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
