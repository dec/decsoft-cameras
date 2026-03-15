
  let
    cameras = new DecSoftCameras(),

    videoElement = null,
    camerasSelect = null,
    capturedImage = null,
    panRangeInput = null,
    zoomRangeInput = null,
    tiltRangeInput = null,
    resizeModeSelect = null,
    stopCameraButton = null,
    initCamerasButton = null,
    pauseCameraButton = null,
    captureBlobButton = null,
    startCameraButton = null,
    contrastRangeInput = null,
    resumeCameraButton = null,
    exposureModeSelect = null,
    captureBase64Button = null,
    sharpnessRangeInput = null,
    frameRateRangeInput = null,
    videoCameraContainer = null,
    brightnessRangeInput = null,
    saturationRangeInput = null,
    camerasStuffContainer = null,
    capturedImageContainer = null,
    exposureTimeRangeInput = null,
    whiteBalanceModeSelect = null,
    stopCameraRecordingButton = null,
    startCameraRecordingButton = null,
    camerasInitializeContainer = null,
    colorTemperatureRangeInput = null;

function resetControls () {

  panRangeInput.disabled = true;
  tiltRangeInput.disabled = true;
  zoomRangeInput.disabled = true;
  resizeModeSelect.disabled = true;
  stopCameraButton.disabled = true;
  captureBlobButton.disabled = true;
  pauseCameraButton.disabled = true;
  contrastRangeInput.disabled = true;
  exposureModeSelect.disabled = true;
  resumeCameraButton.disabled = true;
  sharpnessRangeInput.disabled = true;
  captureBase64Button.disabled = true;
  frameRateRangeInput.disabled = true;
  saturationRangeInput.disabled = true;
  brightnessRangeInput.disabled = true;
  whiteBalanceModeSelect.disabled = true;
  exposureTimeRangeInput.disabled = true;
  stopCameraRecordingButton.disabled = true;
  colorTemperatureRangeInput.disabled = true;
  startCameraRecordingButton.disabled = true;
  capturedImageContainer.classList.add('d-none');
}

