import Scene from "./scene.js";
import { Squirrel, SquirrelColor, SquirrelTeam } from "../entities/squirrel.js";
import { Acorn, AcornCollection } from "../entities/acorn.js";
import Z_ORDER from "../utils/z_order.js";
import * as Playnewton from "../playnewton.js"
import { IngameMapKeyboardEventToPadButton } from "../utils/keyboard_mappings.js";
import Announcement from "../entities/announcement.js";
import Fadeout from "../entities/fadeout.js";
import { Key, KeysAndLocksCollection, KeyColor } from "../entities/key.js";
import { Lever, LeverColor, LeversAndPortcullisCollection } from "../entities/lever.js";
import { MovingPlatform, MovingPlatformCollection } from "../entities/moving_platform.js";
import { DisappearingPlatform, DisappearingPlatformCollection, DisappearingPlatformDescription } from "../entities/disappearing_platform.js";

class FactoryLevelState {
    /**
     * @type FactoryLevel
     */
    level;

    /**
     * @param {FactoryLevel} level 
     */
    constructor(level) {
        this.level = level;
    }

    UpdateBodies() {
        this.level.squirrelTeam.UpdateBodies();
        this.level.acornCollection.Pursue(this.level.squirrelTeam);
        this.level.keyCollection.Pursue(this.level.squirrelTeam);
        this.level.keyCollection.UpdateBodies();
        this.level.leverCollection.Check(this.level.squirrelTeam);
        this.level.leverCollection.UpdateBodies();
        this.level.movingPlatformCollection.TransportSquirrels(this.level.squirrelTeam);
        this.level.movingPlatformCollection.UpdateBodies();
        this.level.disappearingPlatformCollection.UpdateBodies();
    }

    UpdateSprites() {
        this.level.squirrelTeam.UpdateSprites();
        this.level.movingPlatformCollection.UpdateSprites();
    }
}

class FactoryLevelPlayState extends FactoryLevelState {

    /**
     * @param {FactoryLevel} level 
     */
    constructor(level) {
        super(level);
        Playnewton.CTRL.MapKeyboardEventToPadButton = IngameMapKeyboardEventToPadButton;
    }

    UpdateBodies() {
        super.UpdateBodies();
        if (this.level.acornCollection.allCollected) {
            this.level.state = new FactoryLevelWinState(this.level);
        }
    }
}

class FactoryLevelWinState extends FactoryLevelState {
    /**
     * @type Announcement
     */
    announcement;

    /**
     * @param {FactoryLevel} level 
     */
    constructor(level) {
        super(level);
        this.announcement = new Announcement("Victory !");
        this.announcement.Start();
    }

    UpdateSprites() {
        super.UpdateSprites();
        this.announcement.Update();
        if (this.announcement.done) {
            Playnewton.APU.PlaySound("sounds/pause_resume.wav");
            this.level.state = new FactoryLevelFadeoutState(this.level);
        }
    }
}

class FactoryLevelFadeoutState extends FactoryLevelState {
    /**
     * @type Fadeout
     */
    fadeout;

    /**
         * @param {FactoryLevel} level 
         */
    constructor(level) {
        super(level);
        let layers = [];
        for (let i = Z_ORDER.MIN; i <= Z_ORDER.MAX; ++i) {
            layers.push(i);
        }
        this.fadeout = new Fadeout(1000, layers, () => {
            this.level.Stop();
            this.level.nextScene = this.level.nextSceneOnExit;
            this.level.nextScene.Start();
        });

    }

    UpdateSprites() {
        super.UpdateSprites();
        this.fadeout.Update();
    }
}

export default class FactoryLevel extends Scene {

    /**
     * @type FactoryLevelState
     */
    state;

    /**
     * @type Scene
     */
    nextSceneOnExit;

    /**
     * @type string
     */
    mapPath;

    /**
     * @type SquirrelTeam
     */
    squirrelTeam;

    /**
     * @type AcornCollection
     */
    acornCollection;

    /**
     * @type KeysAndLocksCollection
     */
    keyCollection;

    /**
     * @type LeversAndPortcullisCollection
     */
    leverCollection;

    /**
     * @type MovingPlatformCollection
     */
    movingPlatformCollection;

    /**
     * @type DisappearingPlatformCollection
     */
    disappearingPlatformCollection;

    /**
     * 
     * @param {string} mapPath 
     * @param {Scene} nextScene 
     */
    constructor(mapPath, nextScene) {
        super();
        this.mapPath = mapPath;
        this.nextSceneOnExit = nextScene;
    }

    async InitWorld() {
        for (let z = Z_ORDER.MIN; z <= Z_ORDER.MAX; ++z) {
            let layer = Playnewton.GPU.GetLayer(z);
            Playnewton.GPU.EnableLayer(layer);
        }
    }

    async InitMap() {
        let map = await Playnewton.DRIVE.LoadTmxMap(this.mapPath);

        Playnewton.PPU.SetWorldBounds(0, 0, 1024, 576);
        Playnewton.PPU.SetWorldGravity(0, 1);

        Playnewton.DRIVE.ConvertTmxMapToGPUSprites(Playnewton.GPU, map, 0, 0, Z_ORDER.BACKGROUND);
        Playnewton.DRIVE.ConvertTmxMapToPPUBodies(Playnewton.PPU, map, 0, 0);

        await this.InitMapObjects(map);
    }

