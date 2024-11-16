import * as Playnewton from "../playnewton.js"

export default class Scene {

    /**
     * @type Scene
     */
    nextScene;
    
    /**
     * @type number
     */
    progress = -1;

    pausable = true;

    /**
     * 
     * @returns {boolean}
     */
    get started() {
        return this.progress >= 0;
    }

    /**
     * 
     * @returns {boolean}
     */
    get ready() {
        return this.progress >= 100;
    }

    constructor() {
        this.nextScene = this;
    }

    async Start() {
        Playnewton.APU.Reset();
        Playnewton.GPU.Reset();
        Playnewton.PPU.Reset();
        Playnewton.CTRL.Reset();
        this.progress = 0;
    }

    Stop() {
        Playnewton.APU.Reset();
        Playnewton.GPU.Reset();
        Playnewton.PPU.Reset();
        Playnewton.CTRL.Reset();
        Playnewton.DRIVE.Reset();
    }

    /**
     * 
     * @param {number} progress 
     */
    Progress(progress) {
        this.progress = progress;
    }

    UpdateBodies() {
    }
    
    UpdateSprites() {
    }
}