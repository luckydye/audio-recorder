import { html, css, LitElement } from 'https://cdn.skypack.dev/lit-element@2.4.0';

export default class AudioTrack extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
            }
        `;
    }

    render() {
        return html`
            audio-track
        `;
    }

}

customElements.define('audio-track', AudioTrack);
