
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
  
  try {
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
    
    // Try to revoke any existing MediaStream permissions
    try {
      navigator.mediaDevices.getUserMedia({ audio: false, video: false })
        .then(stream => {
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop();
            });
          }
        })
        .catch(() => {
          // Ignore errors, as they might just mean no camera is available
        });
    } catch (error) {
      // Ignore any errors in this cleanup
    }
    
    // Try to stop any active MediaTracks that might be running
    try {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          // Force MediaDevices to clean up
          console.log("Enumerating devices to help release resources");
        })
        .catch(() => {
          // Ignore errors
        });
    } catch (error) {
      // Ignore any errors
    }
    
    // Then attempt to safely remove video elements in a separate pass after a short delay
    // This avoids issues with modifying the DOM while iterating
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
      
      // Second pass to ensure all streams are really stopped
      setTimeout(() => {
        try {
          // Last-resort cleanup of any video-related DOM elements
          const videoRelatedElements = document.querySelectorAll('video, .html5-qrcode-element, [id*="qr-scanner"]');
          videoRelatedElements.forEach(element => {
            if (element.parentNode && document.contains(element)) {
              try {
                if (element instanceof HTMLVideoElement && element.srcObject) {
                  const stream = element.srcObject as MediaStream;
                  if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                  }
                  element.srcObject = null;
                  element.pause();
                }
                // Don't remove the container elements, just clean them
                if (!element.id?.includes('container')) {
                  element.parentNode.removeChild(element);
                }
              } catch (e) {
                console.log("Error in final element cleanup:", e);
              }
            }
          });
        } catch (e) {
          console.log("Error in final DOM cleanup:", e);
        }
      }, 200);
    }, 100);
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
