
document.addEventListener('DOMContentLoaded', () => {

  let
    cameras = new DecSoftCameras(),
    videoElement = document.getElementById('video-camera'),
    camerasSelect = document.getElementById('cameras-select'),
    capturedImage = document.getElementById('captured-image'),
    panRangeInput = document.getElementById('pan-range-input'),
    zoomRangeInput = document.getElementById('zoom-range-input'),
    tiltRangeInput = document.getElementById('tilt-range-input'),
    stopCameraButton = document.getElementById('stop-camera-button'),
    pauseCameraButton = document.getElementById('pause-camera-button'),
    captureBlobButton = document.getElementById('capture-blob-button'),
    startCameraButton = document.getElementById('start-camera-button'),
    resumeCameraButton = document.getElementById('resume-camera-button'),
    captureBase64Button = document.getElementById('capture-base64-button'),
    videoCameraContainer = document.getElementById('video-camera-container'),
    initCamerasButton = document.getElementById('initialize-cameras-button'),
    camerasStuffContainer = document.getElementById('camera-stuff-container'),
    capturedImageContainer = document.getElementById('captured-image-container'),
    stopCameraRecordingButton = document.getElementById('stop-recording-button'),
    startCameraRecordingButton = document.getElementById('start-recording-button'),
    camerasInitializeContainer = document.getElementById('cameras-initialize-container');

  panRangeInput.disabled = true;
  tiltRangeInput.disabled = true;
  zoomRangeInput.disabled = true;
  stopCameraButton.disabled = true;
  captureBlobButton.disabled = true;
  pauseCameraButton.disabled = true;
  resumeCameraButton.disabled = true;
  captureBase64Button.disabled = true;
  stopCameraRecordingButton.disabled = true;
  startCameraRecordingButton.disabled = true;
  capturedImageContainer.classList.add('d-none');

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

     panRangeInput.disabled = true;
     tiltRangeInput.disabled = true;
     zoomRangeInput.disabled = true;
     stopCameraButton.disabled = true;
     pauseCameraButton.disabled = true;
     captureBlobButton.disabled = true;
     resumeCameraButton.disabled = true;
     captureBase64Button.disabled = true;
     stopCameraRecordingButton.disabled = true;
     startCameraRecordingButton.disabled = true;
     capturedImageContainer.classList.add('d-none');

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

    panRangeInput.disabled = true;
    tiltRangeInput.disabled = true;
    zoomRangeInput.disabled = true;
    stopCameraButton.disabled = true;
    pauseCameraButton.disabled = true;
    captureBlobButton.disabled = true;
    resumeCameraButton.disabled = true;
    captureBase64Button.disabled = true;
    stopCameraRecordingButton.disabled = true;
    startCameraRecordingButton.disabled = true;
    capturedImageContainer.classList.add('d-none');

    if (!stopCameraRecordingButton.disabled) {
      cameras.stopCameraRecording(camerasSelect.value);
    }

    cameras.stopCamera(camerasSelect.value);
  });

  captureBlobButton.addEventListener('click', () => {

    cameras.videoCaptureToBlob(camerasSelect.value, videoElement).then(blob => {

      capturedImageContainer.classList.remove('d-none');
      capturedImage.src = URL.createObjectURL(blob);
    });
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
