
/**
 * Utilities for camera detection and status
 */

/**
 * Check if camera is already in use by checking for active video tracks
 */
export const isCameraInUse = (): boolean => {
  let inUse = false;
  
  // Check video elements first
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach(video => {
    if (video.srcObject) {
      inUse = true;
    }
  });
  
  // Also check for any active media tracks in the document
  if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
    // Get all media capture elements
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach(element => {
      const mediaElement = element as HTMLMediaElement;
      if (mediaElement.srcObject) {
        inUse = true;
      }
    });
  }
  
  return inUse;
};

/**
 * Checks if the device has camera capabilities
 */
export const hasCameraSupport = (): boolean => {
  return !!(
    typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia
  );
};

/**
 * Gets available camera devices
 */
export const getAvailableCameras = async (): Promise<MediaDeviceInfo[]> => {
  if (!hasCameraSupport()) {
    return [];
  }
  
  try {
    // Request permission to enumerate devices
    await navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        // Immediately stop all tracks
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {
        // Ignore permission errors here, we're just trying to enumerate
      });
    
    // Get list of all available devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Filter to only video input devices (cameras)
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error) {
    console.error("Error getting available cameras:", error);
    return [];
  }
};
