import Gyro from 'https://dev.luckydye.de/gyro.js';
import AudioChannel from './audio/AudioChannel.js';
import { AudioClip } from './audio/AudioClip.js';
import { AudioRecorder } from './audio/AudioRecorder.js';
import AudioSource from './audio/AudioSource.js';
import AudioStreamMeter from './components/AudioMeter.js';
import './components/AudioMeterVertical.js';

import './components/AudioTrack.js';
import AudioTrack from './components/AudioTrack.js';

const audioContext = new AudioContext();

function monitorStream(stream, name, contianer) {
    const meter = new AudioStreamMeter(audioContext, name);
    meter.setSourceStream(stream);
    contianer.appendChild(meter);
}

async function main() {
    // setup audiocontext
    await audioContext.audioWorklet.addModule('./audio/audio-processor.js');
    await audioContext.audioWorklet.addModule('./audio/audio-db-meter.js');

    // init routing
    const source = new AudioSource(audioContext);
    const channel = new AudioChannel(audioContext);
    const masterChannel = new AudioChannel(audioContext);

    const knob = new Gyro.Knob();

    knob.min = 0;
    knob.max = 11;
    knob.steps = 0.1;

    knob.setValue(source.getGain() * 10);

    knob.addEventListener('change', e => {
        source.setGain(knob.value / 10);
    })

    headerElement.appendChild(knob);

    channel.setInput(source);

    // async. getting media but output can already be connected to someting
    await source.getMedia();

    const outputStream = channel.getOutputStream();
    const ouputNode = channel.getOutputNode();

    const recorder = new AudioRecorder(audioContext);
    recorder.setInput(ouputNode);

    const ui = makeUi();
    ui.onStart = () => {
        recorder.startRecord();
    }
    ui.onStop = () => {
        recorder.stopRecord();
    }
    ui.onPlay = () => {
        recorder.playLastBuffer(masterChannel);
    }

    const track = new AudioTrack(audioContext, channel);
    track.id = "tracksElement";
    tracksEle.appendChild(track);
    

    // monitor
    monitorStream(outputStream, "Input", headerElement);

    const masterStream = masterChannel.getOutputStream();
    const masterNode = masterChannel.getOutputNode();
    monitorStream(masterStream, "Output", headerElement);

    masterNode.connect(audioContext.destination);
}

function makeUi() {
    const stopBtn = document.createElement('button');
    const startBtn = document.createElement('button');
    const playBtn = document.createElement('button');

    startBtn.innerHTML = "Record";
    stopBtn.innerHTML = "Stop";
    playBtn.innerHTML = `Play`;

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
