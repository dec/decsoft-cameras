"use strict";

/*! DecSoft Cameras | DecSoft Utils <info@decsoftutils.com> | https://www.decsoftutils.com/ | MIT License */

class DecSoftCameras {

  #devices = {
    cameras: [],
    microphones: []
  };

  #CAPTURE_MIME = 'image/png';
  #NO_VID_ERROR = 'No video element provided.';
  #NO_REC_ERROR = 'The camera recorder was not started.';
  #NO_CAM_ERROR = 'No camera found with the provided ID.';
  #NO_MIC_ERROR = 'No microphone found with the provided ID.';

  #KNOW_CAM_RES = [
    { width: 160, height: 120 },
    { width: 320, height: 180 },
    { width: 320, height: 240 },
    { width: 640, height: 360 },
    { width: 640, height: 480 },
    { width: 768, height: 576 },
    { width: 1024, height: 576 },
    { width: 1280, height: 720 },
    { width: 1280, height: 768 },
    { width: 1280, height: 800 },
    { width: 1280, height: 900 },
    { width: 1280, height: 1000 },
    { width: 1920, height: 1080 },
    { width: 1920, height: 1200 },
    { width: 2048, height: 1080 },
    { width: 2560, height: 1440 },
    { width: 3840, height: 2160 },
    { width: 4096, height: 2160 },
    { width: 7680, height: 4320 }
    // Maybe more in the future.
  ];

  getDevices (includeMicrophones = false) {

    this.#initDevices();

    return new Promise((resolve, reject) => {

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: includeMicrophones
       })
       .then((mediaStream) => {

         mediaStream.getTracks().forEach((track) => {
           track.stop();
        });

         this.#getDevices(includeMicrophones)
           .then((devices) => {

             resolve(devices);
           })
           .catch(error => {

             reject(error);
           });

       })
       .catch(error => {

         reject(error);
       });
    });
  }

  getCameras () {

    return this.#devices.cameras;
  }

  getMicrophones () {

    return this.#devices.microphones;
  }

  startCamera (cameraDeviceId, microphoneDeviceId = false) {

    return new Promise((resolve, reject) => {

      navigator.mediaDevices.getUserMedia({
        video: {deviceId: cameraDeviceId},
        audio: microphoneDeviceId !== false ? {deviceId: microphoneDeviceId} : false
       })
       .then((mediaStream) => {

         let
           camera = this.#getCamera(cameraDeviceId);

        if (camera === null) {
          reject(new Error(this.#NO_CAM_ERROR));
          return;
        }

         camera.stream = mediaStream;
         camera.track = mediaStream.getVideoTracks()[0];

         if (microphoneDeviceId !== false) {

           let
             microphone = this.#getMicrophone(microphoneDeviceId);

           if (microphone === null) {

             reject(new Error(this.#NO_MIC_ERROR));
             return;
           }

           microphone.track = mediaStream.getAudioTracks()[0];
         }

         resolve(camera.stream);

       })
       .catch((error) => {

         reject(error);
       });
    });
  }

  getCameraSettings (deviceId) {

    return this.#getCameraSettings(deviceId);
  }

  getCameraCapabilities (deviceId) {

    return this.#getCameraCapabilities(deviceId);
  }

  pauseCamera (deviceId) {

    let
      camera = this.#getCamera(deviceId);

    if (camera === null || camera.stream === null) {
      return;
    }

    camera.stream.getTracks().forEach((track) => {
      track.enabled = false;
    });
  }

  resumeCamera (deviceId) {

    let
      camera = this.#getCamera(deviceId);

    if (camera === null || camera.stream === null) {
      return;
    }

    camera.stream.getTracks().forEach((track) => {
      track.enabled = true;
    });
  }

  stopCamera (deviceId) {

    let
      camera = this.#getCamera(deviceId);

    if (camera === null || camera.stream === null) {
      return;
    }

    if (camera.recorder !== null) {
      camera.recorder.stop();
    }

    camera.stream.getTracks().forEach((track) => {
      track.stop();
    });

    camera.stream = null;
  }

  stopCameras () {

    this.#devices.cameras.forEach(camera => {

      if (camera.stream !== null) {

        if (camera.recorder !== null) {
          camera.recorder.stop();
        }

        camera.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    });
  }

  applyCameraConstraints (deviceId, constraints) {

    let
      camera = this.#getCamera(deviceId);

    if (camera === null || camera.track === null) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_CAM_ERROR));
      });
    }

    return new Promise((resolve, reject) => {

      camera.track.applyConstraints(constraints)
        .then(() => {
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  applyMicrophoneConstraints (deviceId, constraints) {

    let
      microphone = this.#getMicrophone(deviceId);

    if (microphone === null || microphone.track === null) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_MIC_ERROR));
      });
    }

    return new Promise((resolve, reject) => {

      microphone.track.applyConstraints(constraints)
        .then(() => {
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  getMicrophoneSettings (deviceId) {

    return this.#getMicrophoneSettings(deviceId);
  }

  getMicrophoneCapabilities (deviceId) {

    let
      microphone = this.#getMicrophone(deviceId);

    if (microphone === null || microphone.track === null) {
      return null;
    }

    return microphone.track.getCapabilities();
  }

  videoCaptureToBlob (deviceId, videoElement) {

    if (!videoElement) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_VID_ERROR));
      });
    }

    let
      settings = this.#getCameraSettings(deviceId);

    if (settings === null) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_CAM_ERROR));
      });
    }

    let
      canvas = document.createElement('canvas'),
      canvasContext = canvas.getContext('2d');

    canvas.width = settings.width;
    canvas.height = settings.height;

    // Mirror the capture?
    //canvasContext.translate(canvas.width, 0);
    //canvasContext.scale(-1, 1);

    canvasContext.drawImage(videoElement, 0, 0,
     canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(blob => resolve(blob), this.#CAPTURE_MIME, 1);
    });
  }

  videoCaptureToBase64 (deviceId, videoElement) {

    if (!videoElement) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_VID_ERROR));
      });
    }

    let
      settings = this.#getCameraSettings(deviceId);

    if (settings === null) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_CAM_ERROR));
      });
    }

    let
      canvas = document.createElement('canvas'),
      canvasContext = canvas.getContext('2d');

    canvas.width = settings.width;
    canvas.height = settings.height;

    // Mirror the capture?
    //canvasContext.translate(canvas.width, 0);
    //canvasContext.scale(-1, 1);

    canvasContext.drawImage(videoElement, 0, 0,
     canvas.width, canvas.height);

    return new Promise(resolve => {
      resolve(canvas.toDataURL(this.#CAPTURE_MIME, 1));
    });
  }

  startCameraRecording (deviceId) {

    let
      camera = this.#getCamera(deviceId);

    if (camera === null || camera.stream === null) {
      return false;
    }

    camera.recChunks = [];

    camera.recorder = new MediaRecorder(camera.stream);

    camera.recorder.start();

    camera.recorder.ondataavailable = (event) => {

      if (event.data && event.data.size > 0) {
        camera.recChunks.push(event.data);
      }
    };

    return true;
  }

  stopCameraRecording (deviceId) {

    let
      camera = this.#getCamera(deviceId);

    if (camera === null || camera.recorder === null) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_REC_ERROR));
      });
    }

    return new Promise((resolve) => {

      camera.recorder.onstop = () => {

        resolve(new Blob(camera.recChunks));
      };

      camera.recorder.stop();
    });
  }

  downloadBlobToFile (blob, filename) {

    const
      link = document.createElement('a'),
      objectURL = window.URL.createObjectURL(blob);

    link.href = objectURL;
    link.download = filename;

    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
    );

    setTimeout(() => {
      window.URL.revokeObjectURL(objectURL);
      link.remove();
    }, 100);
  }

  getCameraResolutions (deviceId) {

    let
      result = [],
      camera = this.#getCamera(deviceId);

    if (camera === null) {
      return result;
    }

    let
      serializedResMap = [],
      settings = this.#getCameraSettings(deviceId),
      capabilities = this.#getCameraCapabilities(deviceId),
      currentRes = { width: settings.width, height: settings.height },
      serializedCurrentRes = JSON.stringify(currentRes);

    this.#KNOW_CAM_RES.forEach(resolution => {

      if (resolution.width <= capabilities.width.max &&
       resolution.height <= capabilities.height.max) {

         result.push(resolution);
         serializedResMap.push(JSON.stringify(resolution));
      }
    });

    if (serializedResMap.indexOf(serializedCurrentRes) === -1) {
      result.unshift(currentRes);
    }

    return result;
  }

  #getCamera (deviceId) {

    for (let i = 0; i < this.#devices.cameras.length; i++) {

      if (this.#devices.cameras[i].id === deviceId) {

        return this.#devices.cameras[i];
      }
    }

    return null;
  }

  #getMicrophone (deviceId) {

    for (let i = 0; i < this.#devices.microphones.length; i++) {

      if (this.#devices.microphones[i].id === deviceId) {

        return this.#devices.microphones[i];
      }
    }

    return null;
  }

  #getDevices (includeMicrophones = false) {

    this.#initDevices();

    return new Promise((resolve, reject) => {

      navigator.mediaDevices.enumerateDevices()
        .then(devices => {

          let
            cameraNum = 1,
            microphoneNum = 1;

          devices.forEach((device) => {

            if (device.kind === 'videoinput' && device.deviceId !== '') {

              let
                camera = this.#initCameraObject();

              camera.id = device.deviceId;
              camera.label = device.label.trim() !== '' ? device.label : `Camera ${cameraNum}`;

              this.#devices.cameras.push(camera);
            }

            if (includeMicrophones && device.kind === 'audioinput' && device.deviceId !== '') {

              let
                microphone = this.#initMicrophoneObject();

              microphone.id = device.deviceId;
              microphone.label = device.label.trim() !== '' ? device.label : `Microphone ${microphoneNum}`;

              this.#devices.microphones.push(microphone);
            }

            cameraNum++;
            microphoneNum++;
          });

          resolve(this.#devices);
        })
        .catch(error => {

          reject(error);
        });
    });
  }

  #getCameraSettings (deviceId) {

    let
      camera = this.#getCamera(deviceId);

    if (camera === null || camera.track === null) {
      return null;
    }

    return camera.track.getSettings();
  }

  #getCameraCapabilities (deviceId) {

    let
      camera = this.#getCamera(deviceId);

    if (camera === null || camera.track === null) {
      return null;
    }

    return camera.track.getCapabilities();
  }

  #getMicrophoneSettings (deviceId) {

    let
      microphone = this.#getMicrophone(deviceId);

    if (microphone === null || microphone.track === null) {
      return null;
    }

    return microphone.track.getSettings();
  }

  #initDevices () {

    this.#devices = {
      cameras: [],
      microphones: []
    };
  }

  #initCameraObject () {

    return {
      id: '',
      label: '',
      track: null,
      stream: null,
      recChunks: [],
      recorder: null
    };
  }

  #initMicrophoneObject () {

    return {
      id: '',
      label: '',
      track: null
    };
  }
}
