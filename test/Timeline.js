import { html, LitElement, css } from 'https://cdn.skypack.dev/lit-element@2.4.0';

export default class Timeline extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
                overflow: hidden;
                position: relative;
                width: 100%;
                height: 100vh;
            }
            .container {

            }
    
            .background {
                position: absolute;
                top: 0;
                left: 0;
            }
    
            canvas {
                image-rendering: pixelated;
            }
    
            .tracks {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                padding: 30px 0 0 0;
            }
    
            .track {
                width: 100%;
                height: 100px;
                padding: 1px;
                box-sizing: border-box;
            }

            .track-content {
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.03);
            }
            .track-content:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .playhead {
                position: absolute;
                top: 0px;
                left: calc(var(--time) * 1px - var(--scrollX) * 1px);
                height: 100%;
                width: 1px;
                background: white;
                pointer-events: none;
            }
        `;
    }

    constructor() {
        super();

        const backgroundCanvas = document.createElement('canvas');
        this.canvas = backgroundCanvas;
        backgroundCanvas.width = this.clientWidth;
        backgroundCanvas.height = this.clientHeight;

        let width = backgroundCanvas.width;
        let height = backgroundCanvas.height;

        window.addEventListener('resize', e => {
            backgroundCanvas.width = this.clientWidth;
            backgroundCanvas.height = this.clientHeight;
            width = backgroundCanvas.width;
            height = backgroundCanvas.height;
        })

        const ctx = backgroundCanvas.getContext("2d");

        const timeline = {
            scrollX: 0,
            scrollY: 0,
            time: 2.4 * 100,
            selection: [[0, 0], [0, 0]],
        }

        const gblobalScale = 100;
        const trackCount = 3;

        let mousedown = false;
        let dragging = 0;
        let deltaX = 0;

        this.addEventListener('wheel', e => {
            const newX = timeline.scrollX - Math.sign(e.deltaY) * 50
            if(newX <= 0) {
                timeline.scrollX = newX; 
            }
        })
        this.addEventListener('mousedown', e => {
            timeline.selection[0][0] = Math.floor((e.y - 30) / gblobalScale);
            timeline.selection[0][1] = Math.min(Math.floor((e.y - 30) / gblobalScale), trackCount - 1);
            timeline.selection[1][0] = (e.x - timeline.scrollX) / gblobalScale;
            timeline.selection[1][1] = (e.x - timeline.scrollX) / gblobalScale;
            mousedown = true;
        })
        window.addEventListener('mouseup', e => {
            if(!dragging) {
                timeline.time = (e.x - timeline.scrollX);
            }

            timeline.selection[0][1] = Math.min(Math.floor((e.y - 30) / gblobalScale), trackCount - 1);
            timeline.selection[1][1] = (e.x - timeline.scrollX) / gblobalScale;
            dragging = false;
            mousedown = false;

            deltaX = 0;
        })
        window.addEventListener('mousemove', e => {
            deltaX += e.movementX;
            if(!dragging && mousedown && Math.abs(deltaX) > 1) {
                dragging = true;
            }
            if(dragging) {
                timeline.selection[0][1] = Math.min(Math.floor((e.y - 30) / gblobalScale), trackCount - 1);
                timeline.selection[1][1] = (e.x - timeline.scrollX) / gblobalScale;
            }
        })

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "#1c1c1c";
            ctx.font = "9px Arial";
            ctx.textAlign = "center";

            let second = 0;
            for(let i = timeline.scrollX; i < (backgroundCanvas.width - timeline.scrollX); i+=100) {
                let x = i + timeline.scrollX;
                if(x > 0) {
                    ctx.fillStyle = "grey";
                    ctx.fillText(second, x, 15);
                    ctx.fillStyle = "#1c1c1c";
                    ctx.fillRect(x, 20, 1, height);
                }

                second++;
            }

            const selection = timeline.selection;
            ctx.fillStyle = "rgba(100, 100, 100, 0.25)";

            const trackStart = Math.min(...selection[0]) * gblobalScale;
            const trackEnd = Math.max(...selection[0]) * gblobalScale;
            const start = selection[1][0] * gblobalScale;
            const end = selection[1][1] * gblobalScale;
            ctx.fillRect(
                start + timeline.scrollX, 
                trackStart + 30, 
                end - start, 
                ((trackEnd + 100) - trackStart)
            );

            this.style.setProperty('--time', timeline.time);
            this.style.setProperty('--scrollX', -timeline.scrollX);

            requestAnimationFrame(draw);

            window.timeline = JSON.stringify(timeline);
        }

        draw();
    }

    render() {
        return html`
            <div class="container">
                <div class="background">
                    ${this.canvas}
                </div>
                <div class="tracks">
                    <div class="track">
                        <div class="track-content">
                            <slot name="track1"></slot>
                        </div>
                    </div>
                    <div class="track">
                        <div class="track-content">
                            <slot name="track2"></slot>
                        </div>
                    </div>
                    <div class="track">
                        <div class="track-content">
                            <slot name="track3"></slot>
                        </div>
                    </div>
                </div>
                <div class="playhead"></div>
            </div>
        `;
    }

}

customElements.define('audio-timeline', Timeline);