# SIGNAL PRO | FFT Frequency Lab

A high-performance, real-time audio analysis dashboard. This tool utilizes the Fast Fourier Transform (FFT) algorithm to decompose audio signals into their constituent frequencies, providing live visualization and spectral metrics.

## Features
- **FFT Spectrum Analyzer:** Visualizes frequencies from 20Hz to 22kHz using colorful gradient bars.
- **Oscilloscope Mode:** Real-time time-domain visualization of the raw audio wave.
- **Spectral Centroid Calculation:** Real-time "center of gravity" calculation to determine the timbre of the sound.
- **Peak Frequency Tracking:** Automatically identifies the loudest frequency in the current environment.
- **Mobile Responsive:** Built with Tailwind CSS for a seamless experience across devices.

## The Science
This project implements several Digital Signal Processing (DSP) concepts:

### 1. Fast Fourier Transform (FFT)
The app uses the Web Audio API's AnalyserNode to solve the Discrete Fourier Transform. It maps complex audio waves into individual sinusoids with a computational complexity of $O(N \log N)$.

### 2. Spectral Centroid
To find the "brightness" of a sound, we calculate the weighted mean of the frequencies present in the signal:
$$C = \frac{\sum_{n=0}^{N-1} f(n)x(n)}{\sum_{n=0}^{N-1} x(n)}$$
*Where $f(n)$ is the center frequency and $x(n)$ is the magnitude of the bin.*

### 3. Logarithmic Scaling
Since human hearing is logarithmic, the data is normalized from 8-bit integers to a scale that better represents Decibels (dB) and human perception.

## Tech Stack
* **Language:** JavaScript (ES6+)
* **Styling:** Tailwind CSS
* **API:** Web Audio API
* **Graphics:** HTML5 Canvas API

