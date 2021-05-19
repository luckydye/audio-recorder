import Gyro from 'https://dev.luckydye.de/gyro.js';
import AudioChannel from './audio/AudioChannel.js';
import { AudioClip } from './audio/AudioClip.js';
import { AudioRecorder } from './audio/AudioRecorder.js';
import AudioSource from './audio/AudioSource.js';

const audioContext = new AudioContext();

function monitorStream(stream, name, contianer) {
    const meter = new Gyro.AudioStreamMeter(audioContext, name);
    meter.setSourceStream(stream);
    contianer.appendChild(meter);
}

async function main() {
    // setup audiocontext
    await audioContext.audioWorklet.addModule('./audio/audio-processor.js');
    const audioProcessor = new AudioWorkletNode(audioContext, 'audio-processor');

    // init routing
    const source = new AudioSource(audioContext);
    const channel = new AudioChannel(audioContext);

    channel.setInput(source);

    // async. getting media but output can already be connected to someting
    await source.getMedia();

    const outputStream = channel.getOutputStream();
    const ouputNode = channel.getOutputNode();

    // const clip = new AudioClip();

    ouputNode.connect(audioProcessor);

    let recording = false;
    let startRecordTs = 0;
    let endRecordTs = 0;
    let currentRecTime = 0;

    let audioChunks = [];

    audioProcessor.port.onmessage = msg => {
        const data = msg.data;

        if (recording) {
            audioChunks.push(data[0]);
            currentRecTime = (audioContext.currentTime - startRecordTs);
        }
    }

    function makeAudioBuffer(chunks) {
        const numberOfChannels = chunks[0].length;
        const chunkSize = chunks[0][0].length;

        const buffer = audioContext.createBuffer(numberOfChannels, chunks.length * chunkSize, audioContext.sampleRate);

        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const channelBuffer = buffer.getChannelData(channel);
            for(let chunk in chunks) {
                for(let i = 0; i < chunkSize; i++) {
                    channelBuffer[i + (chunk * chunkSize)] = chunks[chunk][channel][i];
                }
            }
        }
        return buffer;
    }

    function getLiveBuffer(audioChunks) {
        const chunkBuffer = [[], []];

        for(let chunk of audioChunks) {
            const channel1 = chunk[0];
            const channel2 = chunk[1];

            for(let sample of channel1) {
                chunkBuffer[0].push(sample);
            }
            for(let sample of channel2) {
                chunkBuffer[1].push(sample);
            }
        }

        return chunkBuffer;
    }

    // ui
    let currClip = null;

    setInterval(() => {
        if(currClip) {
            const chunkBuffer = getLiveBuffer(audioChunks);
            currClip.update(chunkBuffer, currentRecTime);
        }
    }, 1000 / 30);

    const ui = makeUi();
    ui.onStart = () => {
        audioChunks = [];
        currentRecTime = 0;
        startRecordTs = audioContext.currentTime;
        recording = true;

        const chunkBuffer = getLiveBuffer(audioChunks);
        currClip = drawAudioBuffer(chunkBuffer, currentRecTime, audioContext.sampleRate);
        tracksElement.appendChild(currClip.canvas);
    }
    ui.onStop = () => {
        recording = false;

        const buffer = makeAudioBuffer(audioChunks);

        const chunkBuffer = getLiveBuffer(audioChunks);
        currClip.update(chunkBuffer, currentRecTime);
        currClip = null;

        let playStartTime = Date.now();
        window.playLastBuffer = () => {
            playStartTime = Date.now();
            
            const sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = buffer;
            sourceNode.connect(audioContext.destination);
            sourceNode.start();

            sourceNode.onended = () => {
                sourceNode.disconnect();
            }
        }
    }
    ui.onPlay = () => {
        window.playLastBuffer();
    }

    // monitor
    monitorStream(source.stream, "Input", headerElement);
    // monitorStream(outputStream, "Output", footerElement);
}

function drawAudioBuffer(buffer, duration, sampleRate) {

    const channelCount = buffer.length;

    const scale = 100; // 100 pixel equals 1second of audio

    const canvas = document.createElement('canvas');
    canvas.height = 200;

    canvas.style.background = "grey";
    canvas.style.borderTop = "10px solid #eee";

    const ctxt = canvas.getContext("2d");
    canvas.ctxt = ctxt;

    const draw = () => {
        const dataLength = sampleRate * duration;
        canvas.width = (dataLength / (sampleRate / scale));

        for(let channel = 0; channel < channelCount; channel++) {
            const data = buffer[channel];
    
            const height = canvas.height / channelCount;
            const yOffset = height * channel;
            const y = yOffset + (height/2);
    
            ctxt.fillRect(0, height, canvas.width, 1);
            ctxt.moveTo(0, y);
    
            for(let i = 0; i < data.length; i+=scale) {
                const x = i / (sampleRate / scale);
                ctxt.lineTo(x, y + data[i] * height);
            }
    
            ctxt.strokeStyle = "white";
            ctxt.stroke();
        }
    }

    draw();

    return {
        canvas,
        update: (newBuffer, currDuration) => {
            buffer = newBuffer;
            duration = currDuration;
            draw();
        }
    };
}

function makeUi() {
    const stopBtn = document.createElement('button');
    const startBtn = document.createElement('button');
    const playBtn = document.createElement('button');

    startBtn.innerText = "Record";
    stopBtn.innerText = "Stop";
    playBtn.innerText = "Play";

    const callbacks = {
        onStart() { },
        onStop() { },
        onPlay() { }
    }

    controlsElement.appendChild(stopBtn);
    controlsElement.appendChild(startBtn);
    controlsElement.appendChild(playBtn);

    stopBtn.onclick = () => {
        callbacks.onStop();
    }
    startBtn.onclick = () => {
        callbacks.onStart();
    }
    playBtn.onclick = () => {
        callbacks.onPlay();
    }

    return callbacks;
}

main();
