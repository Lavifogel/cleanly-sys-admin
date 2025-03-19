
/**
 * This file is for backward compatibility.
 * It re-exports all the utilities from the qrScanner directory.
 */

import { 
  stopCameraStream,
  stopAllVideoStreams,
  isCameraInUse,
  hasCameraSupport
} from './qrScanner';

export {
  stopCameraStream,
  stopAllVideoStreams,
  isCameraInUse,
  hasCameraSupport
};
