import Scene from "./scene.js"
import * as Playnewton from "../playnewton.js"
import Z_ORDER from "../utils/z_order.js"
import Fadeout from "../entities/fadeout.js"
import { IngameMapKeyboardEventToPadButton } from "../utils/keyboard_mappings.js";
import { Dialog } from "../entities/dialog.js"
import Announcement from "../entities/announcement.js"
import { Squirrel, SquirrelColor, SquirrelTeam } from "../entities/squirrel.js";

/**
 * Enum for level state
 * @readonly
 * @enum {number}
 */
const TutorialLevelState = {
    START: 0,
    PLATFORM_MOVES: 1,
    END: 2,
    STOPPED: 3
};

export default class TutorialLevel extends Scene {

    /**
     * @type TutorialLevelState
     */
    state;

    /**
     * @type Fadeout
     */
    fadeout;

    /**
     * @type ImageBitmap
     */
    backgroundBitmap;

    /**
     * @type Playnewton.GPU_Label
     */
    dialogLabel;

    /**
     * @type Playnewton.GPU_Label
     */
    skipLabel;

    /**
     * @type Dialog
     */
    dialog;

    /**
     * @type SquirrelTeam
     */
    squirrelTeam;

    /**
     * @type Array<Playnewton.PPU_Body>
     */
    invisiblePlatforms = [];

    /**
     * @type Announcement
     */
    announcement;

    /**
     * @type Scene
     */
    nextSceneOnExit;

    constructor(nextScene) {
        super();
        this.nextSceneOnExit = nextScene;
    }

    async InitWorld() {
        for (let z = Z_ORDER.MIN; z <= Z_ORDER.MAX; ++z) {
            let layer = Playnewton.GPU.GetLayer(z);
            Playnewton.GPU.EnableLayer(layer);
        }

        this.backgroundBitmap = await Playnewton.DRIVE.LoadBitmap("sprites/tutorial.png");
        let backgroundPicture = Playnewton.GPU.CreatePicture(this.backgroundBitmap);

        let backgroundSprite = Playnewton.GPU.CreateSprite();
        Playnewton.GPU.SetSpritePicture(backgroundSprite, backgroundPicture);
        Playnewton.GPU.SetSpritePosition(backgroundSprite, 0, 0);
        Playnewton.GPU.EnableSprite(backgroundSprite);
    }

    async InitDialog() {
        this.dialog = new Dialog();

        this.dialogLabel = Playnewton.GPU.HUD.CreateLabel();
        Playnewton.GPU.HUD.SetLabelFont(this.dialogLabel, "bold 32px monospace");
        Playnewton.GPU.HUD.SetLabelAlign(this.dialogLabel, "left");
        Playnewton.GPU.HUD.SetLabelPosition(this.dialogLabel, 32, Playnewton.GPU.screenHeight - 44);
        Playnewton.GPU.HUD.SetLabelText(this.dialogLabel, "");
        Playnewton.GPU.HUD.SetLabelBackground(this.dialogLabel, 0, Playnewton.GPU.screenHeight - 88, Playnewton.GPU.screenWidth, 88, `#000000cc`);
        Playnewton.GPU.HUD.EnableLabel(this.dialogLabel);

        this.skipLabel = Playnewton.GPU.HUD.CreateLabel();
        Playnewton.GPU.HUD.SetLabelFont(this.skipLabel, "bold 12px monospace");
        Playnewton.GPU.HUD.SetLabelAlign(this.skipLabel, "right");
        Playnewton.GPU.HUD.SetLabelPosition(this.skipLabel, 1024, 564);
        Playnewton.GPU.HUD.SetLabelColor(this.skipLabel, "#eeeeee");
        Playnewton.GPU.HUD.SetLabelText(this.skipLabel, "Skip with ⌨️enter or 🎮start");
        Playnewton.GPU.HUD.EnableLabel(this.skipLabel);
    }

    async Start() {
        this.state = TutorialLevelState.START;

        this.pausable = false;
        this.fadeout = null;

        await super.Start();

        this.progress = 0;

        await this.InitWorld();
        this.progress = 10;

        await this.InitDialog();
        this.progress = 20;

        await Squirrel.Load();
        this.progress = 30;

        this.progress = 100;
    }

    Stop() {
        super.Stop();

        Squirrel.Unload();
        this.squirrelTeam = null;

        this.backgroundBitmap = null;
        this.announcement = null;
        this.invisiblePlatforms = [];
    }

    UpdateBodies() {
        switch (this.state) {
            case TutorialLevelState.START:
                Playnewton.CTRL.MapKeyboardEventToPadButton = IngameMapKeyboardEventToPadButton;
                this.announcement = new Announcement("Platform movements");
                this.announcement.Start();

                Playnewton.PPU.SetWorldBounds(80, 0, 864, 486);
                Playnewton.PPU.SetWorldGravity(0, 1);

                this.squirrelTeam = new SquirrelTeam();
                this.squirrelTeam.AddSquirrel(400, 486, SquirrelColor.BROWN);
                this.squirrelTeam.AddSquirrel(600, 486, SquirrelColor.RED);

                this.state = TutorialLevelState.PLATFORM_MOVES;
                break;
            case TutorialLevelState.PLATFORM_MOVES:
                this.dialog.Update(this.dialogLabel);
                this.squirrelTeam.UpdateBodies();
                for (let pad of Playnewton.CTRL.pads) {
                    if (pad.TestStartAndResetIfPressed()) {
                        Playnewton.APU.PlaySound("sounds/skip.wav");
                        Playnewton.APU.PlaySound("sounds/skip.wav");
                        this.announcement.Stop();
                        this.dialog.Skip();
                        this.fadeoutToNextScene();
                        this.state = TutorialLevelState.END;
                        break;
                    } else if (this.dialog.doneOrNotStarted) {
                        this.dialog.Start([
                            { color: "#8fffff", text: "Select squirrel with ␣ (space bar)" },
                            { color: "#8fffff", text: "Move with ←→ (left and right arrow keys)" },
                            { color: "#8fffff", text: "Jump with ↑ (up arrow key)" },
                            { color: "#8fffff", text: "Double jump with ↑ (up arrow key)" },
                            { color: "#8fffff", text: "Crouch with ↓ (down arrow key)" },
                        ]);
                        break;
                    }
                }
                break;
            case TutorialLevelState.END:
            case TutorialLevelState.STOPPED:
                return;
        }
    }


    fadeoutToNextScene() {
        if (!this.fadeout) {
            let layers = [];
            for (let i = Z_ORDER.MIN; i <= Z_ORDER.MAX; ++i) {
                layers.push(i);
            }
            this.fadeout = new Fadeout(1000, layers, () => {
                this.Stop();
                this.state = TutorialLevelState.STOPPED;
                this.nextScene = this.nextSceneOnExit;
                this.nextScene.Start();
            });
        }
    }

    UpdateSprites() {
        if (this.state === TutorialLevelState.STOPPED) {
            return;
        }
        if (this.fadeout) {
            this.fadeout.Update();
        }
        if (this.squirrelTeam) {
            this.squirrelTeam.UpdateSprites();
        }
        if (this.announcement) {
            this.announcement.Update();
        }
    }
}
