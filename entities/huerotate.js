import * as Playnewton from "../playnewton.js"

/**
 * HueRotate done callback
 *
 * @callback hueRotatedoneCallback
 */

export default class HueRotate {

    /**
     * @type Array<number>
     */
    layers;

    angle = 360;

    /**
     * @type hueRotatedoneCallback
     */
    doneCallback;

    /**
     * @param {Array<number>} layers 
     * @param {hueRotatedoneCallback} doneCallback
     */
    constructor(layers, doneCallback = undefined) {
        this.layers = layers;
        this.doneCallback = doneCallback;
    }

    Update() {
        this.angle -= 4;
        if(this.angle >= 0) {
            for(let l of this.layers) {
                let layer = Playnewton.GPU.GetLayer(l);
                layer.filter = `hue-rotate(${this.angle}deg) brightness(${this.angle/2}%)`;
            }
        } else {
            this.Done();
        }
    }

    Done() {
        if(this.doneCallback) {
            for(let l of this.layers) {
                let layer = Playnewton.GPU.GetLayer(l);
                layer.filter = "none";
            }
            this.doneCallback();
            this.doneCallback = undefined;
        }
    }

}