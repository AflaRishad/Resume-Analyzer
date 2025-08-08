const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const context = overlay.getContext('2d');
const errorEl = document.getElementById('error');

const insults = [
  "Is that your face, or did Photoshop crash?",
  "I've seen potatoes with better resolution.",
  "That face could launch a thousand… error messages.",
  "You have a great face… for radio.",
  "Your webcam is crying right now."
];

async function startVideo() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/models');
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error("Camera error:", err);
    errorEl.textContent = "❌ Cannot access camera. Please allow webcam permissions and use HTTPS or localhost.";
  }
}

video.addEventListener('play', () => {
  overlay.width = video.width;
  overlay.height = video.height;

  let lastRoastTime = 0;

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());

    context.clearRect(0, 0, overlay.width, overlay.height);

    detections.forEach((det) => {
      const box = det.box;
      context.strokeStyle = 'red';
      context.lineWidth = 2;
      context.strokeRect(box.x, box.y, box.width, box.height);

      const now = Date.now();
      if (now - lastRoastTime > 3000) {
        let roast = detections.length > 1
          ? "Oh great, a group. Double the faces, double the disappointment."
          : insults[Math.floor(Math.random() * insults.length)];

        context.fillStyle = 'yellow';
        context.font = '16px Arial';
        context.fillText(roast, box.x, box.y - 10);

        const utter = new SpeechSynthesisUtterance(roast);
        window.speechSynthesis.speak(utter);

        document.body.style.backgroundColor = "darkred";
        setTimeout(() => document.body.style.backgroundColor = "black", 200);

        lastRoastTime = now;
      }
    });
  }, 100);
});

startVideo();
