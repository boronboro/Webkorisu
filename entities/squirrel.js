import * as Playnewton from "../playnewton.js"
import Z_ORDER from "../utils/z_order.js";
import Vulnerable from "./vulnerable.js";

/**
 * @readonly
 * @enum {number}
 */
export const SquirrelColor = {
    COLOR_MIN: 0,
    BLACK: 0,
    BROWN: 1,
    GRAY: 2,
    RED: 3,
    COLOR_MAX: 3,
    NB_COLOR: 4
}

/**
 * @readonly
 * @enum {number}
 */
const SquirrelState = {
    WAIT: 1,
    CROUCH: 2,
    RUN: 3,
    JUMP: 4,
    DOUBLE_JUMP: 5,
    BOUNCE: 6,
    DYING: 7,
    TELEPORT_OUT: 8,
    TELEPORT_IN: 9,
};

/**
 * @readonly
 * @enum {number}
 */
const SquirrelDirection = {
    LEFT: 0,
    RIGHT: 1
};

/**
 * 
 * @type SquirrelAnimations
 */
class SquirrelAnimations {
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    idle;
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    run;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    jumpAscend;
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    jumpFloat;
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    jumpDescend;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    doubleJump;
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    crouch;
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    dying;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    teleportIn;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    teleportOut;
}

class SquirrelPlayer {

    /**
     * @type number
     */
    num;

    /**
     * @type Playnewton.CTRL_Gamepad
     */
    pad;

    /**
     * @type SquirrelColor
     */
    activeColor = null;

    /**
     * @type Playnewton.GPU_Sprite
     */
    sprite;
}

export class SquirrelTeam {

    /**
     * @type Array<SquirrelPlayer>
     */
    players = [];

    /**
     * @type Array<Squirrel>
     */
    squirrels = [];

    constructor() {
        for (let p = 1; p <= 4; ++p) {
            let player = new SquirrelPlayer();
            player.pad = Playnewton.CTRL.GetPad(p - 1);
            player.num = p;
            player.sprite = Playnewton.GPU.CreateSprite();
            Playnewton.GPU.SetSpriteZ(player.sprite, Z_ORDER.PLAYER_MARKS);
            Playnewton.GPU.SetSpriteAnimation(player.sprite, Squirrel.markAnimations[p - 1]);
            this.players.push(player);
        }
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {SquirrelColor} color
     */
    AddSquirrel(x, y, color) {
        this.squirrels.push(new Squirrel(x, y, color));
    }

    /**
     * 
     * @param {SquirrelPlayer} player 
     */
    _ChangePlayerColor(player) {
        if (player.activeColor === null) {
            player.activeColor = SquirrelColor.COLOR_MIN;
            Playnewton.GPU.EnableSprite(player.sprite);
        }
        let newActiveColor = player.activeColor;
        for (let c = 1; c <= SquirrelColor.NB_COLOR; c++) {
            newActiveColor = Playnewton.FPU.wrap(SquirrelColor.COLOR_MIN, newActiveColor + 1, SquirrelColor.COLOR_MAX);
            let squirrel = this._findSquirrelWithColor(newActiveColor);
            if (squirrel && !squirrel.player) {
                this._disconnectPlayerFromSquirrels(player);
                squirrel.player = player;
                player.activeColor = newActiveColor;
                return;
            }
        }
        if (player.activeColor === newActiveColor) {
            this._disconnectPlayerFromSquirrels(player);
            player.activeColor = null;
            Playnewton.GPU.DisableSprite(player.sprite);
        }
    }

    UpdateBodies() {
        for (let player of this.players) {
            if (player.pad.TestBAndResetIfPressed()) {
                this._ChangePlayerColor(player);
            }
        }
        for (let squirrel of this.squirrels) {
            squirrel.UpdateBody();
        }
    }

    /**
     * 
     * @param {SquirrelPlayer} player 
     */
    _disconnectPlayerFromSquirrels(player) {
        for (let squirrel of this.squirrels) {
            if (squirrel.player === player) {
                squirrel.player = null;
            }
        }
    }

    /**
     * 
     * @param {SquirrelColor} color 
     */
    _findSquirrelWithColor(color) {
        for (let squirrel of this.squirrels) {
            if (squirrel.color === color) {
                return squirrel;
            }
        }
        return null;
    }

    UpdateSprites() {
        for (let squirrel of this.squirrels) {
            squirrel.UpdateSprite();
            if (squirrel.player) {
                Playnewton.GPU.SetSpritePosition(squirrel.player.sprite, squirrel.body.centerX - squirrel.player.sprite.width / 2, squirrel.body.top - squirrel.player.sprite.height * 1.5);
            }
        }
    }
}

export class Squirrel extends Vulnerable {

