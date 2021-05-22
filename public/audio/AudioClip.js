export class AudioClip {

    constructor(buffer, duration, sampleRate) {
        this.data = [];
        this.startTime = 0;
        this.clipOffset = 0;

        const channelCount = buffer.length;
        const scale = 100; // 100 pixel equals 1second of audio

        const canvas = document.createElement('canvas');
        canvas.height = 200;

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

        this.canvas = canvas;
        this.update = (newBuffer, currDuration) => {
            buffer = newBuffer;
            duration = currDuration;
            draw();
        }
    }

    update() {
        
    }

}
