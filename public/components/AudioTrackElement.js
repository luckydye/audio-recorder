import Gyro from 'https://dev.luckydye.de/gyro.js';
import { html, css, LitElement } from 'https://cdn.skypack.dev/lit-element@2.4.0';
import AudioUtils from '../audio/AudioUtils.js';
import AudioStreamMeterVertecal from './AudioMeterVertical.js';
import DropdownButton from './DropdownButton.js';

function createControlKnob(source) {
    const knob = new Gyro.Knob();

    knob.min = 0;
    knob.max = 20;
    knob.steps = 0.1;

    knob.setValue(source.getGain());

    knob.addEventListener('change', e => {
        source.setGain(knob.value);
    })

    return knob;
}

export default class AudioTrackElement extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
                width: 100%;
            }
            .track-container {
                display: grid;
                grid-template-columns: auto;
            }
            .head {
                background: grey;
                display: grid;
                grid-template-columns: 150px auto;
            }
            .track-controls {
                padding: 8px;
            }
            .meter {
                background: darkgrey;
                width: auto;
            }
            audio-meter-vertical {
                height: 100%;
                background: #1c1c1c;
            }
            .label {
                box-sizing: border-box;
                width: 100%;
                padding: 5px 8px;
                background: #5c5c5c;
                font-size: 11px;
            }
        `;
    }

    constructor(audioContext, track) {
        super();

        this.track = track;
        this.meter = new AudioStreamMeterVertecal(audioContext);
        this.meter.setAudioSourceNode(this.track.getOutputNode());

        this.initDeviceSelect();
    }

    async initDeviceSelect() {
        const devices = await AudioUtils.getAudioDevies();
        const audioInputDevices = devices.audioinput;

        const device = audioInputDevices[0];
        this.track.setInputDevice(device.deviceId);
        
        const deviceDropdown = new DropdownButton();
        deviceDropdown.options = audioInputDevices.map(dev => {
            return {
                name: dev.label,
                deviceId: dev.deviceId,
            }
        })
        deviceDropdown.addEventListener('change', e => {
            this.track.setInputDevice(deviceDropdown.value.deviceId);
        })

        // knob

        this.deopdown = deviceDropdown;
        this.knob = createControlKnob(this.track.audioSource);
        this.update();
    }

    render() {
        return html`
            <div class="track-container">
                <div class="head">
                    <div>
                        <div class="label">${this.track.name}</div>
                        <div class="track-controls">
                            ${this.deopdown}
                            <div class="input-track">In Track</div>
                            <div class="input-gain">
                                ${this.knob}
                            </div>
                            <div class="rec-toggle">
                                <toggle-button>X</toggle-button>
                            </div>
                        </div>
                    </div>
                    <div class="meter">
                        ${this.meter}
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define('audio-track', AudioTrackElement);
