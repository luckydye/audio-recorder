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