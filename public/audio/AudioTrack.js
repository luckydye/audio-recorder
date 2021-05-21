import AudioChannel from "./AudioChannel.js";
import AudioSource from "./AudioSource.js";

export class AudioTrack {

    constructor(audioContext) {
        this.context = audioContext;

        this.audioSource = new AudioSource(this.context);
        this.channel = new AudioChannel(this.context);

        this.channel.setInput(this.audioSource);
    }

    async loadInputSource() {
        return this.audioSource.getMedia();
    }

    getOutputNode() {
        return this.channel.getOutputNode();
    }

}