    /**
     * 
     * @param {Playnewton.TMX_Map} map 
     */
    async InitMapObjects(map) {
        Playnewton.DRIVE.ForeachTmxMapObject(
            (object, objectgroup, x, y) => {
                switch (object.type) {
                    case "squirrel-brown":
                        this.squirrelTeam.AddSquirrel(x, y - 21, SquirrelColor.BROWN);
                        this.activeColor = SquirrelColor.BROWN;
                        break;
                    case "squirrel-black":
                        this.squirrelTeam.AddSquirrel(x, y - 21, SquirrelColor.BLACK);
                        this.activeColor = SquirrelColor.BLACK;
                        break;
                    case "squirrel-gray":
                        this.squirrelTeam.AddSquirrel(x, y - 21, SquirrelColor.GRAY);
                        this.activeColor = SquirrelColor.GRAY;
                        break;
                    case "squirrel-red":
                        this.squirrelTeam.AddSquirrel(x, y - 21, SquirrelColor.RED);
                        this.activeColor = SquirrelColor.RED;
                        break;
                    case "acorn":
                        this.acornCollection.AddAcorn(x, y - 16);
                        break;
                    case "key-yellow":
                        this.keyCollection.AddKey(x, y - 32, KeyColor.YELLOW);
                        break;
                    case "key-blue":
                        this.keyCollection.AddKey(x, y - 32, KeyColor.BLUE);
                        break;
                    case "key-green":
                        this.keyCollection.AddKey(x, y - 32, KeyColor.GREEN);
                        break;
                    case "key-pink":
                        this.keyCollection.AddKey(x, y - 32, KeyColor.PINK);
                        break;
                    case "lock-yellow":
                        this.keyCollection.AddLock(x, y - 32, KeyColor.YELLOW);
                        break;
                    case "lock-blue":
                        this.keyCollection.AddLock(x, y - 32, KeyColor.BLUE);
                        break;
                    case "lock-green":
                        this.keyCollection.AddLock(x, y - 32, KeyColor.GREEN);
                        break;
                    case "lock-pink":
                        this.keyCollection.AddLock(x, y - 32, KeyColor.PINK);
                        break;
                    case "portcullis-yellow":
                        this.leverCollection.AddPortcullis(x, y - 32, LeverColor.YELLOW);
                        break;
                    case "portcullis-blue":
                        this.leverCollection.AddPortcullis(x, y - 32, LeverColor.BLUE);
                        break;
                    case "portcullis-green":
                        this.leverCollection.AddPortcullis(x, y - 32, LeverColor.GREEN);
                        break;
                    case "portcullis-pink":
                        this.leverCollection.AddPortcullis(x, y - 32, LeverColor.PINK);
                        break;
                    case "lever-yellow":
                        this.leverCollection.AddLever(x, y - 31, LeverColor.YELLOW);
                        break;
                    case "lever-blue":
                        this.leverCollection.AddLever(x, y - 31, LeverColor.BLUE);
                        break;
                    case "lever-green":
                        this.leverCollection.AddLever(x, y - 31, LeverColor.GREEN);
                        break;
                    case "lever-pink":
                        this.leverCollection.AddLever(x, y - 31, LeverColor.PINK);
                        break;
                    case "moving-platform":
                        this.movingPlatformCollection.AddMovingPlatform(object.polygonPoints || object.polylinePoints);
                        break;
                    case "disappearing-platform":
                        let desc = new DisappearingPlatformDescription();
                        desc.activeDuration = parseInt(object.properties.get("active"), 10) || 3000;
                        desc.inactiveDuration = parseInt(object.properties.get("inactive"), 10) || 2000;
                        desc.initialDuration = parseInt(object.properties.get("initial"), 10) || 1000;
                        this.disappearingPlatformCollection.AddDisappearingPlatform(x, y-16, desc);
                        break;
                }
            },
            map);
    }


    async Start() {
        await super.Start();

        this.progress = 0;

        await Squirrel.Load();
        this.squirrelTeam = new SquirrelTeam();
        this.progress = 10;

        await Key.Load();
        this.keyCollection = new KeysAndLocksCollection();

        await Lever.Load();
        this.leverCollection = new LeversAndPortcullisCollection();

        await MovingPlatform.Load();
        this.movingPlatformCollection = new MovingPlatformCollection();

        await DisappearingPlatform.Load();
        this.disappearingPlatformCollection = new DisappearingPlatformCollection();

        await Acorn.Load();
        this.acornCollection = new AcornCollection();
        this.progress = 20;

        await this.InitWorld();
        this.progress = 30;

        await this.InitMap();
        this.progress = 40;

        this.state = new FactoryLevelPlayState(this);
        this.progress = 100;

        Playnewton.GPU.backgroundColor = "#0a89ff";
    }

    Stop() {
        super.Stop();

        Squirrel.Unload();
        this.squirrelTeam = null;

        Key.Unload();
        this.keyCollection = null;

        Lever.Unload();
        this.leverCollection = null;

        MovingPlatform.Unload();
        this.movingPlatformCollection = null;

        DisappearingPlatform.Unload();
        this.disappearingPlatformCollection = null;

        Acorn.Unload();
        this.acornCollection = null;

        this.state = null;
    }

    UpdateBodies() {
        this.state.UpdateBodies();
    }

    UpdateSprites() {
        this.state.UpdateSprites();
    }
}
