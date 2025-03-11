
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
};
