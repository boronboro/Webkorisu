import * as Playnewton from "../playnewton.js"
import Z_ORDER from "../utils/z_order.js";
import { Squirrel, SquirrelTeam } from "./squirrel.js";

const CURRENT_PATH_POINT_DONE_DISTANCE = 1;
const MOVING_SPEED = 1;

class MovingPlatformAnimations {
    /**
     * @type Playnewton.GPU_SpriteAnimation
     */
    moving;
}

export class MovingPlatform {

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
     * @type Array<Playnewton.PPU_Point>
     */
    path;

    /**
     * @type number
     */
    currentPathPointIndex = 0;

    /**
     * @type number
     */
    currentDx = 0;

    /**
     * @type MovingPlatformAnimations
     */
    static animations;

    static async Load() {
        let bitmap = await Playnewton.DRIVE.LoadBitmap("sprites/squirrel.png");

        let spriteset = Playnewton.GPU.CreateSpriteset(bitmap, [
            { name: `moving0`, x: 100, y: 86, w: 64, h: 16 },
        ]);

        MovingPlatform.animations = new MovingPlatformAnimations();
        MovingPlatform.animations.moving = Playnewton.GPU.CreateAnimation(spriteset, [
            { name: `moving0`, delay: 1000 },
        ]);
    }

    static Unload() {
        MovingPlatform.animations = null;
    }

    /**
     * 
     * @param {Array<Playnewton.PPU_Point>} path
     */
    constructor(path) {
        this.path = path;

        this.body = Playnewton.PPU.CreateBody();
        Playnewton.PPU.SetBodyRectangle(this.body, 0, 0, 64, 16);
        Playnewton.PPU.SetBodyPosition(this.body, this.path[0].x - 32, this.path[0].y - 8);
        Playnewton.PPU.SetBodyImmovable(this.body, true);
        Playnewton.PPU.SetBodyAffectedByGravity(this.body, false);
        Playnewton.PPU.EnableBody(this.body);

        this.sprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpriteAnimation(this.sprite, MovingPlatform.animations.moving);
        Playnewton.GPU.SetSpritePosition(this.sprite, this.body.centerX - 32, this.body.centerY - 8);
        Playnewton.GPU.SetSpriteZ(this.sprite, Z_ORDER.PLAFORMS);
        Playnewton.GPU.EnableSprite(this.sprite);
    }

    /**
     * @param {Playnewton.PPU_Body} body 
     */
    TransportBody(body) {
        if(Playnewton.PPU.CheckIfBodiesIntersects(body, this.body) && body.bottom >= this.body.top) {
            body.position.x += this.currentDx;
        }
    }

    UpdateBody() {
        let currentPathPoint = this.path[this.currentPathPointIndex];
        let dx = currentPathPoint.x - this.body.centerX;
        let dy = currentPathPoint.y - this.body.centerY;
        let distance = Math.sqrt(dx ** 2 + dy ** 2);
        if (distance < CURRENT_PATH_POINT_DONE_DISTANCE) {
            this.currentPathPointIndex = Playnewton.FPU.wrap(0, this.currentPathPointIndex+1, this.path.length - 1);
            this.currentDx = 0;
        } else {
            let speed = MOVING_SPEED / distance;
            dx *= speed;
            dy *= speed;
            this.currentDx = dx;
            this.body.centerX += dx;
            this.body.centerY += dy;
        }
    }

    UpdateSprite() {
        Playnewton.GPU.SetSpritePosition(this.sprite, this.body.centerX - 32, this.body.centerY - 8);
    }

}

export class MovingPlatformCollection {

    /**
     * @type Array<MovingPlatform>
     */
    movingPlatforms = [];

    /**
     * @returns 
     */
    UpdateBodies() {
        for (let m of this.movingPlatforms) {
            m.UpdateBody();
        }
    }

    /**
     * @returns 
     */
    UpdateSprites() {
        for (let m of this.movingPlatforms) {
            m.UpdateSprite();
        }
    }

    /**
     * @param {Array<Playnewton.PPU_Point>} path
     */
    AddMovingPlatform(path) {
        if (path && path.length > 0) {
            this.movingPlatforms.push(new MovingPlatform(path));
        }
    }


    /**
     * @param {SquirrelTeam} squirrelTeam 
     */
    TransportSquirrels(squirrelTeam) {
        for(let squirrel of squirrelTeam.squirrels) {
            for (let m of this.movingPlatforms) {
                m.TransportBody(squirrel.body);
            }
        }

    }
}