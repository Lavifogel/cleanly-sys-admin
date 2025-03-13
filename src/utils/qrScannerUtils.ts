
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
  }
};

export const stopAllVideoStreams = () => {
  const videoElements = document.querySelectorAll('video');
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
};
