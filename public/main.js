import Gyro from 'https://dev.luckydye.de/gyro.js';
import AudioChannel from './audio/AudioChannel.js';
import { AudioClip } from './audio/AudioClip.js';
import { AudioRecorder } from './audio/AudioRecorder.js';
import AudioSource from './audio/AudioSource.js';
import { AudioTrack } from './audio/AudioTrack.js';
import { AudioTrackMixer } from './audio/AudioTrackMixer.js';
import AudioUtils from './audio/AudioUtils.js';
import AudioStreamMeter from './components/AudioMeter.js';
import './components/AudioMeterVertical.js';
import AudioTrackElement from './components/AudioTrackElement.js';
import DropdownButton from './components/DropdownButton.js';
import PlaybackControls from './components/PlaybackControls.js';
import Timeline from './components/Timeline.js';

const audioContext = new AudioContext();

function monitorStream(stream, name, contianer) {
    const meter = new AudioStreamMeter(audioContext, name);
    meter.setSourceStream(stream);
    contianer.appendChild(meter);
}

function createControlKnob(source) {
    const knob = new Gyro.Knob();

    knob.min = 0;
    knob.max = 20;
    knob.steps = 0.1;

    knob.setValue(source.getGain());

    knob.addEventListener('change', e => {
        source.setGain(knob.value);
    })

    return knob;
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
    // track2.loadInputSource();
    mixer.addTrack(track2);

    const mixOutNode = mixer.getOutputNode(audioContext);

    // init routing
    const masterChannel = new AudioChannel(audioContext);
    masterChannel.setInput(mixOutNode);

    const knob = createControlKnob(masterChannel);
    headerElement.appendChild(knob);

    // channel.setInput(source);

    // const outputStream = channel.getOutputStream();

    const ui = makeUi();
    ui.onStart = () => {
        track1.recorder.startRecord();
    }
    ui.onStop = () => {
        track1.recorder.stopRecord();
    }
    ui.onPlay = () => {
        track1.recorder.playLastBuffer(masterChannel);
    }

    const track = new AudioTrackElement(audioContext, track1);
    track.id = "tracksElement";
    tracksEle.appendChild(track);

    const track2e = new AudioTrackElement(audioContext, track2);
    track2e.id = "tracksElement2";
    tracksEle.appendChild(track2e);

    // monitor
    // monitorStream(outputStream, "Input", headerElement);

    const masterStream = masterChannel.getOutputStream();
    const masterNode = masterChannel.getOutputNode();
    monitorStream(masterStream, "Output", headerElement);

    masterNode.connect(audioContext.destination);

    // devices
    const devices = await AudioUtils.getAudioDevies();
    const audioInputDevices = devices.audioinput;

    console.log('Available Devices:');
    audioInputDevices.forEach((dev, i) => {
        console.log(i.toString(), '|', dev.label, '-', dev.deviceId);
    });
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

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./sw.js', {
//         sopce: '/images/'
//     }).then(registration => {
//         // Registration was successful
//         console.log('ServiceWorker registration successful with scope: ', registration.scope);
//     }, function (err) {
//         // registration failed :(
//         console.log('ServiceWorker registration failed: ', err);
//     });
// }
