function makeAudioBuffer(audioContext, chunks) {
    const numberOfChannels = chunks[0].length;
    const chunkSize = chunks[0][0].length;

    const buffer = audioContext.createBuffer(numberOfChannels, chunks.length * chunkSize, audioContext.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelBuffer = buffer.getChannelData(channel);
        for(let chunk in chunks) {
            for(let i = 0; i < chunkSize; i++) {
                channelBuffer[i + (chunk * chunkSize)] = chunks[chunk][channel][i];
            }
        }
    }
    return buffer;
}

function getLiveBuffer(audioChunks) {
    const chunkBuffer = [[], []];

    for(let chunk of audioChunks) {
        const channel1 = chunk[0];
        const channel2 = chunk[1];

        for(let sample of channel1) {
            chunkBuffer[0].push(sample);
        }
        for(let sample of channel2) {
            chunkBuffer[1].push(sample);
        }
    }

    return chunkBuffer;
}

function drawAudioBuffer(buffer, duration, sampleRate) {

    const channelCount = buffer.length;

    const scale = 100; // 100 pixel equals 1second of audio

    const canvas = document.createElement('canvas');
    canvas.height = 100;

    const ctxt = canvas.getContext("2d");
    canvas.ctxt = ctxt;

    const draw = () => {
        const dataLength = sampleRate * duration;
        canvas.width = (dataLength / (sampleRate / scale));

        for(let channel = 0; channel < channelCount; channel++) {
            const data = buffer[channel];
    
            const height = canvas.height / channelCount;
            const yOffset = height * channel;
            const y = yOffset + (height/2);
    
            ctxt.moveTo(0, y);
    
            for(let i = 0; i < data.length; i+=scale) {
                const x = i / (sampleRate / scale);
                ctxt.lineTo(x, y + data[i] * (height));
            }
    
            ctxt.strokeStyle = "rgba(255, 255, 255, 1)";
            ctxt.stroke();
        }
    }

    draw();

    return {
        canvas,
        update: (newBuffer, currDuration) => {
            buffer = newBuffer;
            duration = currDuration;
            draw();
        }
    };
}

export class AudioRecorder {

    constructor(audioContext) {
        this.context = audioContext;
        this.currentRecTime = 0;
        this.recording = false;
        this.audioChunks = [];
        this.audioProcessor = new AudioWorkletNode(this.context, 'audio-processor');
        this.startRecordTs = 0;
        this.currClip = null;

        this.audioProcessor.port.onmessage = msg => {
            if (this.recording) {
                this.audioChunks.push(msg.data[0]);
                this.currentRecTime = (this.context.currentTime - this.startRecordTs);
            }
        }

        setInterval(() => {
            if(this.currClip) {
                const chunkBuffer = getLiveBuffer(this.audioChunks);
                this.currClip.update(chunkBuffer, this.currentRecTime);
            }
        }, 1000 / 30);
    }

    setInput(input) {
        this.input = input;
        this.input.connect(this.audioProcessor);
    }

    clearInput() {
        this.input.disconnect();
        this.input = null;
    }

    connect(output) {
        this.audioProcessor.connect(output);
    }

    disconnect() {
        this.audioProcessor.disconnect();
    }

    startRecord() {
        this.audioChunks = [];
        this.currentRecTime = 0;
        this.startRecordTs = this.context.currentTime;
        this.recording = true;

        const chunkBuffer = getLiveBuffer(this.audioChunks);
        this.currClip = drawAudioBuffer(chunkBuffer, this.currentRecTime, this.context.sampleRate);
        tracksElement.appendChild(this.currClip.canvas);
    }

    stopRecord() {
        this.recording = false;

        const buffer = makeAudioBuffer(this.context, this.audioChunks);

        const chunkBuffer = getLiveBuffer(this.audioChunks);
        this.currClip.update(chunkBuffer, this.currentRecTime);
        this.currClip = null;

        this.playLastBuffer = (channel) => {
            const sourceNode = this.context.createBufferSource();
            sourceNode.buffer = buffer;
            channel.setInput(sourceNode);
            sourceNode.start();

            sourceNode.onended = () => {
                sourceNode.disconnect();
            }
        }
    }

    playLastBuffer(channel) {
        
    }
    
}
