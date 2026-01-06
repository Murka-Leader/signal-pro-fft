let audioCtx, analyser, source, animationId, dataArray, timeDataArray;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('toggle-btn');
const statusText = document.getElementById('status-text');
const micStatus = document.getElementById('mic-status');

const peakFreqEl = document.getElementById('peak-freq');
const centroidEl = document.getElementById('centroid');
const volumeTextEl = document.getElementById('volume-text');
const volumeBarEl = document.getElementById('volume-bar');

let isRecording = false;
let currentView = 'freq'; 

function setView(view) {
    currentView = view;
    document.getElementById('tab-freq').classList.toggle('active', view === 'freq');
    document.getElementById('tab-time').classList.toggle('active', view === 'time');
    document.getElementById('view-label').innerText = view === 'freq' ? 'Frequency Spectrum' : 'Time Domain Oscilloscope';
}

async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaStreamSource(stream);
        
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        timeDataArray = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        isRecording = true;
        updateUI(true);
        draw();
    } catch (err) {
        console.error("Mic access denied", err);
        alert("Please allow microphone access to use the analyzer.");
    }
}

function stopAudio() {
    if (audioCtx) audioCtx.close();
    cancelAnimationFrame(animationId);
    isRecording = false;
    updateUI(false);
    resetStats();
}

function updateUI(active) {
    toggleBtn.innerHTML = active ? 
        `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg> Stop Analysis` : 
        `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg> Start Microphone`;
    
    toggleBtn.className = active ? 
        `flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-lg bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20` : 
        `flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400`;
    
    statusText.innerText = active ? "LIVE" : "OFFLINE";
    micStatus.className = active ? "recording-active text-sm flex items-center gap-1 font-bold" : "text-slate-700 text-sm flex items-center gap-1";
}

function resetStats() {
    peakFreqEl.innerText = "0";
    centroidEl.innerText = "0";
    volumeTextEl.innerText = "0%";
    volumeBarEl.style.width = "0%";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    if (!isRecording) return;
    animationId = requestAnimationFrame(draw);
    
    analyser.getByteFrequencyData(dataArray);
    analyser.getByteTimeDomainData(timeDataArray);
    
    const bufferLength = analyser.frequencyBinCount;
    const sampleRate = audioCtx.sampleRate;

    let sumFrequencies = 0, sumWeights = 0, maxVal = 0, peakIdx = 0;
    for (let i = 0; i < bufferLength; i++) {
        const weight = dataArray[i];
        const freq = i * (sampleRate / analyser.fftSize);
        sumFrequencies += freq * weight;
        sumWeights += weight;
        if (weight > maxVal) { maxVal = weight; peakIdx = i; }
    }

    peakFreqEl.innerText = Math.round(peakIdx * (sampleRate / analyser.fftSize));
    centroidEl.innerText = sumWeights > 0 ? Math.round(sumFrequencies / sumWeights) : 0;
    const vol = Math.round((sumWeights / (bufferLength * 255)) * 100);
    volumeTextEl.innerText = vol + "%";
    volumeBarEl.style.width = vol + "%";

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    if (currentView === 'freq') {
        const barWidth = (w / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * h;
            const hue = (i / bufferLength) * 360;
            ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.8)`;
            ctx.fillRect(x, h - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    } else {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#60a5fa';
        ctx.beginPath();
        const sliceWidth = w * 1.0 / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = timeDataArray[i] / 128.0;
            const y = v * h / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
        }
        ctx.lineTo(w, h / 2);
        ctx.stroke();
    }
}

toggleBtn.addEventListener('click', () => {
    if (isRecording) stopAudio();
    else initAudio();
});

window.addEventListener('resize', () => {
    if (!isRecording) ctx.clearRect(0, 0, canvas.width, canvas.height);
});
