import * as Playnewton from "../playnewton.js"
import Z_ORDER from "../utils/z_order.js";
import { Squirrel, SquirrelTeam } from "./squirrel.js";

/**
 * @readonly
 * @enum {number}
 */
const DisappearingPlatformState = {
    INITIAL: 1,
    INACTIVE: 2,
    APPEAR: 3,
    DISAPPEAR: 4,
    ACTIVE: 5,
};

class DisappearingPlatformAnimations {

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    appear;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    disappear;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    active;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    inactive;
}

export class DisappearingPlatformDescription {
    /**
     * @type DOMHighResTimeStamp
     */
    initialDuration = 1000;

    /**
     * @type DOMHighResTimeStamp
     */
    activeDuration = 3000;

    /**
     * @type DOMHighResTimeStamp
     */
    inactiveDuration = 2000;
}

export class DisappearingPlatform {

    /**
     * @type Playnewton.PPU_Body
     */
    body;

    /**
     * 
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     * @type DisappearingPlatformState
     */
    state = DisappearingPlatformState.INACTIVE;

    /**
     * @type Playnewton.CLOCK_Timer
     */
    initialTimer;

    /**
     * @type Playnewton.CLOCK_Timer
     */
    activeTimer;

    /**
     * @type Playnewton.CLOCK_Timer
     */
    inactiveTimer;

    /**
     * @type DisappearingPlatformAnimations
     */
    static animations;

    static async Load() {
        let bitmap = await Playnewton.DRIVE.LoadBitmap("sprites/squirrel.png");

        let spriteset = Playnewton.GPU.CreateSpriteset(bitmap, [
            { name: `alpha64`, x: 35, y: 35, w: 64, h: 16 },
            { name: `alpha128`, x: 35, y: 52, w: 64, h: 16 },
            { name: `alpha192`, x: 35, y: 69, w: 64, h: 16 },
            { name: `alpha255`, x: 35, y: 86, w: 64, h: 16 }
        ]);

        DisappearingPlatform.animations = new DisappearingPlatformAnimations();

        DisappearingPlatform.animations.active = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: `alpha255`, delay: 1000 },
        ]);

        DisappearingPlatform.animations.inactive = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: `alpha64`, delay: 1000 },
        ]);

        DisappearingPlatform.animations.appear = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: `alpha64`, delay: 250 },
            { name: `alpha128`, delay: 250 },
            { name: `alpha192`, delay: 250 },
            { name: `alpha255`, delay: 250 }
        ]);

        DisappearingPlatform.animations.disappear = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: `alpha255`, delay: 250 },
            { name: `alpha192`, delay: 250 },
            { name: `alpha128`, delay: 250 },
            { name: `alpha64`, delay: 250 }
        ]);
    }

    static Unload() {
        DisappearingPlatform.animations = null;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {DisappearingPlatformDescription} desc
     */
    constructor(x, y, desc) {
        this.initialTimer = new Playnewton.CLOCK_Timer(desc.initialDuration);
        this.activeTimer = new Playnewton.CLOCK_Timer(desc.activeDuration);
        this.inactiveTimer = new Playnewton.CLOCK_Timer(desc.inactiveDuration);

        this.body = Playnewton.PPU.CreateBody();
        Playnewton.PPU.SetBodyRectangle(this.body, 0, 0, 64, 16);
        Playnewton.PPU.SetBodyPosition(this.body, x, y);
        Playnewton.PPU.SetBodyImmovable(this.body, true);

        this.sprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpriteAnimation(this.sprite, DisappearingPlatform.animations.inactive);
        Playnewton.GPU.SetSpritePosition(this.sprite, x, y);
        Playnewton.GPU.SetSpriteZ(this.sprite, Z_ORDER.PLAFORMS);
        Playnewton.GPU.EnableSprite(this.sprite);

        this.state = DisappearingPlatformState.INITIAL;
        this.initialTimer.Start();
    }

    UpdateBody() {
        switch (this.state) {
            case DisappearingPlatformState.INITIAL:
                if (this.initialTimer.elapsed) {
                    this.initialTimer.Stop();
                    this.inactiveTimer.Start();
                    this.state = DisappearingPlatformState.INACTIVE;
                }
                break;
            case DisappearingPlatformState.INACTIVE:
                if (this.inactiveTimer.elapsed) {
                    this.inactiveTimer.Stop();
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, DisappearingPlatform.animations.appear, Playnewton.GPU_AnimationMode.ONCE);
                    this.state = DisappearingPlatformState.APPEAR;
                }
                break;
            case DisappearingPlatformState.APPEAR:
                if (this.sprite.animationStopped) {
                    Playnewton.PPU.EnableBody(this.body);
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, DisappearingPlatform.animations.active);
                    this.activeTimer.Start();
                    this.state = DisappearingPlatformState.ACTIVE;
                }
                break;
            case DisappearingPlatformState.DISAPPEAR:
                if (this.sprite.animationStopped) {
                    Playnewton.PPU.DisableBody(this.body);
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, DisappearingPlatform.animations.inactive);
                    this.inactiveTimer.Start();
                    this.state = DisappearingPlatformState.INACTIVE;
                }
                break;
            case DisappearingPlatformState.ACTIVE:
                if (this.activeTimer.elapsed) {
                    this.activeTimer.Stop();
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, DisappearingPlatform.animations.disappear, Playnewton.GPU_AnimationMode.ONCE);
                    this.state = DisappearingPlatformState.DISAPPEAR;
                }
                break;
        }
    }
}

export class DisappearingPlatformCollection {

    /**
     * @type Array<DisappearingPlatform>
     */
    disappearingPlatforms = [];

    /**
     * @returns 
     */
    UpdateBodies() {
        for (let m of this.disappearingPlatforms) {
            m.UpdateBody();
        }
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {DisappearingPlatformDescription} desc
     */
    AddDisappearingPlatform(x, y, desc) {
        this.disappearingPlatforms.push(new DisappearingPlatform(x, y, desc));
    }
}