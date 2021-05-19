export default class AudioChannel {

    constructor(audioContext) {
        if(!audioContext)
            throw new Error('Missing audio context.');
        
        this.context = audioContext;

        this.gain = audioContext.createGain();
        this.compressor = audioContext.createDynamicsCompressor();
        this.analyser = audioContext.createAnalyser();
        this.filter = audioContext.createBiquadFilter();

        this.input = null;
    }

    setInput(source) {
        this.input = source;
        this.input.connect(this.gain);
    }

    clearInput() {
        this.input.disconnect();
        this.input = null;
    }

    getOutputStream() {
        const dest = this.context.createMediaStreamDestination();
        this.gain.connect(dest);
        return dest.stream;
    }

    getOutputNode() {
        return this.gain;
    }

}
