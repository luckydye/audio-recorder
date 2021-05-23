import Timer from "../Timer.js";
import AudioChannel from "./AudioChannel.js";
import { AudioRecorder } from "./AudioRecorder.js";
import AudioSource from "./AudioSource.js";

let tempTrackCount = 0;

export class AudioTrack {

    constructor(audioContext) {
        this.name = "Track " + tempTrackCount;

        this.context = audioContext;

        this.audioSource = new AudioSource(this.context);
        this.channel = new AudioChannel(this.context);
        this.channel.setInput(this.audioSource);

        this.recorder = new AudioRecorder(this.context);
        this.recorder.setInput(this.audioSource);

        this.clips = [];
        this.recorder.onClipCreated = clip => {
            this.clips.push(clip);

            clip.startTime = Timer.time;

            const timeline = document.querySelector('audio-timeline');
            clip.canvas.slot = "track1";
            timeline.appendChild(clip.canvas);
        }

        this.outputChannel = new AudioChannel(this.context);

        tempTrackCount++;
        
        const outputBuffer = this.context.createBuffer(2, 128, this.context.sampleRate);

        // whtie noise for testing
        // for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        //     var nowBuffering = outputBuffer.getChannelData(channel);
        //     for (var i = 0; i < outputBuffer.length; i++) {
        //         nowBuffering[i] = (Math.random() * 2 - 1) * 0.01;
        //     }
        // }

        let elapsedTime = 0;
        let lastTick = 0;

        Timer.on('play', e => {
            elapsedTime = 0;
            lastTick = performance.now();
        });

        Timer.on('pause', e => {
            console.log(this.name, elapsedTime);
        });

        Timer.on('update', e => {
            if(!lastTick)
                return;

            const deltaTime = (performance.now() - lastTick) / 1000;
            const buffer = this.getBufferAt(Timer.time);

            const bufferTime = (128 / this.context.sampleRate); // fraction of second per sample
            const tickTime = deltaTime; // ticktime cant be higher then the buffertime

            this.audioComposer.port.postMessage(buffer);

            elapsedTime += deltaTime;
            lastTick = performance.now();
        })

        this.audioComposer = new AudioWorkletNode(this.context, 'audio-composer');
        this.outputChannel.setInput(this.audioComposer);
    }

    getClipAt(second) {
        let currentClip = null;
        for(let clip of this.clips) {
            if (clip.startTime < second &&
                clip.startTime + clip.length >= second) {
                currentClip = clip;
            }
        }
        return currentClip;
    }

    getBufferAt(second) {
        let currentClip = this.getClipAt(second);
        if(currentClip) {
            const timeOffset = second - currentClip.startTime;
            const dataIndex = Math.floor((timeOffset / currentClip.length) * currentClip.data.length);
            const dataBlock = currentClip.data.slice(dataIndex, dataIndex + 4);
            return dataBlock;
        }
        return null;
    }

    async loadInputSource() {
        return this.audioSource.setInputDevice('default');
    }

    setInputDevice(deviceId) {
        return this.audioSource.setInputDevice(deviceId);
    }

    getInputNode() {
        return this.channel.getOutputNode();
    }

    getOutputNode() {
        return this.outputChannel.getOutputNode();
    }

}