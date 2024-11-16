import * as Playnewton from "../playnewton.js"
import Z_ORDER from "../utils/z_order.js";
import { Squirrel, SquirrelTeam } from "./squirrel.js";

/**
 * @readonly
 * @enum {number}
 */
const AcornState = {
    IDLE: 1,
    PURSUE: 2,
    COLLECTED: 3,
    BUBBLED: 4
};

const PURSUE_START_DISTANCE = 32;
const PURSUE_DONE_DISTANCE = 8;
const PURSUE_SPEED = 4;

class AcornAnimations {
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    idle;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    bubble;

    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    bubblePop;
}

export class AcornCollection {

    /**
     * @type Array<Acorn>
     */
    acorns = [];

    /**
     * @type Array<AcornBubble>
     */
    bubbles = [];

    /**
     * @returns boolean
     */
    get allCollected() {
        for (let acorn of this.acorns) {
            if (!acorn.collected) {
                return false;
            }
        }
        return true;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {Acorn}
     */
    AddAcorn(x, y) {
        let acorn = new Acorn(x, y);
        this.acorns.push(acorn);
        return acorn;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    AddBubble(x, y) {
        let acorn = this.AddAcorn(x, y);
        acorn.Bubble();
        this.bubbles.push(new AcornBubble(x, y, acorn));
    }

    UpdateSprites() {
        for (let b of this.bubbles) {
            b.UpdateSprite();
        }
    }

    UpdateBodies() {
        for (let b of this.bubbles) {
            b.UpdateBody();
        }
    }

    /**
     * 
     * @param {SquirrelTeam} squirrelTeam 
     */
    Pursue(squirrelTeam) {
        for (let acorn of this.acorns) {
            acorn.Pursue(squirrelTeam);
        }
        for (let bubble of this.bubbles) {
            bubble.Pursue(squirrelTeam);
        }
    }
}

export class Acorn {
    /**
     * 
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     *  @type AcornState
     */
    state = AcornState.IDLE;

    /**
     * @type Squirrel
     */
    squirrelTarget;

    /**
     * @type AcornAnimations
     */
    static animations;

    static async Load() {
        let bitmap = await Playnewton.DRIVE.LoadBitmap("sprites/squirrel.png");

        let spriteset = Playnewton.GPU.CreateSpriteset(bitmap, [
            { name: "acorn0", x: 1007, y: 425, w: 16, h: 14 },
            { name: "acorn1", x: 1007, y: 440, w: 16, h: 14 },
            { name: "acorn2", x: 1007, y: 455, w: 16, h: 14 },
            { name: "bubble0", x: 990, y: 425, w: 16, h: 16 },
            { name: "bubble1", x: 990, y: 425, w: 16, h: 16 },
            { name: "bubble2", x: 990, y: 459, w: 16, h: 16 },
            { name: "bubble-pop0", x: 973, y: 425, w: 16, h: 16 },
            { name: "bubble-pop1", x: 973, y: 425, w: 16, h: 16 },
            { name: "bubble-pop2", x: 973, y: 459, w: 16, h: 16 },
        ]);

        Acorn.animations = new AcornAnimations();

        Acorn.animations.idle = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: "acorn0", delay: 1000 },
            { name: "acorn1", delay: 100 },
            { name: "acorn2", delay: 100 }
        ]);

