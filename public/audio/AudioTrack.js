import AudioChannel from "./AudioChannel.js";
import AudioSource from "./AudioSource.js";

export class AudioTrack {

    constructor(audioContext) {
        this.context = audioContext;

        this.audioSource = new AudioSource(this.context);
        this.channel = new AudioChannel(this.context);

        this.channel.setInput(this.audioSource);
    }

    getOutputNode() {
        return this.channel.getOutputNode();
    }

}