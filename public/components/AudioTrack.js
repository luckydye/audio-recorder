import { html, css, LitElement } from 'https://cdn.skypack.dev/lit-element@2.4.0';
import AudioStreamMeterVertecal from './AudioMeterVertical.js';

export default class AudioTrack extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
                width: 100%;
                height: 100px;
            }
            .track-container {
                display: grid;
                grid-template-columns: auto 1fr;
            }
            .head {
                background: grey;
                display: grid;
                grid-template-columns: 100px auto;
            }
            .track-controls {
                padding: 8px;
            }
            .meter {
                background: darkgrey;
                width: auto;
            }
            .track {

            }
            audio-meter-vertical {
                height: 100%;
                background: #1c1c1c;
            }
        `;
    }

    constructor(audioContext, channel) {
        super();

        this.meter = new AudioStreamMeterVertecal(audioContext);
        this.meter.setAudioSourceNode(channel.getOutputNode());
    }

    render() {
        return html`
            <div class="track-container">
                <div class="head">
                    <div class="track-controls">
                        <div class="label">Track1</div>
                        <div class="input-device">In Device</div>
                        <div class="input-track">In Track</div>
                        <div class="input-gain">
                            <gyro-knob></gyro-knob>
                        </div>
                        <div class="rec-toggle">
                            <toggle-button>X</toggle-button>
                        </div>
                    </div>
                    <div class="meter">
                        ${this.meter}
                    </div>
                </div>
                 <div class="track">
                    <slot></slot>
                 </div>
            </div>
        `;
    }

}

customElements.define('audio-track', AudioTrack);
