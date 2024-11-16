import * as Playnewton from "../playnewton.js"
import Z_ORDER from "../utils/z_order.js";
import { Squirrel, SquirrelTeam } from "./squirrel.js";

const ACTIVATE_LEVER_DISTANCE = 16;

/**
 * @readonly
 * @enum {number}
 */
export const LeverColor = {
    COLOR_MIN: 0,
    YELLOW: 0,
    BLUE: 1,
    GREEN: 2,
    PINK: 3,
    COLOR_MAX: 3,
    NB_COLOR: 4
}

/**
 * @readonly
 * @enum {number}
 */
const LeverState = {
    OFF: 1,
    MOVE_TO_OFF: 2,
    MOVE_TO_ON: 3,
    ON: 4
};

class LeverAnimations {
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    leverOff;
    
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    leverMovingToOff;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    leverMovingToOn;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    leverOn;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    portcullisClosed;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    portcullisOpening;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    portcullisOpen;
}

export class LeversAndPortcullisCollection {

    /**
     * @type Array<Lever>
     */
    levers = [];

    /**
     * @type Array<Portcullis>
     */
    portcullis = [];

    UpdateBodies() {
        for (let p of this.portcullis) {
            if (this.areAllLeversOn(p.color)) {
                p.Open();
            } else {
                p.Close();
            }
            p.UpdateBody();
        }
    }

    /**
     * @param {LeverColor} color
     * @returns boolean
     */
    areAllLeversOn(color) {
        for (let l of this.levers) {
            if (l.color === color && !l.on) {
                return false;
            }
        }
        return true;
    }

    /**
     * 
     * @param {number} x
     * @param {number} y
     * @param {LeverColor} color
     */
    AddLever(x, y, color) {
        this.levers.push(new Lever(x, y, color));
    }

    /**
     * 
     * @param {number} x
     * @param {number} y
     * @param {LeverColor} color
     */
    AddPortcullis(x, y, color) {
        this.portcullis.push(new Portcullis(x, y, color));
    }

    /**
     * 
     * @param {SquirrelTeam} squirrelTeam 
     */
    Check(squirrelTeam) {
        for (let l of this.levers) {
            l.Check(squirrelTeam);
        }
    }
}

export class Lever {
    /**
     * 
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     * @type LeverColor
     */
    color;

    /**
     *  @type LeverState
     */
    state = LeverState.OFF;

    /**
     * @type Playnewton.CLOCK_Timer
     */
    closeTimer = new Playnewton.CLOCK_Timer(3000);

    /**
     * @type Array<LeverAnimations>
     */
    static animations;

