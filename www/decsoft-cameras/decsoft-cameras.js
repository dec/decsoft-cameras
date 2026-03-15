"use strict";

/*! DecSoft Cameras | DecSoft Utils <info@decsoftutils.com> | https://www.decsoftutils.com/ | MIT License */

class DecSoftCameras {

  #cameras = [];

  #CAPTURE_MIME = 'image/png';
  #NO_RECORD_ERROR = 'The camera recorder was not started.';
  #NO_CAMARA_ERROR = 'No camera found with the provided ID.';

  initialize () {

    return new Promise((resolve, reject) => {

      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
       })
       .then((mediaStream) => {

         mediaStream.getTracks().forEach((track) => {
           track.stop();
        });

         this.#getCameras()
           .then((cameraDevices) => {
             resolve(cameraDevices);
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

  startCamera (deviceId) {

    return new Promise((resolve, reject) => {

      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {deviceId: deviceId}
       })
       .then((mediaStream) => {

         let
           camera = this.#getCamera(deviceId);

        if (camera === null) {
          reject(new Error(this.#NO_CAMARA_ERROR));
          return;
        }

         camera.track = mediaStream.getVideoTracks()[0];
         camera.settings = camera.track.getSettings();
         camera.capabilities = camera.track.getCapabilities();

         camera.stream = mediaStream;
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

    camera.stream.getTracks().forEach((track) => {
      track.stop();
    });

    camera.stream = null;
  }

  stopCameras () {

    this.#cameras.forEach(camera => {

      if (camera.stream !== null) {

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

  videoCaptureToBlob (deviceId, videoElement) {

    let
      settings = this.#getCameraSettings(deviceId)

    if (settings === null) {

      return new Promise((resolve, reject) => {
        reject(new Error(this.#NO_CAMARA_ERROR));
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

    let
      settings = this.#getCameraSettings(deviceId)

    if (settings === null) {
      return false;
    }

    let
      canvas = document.createElement('canvas'),
      canvasContext = canvas.getContext('2d');

    canvas.width = settings.width;
    canvas.height = settings.height;

    canvasContext.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL(this.#CAPTURE_MIME, 1);
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

    for (let i = 0; i < this.#cameras.length; i++) {

      if (this.#cameras[i].id = deviceId) {

        return this.#cameras[i];
      }
    }

    return null;
  }

  #getCameras () {

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
              this.#cameras.push(camera);
            }
          });

          resolve(this.#cameras);
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
}