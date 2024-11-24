const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const videoElement = document.getElementById('preview');
let mediaRecorder;
let recordedChunks = [];

startButton.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoElement.srcObject = stream;
        setupRecorder(stream);
    } catch (err) {
        console.error("Error accessing camera and microphone", err);
    }
};

function setupRecorder(stream) {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) recordedChunks.push(event.data);
    };
    mediaRecorder.onstop = uploadVideo;
    mediaRecorder.start(10);
    startButton.disabled = true;
    stopButton.disabled = false;
}

stopButton.onclick = () => { 
    mediaRecorder.stop();
    videoElement.srcObject.getTracks().forEach(track => track.stop());
    stopButton.disabled = true;
    startButton.disabled = false;
};

async function uploadVideo() {
    console.log("Attempting to upload video...");
    const blob = new Blob(recordedChunks, { type: 'video/mp4' });
    let formData = new FormData();
    formData.append('video', blob, 'video.mp4');

    try {
        const serverUrl = 'http://localhost:3000/upload'; 
        const response = await fetch(serverUrl, { method: 'POST', body: formData });
        if (response.ok) {
            console.log("Video uploaded successfully");
        } else {
            console.error("Upload failed", await response.text());
        }
    } catch (err) {
        console.error("Error uploading video", err); 
    }
}


