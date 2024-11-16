import * as Playnewton from "../playnewton.js"
import Z_ORDER from "../utils/z_order.js";
import { Squirrel, SquirrelTeam } from "./squirrel.js";

class LaserAnimations {
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    laserRed;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    laserGreen;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    laserButtonRed;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    laserButtonGreen;
}

export class LasersAndButtonsCollection {

    /**
     * @type Array<Laser>
     */
    lasers = [];

    /**
     * @type Array<LaserButton>
     */
    laserButton = [];


    /**
     * @returns boolean
     */
    areAllLaserButtonsGreen() {
        for (let l of this.laserButton) {
            if (l.state !== LaserButtonState.GREEN) {
                return false;
            }
        }
        return true;
    }

    /**
     * 
     * @param {number} x
     * @param {number} y
     */
    AddLaser(x, y) {
        this.lasers.push(new Laser(x, y));
    }

    /**
     * 
     * @param {number} x
     * @param {number} y
     */
    AddLaserButton(x, y) {
        this.laserButton.push(new LaserButton(x, y));
    }

    /**
     * 
     * @param {SquirrelTeam} squirrelTeam 
     */
    Check(squirrelTeam) {
        for (let b of this.laserButton) {
            b.Check(squirrelTeam);
        }
        if (this.areAllLaserButtonsGreen()) {
            for (let l of this.lasers) {
                l.Disable();
            }
        }
    }
}

export class Laser {
    /**
     * 
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     * @type Playnewton.PPU_Body
     */
    body;

    /**
     * @type Playnewton.CLOCK_Timer
     */
    closeTimer = new Playnewton.CLOCK_Timer(3000);

    /**
     * @type LaserAnimations
     */
    static animations;

    static async Load() {
        let bitmap = await Playnewton.DRIVE.LoadBitmap("sprites/squirrel.png");

        let spriteset = Playnewton.GPU.CreateSpriteset(bitmap, [
            { name: `laser-red`, x: 130, y: 288, w: 32, h: 32 },
            { name: `laser-green`, x: 130, y: 321, w: 32, h: 32 },
            { name: `laser-button-red`, x: 130, y: 255, w: 32, h: 32 },
            { name: `laser-button-green`, x: 130, y: 222, w: 32, h: 32 }
        ]);

        Laser.animations = new LaserAnimations();

        Laser.animations.laserRed = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: `laser-red`, delay: 1000 },
        ]);
        Laser.animations.laserGreen = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: `laser-green`, delay: 1000 },
        ]);

        Laser.animations.laserButtonRed = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: `laser-button-red`, delay: 1000 },
        ]);
        Laser.animations.laserButtonGreen = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: `laser-button-green`, delay: 1000 },
        ]);
    }

    static Unload() {
        Laser.animations = null;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.sprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Laser.animations.laserRed);
        Playnewton.GPU.SetSpritePosition(this.sprite, x, y);
        Playnewton.GPU.SetSpriteZ(this.sprite, Z_ORDER.COLLECTIBLES);
        Playnewton.GPU.EnableSprite(this.sprite);

        this.body = Playnewton.PPU.CreateBody();
        Playnewton.PPU.SetBodyRectangle(this.body, 0, 0, 32, 32);
        Playnewton.PPU.SetBodyPosition(this.body, x, y);
        Playnewton.PPU.SetBodyImmovable(this.body, true);
        Playnewton.PPU.EnableBody(this.body);
    }

    Disable() {
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Laser.animations.laserGreen);
        Playnewton.PPU.DisableBody(this.body);
    }
}

/**
 * @readonly
 * @enum {number}
 */
const LaserButtonState = {
    RED: 1,
    GREEN: 2,
};

export class LaserButton {
    /**
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     * @type Playnewton.PPU_Body
     */
    body;

    /**
     *  @type LaserButtonState
     */
    state = LaserButtonState.RED;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.sprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Laser.animations.laserButtonRed);
        Playnewton.GPU.SetSpritePosition(this.sprite, x, y);
        Playnewton.GPU.SetSpriteZ(this.sprite, Z_ORDER.COLLECTIBLES);
        Playnewton.GPU.EnableSprite(this.sprite);

        this.body = Playnewton.PPU.CreateBody();
        Playnewton.PPU.SetBodyRectangle(this.body, 0, 0, 32, 32);
        Playnewton.PPU.SetBodyPosition(this.body, x, y);
        Playnewton.PPU.SetBodyImmovable(this.body, true);
        Playnewton.PPU.EnableBody(this.body);

    }

    /**
     * 
     * @param {SquirrelTeam} squirrelTeam 
     */
    Check(squirrelTeam) {
        for(let s of squirrelTeam.squirrels) {
            if (Playnewton.PPU.CheckIfBodiesIntersects(s.body, this.body) && s.body.bottom <= this.body.top) {
                Playnewton.GPU.SetSpriteAnimation(this.sprite, Laser.animations.laserButtonGreen);
                this.state = LaserButtonState.GREEN;
                return;
            }
        }
        this.state = LaserButtonState.RED;
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Laser.animations.laserButtonRed);
    }
}