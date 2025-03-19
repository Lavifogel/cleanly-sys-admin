
export const stopCameraStream = (videoElement: HTMLVideoElement | null) => {
  if (!videoElement) return;
  
  try {
    console.log("Stopping camera stream for single video element");
    
    // Stop all tracks
    if (videoElement.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log("Track stopped:", track.kind, track.id);
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
  
  try {
    // First collect all video elements
    const videoElements = document.querySelectorAll('video');
    console.log(`Found ${videoElements.length} video elements to stop`);
    
    // First detach media streams from all videos before removing them
    videoElements.forEach((video, index) => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          console.log(`Video ${index}: Found ${tracks.length} tracks to stop`);
          
          tracks.forEach(track => {
            try {
              track.stop();
              console.log(`Stopped ${track.kind} track with ID: ${track.id}`);
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
    
    // Then attempt to safely remove video elements in a separate pass after a short delay
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
      
      // Reset any scanner controls
      try {
        const scannerButtons = document.querySelectorAll('#html5-qrcode-button-camera-start, #html5-qrcode-button-camera-stop');
        scannerButtons.forEach(button => {
          if (button.parentNode && document.contains(button)) {
            try {
              button.parentNode.removeChild(button);
            } catch (e) {
              console.log("Error removing scanner button:", e);
            }
          }
        });
      } catch (e) {
        console.log("Error removing scanner buttons:", e);
      }
      
      // Remove any orphaned scanner containers
      try {
        const scannerContainers = document.querySelectorAll('[id^="html5-qrcode-"]');
        scannerContainers.forEach(container => {
          if (container.parentNode && document.contains(container)) {
            try {
              container.parentNode.removeChild(container);
            } catch (e) {
              console.log("Error removing scanner container:", e);
            }
          }
        });
      } catch (e) {
        console.log("Error removing scanner containers:", e);
      }
      
      console.log("All video streams stopped and elements cleaned up");
    }, 200);
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
  
  console.log(`Camera in use: ${inUse}`);
  return inUse;
};
