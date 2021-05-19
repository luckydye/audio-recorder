export class AudioClip {

    constructor() {
        this.data = [];
    }

    appendData(data) {
        this.data.push(data);
    }

    toBlob() {
        return new Blob(this.data, { 'type' : 'audio/ogg; codecs=opus' });
    }

}