    /**
     * @type SquirrelColor
     */
    color;

    /**
     * @type SquirrelPlayer
     */
    player;

    /**
     * 
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     * @type Playnewton.PPU_Point
     */
    teleportDestination;

    /**
     *  @type number
     */
    runSpeed = 2;

    /**
     *  @type number
     */
    jumpImpulse = 18;

    /**
     *  @type number
     */
    jumpImpulseFrames = 10;

    /**
 *  @type number
 */
    jumpImpulseFrameCounter = 0;


    /**
     *  @type number
     */
    bounceImpulse = 9;

    /**
     * @type boolean
     */
    isOnGround = false;

    /**
     *  @type SquirrelState
     */
    state = SquirrelState.RUN;

    /**
     * @type SquirrelDirection
     */
    direction = SquirrelDirection.RIGHT;

    /**
     * @type boolean
     */
    canJump = true;

    /**
     * @type number
     */
    health = 5;

    /**
     * @type number
     */
    maxHealth = 10;

    get dead() {
        return this.health <= 0;
    }

    /**
     * @type Array<Array<SquirrelAnimations>>
     */
    static animations;

    /**
     * @type Array<Playnewton.GPU_SpriteAnimation>
     */
    static markAnimations;

    static async Load() {
        let bitmap = await Playnewton.DRIVE.LoadBitmap("sprites/squirrel.png");

        let spriteset = Playnewton.GPU.CreateSpriteset(bitmap, [
            { name: `${SquirrelColor.BLACK}-idle-left0`, x: 273, y: 816, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-left1`, x: 273, y: 842, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-left2`, x: 273, y: 868, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-left3`, x: 273, y: 894, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-left4`, x: 273, y: 920, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-left5`, x: 273, y: 946, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-left6`, x: 273, y: 972, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-left7`, x: 273, y: 998, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-right0`, x: 718, y: 816, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-right1`, x: 718, y: 842, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-right2`, x: 718, y: 868, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-right3`, x: 718, y: 894, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-right4`, x: 718, y: 920, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-right5`, x: 718, y: 946, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-right6`, x: 718, y: 972, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-idle-right7`, x: 718, y: 998, w: 33, h: 25 },
            { name: `${SquirrelColor.BLACK}-run-left0`, x: 252, y: 648, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-left1`, x: 252, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-left2`, x: 252, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-left3`, x: 252, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-left4`, x: 252, y: 760, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-left5`, x: 252, y: 788, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-right0`, x: 718, y: 648, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-right1`, x: 718, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-right2`, x: 718, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-right3`, x: 718, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-right4`, x: 718, y: 760, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-run-right5`, x: 718, y: 788, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-jump-descend-left`, x: 252, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-jump-float-left`, x: 252, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-jump-ascend-left`, x: 252, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-jump-ascend-right`, x: 718, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-jump-float-right`, x: 718, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-jump-descend-right`, x: 718, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.BLACK}-doublejump-left0`, x: 205, y: 648, w: 46, h: 43 },
            { name: `${SquirrelColor.BLACK}-doublejump-left1`, x: 205, y: 692, w: 46, h: 43 },
            { name: `${SquirrelColor.BLACK}-doublejump-left2`, x: 205, y: 736, w: 46, h: 43 },
            { name: `${SquirrelColor.BLACK}-doublejump-left3`, x: 205, y: 780, w: 46, h: 43 },
            { name: `${SquirrelColor.BLACK}-doublejump-right0`, x: 773, y: 648, w: 46, h: 43 },
            { name: `${SquirrelColor.BLACK}-doublejump-right1`, x: 773, y: 692, w: 46, h: 43 },
            { name: `${SquirrelColor.BLACK}-doublejump-right2`, x: 773, y: 736, w: 46, h: 43 },
            { name: `${SquirrelColor.BLACK}-doublejump-right3`, x: 773, y: 780, w: 46, h: 43 },
            { name: `${SquirrelColor.BLACK}-crouch-left0`, x: 218, y: 824, w: 25, h: 25 },
            { name: `${SquirrelColor.BLACK}-crouch-left1`, x: 218, y: 850, w: 25, h: 25 },
            { name: `${SquirrelColor.BLACK}-crouch-right0`, x: 781, y: 824, w: 25, h: 25 },
            { name: `${SquirrelColor.BLACK}-crouch-right1`, x: 781, y: 850, w: 25, h: 25 },
            { name: `${SquirrelColor.BLACK}-dying-left0`, x: 244, y: 648, w: 28, h: 32 },
            { name: `${SquirrelColor.BLACK}-dying-left1`, x: 244, y: 692, w: 28, h: 32 },
            { name: `${SquirrelColor.BLACK}-dying-right0`, x: 752, y: 824, w: 28, h: 32 },
            { name: `${SquirrelColor.BLACK}-dying-right1`, x: 752, y: 857, w: 28, h: 32 },

            { name: `${SquirrelColor.BROWN}-idle-left0`, x: 375, y: 816, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-left1`, x: 375, y: 842, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-left2`, x: 375, y: 868, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-left3`, x: 375, y: 894, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-left4`, x: 375, y: 920, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-left5`, x: 375, y: 946, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-left6`, x: 375, y: 972, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-left7`, x: 375, y: 998, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-right0`, x: 616, y: 816, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-right1`, x: 616, y: 842, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-right2`, x: 616, y: 868, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-right3`, x: 616, y: 894, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-right4`, x: 616, y: 920, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-right5`, x: 616, y: 946, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-right6`, x: 616, y: 972, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-idle-right7`, x: 616, y: 998, w: 33, h: 25 },
            { name: `${SquirrelColor.BROWN}-run-left0`, x: 354, y: 648, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-left1`, x: 354, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-left2`, x: 354, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-left3`, x: 354, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-left4`, x: 354, y: 760, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-left5`, x: 354, y: 788, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-right0`, x: 616, y: 648, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-right1`, x: 616, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-right2`, x: 616, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-right3`, x: 616, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-right4`, x: 616, y: 760, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-run-right5`, x: 616, y: 788, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-jump-descend-left`, x: 354, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-jump-float-left`, x: 354, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-jump-ascend-left`, x: 354, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-jump-ascend-right`, x: 616, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-jump-float-right`, x: 616, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-jump-descend-right`, x: 616, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.BROWN}-doublejump-left0`, x: 307, y: 648, w: 46, h: 43 },
            { name: `${SquirrelColor.BROWN}-doublejump-left1`, x: 307, y: 692, w: 46, h: 43 },
            { name: `${SquirrelColor.BROWN}-doublejump-left2`, x: 307, y: 736, w: 46, h: 43 },
            { name: `${SquirrelColor.BROWN}-doublejump-left3`, x: 307, y: 780, w: 46, h: 43 },
            { name: `${SquirrelColor.BROWN}-doublejump-right0`, x: 671, y: 648, w: 46, h: 43 },
            { name: `${SquirrelColor.BROWN}-doublejump-right1`, x: 671, y: 692, w: 46, h: 43 },
            { name: `${SquirrelColor.BROWN}-doublejump-right2`, x: 671, y: 736, w: 46, h: 43 },
            { name: `${SquirrelColor.BROWN}-doublejump-right3`, x: 671, y: 780, w: 46, h: 43 },
            { name: `${SquirrelColor.BROWN}-crouch-left0`, x: 320, y: 824, w: 25, h: 25 },
            { name: `${SquirrelColor.BROWN}-crouch-left1`, x: 320, y: 850, w: 25, h: 25 },
            { name: `${SquirrelColor.BROWN}-crouch-right0`, x: 679, y: 824, w: 25, h: 25 },
            { name: `${SquirrelColor.BROWN}-crouch-right1`, x: 679, y: 850, w: 25, h: 25 },
            { name: `${SquirrelColor.BROWN}-dying-left0`, x: 346, y: 648, w: 28, h: 32 },
            { name: `${SquirrelColor.BROWN}-dying-left1`, x: 346, y: 692, w: 28, h: 32 },
            { name: `${SquirrelColor.BROWN}-dying-right0`, x: 650, y: 824, w: 28, h: 32 },
            { name: `${SquirrelColor.BROWN}-dying-right1`, x: 650, y: 857, w: 28, h: 32 },

            { name: `${SquirrelColor.GRAY}-idle-left0`, x: 69, y: 816, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-left1`, x: 69, y: 842, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-left2`, x: 69, y: 868, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-left3`, x: 69, y: 894, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-left4`, x: 69, y: 920, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-left5`, x: 69, y: 946, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-left6`, x: 69, y: 972, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-left7`, x: 69, y: 998, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-right0`, x: 922, y: 816, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-right1`, x: 922, y: 842, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-right2`, x: 922, y: 868, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-right3`, x: 922, y: 894, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-right4`, x: 922, y: 920, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-right5`, x: 922, y: 946, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-right6`, x: 922, y: 972, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-idle-right7`, x: 922, y: 998, w: 33, h: 25 },
            { name: `${SquirrelColor.GRAY}-run-left0`, x: 48, y: 648, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-left1`, x: 48, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-left2`, x: 48, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-left3`, x: 48, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-left4`, x: 48, y: 760, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-left5`, x: 48, y: 788, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-right0`, x: 922, y: 648, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-right1`, x: 922, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-right2`, x: 922, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-right3`, x: 922, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-right4`, x: 922, y: 760, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-run-right5`, x: 922, y: 788, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-jump-descend-left`, x: 48, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-jump-float-left`, x: 48, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-jump-ascend-left`, x: 48, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-jump-ascend-right`, x: 922, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-jump-float-right`, x: 922, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-jump-descend-right`, x: 922, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.GRAY}-doublejump-left0`, x: 1, y: 648, w: 46, h: 43 },
            { name: `${SquirrelColor.GRAY}-doublejump-left1`, x: 1, y: 692, w: 46, h: 43 },
            { name: `${SquirrelColor.GRAY}-doublejump-left2`, x: 1, y: 736, w: 46, h: 43 },
            { name: `${SquirrelColor.GRAY}-doublejump-left3`, x: 1, y: 780, w: 46, h: 43 },
            { name: `${SquirrelColor.GRAY}-doublejump-right0`, x: 977, y: 648, w: 46, h: 43 },
            { name: `${SquirrelColor.GRAY}-doublejump-right1`, x: 977, y: 692, w: 46, h: 43 },
            { name: `${SquirrelColor.GRAY}-doublejump-right2`, x: 977, y: 736, w: 46, h: 43 },
            { name: `${SquirrelColor.GRAY}-doublejump-right3`, x: 977, y: 780, w: 46, h: 43 },
            { name: `${SquirrelColor.GRAY}-crouch-left0`, x: 14, y: 824, w: 25, h: 25 },
            { name: `${SquirrelColor.GRAY}-crouch-left1`, x: 14, y: 850, w: 25, h: 25 },
            { name: `${SquirrelColor.GRAY}-crouch-right0`, x: 985, y: 824, w: 25, h: 25 },
            { name: `${SquirrelColor.GRAY}-crouch-right1`, x: 985, y: 850, w: 25, h: 25 },
            { name: `${SquirrelColor.GRAY}-dying-left0`, x: 956, y: 648, w: 28, h: 32 },
            { name: `${SquirrelColor.GRAY}-dying-left1`, x: 956, y: 692, w: 28, h: 32 },
            { name: `${SquirrelColor.GRAY}-dying-right0`, x: 752, y: 824, w: 28, h: 32 },
            { name: `${SquirrelColor.GRAY}-dying-right1`, x: 752, y: 857, w: 28, h: 32 },

            { name: `${SquirrelColor.RED}-idle-left0`, x: 171, y: 816, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-left1`, x: 171, y: 842, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-left2`, x: 171, y: 868, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-left3`, x: 171, y: 894, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-left4`, x: 171, y: 920, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-left5`, x: 171, y: 946, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-left6`, x: 171, y: 972, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-left7`, x: 171, y: 998, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-right0`, x: 820, y: 816, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-right1`, x: 820, y: 842, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-right2`, x: 820, y: 868, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-right3`, x: 820, y: 894, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-right4`, x: 820, y: 920, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-right5`, x: 820, y: 946, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-right6`, x: 820, y: 972, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-idle-right7`, x: 820, y: 998, w: 33, h: 25 },
            { name: `${SquirrelColor.RED}-run-left0`, x: 150, y: 648, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-left1`, x: 150, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-left2`, x: 150, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-left3`, x: 150, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-left4`, x: 150, y: 760, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-left5`, x: 150, y: 788, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-right0`, x: 820, y: 648, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-right1`, x: 820, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-right2`, x: 820, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-right3`, x: 820, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-right4`, x: 820, y: 760, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-run-right5`, x: 820, y: 788, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-jump-descend-left`, x: 150, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-jump-float-left`, x: 150, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-jump-ascend-left`, x: 150, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-jump-ascend-right`, x: 820, y: 676, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-jump-float-right`, x: 820, y: 704, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-jump-descend-right`, x: 820, y: 732, w: 54, h: 27 },
            { name: `${SquirrelColor.RED}-doublejump-left0`, x: 103, y: 648, w: 46, h: 43 },
            { name: `${SquirrelColor.RED}-doublejump-left1`, x: 103, y: 692, w: 46, h: 43 },
            { name: `${SquirrelColor.RED}-doublejump-left2`, x: 103, y: 736, w: 46, h: 43 },
            { name: `${SquirrelColor.RED}-doublejump-left3`, x: 103, y: 780, w: 46, h: 43 },
            { name: `${SquirrelColor.RED}-doublejump-right0`, x: 875, y: 648, w: 46, h: 43 },
            { name: `${SquirrelColor.RED}-doublejump-right1`, x: 875, y: 692, w: 46, h: 43 },
            { name: `${SquirrelColor.RED}-doublejump-right2`, x: 875, y: 736, w: 46, h: 43 },
            { name: `${SquirrelColor.RED}-doublejump-right3`, x: 875, y: 780, w: 46, h: 43 },
            { name: `${SquirrelColor.RED}-crouch-left0`, x: 116, y: 824, w: 25, h: 25 },
            { name: `${SquirrelColor.RED}-crouch-left1`, x: 116, y: 850, w: 25, h: 25 },
            { name: `${SquirrelColor.RED}-crouch-right0`, x: 883, y: 824, w: 25, h: 25 },
            { name: `${SquirrelColor.RED}-crouch-right1`, x: 883, y: 850, w: 25, h: 25 },
            { name: `${SquirrelColor.RED}-dying-left0`, x: 142, y: 648, w: 28, h: 32 },
            { name: `${SquirrelColor.RED}-dying-left1`, x: 142, y: 692, w: 28, h: 32 },
            { name: `${SquirrelColor.RED}-dying-right0`, x: 854, y: 824, w: 28, h: 32 },
            { name: `${SquirrelColor.RED}-dying-right1`, x: 854, y: 857, w: 28, h: 32 },
            { name: "player1-mark0", x: 409, y: 648, w: 16, h: 16 },
            { name: "player1-mark1", x: 409, y: 665, w: 16, h: 16 },
            { name: "player2-mark0", x: 426, y: 648, w: 16, h: 16 },
            { name: "player2-mark1", x: 426, y: 665, w: 16, h: 16 },
            { name: "player3-mark0", x: 443, y: 648, w: 16, h: 16 },
            { name: "player3-mark1", x: 443, y: 665, w: 16, h: 16 },
            { name: "player4-mark0", x: 460, y: 648, w: 16, h: 16 },
            { name: "player4-mark1", x: 460, y: 665, w: 16, h: 16 },
            { name: "teleport-left0", x: 408, y: 979, w: 25, h: 25 },
            { name: "teleport-left1", x: 434, y: 979, w: 25, h: 25 },
            { name: "teleport-left2", x: 460, y: 979, w: 25, h: 25 },
            { name: "teleport-left3", x: 486, y: 979, w: 25, h: 25 },
            { name: "teleport-left4", x: 512, y: 979, w: 25, h: 25 },
            { name: "teleport-right0", x: 538, y: 979, w: 25, h: 25 },
            { name: "teleport-right1", x: 564, y: 979, w: 25, h: 25 },
            { name: "teleport-right2", x: 460, y: 979, w: 25, h: 25 },
            { name: "teleport-right3", x: 486, y: 979, w: 25, h: 25 },
            { name: "teleport-right4", x: 512, y: 979, w: 25, h: 25 }
        ]);

        Squirrel.animations = [];
        Squirrel.animations[SquirrelDirection.LEFT] = [];
        Squirrel.animations[SquirrelDirection.RIGHT] = [];

        for (let color = SquirrelColor.COLOR_MIN; color <= SquirrelColor.COLOR_MAX; color++) {
            Squirrel.animations[SquirrelDirection.LEFT][color] = new SquirrelAnimations();
            Squirrel.animations[SquirrelDirection.RIGHT][color] = new SquirrelAnimations();
            Squirrel.animations[SquirrelDirection.LEFT][color].idle = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-idle-left0`, delay: 100 },
                { name: `${color}-idle-left1`, delay: 100 },
                { name: `${color}-idle-left2`, delay: 100 },
                { name: `${color}-idle-left3`, delay: 100 },
                { name: `${color}-idle-left4`, delay: 100 },
                { name: `${color}-idle-left5`, delay: 100 },
                { name: `${color}-idle-left6`, delay: 100 },
                { name: `${color}-idle-left7`, delay: 100 }
            ]);