document.addEventListener('DOMContentLoaded', () => {

    videoElement = document.getElementById('video-camera'),
    camerasSelect = document.getElementById('cameras-select'),
    capturedImage = document.getElementById('captured-image'),
    panRangeInput = document.getElementById('pan-range-input'),
    zoomRangeInput = document.getElementById('zoom-range-input'),
    tiltRangeInput = document.getElementById('tilt-range-input'),
    resizeModeSelect = document.getElementById('resize-mode-select'),
    stopCameraButton = document.getElementById('stop-camera-button'),
    pauseCameraButton = document.getElementById('pause-camera-button'),
    captureBlobButton = document.getElementById('capture-blob-button'),
    startCameraButton = document.getElementById('start-camera-button'),
    contrastRangeInput = document.getElementById('contrast-range-input'),
    resumeCameraButton = document.getElementById('resume-camera-button'),
    exposureModeSelect = document.getElementById('exposure-mode-select'),
    sharpnessRangeInput = document.getElementById('sharpness-range-input'),
    captureBase64Button = document.getElementById('capture-base64-button'),
    frameRateRangeInput = document.getElementById('frame-rate-range-input'),
    brightnessRangeInput = document.getElementById('brightness-range-input'),
    videoCameraContainer = document.getElementById('video-camera-container'),
    initCamerasButton = document.getElementById('initialize-cameras-button'),
    saturationRangeInput = document.getElementById('saturation-range-input'),
    camerasStuffContainer = document.getElementById('camera-stuff-container'),
    capturedImageContainer = document.getElementById('captured-image-container'),
    stopCameraRecordingButton = document.getElementById('stop-recording-button'),
    exposureTimeRangeInput = document.getElementById('exposure-time-range-input'),
    whiteBalanceModeSelect = document.getElementById('white-balance-mode-select'),
    startCameraRecordingButton = document.getElementById('start-recording-button'),
    camerasInitializeContainer = document.getElementById('cameras-initialize-container'),
    colorTemperatureRangeInput = document.getElementById('color-temperature-range-input');

  resetControls();

  initCamerasButton.addEventListener('click', () => {

    camerasInitializeContainer.classList.add('d-none');

    cameras.initialize()
      .then(cameraDevices => {

        camerasStuffContainer.classList.remove('d-none');

        cameraDevices.forEach(cameraDevice => {

          let
            option = document.createElement('option');

          option.value = cameraDevice.id;
          option.text = cameraDevice.label;
          camerasSelect.appendChild(option);
        });

      })
      .catch((error) => {

        camerasStuffContainer.classList.remove('d-none');
        camerasStuffContainer.innerHTML = `Error initializing cameras: ${error.message}. <br> Please, refresh this page if you block the permissions.`;
      });
  });

  startCameraButton.addEventListener('click', () => {

     resetControls();

     cameras.stopCameras();

     cameras.startCamera(camerasSelect.value)
       .then((mediaStream) => {

         stopCameraButton.disabled = false;
         pauseCameraButton.disabled = false;
         captureBlobButton.disabled = false;
         captureBase64Button.disabled = false;
         startCameraRecordingButton.disabled = false;
         videoCameraContainer.classList.remove('d-none');

         let
           videoSettings = cameras.getCameraSettings(camerasSelect.value),
           videoCapabilities = cameras.getCameraCapabilities(camerasSelect.value);

         videoElement.srcObject = mediaStream;
         videoElement.play();

         ['zoom', 'tilt', 'pan'].forEach(capability => {

           if (videoCapabilities[capability] === undefined) {

             document.getElementById(`${capability}-range-input`).disabled = true;

           } else {

             document.getElementById(`${capability}-range-input`).disabled = false;
             document.getElementById(`${capability}-range-input`).value = videoSettings[capability];
             document.getElementById(`${capability}-range-input`).min = videoCapabilities[capability].min;
             document.getElementById(`${capability}-range-input`).max = videoCapabilities[capability].max;
             document.getElementById(`${capability}-range-input`).step = videoCapabilities[capability].step;
           }
         });

         if (videoCapabilities.frameRate !== undefined) {

           frameRateRangeInput.disabled = false;
           frameRateRangeInput.step = 1;
           frameRateRangeInput.value = videoSettings.frameRate;
           frameRateRangeInput.min = videoCapabilities.frameRate.min;
           frameRateRangeInput.max = videoCapabilities.frameRate.max;
         }

         if (videoCapabilities.brightness !== undefined) {

           brightnessRangeInput.disabled = false;
           brightnessRangeInput.value = videoSettings.brightness;
           brightnessRangeInput.min = videoCapabilities.brightness.min;
           brightnessRangeInput.max = videoCapabilities.brightness.max;
           brightnessRangeInput.step = videoCapabilities.brightness.step;
         }

         if (videoCapabilities.contrast !== undefined) {

           contrastRangeInput.disabled = false;
           contrastRangeInput.value = videoSettings.contrast;
           contrastRangeInput.min = videoCapabilities.contrast.min;
           contrastRangeInput.max = videoCapabilities.contrast.max;
           contrastRangeInput.step = videoCapabilities.contrast.step;
         }

         if (videoCapabilities.colorTemperature !== undefined) {

           colorTemperatureRangeInput.disabled = false;
           colorTemperatureRangeInput.value = videoSettings.colorTemperature;
           colorTemperatureRangeInput.min = videoCapabilities.colorTemperature.min;
           colorTemperatureRangeInput.max = videoCapabilities.colorTemperature.max;
           colorTemperatureRangeInput.step = videoCapabilities.colorTemperature.step;
         }

         if (videoCapabilities.saturation !== undefined) {

           saturationRangeInput.disabled = false;
           saturationRangeInput.value = videoSettings.saturation;
           saturationRangeInput.min = videoCapabilities.saturation.min;
           saturationRangeInput.max = videoCapabilities.saturation.max;
           saturationRangeInput.step = videoCapabilities.saturation.step;
         }

         if (videoCapabilities.sharpness !== undefined) {

           sharpnessRangeInput.disabled = false;
           sharpnessRangeInput.value = videoSettings.sharpness;
           sharpnessRangeInput.min = videoCapabilities.sharpness.min;
           sharpnessRangeInput.max = videoCapabilities.sharpness.max;
           sharpnessRangeInput.step = videoCapabilities.sharpness.step;
         }

         if (videoCapabilities.exposureTime !== undefined) {

           exposureTimeRangeInput.disabled = false;
           exposureTimeRangeInput.value = videoSettings.exposureTime;
           exposureTimeRangeInput.min = videoCapabilities.exposureTime.min;
           exposureTimeRangeInput.max = videoCapabilities.exposureTime.max;
           exposureTimeRangeInput.step = videoCapabilities.exposureTime.step;
         }

         if (videoCapabilities.exposureMode !== undefined && videoCapabilities.exposureMode.length > 0) {

           exposureModeSelect.disabled = false;

           videoCapabilities.exposureMode.forEach(mode => {

             let
               option = document.createElement('option');

             option.value = mode;
             option.text = mode;
             option.selected = mode === videoSettings.exposureMode;
             exposureModeSelect.appendChild(option);
           });
         }

         if (videoCapabilities.resizeMode !== undefined && videoCapabilities.resizeMode.length > 0) {

           resizeModeSelect.disabled = false;

           videoCapabilities.resizeMode.forEach(mode => {

             let
               option = document.createElement('option');

             option.value = mode;
             option.text = mode;
             option.selected = mode === videoSettings.resizeMode;
             resizeModeSelect.appendChild(option);
           });
         }

         if (videoCapabilities.whiteBalanceMode !== undefined && videoCapabilities.whiteBalanceMode.length > 0) {

           whiteBalanceModeSelect.disabled = false;

           videoCapabilities.whiteBalanceMode.forEach(mode => {

             let
               option = document.createElement('option');

             option.value = mode;
             option.text = mode;
             option.selected = mode === videoSettings.whiteBalanceMode;
             whiteBalanceModeSelect.appendChild(option);
           });
         }
       })
       .catch(error => {

         alert(error.message);
       });
  });

  zoomRangeInput.addEventListener('input', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {zoom: event.target.value});
  });

  tiltRangeInput.addEventListener('input', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {tilt: event.target.value});
  });

  panRangeInput.addEventListener('input', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {pan: event.target.value});
  });

  frameRateRangeInput.addEventListener('input', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {frameRate: event.target.value});
  });

  brightnessRangeInput.addEventListener('input', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {brightness: event.target.value});
  });

  contrastRangeInput.addEventListener('input', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {contrast: event.target.value});
  });

  colorTemperatureRangeInput.addEventListener('input', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {colorTemperature: event.target.value});
  });

  saturationRangeInput.addEventListener('input', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {saturation: event.target.value});
  });

  sharpnessRangeInput.addEventListener('input', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {sharpness: event.target.value});
  });

  exposureTimeRangeInput.addEventListener('input', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {exposureTime: event.target.value});
  });

  exposureModeSelect.addEventListener('change', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {exposureMode: event.target.value});
  });

  resizeModeSelect.addEventListener('change', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {resizeMode: event.target.value});
  });

  whiteBalanceModeSelect.addEventListener('change', (event) => {

    cameras.applyCameraConstraints(camerasSelect.value, {whiteBalanceMode: event.target.value});
  });

  pauseCameraButton.addEventListener('click', () => {

    pauseCameraButton.disabled = true;
    resumeCameraButton.disabled = false;

    cameras.pauseCamera(camerasSelect.value);
  });

  resumeCameraButton.addEventListener('click', () => {

    pauseCameraButton.disabled = false;
    resumeCameraButton.disabled = true;

    cameras.resumeCamera(camerasSelect.value);
  });

  stopCameraButton.addEventListener('click', () => {

    resetControls();

    if (!stopCameraRecordingButton.disabled) {
      cameras.stopCameraRecording(camerasSelect.value);
    }

    cameras.stopCamera(camerasSelect.value);
  });

  captureBlobButton.addEventListener('click', () => {

    cameras.videoCaptureToBlob(camerasSelect.value, videoElement)
      .then(blob => {

        capturedImageContainer.classList.remove('d-none');
        capturedImage.src = URL.createObjectURL(blob);
      })
      .catch(error => alert(error.message));
  });

  captureBase64Button.addEventListener('click', () => {

    let
      capture = cameras.videoCaptureToBase64(
       camerasSelect.value, videoElement);

    if (capture === false) {
      alert('An error occur while capturing the image.');
      return;
    }

    capturedImageContainer.classList.remove('d-none');

    capturedImage.src = capture;
  });

  startCameraRecordingButton.addEventListener('click', () => {

    stopCameraRecordingButton.disabled = false;
    startCameraRecordingButton.disabled = true;

    cameras.startCameraRecording(camerasSelect.value);
  });

  stopCameraRecordingButton.addEventListener('click', () => {

    stopCameraRecordingButton.disabled = true;
    startCameraRecordingButton.disabled = false;

    cameras.stopCameraRecording(camerasSelect.value).then((blob) => {

      cameras.downloadBlobToFile(blob, 'file.webm');
    })
    .catch(error => {
      alert(error);
    });
  });

}); // DOMContentLoaded
