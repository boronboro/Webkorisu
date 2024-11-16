import * as Playnewton from "./playnewton.js"
import Title from "./scenes/title.js"

export default class WebKorisu {

    async Start() {
        Playnewton.GPU.SetVideoOutput(/** @type HTMLCanvasElement */(document.getElementById('game')));

        const title = new Title();
        let scene = title;
        scene.Start();

        let redraw = (timestamp) => {
            if (Playnewton.GPU.fpsLimiter.ShouldDraw()) {
                if (scene.ready) {
                    Playnewton.GPU.SetDrawLoadingOnly(false);
                    Playnewton.GPU.HUD.SetLoadingText("");
                    Playnewton.CTRL.Poll();
                    Playnewton.CLOCK.Update();
                    if (scene.pausable) {
                        for(let pad of Playnewton.CTRL.pads) {
                            if(pad.TestEscAndResetIfPressed()) {
                                if(Playnewton.CLOCK.paused) {
                                    scene.Stop();
                                    scene = title;
                                    scene.Start();
                                    Playnewton.CLOCK.Resume();
                                    Playnewton.GPU.HUD.SetPausedText("");
                                    requestAnimationFrame(redraw);
                                    return;
                                } else {
                                    Playnewton.APU.PlaySound("sounds/pause_resume.wav");
                                    Playnewton.CLOCK.Pause();
                                    Playnewton.GPU.HUD.SetPausedText("Paused\n\nPress ⌨️enter or 🎮start to resume.\nPress ⌨️ESC to quit.");
                                }
                            }
                            if (pad.TestStartAndResetIfPressed()) {
                                if (Playnewton.CLOCK.paused) {
                                    Playnewton.APU.PlaySound("sounds/pause_resume.wav");
                                    Playnewton.CLOCK.Resume();
                                    Playnewton.GPU.HUD.SetPausedText("");
                                    break;
                                } else {
                                    Playnewton.APU.PlaySound("sounds/pause_resume.wav");
                                    Playnewton.CLOCK.Pause();
                                    Playnewton.GPU.HUD.SetPausedText("Paused\n\nPress ⌨️enter or 🎮start to resume.\nPress ⌨️ESC to quit.");
                                    break;
                                }
                            }
                        }
                    }
                    if (!Playnewton.CLOCK.paused) {
                        scene.UpdateBodies();
                        Playnewton.PPU.Update();
                        scene.UpdateSprites();
                    }
                    Playnewton.GPU.DrawFrame();
                } else {
                    if (Playnewton.CLOCK.paused) {
                        Playnewton.CLOCK.Resume();
                    }
                    Playnewton.CLOCK.Update();
                    Playnewton.GPU.SetDrawLoadingOnly(true);
                    Playnewton.GPU.HUD.SetLoadingText(`Loading ${scene.progress}%`);
                    Playnewton.GPU.DrawFrame();
                }
                scene = scene.nextScene;
            }
            requestAnimationFrame(redraw);
        };
        requestAnimationFrame(redraw);
    }
}

async function main() {
    if('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./serviceWorker.js');
        } catch(e) {
            console.log(e);
        }
      };
      
    let game = new WebKorisu();
    game.Start();
}
main();