            Squirrel.animations[SquirrelDirection.RIGHT][color].idle = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-idle-right0`, delay: 100 },
                { name: `${color}-idle-right1`, delay: 100 },
                { name: `${color}-idle-right2`, delay: 100 },
                { name: `${color}-idle-right3`, delay: 100 },
                { name: `${color}-idle-right4`, delay: 100 },
                { name: `${color}-idle-right5`, delay: 100 },
                { name: `${color}-idle-right6`, delay: 100 },
                { name: `${color}-idle-right7`, delay: 100 }
            ]);

            Squirrel.animations[SquirrelDirection.LEFT][color].run = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-run-left0`, delay: 100 },
                { name: `${color}-run-left1`, delay: 100 },
                { name: `${color}-run-left2`, delay: 100 },
                { name: `${color}-run-left3`, delay: 100 },
                { name: `${color}-run-left4`, delay: 100 },
                { name: `${color}-run-left5`, delay: 100 },
            ]);

            Squirrel.animations[SquirrelDirection.RIGHT][color].run = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-run-right0`, delay: 100 },
                { name: `${color}-run-right1`, delay: 100 },
                { name: `${color}-run-right2`, delay: 100 },
                { name: `${color}-run-right3`, delay: 100 },
                { name: `${color}-run-right4`, delay: 100 },
                { name: `${color}-run-right5`, delay: 100 }
            ]);

            Squirrel.animations[SquirrelDirection.LEFT][color].jumpAscend = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-jump-ascend-left`, delay: 1000 }
            ]);

            Squirrel.animations[SquirrelDirection.LEFT][color].jumpFloat = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-jump-float-left`, delay: 1000 }
            ]);

            Squirrel.animations[SquirrelDirection.LEFT][color].jumpDescend = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-jump-descend-left`, delay: 1000 }
            ]);

            Squirrel.animations[SquirrelDirection.RIGHT][color].jumpAscend = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-jump-ascend-right`, delay: 1000 }
            ]);

            Squirrel.animations[SquirrelDirection.RIGHT][color].jumpFloat = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-jump-float-right`, delay: 1000 }
            ]);

            Squirrel.animations[SquirrelDirection.RIGHT][color].jumpDescend = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-jump-descend-right`, delay: 1000 }
            ]);

            Squirrel.animations[SquirrelDirection.LEFT][color].doubleJump = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-doublejump-left0`, delay: 100 },
                { name: `${color}-doublejump-left1`, delay: 100 },
                { name: `${color}-doublejump-left2`, delay: 100 },
                { name: `${color}-doublejump-left3`, delay: 100 }
            ]);

            Squirrel.animations[SquirrelDirection.RIGHT][color].doubleJump = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-doublejump-right0`, delay: 100 },
                { name: `${color}-doublejump-right1`, delay: 100 },
                { name: `${color}-doublejump-right2`, delay: 100 },
                { name: `${color}-doublejump-right3`, delay: 100 }
            ]);

            Squirrel.animations[SquirrelDirection.LEFT][color].crouch = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-crouch-left0`, delay: 100 },
                { name: `${color}-crouch-left1`, delay: 100 }
            ]);

            Squirrel.animations[SquirrelDirection.RIGHT][color].crouch = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-crouch-right0`, delay: 100 },
                { name: `${color}-crouch-right1`, delay: 100 }
            ]);

            Squirrel.animations[SquirrelDirection.LEFT][color].dying = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-dying-left0`, delay: 1000 },
                { name: `${color}-dying-left1`, delay: 1000 }
            ]);

            Squirrel.animations[SquirrelDirection.RIGHT][color].dying = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `${color}-dying-right0`, delay: 1000 },
                { name: `${color}-dying-right1`, delay: 1000 }
            ]);

            Squirrel.animations[SquirrelDirection.LEFT][color].teleportOut = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `teleport-left4`, delay: 100 },
                { name: `teleport-left3`, delay: 100 },
                { name: `teleport-left2`, delay: 100 },
                { name: `teleport-left1`, delay: 100 },
                { name: `teleport-left0`, delay: 100 },
            ]);

            Squirrel.animations[SquirrelDirection.RIGHT][color].teleportOut = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `teleport-right4`, delay: 100 },
                { name: `teleport-right3`, delay: 100 },
                { name: `teleport-right2`, delay: 100 },
                { name: `teleport-right1`, delay: 100 },
                { name: `teleport-right0`, delay: 100 },
            ]);

            Squirrel.animations[SquirrelDirection.LEFT][color].teleportIn = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `teleport-left0`, delay: 100 },
                { name: `teleport-left1`, delay: 100 },
                { name: `teleport-left2`, delay: 100 },
                { name: `teleport-left3`, delay: 100 },
                { name: `teleport-left4`, delay: 100 },
            ]);

            Squirrel.animations[SquirrelDirection.RIGHT][color].teleportIn = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `teleport-right0`, delay: 100 },
                { name: `teleport-right1`, delay: 100 },
                { name: `teleport-right2`, delay: 100 },
                { name: `teleport-right3`, delay: 100 },
                { name: `teleport-right4`, delay: 100 },
            ]);
        }

        Squirrel.markAnimations = [];
        for (let player = 0; player < 4; player++) {
            Squirrel.markAnimations[player] = Playnewton.GPU.CreateAnimation(spriteset, [
                { name: `player${player + 1}-mark0`, delay: 200 },
                { name: `player${player + 1}-mark1`, delay: 200 }
            ]);
        }
    }

    static Unload() {
        Squirrel.animations = null;
        Squirrel.markAnimations = null;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {SquirrelColor} color
     */
    constructor(x, y, color) {
        super();
        this.color = color;
        this.sprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpriteZ(this.sprite, Z_ORDER.SQUIRRELS);
        Playnewton.GPU.EnableSprite(this.sprite);

        this.body = Playnewton.PPU.CreateBody();
        Playnewton.PPU.SetBodyRectangle(this.body, 17, 5, 12, 21);
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[SquirrelDirection.RIGHT][this.color].idle);
        Playnewton.PPU.SetBodyPosition(this.body, x, y);
        Playnewton.PPU.SetBodyCollideWorldBounds(this.body, true);
        Playnewton.PPU.SetBodyVelocityBounds(this.body, -8, 8, -11, 8);
        Playnewton.PPU.EnableBody(this.body);
    }

    UpdateBody() {
        if (this.state === SquirrelState.DYING) {
            return;
        }

        this.isOnGround = false;
        let velocityX = this.body.velocity.x;
        let velocityY = this.body.velocity.y;
        if (this.body.bottom >= Playnewton.PPU.world.bounds.bottom || this.body.touches.bottom) {
            this.isOnGround = true;
            velocityX /= 2;
        }

        switch (this.state) {
            case SquirrelState.RUN:
            case SquirrelState.JUMP:
            case SquirrelState.DOUBLE_JUMP:
                if (this.player && this.player.pad.left) {
                    this.direction = SquirrelDirection.LEFT;
                    velocityX -= this.runSpeed;
                } else if (this.player && this.player.pad.right) {
                    this.direction = SquirrelDirection.RIGHT;
                    velocityX += this.runSpeed;
                } else {
                    velocityX = 0;
                }
                break;
            case SquirrelState.TELEPORT_OUT:
            case SquirrelState.TELEPORT_IN:
                velocityX = 0;
                velocityY = 0;
                break;
        }

        switch (this.state) {
            case SquirrelState.CROUCH:
                if (this.player && this.player.pad.down) {
                    if (this.body.touches.bottom && this.body.touches.bottom.passable.fromBottomToTop) {
                        Playnewton.PPU.SetBodyPosition(this.body, this.body.position.x, this.body.touches.bottom.bottom);
                        this.state = SquirrelState.RUN;
                    }
                } else {
                    this.state = SquirrelState.RUN;
                }
                if (!this.isOnGround) {
                    this.state = SquirrelState.RUN;
                }
                break;
            case SquirrelState.RUN:
                if (this.player && this.player.pad.A) {
                    if (this.canJump && this.isOnGround) {
                        this.jumpImpulseFrameCounter = this.jumpImpulseFrames;
                        velocityY = -this.jumpImpulse;
                        this.canJump = false;
                        this.state = SquirrelState.JUMP;
                        Playnewton.APU.PlaySound("sounds/jump-squirrel.wav");
                    }
                } else if (this.player && this.player.pad.down && this.isOnGround) {
                    this.state = SquirrelState.CROUCH;
                    this.canJump = false;
                } else {
                    this.canJump = true;
                }
                break;
            case SquirrelState.JUMP:
                if (this.player && this.player.pad.A) {
                    if (this.canJump) {
                        this.canJump = false;
                        this.jumpImpulseFrameCounter = this.jumpImpulseFrames;
                        velocityY = -this.jumpImpulse;
                        this.state = SquirrelState.DOUBLE_JUMP;
                        Playnewton.APU.PlaySound("sounds/jump-squirrel.wav");
                    }
                } else {
                    this.canJump = true;
                }
                if (this.isOnGround) {
                    this.state = SquirrelState.RUN;
                } else {
                    --this.jumpImpulseFrameCounter;
                    if (this.jumpImpulseFrameCounter > 0) {
                        velocityY = -this.jumpImpulse;
                    }
                }
                break;
            case SquirrelState.DOUBLE_JUMP:
                if (this.isOnGround) {
                    this.state = SquirrelState.RUN;
                } else {
                    --this.jumpImpulseFrameCounter;
                    if (this.jumpImpulseFrameCounter > 0) {
                        velocityY = -this.jumpImpulse;
                    }
                }
                break;
            case SquirrelState.BOUNCE:
                velocityY = -this.bounceImpulse;
                this.state = SquirrelState.JUMP;
                break;
        }
        Playnewton.PPU.SetBodyVelocity(this.body, velocityX, velocityY);
    }

    UpdateSprite() {
        switch (this.state) {
            case SquirrelState.WAIT:
                Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].idle);
                if (this.direction === SquirrelDirection.LEFT) {
                    Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x + 12, this.body.position.y + 1);
                } else {
                    Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x, this.body.position.y + 1);
                }
                break;
            case SquirrelState.CROUCH:
                Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].crouch);
                Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x, this.body.position.y + 1);
                if (this.direction === SquirrelDirection.LEFT) {
                    Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x + 12, this.body.position.y + 1);
                } else {
                    Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x + 8, this.body.position.y + 1);
                }
                break;
            case SquirrelState.RUN:
                if (Math.abs(this.body.velocity.x) < Number.EPSILON) {
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].idle);
                    if (this.direction === SquirrelDirection.LEFT) {
                        Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x + 12, this.body.position.y + 1);
                    } else {
                        Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x, this.body.position.y + 1);
                    }
                } else {
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].run);
                    if (this.direction === SquirrelDirection.LEFT) {
                        Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x + 8, this.body.position.y + 1);
                    } else {
                        Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x - 16, this.body.position.y + 1);
                    }
                }
                break;
            case SquirrelState.JUMP:
                if (this.body.velocity.y > 5) {
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].jumpDescend);
                } else if (this.body.velocity.y < -5) {
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].jumpAscend);
                } else {
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].jumpFloat);
                }
                if (this.direction === SquirrelDirection.LEFT) {
                    Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x + 8, this.body.position.y + 1);
                } else {
                    Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x - 16, this.body.position.y + 1);
                }
                break;
            case SquirrelState.DOUBLE_JUMP:
                Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].doubleJump);
                Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x, this.body.position.y + 1);
                break;
            case SquirrelState.BOUNCE:
                Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].jumpFloat);
                Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x, this.body.position.y + 1);
                break;
            case SquirrelState.DYING:
                Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].dying, Playnewton.GPU_AnimationMode.ONCE);
                Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x, this.body.position.y + 1);
                break;
            case SquirrelState.TELEPORT_IN:
                if (this.sprite.animationStopped) {
                    Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].teleportOut, Playnewton.GPU_AnimationMode.ONCE);
                    this.body.bottom = this.teleportDestination.y;
                    this.body.centerX = this.teleportDestination.x;
                    if (this.direction === SquirrelDirection.LEFT) {
                        Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x + 12, this.body.position.y + 1);
                    } else {
                        Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x, this.body.position.y + 1);
                    }
                    this.state = SquirrelState.TELEPORT_OUT;
                }
                break;
            case SquirrelState.TELEPORT_OUT:
                if (this.sprite.animationStopped) {
                    this.state = SquirrelState.RUN;
                }
                break;
        }
    }

    Hurt() {
        if (this.dead || Playnewton.GPU.IsSpriteBlinking(this.sprite)) {
            return;
        }
        Playnewton.GPU.MakeSpriteBlink(this.sprite, 1000);
        this.health = Math.max(this.health - 1, 0);
        if (this.dead) {
            this.state = SquirrelState.DYING;
            Playnewton.PPU.SetBodyImmovable(this.body, true);
        } else {
            Playnewton.APU.PlaySound("sounds/hurt-squirrel.wav");
        }
    }

    Wait() {
        this.state = SquirrelState.WAIT;
    }

    StopWaiting() {
        if (this.state === SquirrelState.WAIT) {
            this.state = SquirrelState.RUN;
        }
    }

    /**
     * 
     * @param {Playnewton.PPU_Point} destination 
     */
    TeleportTo(destination) {
        if (this.state === SquirrelState.CROUCH) {
            Playnewton.GPU.SetSpriteAnimation(this.sprite, Squirrel.animations[this.direction][this.color].teleportIn, Playnewton.GPU_AnimationMode.ONCE);
            if (this.direction === SquirrelDirection.LEFT) {
                Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x + 12, this.body.position.y + 1);
            } else {
                Playnewton.GPU.SetSpritePosition(this.sprite, this.body.position.x, this.body.position.y + 1);
            }
            this.teleportDestination = destination;
            this.state = SquirrelState.TELEPORT_IN;
        }
    }


    get bulletable() {
        return true;
    }
}
