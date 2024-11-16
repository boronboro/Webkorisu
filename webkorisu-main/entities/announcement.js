import * as Playnewton from "../playnewton.js"
import { Dialog } from "./dialog.js";

export default class Announcement {

    /**
     * @type string
     */
    text;

    /**
     * @type Playnewton.GPU_Label
     */
    label;

    backgroundAlpha;

    dialog = new Dialog();

    constructor(text) {
        this.text = text;
        this.label = Playnewton.GPU.HUD.CreateLabel();
    }

    Start() {
        Playnewton.GPU.HUD.SetLabelPosition(this.label, Playnewton.GPU.screenWidth / 2, Playnewton.GPU.screenHeight / 2);
        Playnewton.GPU.HUD.EnableLabel(this.label);
        Playnewton.GPU.HUD.SetLabelText(this.label, "");
        this.backgroundAlpha = 128;
        this.dx = 0;
        this.dialog.keepLastLine = true;
        this.dialog.Start([{text: this.text, align: "center"}]); 
    }

    Stop() {
        Playnewton.GPU.HUD.DisableLabel(this.label);
    }

    Update() {
        if(this.label.enabled) {
            this.dialog.Update(this.label);
            let dx = this.dialog.done ? 4 : 0;
            this.backgroundAlpha = Math.max(0, this.backgroundAlpha - dx);
            Playnewton.GPU.HUD.SetLabelBackground(this.label, 0, this.label.y - 16, Playnewton.GPU.screenWidth, 24, `#000000${this.backgroundAlpha.toString(16).padStart(2, '0')}`);
            Playnewton.GPU.HUD.SetLabelPosition(this.label, this.label.x + dx, this.label.y);
            if(this.label.x > Playnewton.GPU.screenWidth) {
                Playnewton.GPU.HUD.DisableLabel(this.label);
            }
        }
    }

    /**
     * @type boolean
     */
     get done() {
        return !this.label.enabled;
    }
}