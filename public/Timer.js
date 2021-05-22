const state = {
    time: 0,
    playing: false,
}

const eventTarget = new EventTarget();

export default class Timer {

    static get time() {
        return state.time;
    }

    static set time(second) {
        state.time = second;
    }

    static play() {
        state.playing = true;
        console.log('play');
        eventTarget.dispatchEvent(new Event('play'));
    }
    
    static pause() {
        state.playing = false;
        console.log('pause');
        eventTarget.dispatchEvent(new Event('pause'));
    }

    static get playing() {
        return state.playing;
    }

    static on(event, callback) {
        eventTarget.addEventListener(event, callback);
        return () => {
            eventTarget.removeEventListener(event, callback);
        }
    }

}

let lastTick = null;
const updateUI = ms => {
    
    if(lastTick != null) {
        const delta = ms - lastTick;

        if(Timer.playing) {
            Timer.time += delta / 1000;
        }
    }
    lastTick = ms;

    requestAnimationFrame(updateUI);
}

updateUI();