        Acorn.animations.bubble = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: "bubble0", delay: 200 },
            { name: "bubble1", delay: 200 },
            { name: "bubble2", delay: 200 }
        ]);
        Acorn.animations.bubblePop = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: "bubble-pop0", delay: 200 },
            { name: "bubble-pop1", delay: 200 },
            { name: "bubble-pop2", delay: 200 }
        ]);
    }

    static Unload() {
        Acorn.animations = null;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.sprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Acorn.animations.idle);
        Playnewton.GPU.SetSpritePosition(this.sprite, x, y);
        Playnewton.GPU.SetSpriteZ(this.sprite, Z_ORDER.COLLECTIBLES);
        Playnewton.GPU.EnableSprite(this.sprite);
    }

    Bubble() {
        this.state = AcornState.BUBBLED;
        Playnewton.GPU.DisableSprite(this.sprite);
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    UnbubbleAt(x, y) {
        this.state = AcornState.IDLE;
        Playnewton.GPU.EnableSprite(this.sprite);
        Playnewton.GPU.SetSpritePosition(this.sprite, x, y);
    }

    /**
     * @returns boolean
     */
    get collected() {
        return this.state === AcornState.COLLECTED;
    }

    /**
     * @param {SquirrelTeam} squirrelTeam
     */
    Pursue(squirrelTeam) {
        switch (this.state) {
            case AcornState.IDLE:
                this.Aim(squirrelTeam);
                break;
            case AcornState.PURSUE:
                this.PursueTarget();
                break;
            case AcornState.COLLECTED:
            case AcornState.BUBBLED:
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
                this.state = AcornState.PURSUE;
                Playnewton.APU.PlaySound("sounds/collect-acorn.wav");
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
            this.state = AcornState.COLLECTED;
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
const BubbleState = {
    MOVING: 1,
    POPPING: 2,
    POPPED: 3
};

const BUBBLE_SPEED = 1;

export class AcornBubble {
    /**
     * @type Playnewton.PPU_Body
     */
    body;

    /**
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     * @type Acorn
     */
    acorn;

    /**
     * @type BubbleState
     */
    state;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {Acorn} acorn
     */
    constructor(x, y, acorn) {
        this.acorn = acorn;
        this.state = BubbleState.MOVING;

        this.sprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Acorn.animations.bubble);
        Playnewton.GPU.SetSpriteZ(this.sprite, Z_ORDER.COLLECTIBLES);
        Playnewton.GPU.EnableSprite(this.sprite);

        this.body = Playnewton.PPU.CreateBody();
        Playnewton.PPU.SetBodyCircle(this.body, 8, 8, 8);
        Playnewton.PPU.SetBodyPosition(this.body, x, y);
        Playnewton.PPU.SetBodyVelocity(this.body, Playnewton.RAND.pickOne([-BUBBLE_SPEED, BUBBLE_SPEED]), Playnewton.RAND.pickOne([-BUBBLE_SPEED, BUBBLE_SPEED]));
        Playnewton.PPU.SetBodyAffectedByGravity(this.body, false);
        Playnewton.PPU.SetBodyCollideWorldBounds(this.body, true);
        Playnewton.PPU.EnableBody(this.body);
    }

    /**
     * @param {SquirrelTeam} squirrelTeam
     */
    Pursue(squirrelTeam) {
        switch (this.state) {
            case BubbleState.MOVING:
                this.Collides(squirrelTeam);
                break;
            case BubbleState.POPPING:
            case BubbleState.POPPED:
                break;
        }
    }

    /**
     * @param {SquirrelTeam} squirrelTeam
     */
    Collides(squirrelTeam) {
        for (let squirrel of squirrelTeam.squirrels) {
            if (Playnewton.PPU.CheckIfBodiesIntersects(this.body, squirrel.body)) {
                this.Pop();
                break;
            }
        }
    }

    Pop() {
        Playnewton.GPU.SetSpriteAnimation(this.sprite, Acorn.animations.bubblePop, Playnewton.GPU_AnimationMode.ONCE);
        Playnewton.PPU.DisableBody(this.body);
        this.state = BubbleState.POPPING;

    }

    UpdateSprite() {
        switch (this.state) {
            case BubbleState.MOVING:
                Playnewton.GPU.SetSpritePosition(this.sprite, this.body.left, this.body.top);
                break;
            case BubbleState.POPPING:
                if (this.sprite.animationStopped) {
                    Playnewton.GPU.DisableSprite(this.sprite);
                    this.acorn.UnbubbleAt(this.sprite.x, this.sprite.y);
                    this.state = BubbleState.POPPED;
                }
                break;
            case BubbleState.POPPED:
                break;
        }

    }

    UpdateBody() {
        if (this.state !== BubbleState.MOVING) {
            return;
        }

        if (this.body.velocity.x > 0 && (this.body.touches.right || this.body.right >= Playnewton.PPU.world.bounds.right)) {
            this.body.velocity.x = -BUBBLE_SPEED;
        }
        if (this.body.velocity.x < 0 && (this.body.touches.left || this.body.left <= Playnewton.PPU.world.bounds.left)) {
            this.body.velocity.x = BUBBLE_SPEED;
        }
        if (this.body.velocity.y > 0 && (this.body.touches.bottom || this.body.bottom >= Playnewton.PPU.world.bounds.bottom)) {
            this.body.velocity.y = -BUBBLE_SPEED;
        }
        if (this.body.velocity.y < 0 && (this.body.touches.top, this.body.top <= Playnewton.PPU.world.bounds.top)) {
            this.body.velocity.y = BUBBLE_SPEED;
        }
    }
}