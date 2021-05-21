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

        this.recorder = new AudioRecorder(this.context);
        this.recorder.setInput(this.audioSource);

        this.channel.setInput(this.audioSource);

        tempTrackCount++;
    }

    async loadInputSource() {
        return this.audioSource.setInputDevice('default');
    }

    setInputDevice(deviceId) {
        return this.audioSource.setInputDevice(deviceId);
    }

    getOutputNode() {
        return this.channel.getOutputNode();
    }

}