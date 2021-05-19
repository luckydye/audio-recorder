export class AudioRecorder {

    constructor(stream) {
        this.recorder = new MediaRecorder(stream);
        this._initAnalyser(stream);

        this.recorder.ondataavailable = e => {
            this.onData(e.data);
        }

        this.recorder.onstop = e => {
            console.log('Stoped recording');
        }
    }

    onData() {
        // data callback
    }

    getData() {
        if(this.recorder.state !== "inactive") {
            return this.recorder.requestData();
        }
        return null;
    }

    startRecord() {
        this.recorder.start();
    }

    stopRecord() {
        this.recorder.stop();
    }

    _initAnalyser(stream) {
        const context = new AudioContext();
        const analyser = context.createAnalyser();

        const source = context.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        setInterval(() => {
            if(this.recorder.state === "recording") {
                analyser.getByteTimeDomainData(dataArray);
                const chunk = [...dataArray];
                const values = chunk.map(v => v / 128.0);
                
            }
        }, 1000 / 2);
    }

}