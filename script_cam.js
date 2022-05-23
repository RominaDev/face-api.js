const video = document.getElementById('video')
const snap = document.getElementById("snap");
const canvas = document.getElementById('foto');
const errorMsgElement = document.querySelector('span#errorMsg');
const compare = document.getElementById("comparar");
const input1 = document.getElementById('video');
const input2 = document.getElementById('foto');

Promise.all([
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models'),
]).then(startVideo)

-|

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})

// Acceso a la webcam
async function init() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    // errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}

function handleSuccess(stream) {
  window.stream = stream;
  video.srcObject = stream;
}

init();

// Dibuja la imagen
var context = canvas.getContext('2d');
snap.addEventListener("click", function () {
  context.drawImage(video, 0, 0, 640, 480);
});

// Comparación
compare.addEventListener("click", async function () {

  const results1 = await faceapi.detectSingleFace(input1, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks().withFaceDescriptor().withFaceExpressions().withAgeAndGender();
  
  const results2 = await faceapi.detectSingleFace(input2, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks().withFaceDescriptor().withFaceExpressions().withAgeAndGender();

  console.log("descripcion facial input video : ",results1.age,results1.gender, results1.expressions)
  console.log("descripcion facial input foto : ",results2.age,results2.gender, results2.expressions)
  
  const results = await faceapi.detectAllFaces(input1).withFaceLandmarks().withFaceDescriptors()
  if(!results.length) 
  {return}
  faceMatcher = new faceapi.FaceMatcher(results)
  
  const singleResult = await faceapi.detectSingleFace(input2).withFaceLandmarks().withFaceDescriptor()
  if (singleResult)
    {const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor)
      console.log('comparativo', bestMatch.toString())}
});