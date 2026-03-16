"use strict";

/*! DecSoft Cameras | DecSoft Utils <info@decsoftutils.com> | https://www.decsoftutils.com/ | MIT License */

class DecSoftCameras {

  #devices = {};

  #CAPTURE_MIME = 'image/png';
  #NO_VIDEO_ERROR = 'No video element provided.';
  #NO_RECORD_ERROR = 'The camera recorder was not started.';
  #NO_CAMERA_ERROR = 'No camera found with the provided ID.';
  #NO_MICROPHONE_ERROR = 'No microphone found with the provided ID.';

  constructor () {

    this.#devices.cameras = [];
    this.#devices.microphones = [];
  }

  initialize () {

    this.#devices.cameras = [];
    this.#devices.microphones = [];

    return new Promise((resolve, reject) => {

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
       })
       .then((mediaStream) => {

         mediaStream.getTracks().forEach((track) => {
           track.stop();
        });

         this.#getDevices()
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

  startCamera (cameraDeviceId, microphoneDeviceId) {

    return new Promise((resolve, reject) => {

      navigator.mediaDevices.getUserMedia({
        video: {deviceId: cameraDeviceId},
        audio: microphoneDeviceId !== false ? {deviceId: microphoneDeviceId} : false
       })
       .then((mediaStream) => {

         let
           camera = this.#getCamera(cameraDeviceId);

        if (camera === null) {
          reject(new Error(this.#NO_CAMERA_ERROR));
          return;
        }

         camera.stream = mediaStream;
         camera.track = mediaStream.getVideoTracks()[0];
         camera.settings = camera.track.getSettings();
         camera.capabilities = camera.track.getCapabilities();

         if (microphoneDeviceId !== false) {

           let
             microphone = this.#getMicrophone(microphoneDeviceId);

           if (microphone === null) {

             reject(new Error(this.#NO_MICROPHONE_ERROR));
             return;
           }

           microphone.track = mediaStream.getAudioTracks()[0];
           microphone.settings = microphone.track.getSettings();
           microphone.capabilities = microphone.track.getCapabilities();
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

    let
      camera = this.#getCamera(deviceId);

    if (camera === null) {
      return null;
    }

    return camera.capabilities;
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
      return false;
    }

    try {
      camera.track.applyConstraints(constraints);
      return true;
    } catch {
      return false;
    }
  }

  applyMicrophoneConstraints (deviceId, constraints) {

    let
      microphone = this.#getMicrophone(deviceId);

    if (microphone === null || microphone.track === null) {
      return false;
    }

    try {
      microphone.track.applyConstraints(constraints);
      return true;
    } catch {
      return false;
    }
  }

  getMicrophoneSettings (deviceId) {

    return this.#getMicrophoneSettings(deviceId);
  }

  getMicrophoneCapabilities (deviceId) {

    let
      microphone = this.#getMicrophone(deviceId);

    if (microphone === null) {
      return null;
    }

    return microphone.capabilities;
  }

  videoCaptureToBlob (deviceId, videoElement) {

    if (!videoElement) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_VIDEO_ERROR));
      });
    }

    let
      settings = this.#getCameraSettings(deviceId);

    if (settings === null) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_CAMERA_ERROR));
      });
    }

    let
      canvas = document.createElement('canvas'),
      canvasContext = canvas.getContext('2d');

    canvas.width = settings.width;
    canvas.height = settings.height;

    canvasContext.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(blob => resolve(blob), this.#CAPTURE_MIME, 1);
    });
  }

  videoCaptureToBase64 (deviceId, videoElement) {

    if (!videoElement) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_VIDEO_ERROR));
      });
    }

    let
      settings = this.#getCameraSettings(deviceId);

    if (settings === null) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_CAMERA_ERROR));
      });
    }

    let
      canvas = document.createElement('canvas'),
      canvasContext = canvas.getContext('2d');

    canvas.width = settings.width;
    canvas.height = settings.height;

    canvasContext.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
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
        reject(new Error(this.#NO_RECORD_ERROR));
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

  #getDevices () {

    return new Promise((resolve, reject) => {

      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {

          devices.forEach((device) => {

            if (device.kind === 'videoinput') {

              let
                camera = this.#initCameraObject();

              camera.id = device.deviceId;
              camera.label = device.label || device.deviceId;
              this.#devices.cameras.push(camera);
            }

            if (device.kind === 'audioinput') {

              let
                microphone = this.#initMicrophoneObject();

              microphone.id = device.deviceId;
              microphone.label = device.label || device.deviceId;
              this.#devices.microphones.push(microphone);
            }
          });

          resolve(this.#devices);
        })
        .catch((error) => {

          reject(error);
        });
    });
  }

  #getCameraSettings (deviceId) {

    let
      camera = this.#getCamera(deviceId);

    if (camera === null) {
      return null;
    }

    return camera.settings;
  }

  #getMicrophoneSettings (deviceId) {

    let
      microphone = this.#getMicrophone(deviceId);

    if (microphone === null) {
      return null;
    }

    return microphone.settings;
  }

  #initCameraObject () {

    return {
      id: '',
      label: '',
      track: null,
      stream: null,
      recChunks: [],
      settings: null,
      recorder: null,
      capabilities: null
    };
  }

  #initMicrophoneObject () {

    return {
      id: '',
      label: '',
      track: null,
      settings: null,
      capabilities: null
    };
  }
}
