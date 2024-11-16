import { PPU_Body } from "../playnewton.js";

export default class Vulnerable {

    /**
     * @returns {Array<Vulnerable>}
     */
    get weak_spots() {
        return null;
    }

    /**
     * @type PPU_Body
     */
    body;

    get stompable() {
        return false;
    }

    get bulletable() {
        return false;
    }

    Hurt() {
    }

    HurtByStomp() {
        this.Hurt();
    }

    HurtByBullet() {
        this.Hurt();
    }
}