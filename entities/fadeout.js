import * as Playnewton from "../playnewton.js"

/**
 * Fadeout done callback
 *
 * @callback doneCallback
 */

export default class Fadeout {

    /**
     * @type Array<number>
     */
    layers;

    /**
     * @type doneCallback
     */
    doneCallback;

    /**
     * @type number
     */
    duration;

    /**
     * @type number
     */
    endTime;

    /**
     * @param {number} duration Fade out duration in milliseconds 
     * @param {Array<number>} layers 
     * @param {doneCallback} doneCallback
     */
    constructor(duration, layers, doneCallback = undefined) {
        this.duration = duration;
        this.endTime = Playnewton.CLOCK.now + duration;
        this.layers = layers;
        this.doneCallback = doneCallback;
    }

    Update() {
        let brightnessPercentage = Playnewton.FPU.bound(0, Math.ceil(100 * (this.endTime - Playnewton.CLOCK.now) / this.duration), 100);
        for(let l of this.layers) {
            let layer = Playnewton.GPU.GetLayer(l);
            layer.filter = `brightness(${brightnessPercentage}%)`;
        }
        if(brightnessPercentage <= 0) {
            this.Done();
        }
    }

    Done() {
        if(this.doneCallback) {
            this.doneCallback();
            this.doneCallback = undefined;
        }
    }

}