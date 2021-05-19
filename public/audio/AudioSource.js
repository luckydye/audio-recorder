import AudioUtils from "./AudioUtils.js";

export default class AudioSource {

    constructor(audioContext) {
        if(!audioContext)
            throw new Error('Missing audio context.');
            
        this.context = audioContext;
        this.gain = this.context.createGain();
        this.stream = null;
    }

    connect(output) {
        this.gain.connect(output);
    }

    disconnect() {
        this.gain.disconnect();
    }

    setGain(val = 0) {
        this.gain.gain.setValueAtTime(val, this.context.currentTime + 0.01);
    }

    getGain() {
        return this.gain.gain.value;
    }

    setInputStream(stream) {
        this.stream = stream;
        const audioSource = this.context.createMediaStreamSource(stream);
        audioSource.connect(this.gain);
    }

    async getMedia() {
        return AudioUtils.getMicrophoneStream().then(stream => {
            this.setInputStream(stream);
        })
    }

}
