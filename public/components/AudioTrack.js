import { html, css, LitElement } from 'https://cdn.skypack.dev/lit-element@2.4.0';

export default class AudioTrack extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
                width: 100%;
                height: auto;
            }
            .track-container {
                display: grid;
                grid-template-columns: auto 1fr;
            }
            .head {
                background: grey;
                display: grid;
                grid-template-columns: 100px 10px;
            }
            .track-controls {
                padding: 8px;
            }
            .meter {
                background: darkgrey;
            }
            .track {

            }
        `;
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
