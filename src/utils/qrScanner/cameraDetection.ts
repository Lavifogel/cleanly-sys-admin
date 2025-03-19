
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
  
  return inUse;
};

/**
 * Checks if the device has camera capabilities
 */
export const hasCameraSupport = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};
