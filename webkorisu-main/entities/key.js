import * as Playnewton from "../playnewton.js"
import Z_ORDER from "../utils/z_order.js";
import { Squirrel, SquirrelTeam } from "./squirrel.js";

/**
 * @readonly
 * @enum {number}
 */
export const KeyColor = {
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
const KeyState = {
    IDLE: 1,
    PURSUE: 2,
    COLLECTED: 3
};

const PURSUE_START_DISTANCE = 32;
const PURSUE_DONE_DISTANCE = 8;
const PURSUE_SPEED = 4;

class KeyAnimations {
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    key;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    lock;
}

export class KeysAndLocksCollection {

    /**
     * @type Array<Key>
     */
    keys = [];

    /**
     * @type Array<Lock>
     */
    locks = [];

    UpdateBodies() {
        for(let lock of this.locks) {
            if(this.areAllKeysCollected(lock.color)) {
                lock.Open();
            }
            lock.UpdateBody();
        }
    }

    /**
     * @param {KeyColor} color
     * @returns boolean
     */
    areAllKeysCollected(color) {
        for (let key of this.keys) {
            if (key.color === color && !key.collected) {
                return false;
            }
        }
        return true;
    }

    /**
     * 
     * @param {number} x
     * @param {number} y
     * @param {KeyColor} color
     */
    AddKey(x, y, color) {
        this.keys.push(new Key(x, y, color));
    }

    /**
     * 
     * @param {number} x
     * @param {number} y
     * @param {KeyColor} color
     */
    AddLock(x, y, color) {
        this.locks.push(new Lock(x, y, color));
    }

    /**
     * 
     * @param {SquirrelTeam} squirrelTeam 
     */
    Pursue(squirrelTeam) {
        for (let key of this.keys) {
            key.Pursue(squirrelTeam);
        }
    }
}

export class Key {
    /**
     * 
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     * @type KeyColor
     */
    color;

    /**
     *  @type KeyState
     */
    state = KeyState.IDLE;

    /**
     * @type Squirrel
     */
    squirrelTarget;

    /**
     * @type Array<KeyAnimations>
     */
    static animations;

    static async Load() {
        let bitmap = await Playnewton.DRIVE.LoadBitmap("sprites/squirrel.png");

        let spriteset = Playnewton.GPU.CreateSpriteset(bitmap, [
            { name: `${KeyColor.YELLOW}-key0`, x: 409, y: 682, w: 32, h: 32 },
            { name: `${KeyColor.YELLOW}-key1`, x: 409, y: 715, w: 32, h: 32 },
            { name: `${KeyColor.YELLOW}-key2`, x: 409, y: 748, w: 32, h: 32 },
            { name: `${KeyColor.YELLOW}-key3`, x: 409, y: 781, w: 32, h: 32 },
            { name: `${KeyColor.YELLOW}-key4`, x: 409, y: 814, w: 32, h: 32 },
            { name: `${KeyColor.YELLOW}-key5`, x: 409, y: 847, w: 32, h: 32 },
            { name: `${KeyColor.YELLOW}-key6`, x: 409, y: 880, w: 32, h: 32 },
            { name: `${KeyColor.YELLOW}-key7`, x: 409, y: 913, w: 32, h: 32 },
            { name: `${KeyColor.YELLOW}-lock0`, x: 409, y: 946, w: 32, h: 32 },
            { name: `${KeyColor.BLUE}-key0`, x: 441, y: 682, w: 32, h: 32 },
            { name: `${KeyColor.BLUE}-key1`, x: 441, y: 715, w: 32, h: 32 },
            { name: `${KeyColor.BLUE}-key2`, x: 441, y: 748, w: 32, h: 32 },
            { name: `${KeyColor.BLUE}-key3`, x: 441, y: 781, w: 32, h: 32 },
            { name: `${KeyColor.BLUE}-key4`, x: 441, y: 814, w: 32, h: 32 },
            { name: `${KeyColor.BLUE}-key5`, x: 441, y: 847, w: 32, h: 32 },
            { name: `${KeyColor.BLUE}-key6`, x: 441, y: 880, w: 32, h: 32 },
            { name: `${KeyColor.BLUE}-key7`, x: 441, y: 913, w: 32, h: 32 },
            { name: `${KeyColor.BLUE}-lock0`, x: 442, y: 946, w: 32, h: 32 },
            { name: `${KeyColor.GREEN}-key0`, x: 473, y: 682, w: 32, h: 32 },
            { name: `${KeyColor.GREEN}-key1`, x: 473, y: 715, w: 32, h: 32 },
            { name: `${KeyColor.GREEN}-key2`, x: 473, y: 748, w: 32, h: 32 },
            { name: `${KeyColor.GREEN}-key3`, x: 473, y: 781, w: 32, h: 32 },
            { name: `${KeyColor.GREEN}-key4`, x: 473, y: 814, w: 32, h: 32 },
            { name: `${KeyColor.GREEN}-key5`, x: 473, y: 847, w: 32, h: 32 },
            { name: `${KeyColor.GREEN}-key6`, x: 473, y: 880, w: 32, h: 32 },
            { name: `${KeyColor.GREEN}-key7`, x: 473, y: 913, w: 32, h: 32 },
            { name: `${KeyColor.GREEN}-lock0`, x: 475, y: 946, w: 32, h: 32 },
            { name: `${KeyColor.PINK}-key0`, x: 505, y: 682, w: 32, h: 32 },
            { name: `${KeyColor.PINK}-key1`, x: 505, y: 715, w: 32, h: 32 },
            { name: `${KeyColor.PINK}-key2`, x: 505, y: 748, w: 32, h: 32 },
            { name: `${KeyColor.PINK}-key3`, x: 505, y: 781, w: 32, h: 32 },
            { name: `${KeyColor.PINK}-key4`, x: 505, y: 814, w: 32, h: 32 },
            { name: `${KeyColor.PINK}-key5`, x: 505, y: 847, w: 32, h: 32 },
            { name: `${KeyColor.PINK}-key6`, x: 505, y: 880, w: 32, h: 32 },
            { name: `${KeyColor.PINK}-key7`, x: 505, y: 913, w: 32, h: 32 },
            { name: `${KeyColor.PINK}-lock0`, x: 508, y: 946, w: 32, h: 32 },
        ]);

        Key.animations = [];

        for (let color = KeyColor.COLOR_MIN; color <= KeyColor.COLOR_MAX; color++) {
            Key.animations[color] = new KeyAnimations();
            Key.animations[color].key = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-key0`, delay: 1000 },
                { name: `${color}-key1`, delay: 100 },
                { name: `${color}-key2`, delay: 100 },
                { name: `${color}-key3`, delay: 100 },
                { name: `${color}-key4`, delay: 100 },
                { name: `${color}-key5`, delay: 100 },
                { name: `${color}-key6`, delay: 100 },
                { name: `${color}-key7`, delay: 100 },
            ]);

            Key.animations[color].lock = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-lock0`, delay: 1000 },
            ]);
        }
    }

    static Unload() {
        Key.animations = null;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {KeyColor} color
     */
    constructor(x, y, color) {
        this.sprite = Playnewton.GPU.CreateSprite();
        this.color = color;
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Key.animations[color].key);
        Playnewton.GPU.SetSpritePosition(this.sprite, x, y);
        Playnewton.GPU.SetSpriteZ(this.sprite, Z_ORDER.COLLECTIBLES);
        Playnewton.GPU.EnableSprite(this.sprite);
    }

    /**
     * @returns boolean
     */
    get collected() {
        return this.state === KeyState.COLLECTED;
    }

    /**
     * @param {SquirrelTeam} squirrelTeam
     */
    Pursue(squirrelTeam) {
        switch (this.state) {
            case KeyState.IDLE:
                this.Aim(squirrelTeam);
                break
            case KeyState.PURSUE:
                this.PursueTarget();
                break;
            case KeyState.COLLECTED:
                break;
        }
    }

    /**
     * 
     * @param {SquirrelTeam} squirrelTeam
     */
    Aim(squirrelTeam) {
        for (let squirrel of squirrelTeam.squirrels) {
            let dx = squirrel.body.centerX - this.sprite.centerX;
            let dy = squirrel.body.centerY - this.sprite.centerY;
            let distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance < PURSUE_START_DISTANCE) {
                this.state = KeyState.PURSUE;
                this.squirrelTarget = squirrel;
                break;
            }
        }
    }

    PursueTarget() {
        let dx = this.squirrelTarget.body.centerX - this.sprite.centerX;
        let dy = this.squirrelTarget.body.centerY - this.sprite.centerY;
        let distance = Math.sqrt(dx ** 2 + dy ** 2);
        if (distance < PURSUE_DONE_DISTANCE) {
            Playnewton.APU.PlaySound("sounds/collect-key.wav");
            this.state = KeyState.COLLECTED;
            this.squirrelTarget = null;
            Playnewton.GPU.DisableSprite(this.sprite);
        } else {
            let speed = PURSUE_SPEED / distance;
            dx *= speed;
            dy *= speed;
            this.sprite.centerX += dx;
            this.sprite.centerY += dy;
        }
    }
}

/**
 * @readonly
 * @enum {number}
 */
const LockState = {
    CLOSE: 1,
    OPENING: 2,
    OPEN: 3
};

export class Lock {
    /**
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     * @type Playnewton.PPU_Body
     */
    body;

    /**
     * @type KeyColor
     */
    color;

    /**
     *  @type LockState
     */
    state = LockState.CLOSE;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {KeyColor} color
     */
    constructor(x, y, color) {
        this.color = color;
        this.sprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Key.animations[color].lock);
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
        switch(this.state) {
            case LockState.CLOSE:
                this.state = LockState.OPENING;
                Playnewton.GPU.MakeSpriteBlink(this.sprite, 1000);
                break;
        }
    }

    UpdateBody() {
        switch(this.state) {
            case LockState.OPENING:
                if(!Playnewton.GPU.IsSpriteBlinking(this.sprite)) {
                    this.state = LockState.OPEN;
                    Playnewton.GPU.DisableSprite(this.sprite);
                    Playnewton.PPU.DisableBody(this.body);
                }
                break;
        }
    }
}