// audio-processor.js

class AudioComposer extends AudioWorkletProcessor {

    constructor() {
        super();

        this.port.onmessage = msg => {
            const data = msg.data;
            this.bufferDataTime = Date.now();
            this.bufferData = data;
        }
    }

    process(inputs, outputs, parameters) {

        if(this.bufferData) {
            const bufferDataAge = (Date.now() - this.bufferDataTime) / 1000;
            const bufferSize = 128;

            console.log(bufferDataAge);
    
            const timePerBuffer = bufferSize / sampleRate;
            const bufferCountInSecond = sampleRate / bufferSize;
    
            const currentBufferIndex = Math.floor(bufferDataAge / timePerBuffer);
            const currentBuffer = this.bufferData[currentBufferIndex];

            if(currentBuffer) {
                const output = outputs[0];
                output.forEach((channelData, channel) => {
                    for (let i = 0; i < channelData.length; i++) {
                        channelData[i] = currentBuffer[channel][i];
                    }
                })
            }
        }
    
        return true;
    }
}

registerProcessor('audio-composer', AudioComposer);
