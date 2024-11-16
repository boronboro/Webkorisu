import * as Playnewton from "../playnewton.js"
import Z_ORDER from "../utils/z_order.js";
import { Squirrel, SquirrelTeam } from "./squirrel.js";

const TELEPORT_DISTANCE = 24;

export class TeleporterCollection {

    /**
     * @type Array<Teleporter>
     */
    teleporters = [];

    /**
     * @param {Array<Playnewton.PPU_Point>} path
     */
    AddTeleporter(path) {
        if(path && path.length >= 2) {
            this.teleporters.push(new Teleporter(path[0].x, path[0].y, path[path.length-1].x, path[path.length-1].y));
        }
    }

    /**
     * 
     * @param {SquirrelTeam} squirrelTeam 
     */
    Check(squirrelTeam) {
        for (let t of this.teleporters) {
            t.Check(squirrelTeam);
        }
    }
}

export class Teleporter {
    /**
     * 
     * @type Playnewton.GPU_Sprite
     */
    sprite;

    /**
     * @type Playnewton.PPU_Point
     */
    source;

    /**
     * @type Playnewton.PPU_Point
     */
    destination;

    /**
     * 
     * @param {number} sx 
     * @param {number} sy
     * @param {number} dx
     * @param {number} dy
     */
    constructor(sx, sy, dx, dy) {
        this.sprite = Playnewton.GPU.CreateSprite();
        this.source = new Playnewton.PPU_Point(sx, sy);
        this.destination = new Playnewton.PPU_Point(dx, dy);
    }

    /**
     * @param {SquirrelTeam} squirrelTeam
     */
    Check(squirrelTeam) {
        for (let squirrel of squirrelTeam.squirrels) {
            let dx = squirrel.body.centerX - this.source.x;
            let dy = squirrel.body.centerY - this.source.y;
            let distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance < TELEPORT_DISTANCE) {
                squirrel.TeleportTo(this.destination)
                break;
            }
        }
    }
}