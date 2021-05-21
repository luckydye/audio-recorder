import Gyro from 'https://dev.luckydye.de/gyro.js';
import AudioChannel from './audio/AudioChannel.js';
import { AudioClip } from './audio/AudioClip.js';
import { AudioRecorder } from './audio/AudioRecorder.js';
import AudioSource from './audio/AudioSource.js';
import { AudioTrack } from './audio/AudioTrack.js';
import { AudioTrackMixer } from './audio/AudioTrackMixer.js';
import AudioStreamMeter from './components/AudioMeter.js';
import './components/AudioMeterVertical.js';
import AudioTrackElement from './components/AudioTrackElement.js';
import PlaybackControls from './components/PlaybackControls.js';

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

    //new routing
    const mixer = new AudioTrackMixer(audioContext);

    const track1 = new AudioTrack(audioContext);
    track1.loadInputSource();
    mixer.addTrack(track1);

    const track2 = new AudioTrack(audioContext);
    track2.loadInputSource();
    mixer.addTrack(track2);

    const mixStream = mixer.getOutputStream();

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

    const track = new AudioTrackElement(audioContext, channel);
    track.id = "tracksElement";
    tracksEle.appendChild(track);
    

    // monitor
    monitorStream(outputStream, "Input", headerElement);

    const masterStream = masterChannel.getOutputStream();
    const masterNode = masterChannel.getOutputNode();
    monitorStream(masterStream, "Output", headerElement);

    monitorStream(mixStream, "Master Mix", headerElement);

    masterNode.connect(audioContext.destination);
}

function makeUi() {
    const controls = new PlaybackControls();

    const callbacks = {
        onStart() { },
        onStop() { },
        onPlay() { }
    }

    controlsElement.appendChild(controls);

    controls.addEventListener('play', e => {
        callbacks.onPlay();
    })
    controls.addEventListener('startrecord', e => {
        callbacks.onStart();
    })
    controls.addEventListener('stoprecord', e => {
        callbacks.onStop();
    })
    controls.addEventListener('stop', e => {
        callbacks.onStop();
    })

    return callbacks;
}

main();