    static async Load() {
        let bitmap = await Playnewton.DRIVE.LoadBitmap("sprites/squirrel.png");

        let spriteset = Playnewton.GPU.CreateSpriteset(bitmap, [
            { name: `${LeverColor.YELLOW}-lever0`, x: 302, y: 259, w: 41, h: 31 },
            { name: `${LeverColor.YELLOW}-lever1`, x: 302, y: 291, w: 41, h: 31 },
            { name: `${LeverColor.YELLOW}-lever2`, x: 302, y: 323, w: 41, h: 31 },
            { name: `${LeverColor.YELLOW}-lever3`, x: 302, y: 355, w: 41, h: 31 },
            { name: `${LeverColor.YELLOW}-lever4`, x: 302, y: 387, w: 41, h: 31 },
            { name: `${LeverColor.YELLOW}-lever5`, x: 302, y: 419, w: 41, h: 31 },
            { name: `${LeverColor.YELLOW}-portcullis0`, x: 170, y: 259, w: 32, h: 32 },
            { name: `${LeverColor.YELLOW}-portcullis1`, x: 170, y: 292, w: 32, h: 32 },
            { name: `${LeverColor.YELLOW}-portcullis2`, x: 170, y: 325, w: 32, h: 32 },
            { name: `${LeverColor.YELLOW}-portcullis3`, x: 170, y: 358, w: 32, h: 32 },
            { name: `${LeverColor.YELLOW}-portcullis4`, x: 170, y: 391, w: 32, h: 32 },
            { name: `${LeverColor.YELLOW}-portcullis5`, x: 170, y: 424, w: 32, h: 32 },
            { name: `${LeverColor.YELLOW}-portcullis6`, x: 170, y: 457, w: 32, h: 32 },
            { name: `${LeverColor.YELLOW}-portcullis7`, x: 170, y: 490, w: 32, h: 32 },
            { name: `${LeverColor.YELLOW}-portcullis8`, x: 170, y: 523, w: 32, h: 32 },
            { name: `${LeverColor.BLUE}-lever0`, x: 344, y: 259, w: 41, h: 31 },
            { name: `${LeverColor.BLUE}-lever1`, x: 344, y: 291, w: 41, h: 31 },
            { name: `${LeverColor.BLUE}-lever2`, x: 344, y: 323, w: 41, h: 31 },
            { name: `${LeverColor.BLUE}-lever3`, x: 344, y: 355, w: 41, h: 31 },
            { name: `${LeverColor.BLUE}-lever4`, x: 344, y: 387, w: 41, h: 31 },
            { name: `${LeverColor.BLUE}-lever5`, x: 344, y: 419, w: 41, h: 31 },
            { name: `${LeverColor.BLUE}-portcullis0`, x: 203, y: 259, w: 32, h: 32 },
            { name: `${LeverColor.BLUE}-portcullis1`, x: 203, y: 292, w: 32, h: 32 },
            { name: `${LeverColor.BLUE}-portcullis2`, x: 203, y: 325, w: 32, h: 32 },
            { name: `${LeverColor.BLUE}-portcullis3`, x: 203, y: 358, w: 32, h: 32 },
            { name: `${LeverColor.BLUE}-portcullis4`, x: 203, y: 391, w: 32, h: 32 },
            { name: `${LeverColor.BLUE}-portcullis5`, x: 203, y: 424, w: 32, h: 32 },
            { name: `${LeverColor.BLUE}-portcullis6`, x: 203, y: 457, w: 32, h: 32 },
            { name: `${LeverColor.BLUE}-portcullis7`, x: 203, y: 490, w: 32, h: 32 },
            { name: `${LeverColor.BLUE}-portcullis8`, x: 203, y: 523, w: 32, h: 32 },
            { name: `${LeverColor.GREEN}-lever0`, x: 386, y: 259, w: 41, h: 31 },
            { name: `${LeverColor.GREEN}-lever1`, x: 386, y: 291, w: 41, h: 31 },
            { name: `${LeverColor.GREEN}-lever2`, x: 386, y: 323, w: 41, h: 31 },
            { name: `${LeverColor.GREEN}-lever3`, x: 386, y: 355, w: 41, h: 31 },
            { name: `${LeverColor.GREEN}-lever4`, x: 386, y: 387, w: 41, h: 31 },
            { name: `${LeverColor.GREEN}-lever5`, x: 386, y: 419, w: 41, h: 31 },
            { name: `${LeverColor.GREEN}-portcullis0`, x: 236, y: 259, w: 32, h: 32 },
            { name: `${LeverColor.GREEN}-portcullis1`, x: 236, y: 292, w: 32, h: 32 },
            { name: `${LeverColor.GREEN}-portcullis2`, x: 236, y: 325, w: 32, h: 32 },
            { name: `${LeverColor.GREEN}-portcullis3`, x: 236, y: 358, w: 32, h: 32 },
            { name: `${LeverColor.GREEN}-portcullis4`, x: 236, y: 391, w: 32, h: 32 },
            { name: `${LeverColor.GREEN}-portcullis5`, x: 236, y: 424, w: 32, h: 32 },
            { name: `${LeverColor.GREEN}-portcullis6`, x: 236, y: 457, w: 32, h: 32 },
            { name: `${LeverColor.GREEN}-portcullis7`, x: 236, y: 490, w: 32, h: 32 },
            { name: `${LeverColor.GREEN}-portcullis8`, x: 236, y: 523, w: 32, h: 32 },
            { name: `${LeverColor.PINK}-lever0`, x: 428, y: 259, w: 41, h: 31 },
            { name: `${LeverColor.PINK}-lever1`, x: 428, y: 291, w: 41, h: 31 },
            { name: `${LeverColor.PINK}-lever2`, x: 428, y: 323, w: 41, h: 31 },
            { name: `${LeverColor.PINK}-lever3`, x: 428, y: 355, w: 41, h: 31 },
            { name: `${LeverColor.PINK}-lever4`, x: 428, y: 387, w: 41, h: 31 },
            { name: `${LeverColor.PINK}-lever5`, x: 428, y: 419, w: 41, h: 31 },
            { name: `${LeverColor.PINK}-portcullis0`, x: 269, y: 259, w: 32, h: 32 },
            { name: `${LeverColor.PINK}-portcullis1`, x: 269, y: 292, w: 32, h: 32 },
            { name: `${LeverColor.PINK}-portcullis2`, x: 269, y: 325, w: 32, h: 32 },
            { name: `${LeverColor.PINK}-portcullis3`, x: 269, y: 358, w: 32, h: 32 },
            { name: `${LeverColor.PINK}-portcullis4`, x: 269, y: 391, w: 32, h: 32 },
            { name: `${LeverColor.PINK}-portcullis5`, x: 269, y: 424, w: 32, h: 32 },
            { name: `${LeverColor.PINK}-portcullis6`, x: 269, y: 457, w: 32, h: 32 },
            { name: `${LeverColor.PINK}-portcullis7`, x: 269, y: 490, w: 32, h: 32 },
            { name: `${LeverColor.PINK}-portcullis8`, x: 269, y: 523, w: 32, h: 32 }
        ]);

        Lever.animations = [];

        for (let color = LeverColor.COLOR_MIN; color <= LeverColor.COLOR_MAX; color++) {
            Lever.animations[color] = new LeverAnimations();
            
            Lever.animations[color].leverOff = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-lever0`, delay: 1000 },
            ]);
            Lever.animations[color].leverMovingToOff = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-lever5`, delay: 100 },
                { name: `${color}-lever4`, delay: 100 },
                { name: `${color}-lever3`, delay: 100 },
                { name: `${color}-lever2`, delay: 100 },
                { name: `${color}-lever1`, delay: 100 },
                { name: `${color}-lever0`, delay: 100 },
            ]);
            Lever.animations[color].leverMovingToOn = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-lever0`, delay: 100 },
                { name: `${color}-lever1`, delay: 100 },
                { name: `${color}-lever2`, delay: 100 },
                { name: `${color}-lever3`, delay: 100 },
                { name: `${color}-lever4`, delay: 100 },
                { name: `${color}-lever5`, delay: 100 },
            ]);
            Lever.animations[color].leverOn = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-lever5`, delay: 1000 },
            ]);

            Lever.animations[color].portcullisOpen = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-portcullis8`, delay: 1000 },
            ]);
            Lever.animations[color].portcullisClosed = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-portcullis0`, delay: 1000 },
            ]);
            Lever.animations[color].portcullisOpening = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-portcullis0`, delay: 100 },
                { name: `${color}-portcullis1`, delay: 100 },
                { name: `${color}-portcullis2`, delay: 100 },
                { name: `${color}-portcullis3`, delay: 100 },
                { name: `${color}-portcullis4`, delay: 100 },
                { name: `${color}-portcullis5`, delay: 100 },
                { name: `${color}-portcullis6`, delay: 100 },
                { name: `${color}-portcullis7`, delay: 100 },
                { name: `${color}-portcullis8`, delay: 100 }
            ]);

        }
    }

    static Unload() {
        Lever.animations = null;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {LeverColor} color
     */
    constructor(x, y, color) {
        this.sprite = Playnewton.GPU.CreateSprite();
        this.color = color;
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Lever.animations[color].leverOff);
        Playnewton.GPU.SetSpritePosition(this.sprite, x, y);
        Playnewton.GPU.SetSpriteZ(this.sprite, Z_ORDER.COLLECTIBLES);
        Playnewton.GPU.EnableSprite(this.sprite);
    }

    /**
     * @returns boolean
     */
    get on() {
        return this.state === LeverState.ON;
    }

    /**
     * @param {SquirrelTeam} squirrelTeam
     */
    Check(squirrelTeam) {
        switch (this.state) {
            case LeverState.OFF:
                this.Activate(squirrelTeam);
                break
            case LeverState.MOVE_TO_OFF:
                this.MoveToOff();
                break;
            case LeverState.MOVE_TO_ON:
                this.MoveToOn();
                break;
            case LeverState.ON:
                this.Deactivate();
                break;
        }
    }

    /**
     * 
     * @param {SquirrelTeam} squirrelTeam
     */
    Activate(squirrelTeam) {
        for (let squirrel of squirrelTeam.squirrels) {
            let dx = squirrel.body.centerX - (this.sprite.left + 24);
            let dy = squirrel.body.centerY - (this.sprite.top + 24);
            let distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance < ACTIVATE_LEVER_DISTANCE) {
                this.state = LeverState.MOVE_TO_ON;
                Playnewton.GPU.SetSpriteAnimation(this.sprite, Lever.animations[this.color].leverMovingToOn, Playnewton.GPU_AnimationMode.ONCE);
                break;
            }
        }
    }

    Deactivate() {
        if(this.closeTimer.elapsed) {
            this.state = LeverState.MOVE_TO_OFF;
            Playnewton.GPU.SetSpriteAnimation(this.sprite, Lever.animations[this.color].leverMovingToOff, Playnewton.GPU_AnimationMode.ONCE);
        }
    }

    MoveToOn() {
        if(this.sprite.animationStopped) {
            this.state = LeverState.ON;
            this.closeTimer.Start();
            Playnewton.GPU.SetSpriteAnimation(this.sprite, Lever.animations[this.color].leverOn);
        }
    }

    MoveToOff() {
        if(this.sprite.animationStopped) {
            this.state = LeverState.OFF;
            Playnewton.GPU.SetSpriteAnimation(this.sprite, Lever.animations[this.color].leverOff);
        }
    }
}

/**
 * @readonly
 * @enum {number}
 */
const PortcullisState = {
    CLOSED: 1,
    OPENING: 2,
    OPEN: 3
};

export class Portcullis {
    /**
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     * @type Playnewton.PPU_Body
     */
    body;

    /**
     * @type LeverColor
     */
    color;

    /**
     *  @type PortcullisState
     */
    state = PortcullisState.CLOSED;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {LeverColor} color
     */
    constructor(x, y, color) {
        this.color = color;
        this.sprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Lever.animations[color].portcullisClosed);
        Playnewton.GPU.SetSpritePosition(this.sprite, x, y);
        Playnewton.GPU.SetSpriteZ(this.sprite, Z_ORDER.COLLECTIBLES);
        Playnewton.GPU.EnableSprite(this.sprite);

        this.body = Playnewton.PPU.CreateBody();
        Playnewton.PPU.SetBodyRectangle(this.body, 0, 0, 32, 32);
        Playnewton.PPU.SetBodyPosition(this.body, x, y);
        Playnewton.PPU.SetBodyImmovable(this.body, true);
        Playnewton.PPU.EnableBody(this.body);

    }

    Open() {
        switch (this.state) {
            case PortcullisState.CLOSED:
                this.state = PortcullisState.OPENING;
                Playnewton.GPU.SetSpriteAnimation(this.sprite, Lever.animations[this.color].portcullisOpening, Playnewton.GPU_AnimationMode.ONCE);
                break;
        }
    }

    Close() {
        switch (this.state) {
            case PortcullisState.OPEN:
                this.state = PortcullisState.CLOSED;
                Playnewton.GPU.SetSpriteAnimation(this.sprite, Lever.animations[this.color].portcullisClosed);
                break;
        } 
    }

    UpdateBody() {
        switch (this.state) {
            case PortcullisState.OPENING:
                if (this.sprite.animationStopped) {
                    this.state = PortcullisState.OPEN;
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, Lever.animations[this.color].portcullisOpen);
                    Playnewton.PPU.DisableBody(this.body);
                }
                break;
            case PortcullisState.CLOSED:
                Playnewton.PPU.EnableBody(this.body);
                break;
        }
    }
}