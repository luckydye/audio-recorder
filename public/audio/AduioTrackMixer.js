export class AduioTrackMixer {

    constructor(audioContext) {
        this.context = audioContext;
        this.tracks = new Set();

        this.destination = this.context.createMediaStreamDestination();
    }

    addTrack(track) {
        const outputNode = track.getOutputNode();
        outputNode.connect(this.destination);
        this.tracks.add(track);
    }
    
    removeTrack(track) {
        const outputNode = track.getOutputNode();
        outputNode.disconnect(this.destination);
        this.tracks.delete(track);
    }

    getOutputStream() {
        return this.destination.stream;
    }

    getOutputNode() {
        const stream = this.getOutputStream();
        const outputNode = this.audioContext.createMediaStreamSource(stream);
        return outputNode;
    }

}
