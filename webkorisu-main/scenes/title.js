import Scene from "./scene.js"
import * as Playnewton from "../playnewton.js"
import { MenuMapKeyboardEventToPadButton } from "../utils/keyboard_mappings.js";
import TutorialLevel from "./tutorial_level.js";
import ForestLevel from "./forest_level.js";
import CastleLevel from "./castle_level.js";
import FactoryLevel from "./factory_level.js";
import MoonLevel from "./moon_level.js";

class Adventure {
    /**
     * @type string
     */
    name;

    /**
     * @type Playnewton.GPU_Label
     */
    label;

    constructor(name) {
        this.name = name;
        this.label = Playnewton.GPU.HUD.CreateLabel();
        Playnewton.GPU.HUD.SetLabelPosition(this.label, 512, 288);
        Playnewton.GPU.HUD.SetLabelFont(this.label, "bold 24px monospace");
        Playnewton.GPU.HUD.SetLabelText(this.label, name);
        Playnewton.GPU.HUD.SetLabelAlign(this.label, "right");
        Playnewton.GPU.HUD.EnableLabel(this.label);
    }

    /**
     * 
     * @param {Scene} nextScene 
     * @returns {Scene}
     */
    build(nextScene) {
        return nextScene;
    }
};

class TutorialAdventure extends Adventure {
    constructor() {
        super("Tutorial");
        Playnewton.GPU.HUD.SetLabelPosition(this.label, 512, 416);
    }

    /**
     * 
     * @param {Scene} nextScene 
     * @returns {Scene}
     */
    build(nextScene) {
        return new TutorialLevel(nextScene);
    }
}

class ForestAdventure extends Adventure {
    constructor() {
        super("Forest");
        Playnewton.GPU.HUD.SetLabelPosition(this.label, 512, 288);
    }

    /**
     * 
     * @param {Scene} nextScene 
     * @returns {Scene}
     */
    build(nextScene) {
        let scene = nextScene;
        for(let i=3; i>=1; i--) {
            scene = new ForestLevel(`maps/forest/forest${i}.tmx`, scene);
        }
        return scene;
    }
}


class CastleAdventure extends Adventure {
    constructor() {
        super("Castle");
        Playnewton.GPU.HUD.SetLabelPosition(this.label, 512, 320);
    }

    /**
     * 
     * @param {Scene} nextScene 
     * @returns {Scene}
     */
    build(nextScene) {
        let scene = nextScene;
        for(let i=4; i>=1; i--) {
            scene = new CastleLevel(`maps/castle/castle${i}.tmx`, scene);
        }
        return scene;
    }
}

class FactoryAdventure extends Adventure {
    constructor() {
        super("Factory");
        Playnewton.GPU.HUD.SetLabelPosition(this.label, 512, 352);
    }

    /**
     * 
     * @param {Scene} nextScene 
     * @returns {Scene}
     */
    build(nextScene) {
        let scene = nextScene;
        for(let i=4; i>=1; i--) {
            scene = new FactoryLevel(`maps/factory/factory${i}.tmx`, scene);
        }
        return scene;
    }
}


class MoonAdventure extends Adventure {
    constructor() {
        super("Moon");
        Playnewton.GPU.HUD.SetLabelPosition(this.label, 512, 384);
    }

    /**
     * 
     * @param {Scene} nextScene 
     * @returns {Scene}
     */
    build(nextScene) {
        let scene = nextScene;
        for(let i=3; i>=1; i--) {
            scene = new MoonLevel(`maps/moon/moon${i}.tmx`, scene);
        }
        return scene;
    }
}

export default class Title extends Scene {

    /**
     * @type Array<Adventure>
     */
    adventures;

    /**
     * @type number
     */
    adventureIndex;

    /**
     * @type ImageBitmap
     */
    titleBitmap;

    constructor() {
        super();
        this.pausable = false;
    }

    async InitTitle() {
        this.titleBitmap = await Playnewton.DRIVE.LoadBitmap("sprites/title.png");

        let titleSprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpritePicture(titleSprite, Playnewton.GPU.CreatePicture(this.titleBitmap));
        Playnewton.GPU.SetSpritePosition(titleSprite, Playnewton.GPU.screenWidth / 2 - titleSprite.width / 2, 32);
        Playnewton.GPU.EnableSprite(titleSprite);
    }

    InitHUD() {
        let startLabel = Playnewton.GPU.HUD.CreateLabel();
        Playnewton.GPU.HUD.SetLabelPosition(startLabel, 1024, 564);
        Playnewton.GPU.HUD.SetLabelText(startLabel, "Press ⌨️enter or 🎮start");
        Playnewton.GPU.HUD.SetLabelFont(startLabel, "bold 12px monospace");
        Playnewton.GPU.HUD.SetLabelColor(startLabel, "#eeeeee");
        Playnewton.GPU.HUD.SetLabelAlign(startLabel, "right");
        Playnewton.GPU.HUD.EnableLabel(startLabel);

        Playnewton.GPU.EnableHUD(true);
    }

    async Start() {
        await super.Start();

        this.adventures = [];
        this.adventures.push(new ForestAdventure());
        this.adventures.push(new CastleAdventure());
        this.adventures.push(new FactoryAdventure());
        this.adventures.push(new MoonAdventure());
        this.adventures.push(new TutorialAdventure());

        this.adventureIndex = 0;

        Playnewton.CTRL.MapKeyboardEventToPadButton = MenuMapKeyboardEventToPadButton;

        this.nextScene = this;
        for (let z = 0; z < 1; ++z) {
            let layer = Playnewton.GPU.GetLayer(z);
            Playnewton.GPU.EnableLayer(layer);
        }

        this.progress = 0;

        await this.InitTitle();
        this.progress = 50;

        this.InitHUD();
        this.progress = 80;

        this.progress = 100;
    }

    Stop() {
        super.Stop();
        this.nextScene = null;
        this.titleBitmap = null;
    }

    UpdateBodies() {
    }

    UpdateSprites() {
        for (let pad of Playnewton.CTRL.pads) {
            if ((pad.TestAAndResetIfPressed() || pad.TestStartAndResetIfPressed()) && this.nextScene === this) {
                Playnewton.APU.PlaySound("sounds/pause_resume.wav");
                this.Stop();
                this.nextScene = this.adventures[this.adventureIndex].build(this);
                this.nextScene.Start();
                break;
            }

            if (pad.TestUpAndResetIfPressed()) {
                --this.adventureIndex;
                Playnewton.APU.PlaySound("sounds/menu-select.wav");
                break;
            }
            if (pad.TestDownAndResetIfPressed()) {
                ++this.adventureIndex;
                pad.downWasNotPressed = false;
                Playnewton.APU.PlaySound("sounds/menu-select.wav");
                break;
            }
        }
        this.adventureIndex = Playnewton.FPU.wrap(0, this.adventureIndex, this.adventures.length - 1);
        this.adventures.forEach((adventure, index) => {
            Playnewton.GPU.HUD.SetLabelText(adventure.label, `${index === this.adventureIndex ? '👉' : ''}${adventure.name}`);
        });
    }
}
