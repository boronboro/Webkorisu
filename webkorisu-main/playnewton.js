const PLAYNEWTON_DEFAULT_SCREEN_WIDTH = 1024;
const PLAYNEWTON_DEFAULT_SCREEN_HEIGHT = 576;

export class CLOCK_Timer {
    /**
     * @type DOMHighResTimeStamp
     */
    duration = 1000;

    /**
     * @type DOMHighResTimeStamp
     */
    endTime = -1;

    /**
     * @type boolean
     */
    get elapsed() {
        return CLOCK.now > this.endTime;
    }

    /**
     * @param {DOMHighResTimeStamp} duration 
     */
    constructor(duration) {
        this.duration = duration;
    }

    Start() {
        this.endTime = CLOCK.now + this.duration;
    }

    Stop() {
        this.endTime = -1;
    }
}

export class Playnewton_CLOCK {

    /**
     * @type DOMHighResTimeStamp
     */
    _pauseTime = null;

    /**
     * @type DOMHighResTimeStamp
     */
    _totalPausesDuration = 0;

    /**
     * @type DOMHighResTimeStamp
     */
    now = performance.now();

    Update() {
        if (!this.paused) {
            this.now = performance.now() - this._totalPausesDuration;
        }
    }

    Pause() {
        if (!this._pauseTime) {
            this._pauseTime = performance.now();
        }
    }

    Resume() {
        if (this._pauseTime) {
            let now = performance.now();
            this._totalPausesDuration += now - this._pauseTime;
            this.now = now - this._totalPausesDuration;
            this._pauseTime = null;
        }
    }

    get paused() {
        return !!this._pauseTime;
    }

}

/**
 * Frame description for CreateSpriteset()
 * @type GPU_SpritesetFrameDescription
 */
class GPU_SpritesetFrameDescription {
    name;
    x;
    y;
    w;
    h;
}

/**
 * 
 * @type GPU_SpritePicture
 */
export class GPU_SpritePicture {

    /**
     * 
     * @type String
     */
    name;
    /**
     * 
     * @type ImageBitmap
     */
    bitmap;
    /**
     * 
     * @type number
     */
    x;
    /**
     * 
     * @type number
     */
    y;
    /**
     * 
     * @type number
     */
    w;
    /**
     * 
     * @type number
     */
    h;
}

/**
 * 
 * @type GPU_Spriteset
 */
class GPU_Spriteset {
    /**
     * 
     * @type GPU_SpritePicture[]
     */
    pictures = [];
}

/**
 * 
 * @type GPU_Sprite
 */
export class GPU_Sprite {

    /**
     * 
     * @type number
     */
    x;

    /**
     * 
     * @type number
     */
    y;
    /**
     * Z order (greater z order is always in front of than lower)
     * Math.floor(z) gives the layer index
     * @type number
     */
    z = 0;
    /**
     * 
     * @type GPU_SpritePicture
     */
    picture;

    /**
     * 
     * @type number
     */
    scale = 1;

    /**
     * 
     * @type number
     */
    angle = 0;

    /**
     * 
     * @type boolean
     */
    enabled = false;

    /**
     * 
     * @type boolean
     */
    visible = true;

    /**
     * 
     * @type GPU_SpriteAnimation
     */
    animation;
    /**
     * 
     * @type GPU_AnimationMode
     */
    animationMode;
    /**
     * 
     * @type GPU_AnimationState
     */
    animationState;

    /**
     * 
     * @type number
     */
    animationCurrentFrameIndex;

    /**
     * 
     * @type number
     */
    animationCurrentTime;

    /**
     * 
     * @returns {boolean}
     */
    get animationStopped() {
        return this.animationState === GPU_AnimationState.STOPPED;
    }

    /**
     * 
     * @type number
     */
    lastBlinkTime = 0;

    /**
     * 
     * @type number
     */
    blinkUntilTime = 0;

    /**
     * 
     * @returns {number}
     */
    get width() {
        return this.picture.w;
    }
    /**
     * 
     * @returns {number}
     */
    get height() {
        return this.picture.h;
    }

    get left() {
        return this.x;
    }
    get top() {
        return this.y;
    }

    get right() {
        return this.left + this.width;
    }
    get bottom() {
        return this.top + this.height;
    }

    /**
     * 
     * @returns {number}
     */
    get centerX() {
        return (this.left + this.right) / 2;
    }

    /**
     * @param {number} x
     */
    set centerX(x) {
        this.x = x - this.width / 2;
    }

    /**
     * @param {number} y
     */
    set centerY(y) {
        this.y = y - this.height / 2;
    }

    /**
     * 
     * @returns {number}
     */
    get centerY() {
        return (this.top + this.bottom) / 2;
    }
}

/**
 * 
 * @type GPU_SpriteAnimationFrameDescription
 */
class GPU_SpriteAnimationFrameDescription {
    /**
     * Picture name in spriteset
     * @type string
     */
    name;
    /**
     * Delay in ms
     * @type number
     */
    delay;
}

/**
 * 
 * @type GPU_SpriteAnimationFrame
 */
class GPU_SpriteAnimationFrame {
    /**
     * 
     * @type GPU_SpritePicture
     */
    picture;
    /**
     * End of frame time
     * @type number
     */
    endTime;
}

/**
 * 
 * @type GPU_SpriteAnimation
 */
export class GPU_SpriteAnimation {

    /**
     * 
     * @type GPU_SpriteAnimationFrame[]
     */
    frames = [];
    /**
     * Sum of frame delays
     * @type number
     */
    totalDuration;

    /**
     * @type number
     */
    get maxWidth() {
        let width = 0;
        for (let frame of this.frames) {
            if (width < frame.picture.w) {
                width = frame.picture.w;
            }
        }
        return width;
    }
}

/**
 * Enum for animation play mode.
 * @readonly
 * @enum {number}
 */
export const GPU_AnimationMode = {
    ONCE: 1,
    LOOP: 2
};
/**
 * @readonly
 * @enum {number}
 */
const GPU_AnimationState = {
    STARTED: 1,
    STOPPED: 2
};

/**
 * Use this with requestAnimationFrame to limit frame per second
 * @type GPU_FpsLimiter
 */
class GPU_FpsLimiter {
    fps;
    now;
    then;
    interval;
    delta;
    constructor(fps = 60) {
        this.fps = fps;
        this.then = performance.now();
        this.interval = 1000 / fps;
    }

    /**
     * 
     * @returns {boolean}
     */
    ShouldDraw() {
        this.now = performance.now();
        this.delta = this.now - this.then;
        if (this.delta > this.interval) {
            this.then = this.now - (this.delta % this.interval);
            return true;
        }
        return false;
    }
}

export class CTRL_Gamepad {
    /**
     * 
     * @type name
     */
    name;
    /**
     * Is the up button being pressed?
     * @type boolean
     */
    up = false;

    /**
     * True if the up button was NOT pressed once since last reset
     * @type boolean
     */
    upWasNotPressed = false;

    TestUpAndResetIfPressed() {
        if (this.upWasNotPressed && this.up) {
            this.upWasNotPressed = false;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Is the down button being pressed?
     * @type boolean
     */
    down = false;

    /**
     * True if the down button was NOT pressed once since last reset
     * @type boolean
     */
    downWasNotPressed = false;

    TestDownAndResetIfPressed() {
        if (this.downWasNotPressed && this.down) {
            this.downWasNotPressed = false;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Is the left button being pressed?
     * @type boolean
     */
    left = false;

    /**
     * True if the left button was NOT pressed once since last reset
     * @type boolean
     */
    leftWasNotPressed = false;

    TestLeftAndResetIfPressed() {
        if (this.leftWasNotPressed && this.left) {
            this.leftWasNotPressed = false;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Is the right button being pressed?
     * @type boolean
     */
    right = false;

    /**
     * True if the up button was NOT pressed once since last reset
     * @type boolean
     */
    rightWasNotPressed = false;

    TestRightAndResetIfPressed() {
        if (this.rightWasNotPressed && this.right) {
            this.rightWasNotPressed = false;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Is the bottom button in the right button cluster being pressed?
     * @type boolean
     */
    A = false;

    /**
     * True if the A button was NOT pressed once since last reset
     * @type boolean
     */
    AWasNotPressed = false;

    TestAAndResetIfPressed() {
        if (this.AWasNotPressed && this.A) {
            this.AWasNotPressed = false;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Is the right button in the right button cluster being pressed?
     * @type boolean
     */
    B = false;

    /**
     * True if the B button was NOT pressed once since last reset
     * @type boolean
     */
    BWasNotPressed = false;

    TestBAndResetIfPressed() {
        if (this.BWasNotPressed && this.B) {
            this.BWasNotPressed = false;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Is the reste button being pressed?
     * @type boolean
     */
    esc = false;

    /**
     * True if the esc button was NOT pressed once since last reset
     * @type boolean
     */
    escWasNotPressed = false;

    TestEscAndResetIfPressed() {
        if (this.escWasNotPressed && this.esc) {
            this.escWasNotPressed = false;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Is the start button being pressed?
     * @type boolean
     */
    start = false;

    /**
     * True if the start button was NOT pressed once since last reset
     * @type boolean
     */
    startWasNotPressed = false;

    TestStartAndResetIfPressed() {
        if (this.startWasNotPressed && this.start) {
            this.startWasNotPressed = false;
            return true;
        } else {
            return false;
        }
    }

    _ResetWasNotPressed() {
        this.upWasNotPressed = false;
        this.downWasNotPressed = false;
        this.leftWasNotPressed = false;
        this.rightWasNotPressed = false;
        this.AWasNotPressed = false;
        this.BWasNotPressed = false;
        this.startWasNotPressed = false;
        this.escWasNotPressed = false;
    }

    _ResetStates() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.A = false;
        this.B = false;
        this.start = false;
        this.esc = false;
    }

    _UpdateWasNotPressed() {
        if (!this.up) {
            this.upWasNotPressed = true;
        }
        if (!this.down) {
            this.downWasNotPressed = true;
        }
        if (!this.left) {
            this.leftWasNotPressed = true;
        }
        if (!this.right) {
            this.rightWasNotPressed = true;
        }
        if (!this.A) {
            this.AWasNotPressed = true;
        }
        if (!this.B) {
            this.BWasNotPressed = true;
        }
        if (!this.start) {
            this.startWasNotPressed = true;
        }
        if (!this.esc) {
            this.escWasNotPressed = true;
        }
    }
}

class Playnewton_CTRL_VirtualPadButton {
    /**
     * @type number
     */
    x;

    /**
     * @type number
     */
    y;

    /**
     * @type number
     */
    radius;

    /**
     * @type string
     */
    label;

    /**
     * @type string
     */
    mapping;

    /**
     * @type boolean
     */
    pressed = false;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius
     * @param {string} label
     * @param {string} mapping
     */
    constructor(x, y, radius, label, mapping) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.label = label;
        this.mapping = mapping;
    }
}

export class Playnewton_CTRL {

    /**
     * @type TouchList
     */
    touches;

    /**
     * @type Array<Playnewton_CTRL_VirtualPadButton>
     */
    virtualPadButtons = [
        new Playnewton_CTRL_VirtualPadButton(64 + 64 + 8, 576 - 64 - 64 - 64 - 8, 64, "^", "up"),
        new Playnewton_CTRL_VirtualPadButton(64 + 64 + 8, 576 - 64 - 8, 64, "v", "down"),
        new Playnewton_CTRL_VirtualPadButton(64 + 8, 576 - 64 - 64 - 8, 64, "<", "left"),
        new Playnewton_CTRL_VirtualPadButton(64 + 64 + 64 + 8, 576 - 64 - 64 - 8, 64, ">", "right"),
        new Playnewton_CTRL_VirtualPadButton(1024 - 64 - 64 - 8, 576 - 64 - 64 - 64 - 8, 64, "A", "A"),
        new Playnewton_CTRL_VirtualPadButton(1024 - 64 - 64 - 8, 64 + 8, 64, "start", "start")
    ];

    /**
     * 
     * @type CTRL_Gamepad
     */
    pointerVirtualPad;

    /**
     * 
     * @type CTRL_Gamepad
     */
    keyboardVirtualPad;

    /**
     * @type DOMHighResTimeStamp
     */
    lastVirtualPadLastUsageTime = -Infinity;

    /**
     * 
     * @type CTRL_Gamepad[]
     */
    pads;

    /**
     * 
     * @param {number} maxPlayer Max number of players for the game
     */
    constructor(maxPlayer = 1) {
        this.pointerVirtualPad = new CTRL_Gamepad();
        this.keyboardVirtualPad = new CTRL_Gamepad();
        this.pads = [];
        for (let i = 0; i < maxPlayer; ++i) {
            this.pads[i] = new CTRL_Gamepad();
        }

        document.addEventListener("keydown", (event) => {
            if (this.MapKeyboardEventToPadButton(this.keyboardVirtualPad, event, true)) {
                event.preventDefault();
            }
        });
        document.addEventListener("keyup", (event) => {
            if (this.MapKeyboardEventToPadButton(this.keyboardVirtualPad, event, false)) {
                event.preventDefault();
            }
            if (event.code === "F1") {
                PPU.debugDrawEnabled = !PPU.debugDrawEnabled;
            }
        });

        document.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        });
        let handleTouchEvent = (event) => {
            event.preventDefault();
            this.lastVirtualPadLastUsageTime = GPU.fpsLimiter.now;
            this.MapTouchEventToPadButton(this.pointerVirtualPad, event);

        };
        document.addEventListener("touchstart", handleTouchEvent);
        document.addEventListener("touchend", handleTouchEvent);
        document.addEventListener("touchcancel", handleTouchEvent);
        document.addEventListener("touchmove", handleTouchEvent);
    }

    /**
     * @param {CTRL_Gamepad} pad
     * @param {TouchEvent} event
     */
    MapTouchEventToPadButton(pad, event) {
        let rect = GPU.canvas.getBoundingClientRect();
        let scaleX = GPU.canvas.width / rect.width;
        let scaleY = GPU.canvas.height / rect.height;
        for (let button of CTRL.virtualPadButtons) {
            pad[button.mapping] = false;
            button.pressed = false;
            for (let touche of event.touches) {
                let x = (touche.pageX - rect.left) * scaleX;
                let y = (touche.pageY - rect.top) * scaleY;
                let dx = x - button.x;
                let dy = y - button.y;
                let distance = Math.sqrt(dx ** 2 + dy ** 2);
                if (distance < button.radius) {
                    pad[button.mapping] = true;
                    button.pressed = true;
                    break;
                }
            }
        }
    }

    /**
     * @param {CTRL_Gamepad} pad
     * @param {KeyboardEvent} event
     * @param {boolean} down
     * @returns boolean
     */
    MapKeyboardEventToPadButton(pad, event, down) {
        switch (event.code) {
            case "ArrowUp":
                pad.up = down;
                return true;
            case "ArrowDown":
                pad.down = down;
                return true;
            case "ArrowLeft":
                pad.left = down;
                return true;
            case "ArrowRight":
                pad.right = down;
                return true;
            case "KeyZ":
                pad.A = down;
                return true;
            case "KeyX":
                pad.B = down;
                return true;
            case "Enter":
                pad.start = down;
                return true;
            case "Escape":
                pad.esc = down;
                return true;
            default:
                return false;
        }
    }

    Poll() {
        let p = 0;
        this._ResetPadsStates();
        for (let webpad of navigator.getGamepads()) {
            if (p >= this.pads.length) {
                break;
            }
            if (webpad) {
                let pad = this.pads[p];
                let nbButtons = webpad.buttons.length;
                switch (webpad.mapping) {
                    case "standard":
                        if (nbButtons >= 16) {
                            pad.up = webpad.buttons[12].pressed;
                            pad.down = webpad.buttons[13].pressed;
                            pad.left = webpad.buttons[14].pressed;
                            pad.right = webpad.buttons[15].pressed;
                        } else if (webpad.axes.length >= 2) {
                            pad.up = webpad.axes[1] < -0.2;
                            pad.down = webpad.axes[1] > 0.2;
                            pad.left = webpad.axes[0] < -0.2;
                            pad.right = webpad.axes[0] > 0.2;
                        }
                        if (nbButtons >= 1) {
                            pad.A = webpad.buttons[0].pressed;
                        }
                        if (nbButtons >= 2) {
                            pad.B = webpad.buttons[1].pressed;
                        }
                        if (nbButtons >= 10) {
                            pad.start = webpad.buttons[9].pressed;
                        }
                        break;
                    default:
                        if (webpad.axes.length >= 2) {
                            pad.up = webpad.axes[1] < -0.2;
                            pad.down = webpad.axes[1] > 0.2;
                            pad.left = webpad.axes[0] < -0.2;
                            pad.right = webpad.axes[0] > 0.2;
                        }
                        if (webpad.buttons.length >= 1) {
                            pad.A = webpad.buttons[0].pressed;
                        }
                        if (nbButtons >= 2) {
                            pad.B = webpad.buttons[1].pressed;
                        }
                        if (nbButtons >= 3) {
                            pad.start = webpad.buttons[2].pressed;
                        }
                        break;
                }

                ++p;
            }
        }

        if (this.pads.length === 1) {
            //use keyboard as an alternative pad when there is only one player
            this._MergePadsStates(this.pads[0], this.keyboardVirtualPad);
            //use pointer as an alternative pad when there is only one player
            this._MergePadsStates(this.pads[0], this.pointerVirtualPad);
        } else if (p < this.pads.length) {
            //use keyboard as a pad when there is less pads than players
            this._MergePadsStates(this.pads[p], this.keyboardVirtualPad);
        }

        for (let pad of this.pads) {
            pad._UpdateWasNotPressed();
        }
    }

    /**
     * 
     * @param {number} player Player index
     * @returns {CTRL_Gamepad}
     */
    GetPad(player) {
        return this.pads[player];
    }

    /**
     * @returns {CTRL_Gamepad}
     */
    GetMasterPad() {
        return this.pads[0];
    }

    Reset() {
        for (let pad of this.pads) {
            pad._ResetWasNotPressed();
        }
    }

    _ResetPadsStates() {
        for (let pad of this.pads) {
            pad._ResetStates();
        }
    }

    /**
     * 
     * @param {CTRL_Gamepad} dest
     * @param {CTRL_Gamepad} src
     */
    _MergePadsStates(dest, src) {
        dest.up = dest.up || src.up;
        dest.down = dest.down || src.down;
        dest.left = dest.left || src.left;
        dest.right = dest.right || src.right;
        dest.A = dest.A || src.A;
        dest.B = dest.B || src.B;
        dest.start = dest.start || src.start;
        dest.esc = dest.esc || src.esc;
    }
}

// Bits on the far end of the 32-bit global tile ID are used for tile flags
const TMX_FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const TMX_FLIPPED_VERTICALLY_FLAG = 0x40000000;
const TMX_FLIPPED_DIAGONALLY_FLAG = 0x20000000;

class TMX_TileAnimationFrame {
    /**
     * 
     * @type number Local ID of a tile within the parent tileset
     */
    tileid;

    /**
     * How long (in milliseconds) this frame should be displayed before advancing to the next frame
     * @type number
     */
    duration;
}

class TMX_TileAnimation {
    /**
     * 
     * @type TMX_TileAnimationFrame[]
     */
    frames = [];
}

class TMX_Tile {
    /**
     * Local tile ID within its tileset.
     * @type number
     */
    id;

    /**
     * The type of the tile. Refers to an object type and is used by tile objects.
     * @type string
     */
    type;

    /**
     * 
     * @type ImageBitmap
     */
    bitmap;

    /**
     * X coordinate in source bitmap
     * @type number
     */
    sx;

    /**
     * Y coordinate in source bitmap
     * @type number
     */
    sy;

    /**
     * Tile width
     * @type number
     */
    w;

    /**
     * Tile height
     * @type number
     */
    h;

    /**
     * 
     * @type TMX_TileAnimation
     */
    animation;

    properties = new Map();
}

class TMX_Tileset {

    /**
     * The first global tile ID of this tileset (this global ID maps to the first tile in this tileset)
     * @type number
     */
    firstgid;

    /**
     * @type string
     */
    name;
    /**
     * Width of a tile
     * @type number
     */
    tileWidth;
    /**
     * Height of a tile
     * @type number
     */
    tileHeight;
    /**
     * Spacing in pixels between the tiles in this tileset (applies to the tileset image)
     * @type number
     */
    spacing;
    /**
     * Margin around the tiles in this tileset (applies to the tileset image)
     * @type number
     */
    margin;

    /**
     * 
     * @type ImageBitmap
     */
    bitmap;

    /**
     * 
     * @type Map<number, TMX_Tile>
     */
    tiles = new Map();

    properties = new Map();
}

class TMX_Chunk {
    /**
     * X coordinate of the chunk in tiles.
     * @type number
     */
    x;
    /**
     * Y coordinate of the chunk in tiles.
     * @type number
     */
    y;
    /**
     * Width of the chunk in tiles.
     * @type number
     */
    width;
    /**
     * Height: The height of the chunk in tiles.
     * @type number
     */
    height;

    /**
     * 
     * @type TMX_Tile[][]
     */
    tiles
}

/**
 * 
 * @type TMX_Layer
 */
class TMX_Layer {

    /**
     * Name of the layer
     * @type string
     */
    name;

    /**
     * The x coordinate of the layer in tiles
     * @type number
     */
    x;

    /**
     * The y coordinate of the layer in tiles
     * @type number
     */
    y;

    /**
     * The z order to sort layers and object groups
     * @type number
     */
    z;

    /**
     * Horizontal parallax factor
     * @type number
     */
    parallaxX;

    /**
     * Vertical parallax factor
     * @type number
     */
    parallaxY;

    /**
     * Width of the layer in tiles
     * @type number
     */
    width;
    /**
     * Height of the layer in tiles
     * @type number
     */
    height; //The h. Always the same as the map height for fixed-size maps.

    /**
     * 
     * @type TMX_Chunk[]
     */
    chunks = [];

    /**
     * @type number
     */
    opacity = 1;
}


/**
 * 
 * @type TMX_Object
 */
export class TMX_Object {
    /**
     * Name of the object
     * @type string
     */
    name;

    /**
     * The x coordinate of the object in pixels
     * @type number
     */
    x;
    /**
     * The y coordinate of object in pixels
     * @type number
     */
    y;

    /**
     * The z order to sort layers and object groups
     * @type number
     */
    z;

    /**
     * Width of the object
     * @type number
     */
    width;
    /**
     * Height of the object
     * @type number
     */
    height;

    /**
     * @type Map
     */
    properties;

    /**
     * @type Array<PPU_Point>
     */
    polygonPoints;

    /**
     * @type Array<PPU_Point>
     */
    polylinePoints;

    /**
     * 
     * @type TMX_Tile
     */
    tile;

    /**
     * @type string
     */
    _type;

    /**
     * @param {string} type
     */
    set type(type) {
        this._type = type;
    }

    /**
     * @returns string
     */
    get type() {
        return this._type || (this.tile && this.tile.type);
    }
}

/**
 * 
 * @type TMX_ObjectGroup
 */
export class TMX_ObjectGroup {

    /**
     * Name of the object group
     * @type string
     */
    name;

    /**
     * Color of the object group
     * @type string
     */
    color;

    /**
     * The x coordinate of the object group in tiles
     * @type number
     */
    x;
    /**
     * The y coordinate of the object group in tiles
     * @type number
     */
    y;

    /**
     * The z order to sort layers and object groups
     * @type number
     */
    z;

    /**
     * Horizontal parallax factor
     * @type number
     */
    parallaxX;

    /**
     * Vertical parallax factor
     * @type number
     */
    parallaxY;

    /**
     * @type Map
     */
    properties;

    /**
     * Object list
     * @type TMX_Object[]
     */
    objects = [];

    /**
     * @type number
     */
    opacity = 1;
}

export class TMX_Map {

    /**
     * Map width in tiles
     * @type number
     */
    width;
    /**
     * Map height in tiles
     * @type number
     */
    height;
    /**
     * Width of a tile
     * @type number
     */
    tileWidth;
    /**
     * Height of a tile
     * @type number
     */
    tileHeight;
    /**
     * 
     * @type TMX_Tileset[]
     */
    tilesets = [];

    /**
     * 
     * @type TMX_Layer[]
     */
    layers = [];

    /**
     * @type TMX_ObjectGroup[]
     */
    objectgroups = [];

    properties = new Map();
}

class Playnewton_DRIVE {

    /**
     * @type Map<string,ImageBitmap>
     */
    bitmaps = new Map();

    Reset() {
        for (let bitmap of this.bitmaps.values()) {
            bitmap.close();
        }
        this.bitmaps.clear();
    }

    /**
     * Loads an image
     * @param {string} imageURL url for png/jpg files
     * @return ImageBitmap
     * 
     */
    async LoadBitmap(imageURL) {
        let bitmap = this.bitmaps.get(imageURL);
        if (bitmap) {
            return bitmap;
        }
        bitmap = await createImageBitmap(await (await fetch(imageURL)).blob());
        this.bitmaps.set(imageURL, bitmap);
        return bitmap;
    }

    /**
     * Load a [Tiled](https://www.mapeditor.org/) map
     * @param {string} tmxUrl
     * @returns {Promise<TMX_Map>}
     */
    async LoadTmxMap(tmxUrl) {
        let map = new TMX_Map();
        let parser = new DOMParser();
        let tmx = await (await fetch(tmxUrl)).text();
        let doc = parser.parseFromString(tmx, "application/xml");
        let mapElement = doc.getElementsByTagName("map")[0];
        map.properties = this._LoadTmxProperties(mapElement);
        map.width = parseInt(mapElement.getAttribute("width"), 10);
        map.height = parseInt(mapElement.getAttribute("height"), 10);
        map.tileWidth = parseInt(mapElement.getAttribute("tilewidth"), 10);
        map.tileHeight = parseInt(mapElement.getAttribute("tileheight"), 10);

        let baseUrl = tmxUrl.slice(0, tmxUrl.lastIndexOf("/") + 1);
        for (let tilesetElement of doc.getElementsByTagName("tileset")) {
            let source = tilesetElement.getAttribute("source");
            let tileset;
            if (source) {
                tileset = await this.LoadTileset(baseUrl + source);
            } else {
                tileset = await this._LoadTilesetElement(tilesetElement, baseUrl);
            }
            tileset.firstgid = parseInt(tilesetElement.getAttribute("firstgid"), 10);
            map.tilesets.push(tileset);
        }

        let z = 0;
        for (let layerOrObjectGroupElement of doc.querySelectorAll("layer,objectgroup")) {
            switch (layerOrObjectGroupElement.tagName) {
                case "layer":
                    let layerElement = layerOrObjectGroupElement;
                    let layer = new TMX_Layer();
                    layer.name = layerElement.getAttribute("name");
                    layer.x = parseInt(layerElement.getAttribute("x"), 10) || 0;
                    layer.y = parseInt(layerElement.getAttribute("y"), 10) || 0;
                    layer.parallaxX = parseFloat(layerElement.getAttribute("parallaxx")) || 1;
                    layer.parallaxY = parseFloat(layerElement.getAttribute("parallaxy")) || 1;
                    layer.z = z;
                    layer.opacity = parseFloat(layerElement.getAttribute("opacity")) || 1;
                    ++z;
                    layer.width = parseInt(layerElement.getAttribute("width"), 10);
                    layer.height = parseInt(layerElement.getAttribute("height"), 10);

                    let dataElement = layerElement.getElementsByTagName("data")[0];
                    if (dataElement) {
                        let encoding = dataElement.getAttribute("encoding");
                        let compression = dataElement.getAttribute("compression");
                        let chunkElements = dataElement.getElementsByTagName("chunk");
                        if (chunkElements.length > 0) {
                            for (let chunkElement of chunkElements) {
                                layer.chunks.push(this._LoadChunkElement(map, chunkElement, encoding, compression));
                            }
                        } else {
                            layer.chunks.push(this._LoadChunkElement(map, dataElement, encoding, compression));
                        }

                    }
                    map.layers.push(layer);
                    break;
                case "objectgroup":
                    let objectgroupElement = layerOrObjectGroupElement;
                    let objectGroup = new TMX_ObjectGroup();
                    objectGroup.name = objectgroupElement.getAttribute("name");
                    objectGroup.color = objectgroupElement.getAttribute("color");
                    objectGroup.x = parseInt(objectgroupElement.getAttribute("x"), 10) || 0;
                    objectGroup.y = parseInt(objectgroupElement.getAttribute("y"), 10) || 0;
                    objectGroup.parallaxX = parseFloat(objectgroupElement.getAttribute("parallaxx")) || 1;
                    objectGroup.parallaxY = parseFloat(objectgroupElement.getAttribute("parallaxy")) || 1;
                    objectGroup.z = z;
                    objectGroup.opacity = parseFloat(objectgroupElement.getAttribute("opacity")) || 1;
                    ++z;
                    objectGroup.properties = this._LoadTmxProperties(objectgroupElement);
                    for (let objectElement of objectgroupElement.getElementsByTagName("object")) {
                        let object = new TMX_Object();
                        object.name = objectElement.getAttribute("name");
                        object.type = objectElement.getAttribute("class") || objectElement.getAttribute("type");
                        object.x = parseInt(objectElement.getAttribute("x"), 10) || 0;
                        object.y = parseInt(objectElement.getAttribute("y"), 10) || 0;
                        object.width = parseInt(objectElement.getAttribute("width"), 10);
                        object.height = parseInt(objectElement.getAttribute("height"), 10);
                        let global_tile_id = parseInt(objectElement.getAttribute("gid"), 10);
                        if (global_tile_id) {
                            //TODO Read out the flags
                            //let flipped_horizontally = (global_tile_id & TMX_FLIPPED_HORIZONTALLY_FLAG);
                            //let flipped_vertically = (global_tile_id & TMX_FLIPPED_VERTICALLY_FLAG);
                            //let flipped_diagonally = (global_tile_id & TMX_FLIPPED_DIAGONALLY_FLAG);

                            // Clear the flags
                            global_tile_id &= ~(TMX_FLIPPED_HORIZONTALLY_FLAG | TMX_FLIPPED_VERTICALLY_FLAG | TMX_FLIPPED_DIAGONALLY_FLAG);

                            // Resolve the tile
                            for (let i = map.tilesets.length - 1; i >= 0; --i) {
                                let tileset = map.tilesets[i];

                                if (tileset.firstgid <= global_tile_id) {
                                    object.tile = tileset.tiles.get(global_tile_id - tileset.firstgid);
                                    break;
                                }
                            }
                        }
                        object.properties = this._LoadTmxProperties(objectElement);
                        object.polygonPoints = this._LoadPolyPoints("polygon", object, objectElement);
                        object.polylinePoints = this._LoadPolyPoints("polyline", object, objectElement);
                        objectGroup.objects.push(object);
                    }
                    map.objectgroups.push(objectGroup);
                    break
            }
        }
        return map;
    }


    /**
     * @param {string} tagName
     * @param {TMX_Object} object
     * @param {Element} objectElement
     * @returns {Array<PPU_Point>}
     */
    _LoadPolyPoints(tagName, object, objectElement) {
        /**
         * @type Element
         */
        let polygonElement = objectElement.getElementsByTagName(tagName)[0];
        if (!polygonElement) {
            return null;
        }
        let points = polygonElement.getAttribute("points");
        if (!points) {
            return null;
        }
        return points.split(" ").map((str) => {
            let xy = str.split(",");
            let x = parseInt(xy[0], 10) || 0;
            let y = parseInt(xy[1], 10) || 0;
            return new PPU_Point(object.x + x, object.y + y);
        });
    }

    /**
     * Convert map tiles to GPU sprites
     * @param {Playnewton_GPU} GPU
     * @param {TMX_Map} map
     * @param {number} mapX
     * @param {number} mapY
     * @param {number} mapZ
     */
    ConvertTmxMapToGPUSprites(GPU, map, mapX = 0, mapY = 0, mapZ = 0) {
        /**
         * @type Map<TMX_Tile, GPU_SpritePicture>
         */
        let picturesByTile = new Map();
        /**
         * @type Map<TMX_Tile, GPU_SpriteAnimation>
         */
        let animationsByTile = new Map();
        for (let tileset of map.tilesets) {
            for (let tile of tileset.tiles.values()) {
                if (!tile.animation && tile.bitmap) {
                    let picture = GPU.CreatePicture(tile.bitmap, tile.sx, tile.sy, tile.w, tile.h);
                    picturesByTile.set(tile, picture);
                }
            }
            for (let tile of tileset.tiles.values()) {
                if (tile.animation) {
                    let animation = new GPU_SpriteAnimation();
                    let time = 0;
                    for (let tileFrame of tile.animation.frames) {
                        let frame = new GPU_SpriteAnimationFrame();
                        frame.picture = picturesByTile.get(tileset.tiles.get(tileFrame.tileid));
                        time += tileFrame.duration;
                        frame.endTime = time;
                        animation.frames.push(frame);
                    }
                    animation.totalDuration = time;
                    animationsByTile.set(tile, animation);
                }
            }
        }
        for (let layer of map.layers) {
            GPU.SetLayerOpacity(GPU.GetLayer(mapZ + layer.z), layer.opacity);
            GPU.SetLayerParallax(GPU.GetLayer(mapZ + layer.z), layer.parallaxX, layer.parallaxY);
            for (let chunk of layer.chunks) {
                for (let y = 0; y < chunk.height; ++y) {
                    for (let x = 0; x < chunk.width; ++x) {
                        let tile = chunk.tiles[y][x];
                        if (tile && !tile.type) {
                            let picture = picturesByTile.get(tile);
                            let animation = animationsByTile.get(tile);
                            let sprite = GPU.CreateSprite();
                            if (picture || animation) {
                                if (picture) {
                                    picture = GPU.CreatePicture(tile.bitmap, tile.sx, tile.sy, tile.w, tile.h);
                                    GPU.SetSpritePicture(sprite, picture);
                                }
                                if (animation) {
                                    GPU.SetSpriteAnimation(sprite, animation);
                                }
                                GPU.SetSpritePosition(sprite, mapX + (layer.x + chunk.x + x) * map.tileWidth, mapY + (layer.y + chunk.y + y) * map.tileHeight);
                                GPU.SetSpriteZ(sprite, mapZ + layer.z);
                                GPU.EnableSprite(sprite);
                            }
                        }
                    }
                }
            }
        }
        for (let objectgroup of map.objectgroups) {
            GPU.SetLayerOpacity(GPU.GetLayer(mapZ + objectgroup.z), objectgroup.opacity);
            GPU.SetLayerParallax(GPU.GetLayer(mapZ + objectgroup.z), objectgroup.parallaxX, objectgroup.parallaxY);
            for (let object of objectgroup.objects) {
                let tile = object.tile;
                if (tile && !object.type) {
                    let picture = picturesByTile.get(tile);
                    let animation = animationsByTile.get(tile);
                    let sprite = GPU.CreateSprite();
                    if (picture || animation) {
                        if (picture) {
                            picture = GPU.CreatePicture(tile.bitmap, tile.sx, tile.sy, tile.w, tile.h);
                            GPU.SetSpritePicture(sprite, picture);
                        }
                        if (animation) {
                            GPU.SetSpriteAnimation(sprite, animation);
                        }
                        GPU.SetSpritePosition(sprite, mapX + objectgroup.x + object.x, mapY + objectgroup.y + object.y - object.height);
                        GPU.SetSpriteZ(sprite, mapZ + objectgroup.z);
                        GPU.EnableSprite(sprite);
                    }
                }
            }
        }
    }

    /**
     * Convert map tiles to GPU sprites
     * @param {Playnewton_PPU} PPU
     * @param {TMX_Map} map
     * @param {number} mapX
     * @param {number} mapY
     */
    ConvertTmxMapToPPUBodies(PPU, map, mapX = 0, mapY = 0) {
        for (let objectgroup of map.objectgroups) {
            let groupX = mapX + objectgroup.x * map.tileWidth;
            let groupY = mapY + objectgroup.y * map.tileWidth;
            for (let object of objectgroup.objects) {
                if (!object.type) {
                    let immovable = this._ParseBooleanProperty("immovable", object.properties, objectgroup.properties)
                    if (immovable) {
                        let body = PPU.CreateBody();
                        body.debugColor = objectgroup.color;
                        body.tag = this._ParseStringProperty('tag', object.properties, objectgroup.properties);
                        PPU.SetBodyPosition(body, groupX + object.x, groupY + object.y);
                        PPU.SetBodyRectangle(body, 0, 0, object.width, object.height);
                        PPU.SetBodyImmovable(body, true);
                        let passable = new PPU_BodyPassable();
                        passable.fromBottomToTop = this._ParseBooleanProperty("passableFromBottomToTop", object.properties, objectgroup.properties);
                        passable.fromTopToBottom = this._ParseBooleanProperty("passableFromTopToBottom", object.properties, objectgroup.properties);
                        passable.fromLeftToRight = this._ParseBooleanProperty("passableFromLeftToRight", object.properties, objectgroup.properties);
                        passable.fromRightToLeft = this._ParseBooleanProperty("passableFromRightToLeft", object.properties, objectgroup.properties);
                        PPU.SetBodyPassable(body, passable);
                        PPU.EnableBody(body);
                    }
                }
            }
        }
    }

    /**
     * @callback ForeachTmxMapObjectCallback
     * @param {TMX_Object} object
     * @param {TMX_ObjectGroup} objectgroup
     * @param {number} x
     * @param {number} y
     * 
     */

    /**
     * Iterate over map objects
     * @param {ForeachTmxMapObjectCallback} callback
     * @param {TMX_Map} map
     * @param {number} mapX
     * @param {number} mapY
     */
    ForeachTmxMapObject(callback, map, mapX = 0, mapY = 0) {
        for (let objectgroup of map.objectgroups) {
            let groupX = mapX + objectgroup.x * map.tileWidth;
            let groupY = mapY + objectgroup.y * map.tileWidth;
            for (let object of objectgroup.objects) {
                callback(object, objectgroup, groupX + object.x, groupY + object.y);
            }
        }
    }

    /**
     * Find first object of specified type
     * @param {TMX_Map} map
     * @param {string} type
     * @returns
     */
    FindOneObject(map, type) {
        for (let objectgroup of map.objectgroups) {
            for (let object of objectgroup.objects) {
                if (object.type === type) {
                    return object;
                }
            }
        }
        return null;
    }

    async LoadTileset(tsxUrl) {
        let tsx = await (await fetch(tsxUrl)).text();
        let parser = new DOMParser();
        let tilesetElement = parser.parseFromString(tsx, "application/xml").getElementsByTagName("tileset")[0];
        let baseUrl = tsxUrl.slice(0, tsxUrl.lastIndexOf("/") + 1);
        return await this._LoadTilesetElement(tilesetElement, baseUrl);
    }

    _ParseStringProperty(name, objectProperties, groupProperties) {
        let prop = objectProperties.get(name) || groupProperties.get(name);
        return prop;
    }

    _ParseBooleanProperty(name, objectProperties, groupProperties) {
        let prop = objectProperties.get(name) || (groupProperties && groupProperties.get(name));
        return "true" === prop;
    }

    /**
     * @param {Element} tilesetElement
     * @param {string} baseUrl
     * @returns {Promise<TMX_Tileset>}
     */
    async _LoadTilesetElement(tilesetElement, baseUrl = "") {
        let tileset = new TMX_Tileset();
        tileset.name = tilesetElement.getAttribute("name");
        tileset.firstgid = parseInt(tilesetElement.getAttribute("firstgid"), 10);
        tileset.tileWidth = parseInt(tilesetElement.getAttribute("tilewidth"), 10);
        tileset.tileHeight = parseInt(tilesetElement.getAttribute("tileheight"), 10);
        tileset.spacing = parseInt(tilesetElement.getAttribute("spacing"), 10) || 0;
        tileset.margin = parseInt(tilesetElement.getAttribute("margin"), 10) || 0;
        tileset.properties = this._LoadTmxProperties(tilesetElement);
        if (!this._ParseBooleanProperty("doNotLoadBitmap", tileset.properties)) {
            tileset.bitmap = await this.LoadBitmap(baseUrl + tilesetElement.getElementsByTagName("image")[0].getAttribute("source"));
        }

        for (let tileElement of tilesetElement.getElementsByTagName("tile")) {
            let tile = new TMX_Tile();
            tile.id = parseInt(tileElement.getAttribute("id"), 10);
            tile.type = tileElement.getAttribute("class") || tileElement.getAttribute("type");
            let animationElement = tileElement.getElementsByTagName("animation")[0];
            if (animationElement) {
                tile.animation = this._LoadTileAnimation(animationElement);
            }
            let imageElement = tileElement.getElementsByTagName("image")[0];
            if (imageElement) {
                tile.bitmap = await this.LoadBitmap(baseUrl + imageElement.getAttribute("source"));
                tile.sx = parseInt(tileElement.getAttribute("x"), 10) || 0;
                tile.sy = parseInt(tileElement.getAttribute("y"), 10) || 0;
                tile.w = parseInt(tileElement.getAttribute("width"), 10) || tile.bitmap.width;
                tile.h = parseInt(tileElement.getAttribute("height"), 10) || tile.bitmap.height;
            }
            tile.properties = this._LoadTmxProperties(tileElement);
            tileset.tiles.set(tile.id, tile);
        }
        if (tileset.bitmap) {
            let maxX = tileset.bitmap.width - tileset.margin - tileset.tileHeight - tileset.spacing;
            let maxY = tileset.bitmap.height - tileset.margin - tileset.tileWidth - tileset.spacing;
            let id = 0;
            for (let y = tileset.margin; y <= maxY; y += tileset.tileHeight + tileset.spacing) {
                for (let x = tileset.margin; x <= maxX; x += tileset.tileWidth + tileset.spacing) {
                    let tile = tileset.tiles.get(id);
                    if (!tile) {
                        tile = new TMX_Tile();
                        tile.id = id;
                        tile.bitmap = tileset.bitmap;
                        tile.sx = x;
                        tile.sy = y;
                        tile.w = tileset.tileWidth;
                        tile.h = tileset.tileHeight;
                        tileset.tiles.set(id, tile);
                    }
                    ++id;
                }
            }
        }

        return tileset;
    }

    /**
     * 
     * @param {Element} animationElement
     * @returns {TMX_TileAnimation}
     */
    _LoadTileAnimation(animationElement) {
        let animation = new TMX_TileAnimation();
        for (let frameElement of animationElement.getElementsByTagName("frame")) {
            let frame = new TMX_TileAnimationFrame();
            frame.tileid = parseInt(frameElement.getAttribute("tileid"), 10);
            frame.duration = parseInt(frameElement.getAttribute("duration"), 10);
            animation.frames.push(frame);
        }
        return animation;
    }

    /**
     * 
     * @param {Element} element
     * @returns {Map}
     */
    _LoadTmxProperties(element) {
        let props = new Map();
        for (let propertyElement of element.getElementsByTagName("property")) {
            props.set(propertyElement.getAttribute("name"), propertyElement.getAttribute("value"));
        }
        return props;
    }

    /**
     * 
     * @param {TMX_Map} map
     * @param {Element} dataOrChunkElement
     * @param {string} encoding
     * @param {string} compression
     * @returns {TMX_Chunk}
     */
    _LoadChunkElement(map, dataOrChunkElement, encoding, compression) {
        let chunk = new TMX_Chunk();
        chunk.x = parseInt(dataOrChunkElement.getAttribute("x"), 10) || 0;
        chunk.y = parseInt(dataOrChunkElement.getAttribute("y"), 10) || 0;
        chunk.width = parseInt(dataOrChunkElement.getAttribute("width"), 10) || map.width;
        chunk.height = parseInt(dataOrChunkElement.getAttribute("height"), 10) || map.height;
        let data = this._DecodeChunkData(dataOrChunkElement, chunk.width * chunk.height, encoding, compression);
        this._ConvertDataToTiles(map, chunk, data);
        return chunk;
    }

    /**
     * 
     * @param {Element} dataOrChunkElement
     * @param {number} nbtiles
     * @param {string} encoding
     * @param {string} compression
     * @returns {Uint32Array}
     */
    _DecodeChunkData(dataOrChunkElement, nbtiles, encoding, compression) {
        switch (encoding) {
            case "base64":
                return this._DecodeBase64ChunkData(dataOrChunkElement, nbtiles, compression);
            case "csv":
                return this._DecodeCSVChunkData(dataOrChunkElement, nbtiles);
            default:
                return this._DecodeXMLChunkData(dataOrChunkElement, nbtiles);
        }
    }

    /**
     * 
     * @param {Element} dataOrChunkElement
     * @param {number} nbtiles
     * @param {string} compression
     * @returns {Uint32Array}
     */
    _DecodeBase64ChunkData(dataOrChunkElement, nbtiles, compression) {
        if (compression) {
            console.error("Tiled map compression is not supported");
            return new Uint32Array();
        }
        return this._DecodeBase64ToUint32Array(dataOrChunkElement.textContent, nbtiles);
    }

    /**
     * 
     * @param {string} base64Str
     * @param {number} nbtiles
     * @returns {Uint32Array}
     */
    _DecodeBase64ToUint32Array(base64Str, nbtiles) {
        let str = window.atob(base64Str);
        let data = new Uint32Array(nbtiles);
        for (let i = 0; i < str.length; i += 4) {
            data[i / 4] = (
                str.charCodeAt(i) |
                str.charCodeAt(i + 1) << 8 |
                str.charCodeAt(i + 2) << 16 |
                str.charCodeAt(i + 3) << 24
            ) >>> 0;
        }
        return data;
    }

    /**
     * 
     * @param {Element} dataOrChunkElement
     * @param {number} nbtiles
     * @returns {Uint32Array}
     */
    _DecodeCSVChunkData(dataOrChunkElement, nbtiles) {
        let data = new Uint32Array(nbtiles);
        let i = 0;
        for (let m of dataOrChunkElement.textContent.matchAll(/\d+/g)) {
            data[i++] = parseInt(m[0], 10);
        }
        return data;
    }

    /**
     * 
     * @param {Element} dataOrChunkElement
     * @param {number} nbtiles
     * @returns {Uint32Array}
     */
    _DecodeXMLChunkData(dataOrChunkElement, nbtiles) {
        let data = new Uint32Array(nbtiles);
        let tileElements = dataOrChunkElement.getElementsByTagName("tile");
        let i = 0;
        for (let tileElement of tileElements) {
            data[i++] = parseInt(tileElement.getAttribute("gid"), 10);
        }
        return data;
    }

    /**
     * 
     * @param {TMX_Map} map
     * @param {TMX_Chunk} chunk
     * @param {Uint32Array} data
     */
    _ConvertDataToTiles(map, chunk, data) {
        let tile_index = 0;

        chunk.tiles = [];

        // Here you should check that the data has the right size
        // (map_width * map_height * 4)

        for (let y = 0; y < chunk.height; ++y) {
            chunk.tiles[y] = [];
            for (let x = 0; x < chunk.width; ++x) {
                let global_tile_id = data[tile_index++];

                //TODO Read out the flags
                //let flipped_horizontally = (global_tile_id & TMX_FLIPPED_HORIZONTALLY_FLAG);
                //let flipped_vertically = (global_tile_id & TMX_FLIPPED_VERTICALLY_FLAG);
                //let flipped_diagonally = (global_tile_id & TMX_FLIPPED_DIAGONALLY_FLAG);

                // Clear the flags
                global_tile_id &= ~(TMX_FLIPPED_HORIZONTALLY_FLAG | TMX_FLIPPED_VERTICALLY_FLAG | TMX_FLIPPED_DIAGONALLY_FLAG);

                // Resolve the tile
                for (let i = map.tilesets.length - 1; i >= 0; --i) {
                    let tileset = map.tilesets[i];

                    if (tileset.firstgid <= global_tile_id) {
                        chunk.tiles[y][x] = tileset.tiles.get(global_tile_id - tileset.firstgid);
                        break;
                    }
                }
            }
        }
    }
}

/**
 * 
 * @type GPU_Layer
 */
export class GPU_Layer {
    /**
     * 
     * @type number
     */
    x = 0;
    /**
     * 
     * @type number
     */
    y = 0;

    /**
     * Horizontal parallax factor
     * @type number
     */
    parallaxX = 1;

    /**
     * Vertical parallax factor
     * @type number
     */
    parallaxY = 1;

    /**
     * 
     * @type number
     */
    scale = 1;
    /**
     * 
     * @type number
     */
    angle = 0;
    /**
     * 
     * @type number
     */
    alpha = 1;
    /**
     * @type string
     */
    filter = "none";
    /**
     * 
     * @type boolean
     */
    enabled = true;
}

export class GPU_Bar {
    /**
     * @type number
     */
    level = 3;

    /**
     * @type number
     */
    nbColumns = 3

    /**
     * @type number
     */
    nbRows = 1;

    /**
     * @type number
     */
    cellWidth = 8;

    /**
     * @type number
     */
    cellHeight = 16;

    /**
     * @type number
     */
    cellSpacing = 4;

    /**
     * @type string
     */
    borderColor = "#101820";

    /**
     * @type string
     */
    emptyColor = "#9898c8";

    /**
     * @type string
     */
    filledColor = "#b80000";

    /**
     * @type number
     */
    x = 0;

    /**
     * @type number
     */
    y = 0;

    /**
     * @type boolean
     */
    enabled = false;
}

export class GPU_LabelBackground {
    /**
     * @type number
     */
    x;

    /**
     * @type number
     */
    y;

    /**
     * @type number
     */
    width;

    /**
     * @type number
     */
    height;

    /**
     * type string
     */
    color;
}

export class GPU_Label {

    /**
     * @type boolean
     */
    enabled;

    /**
     * @type GPU_LabelBackground
     */
    background;

    /**
     * @type string
     */
    text;

    /**
     * @type number
     */
    x = 0;

    /**
     * @type number
     */
    y = 0;

    /**
     * @type string
     */
    font = "bold 16px monospace";

    /**
     * type string
     */
    color = "#ffffff";

    /**
     * 
     * @type CanvasTextAlign
     */
    align = "start";
}

/**
 * @type GPU_HUD
 */
export class GPU_HUD {
    /**
     * @type GPU_Bar[]
     */
    bars = []

    /**
     * @type GPU_Label[]
     */
    labels = []

    /**
     * @type boolean
     */
    enabled = false;

    loadingFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

    /**
     * @type number
     */
    loadingFrameDuration = 100;

    /**
     * @type DOMHighResTimeStamp
     */
    currentLoadingFrameEndTime = 0;

    /**
     * @type number
     */
    currentLoadingFrame = 0;

    /**
     * @type string
     */
    loadingText;

    /**
     * @type string
     */
    pausedText;

    Reset() {
        this.bars = [];
        this.labels = [];
    }

    /**
     * @returns {GPU_Label} label
     */
    CreateLabel() {
        let label = new GPU_Label();
        this.labels.push(label);
        return label;
    }

    /**
     * 
     * @param {GPU_Label} label 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {string} color 
     */
    SetLabelBackground(label, x, y, w, h, color) {
        if (!label.background) {
            label.background = new GPU_LabelBackground();
        }
        label.background.x = x;
        label.background.y = y;
        label.background.width = w;
        label.background.height = h;
        label.background.color = color;
    }

    /**
     * 
     * @param {GPU_Label} label
     * @param {string} text
     */
    SetLabelText(label, text) {
        label.text = text;
    }

    /**
     * 
     * @param {GPU_Label} label
     * @param {string} color
     */
    SetLabelColor(label, color) {
        label.color = color;
    }

    /**
     * 
     * @param {GPU_Label} label
     * @param {string} font
     */
    SetLabelFont(label, font) {
        label.font = font;
    }

    /**
     * 
     * @param {GPU_Label} label
     * @param {CanvasTextAlign} align
     */
    SetLabelAlign(label, align) {
        label.align = align;
    }

    /**
     * Enable the sprite so it is drawn. 
     * @param {GPU_Label} label
     */
    EnableLabel(label) {
        label.enabled = true;
    }

    /**
     * Enable the sprite so it is drawn. 
     * @param {GPU_Label} label
     */
    DisableLabel(label) {
        label.enabled = false;
    }

    /**
     * 
     * @param {GPU_Label} label
     * @param {number} x 
     * @param {number} y 
     */
    SetLabelPosition(label, x, y) {
        label.x = x;
        label.y = y;
    }

    /**
     * @returns {GPU_Bar} bar
     */
    CreateBar() {
        let bar = new GPU_Bar();
        this.bars.push(bar);
        return bar;
    }

    /**
     * 
     * @param {GPU_Bar} bar
     * @param {number} x 
     * @param {number} y 
     */
    SetBarPosition(bar, x, y) {
        bar.x = x;
        bar.y = y;
    }

    /**
     * 
     * @param {GPU_Bar} bar
     * @param {number} nbColumns 
     * @param {number} nbRows 
     */
    SetBarSize(bar, nbColumns = 3, nbRows = 1) {
        bar.nbColumns = nbColumns;
        bar.nbRows = nbRows;
    }

    /**
     * 
     * @param {GPU_Bar} bar
     * @param {number} level
     */
    SetBarLevel(bar, level) {
        bar.level = Math.max(0, Math.min(level, bar.nbColumns * bar.nbRows));
    }

    /**
     *
     * @param {GPU_Bar} bar 
     * @param {number} cellWidth 
     * @param {number} cellHeight 
     * @param {number} cellSpacing 
     * @param {string} borderColor 
     * @param {string} emptyColor 
     * @param {string} filledColor 
     */
    SetBarStyle(bar, cellWidth, cellHeight, cellSpacing, borderColor, emptyColor, filledColor) {
        bar.cellWidth = cellWidth;
        bar.cellHeight = cellHeight;
        bar.cellSpacing = cellSpacing;
        bar.borderColor = borderColor;
        bar.emptyColor = emptyColor;
        bar.filledColor = filledColor;
    }

    /**
     * Enable the sprite so it is drawn. 
     * @param {GPU_Bar} bar
     */
    EnableBar(bar) {
        bar.enabled = true;
    }

    /**
     * Enable the sprite so it is drawn. 
     * @param {GPU_Bar} bar
     */
    DisableBar(bar) {
        bar.enabled = false;
    }

    /**
     * 
     * @param {string} text 
     */
    SetLoadingText(text) {
        this.loadingText = text;
    }

    /**
     * 
     * @param {string} text 
     */
    SetPausedText(text) {
        if (text) {
            this.pausedText = text;
        } else {
            this.pausedText = null;
        }
    }

}

export class Playnewton_GPU {

    get screenWidth() {
        return this.canvas.width;
    }

    get screenHeight() {
        return this.canvas.height;
    }

    /**
     * 
     * @type GPU_Layer[]
     */
    layers = [];

    /**
     * @type GPU_Sprite[]
     */
    sprites = [];

    /**
     * @type GPU_HUD
     */
    HUD = new GPU_HUD();

    /**
     * Time elapsed since last frame for animation control
     * @type number 
     */
    frameDuration = 1000 / 60;
    /**
     * 
     * @type GPU_FpsLimiter
     */
    fpsLimiter;
    /**
     * 
     * @type HTMLCanvasElement
     */
    canvas;
    /**
     * 
     * @type CanvasRenderingContext2D
     */
    ctx;

    /**
     * @type number
     */
    scrollX = 0;

    /**
     * @type number
     */
    scrollY = 0;

    /**
     * @type boolean
     */
    drawLoadingOnly = false;

    /**
     * @type string
     */
    backgroundColor = "black";

    SetDrawLoadingOnly(drawLoadingOnly) {
        this.drawLoadingOnly = drawLoadingOnly;
    }

    constructor() {
        this.fpsLimiter = new GPU_FpsLimiter();
    }

    Reset() {
        this.scrollX = 0;
        this.scrollY = 0;
        this.layers = [];
        this.sprites = [];
        this.HUD.Reset();
        this.backgroundColor = "black";
    }

    /**
     * @param {number} x 
     * @param {number} y
     */
    SetScroll(x, y) {
        this.scrollX = x;
        this.scrollY = y;
    }

    /**
     * @param {GPU_Layer} layer
     * @param {number} x 
     * @param {number} y
     */
    SetLayerScroll(layer, x, y) {
        layer.x = x;
        layer.y = y;
    }

    /**
     * @param {boolean} enabled 
     */
    EnableHUD(enabled) {
        this.HUD.enabled = enabled;
    }

    /**
     * Creates a new spriteset.
     * @param {ImageBitmap} bitmap
     * @param {GPU_SpritesetFrameDescription[]} frames
     * @returns {GPU_Spriteset}
     */
    CreateSpriteset(bitmap, frames) {
        let spriteset = new GPU_Spriteset();
        for (let frame of frames) {
            let spritePicture = new GPU_SpritePicture();
            spritePicture.name = frame.name;
            spritePicture.bitmap = bitmap;
            spritePicture.x = frame.x;
            spritePicture.y = frame.y;
            spritePicture.w = frame.w;
            spritePicture.h = frame.h;
            spriteset.pictures.push(spritePicture);
        }
        return spriteset;
    }

    /**
     * Creates a picture.
     * @param {ImageBitmap} bitmap
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @returns {GPU_SpritePicture}
     */
    CreatePicture(bitmap, x = 0, y = 0, w = undefined, h = undefined) {
        let spritePicture = new GPU_SpritePicture();
        spritePicture.bitmap = bitmap;
        spritePicture.x = x;
        spritePicture.y = y;
        spritePicture.w = w || bitmap.width;
        spritePicture.h = h || bitmap.height;
        return spritePicture;
    }

    /**
     * Find a picture entry by name in spriteset
     * @param {GPU_Spriteset} spriteset
     * @param {string} name
     * @return {GPU_SpritePicture} Index of the actual picture inside the spriteset
     */
    FindPictureByName(spriteset, name) {
        return spriteset.pictures.find(p => p.name === name);
    }

    /**
     * 
     * @param {GPU_Spriteset} spriteset
     * @param {Array<GPU_SpriteAnimationFrameDescription>} frames
     * @returns {GPU_SpriteAnimation}
     */
    CreateAnimation(spriteset, frames) {
        let animation = new GPU_SpriteAnimation();
        let time = 0;
        for (let frameDescription of frames) {
            let frame = new GPU_SpriteAnimationFrame();
            frame.picture = this.FindPictureByName(spriteset, frameDescription.name);
            if (!frame.picture) {
                console.error(`Cannot find frame description named: ${frameDescription.name}`)
            }
            time += frameDescription.delay;
            frame.endTime = time;
            animation.frames.push(frame);
        }
        animation.totalDuration = time;
        return animation;
    }

    /**
     * Set sprite picture
     * @param {GPU_Sprite} sprite
     * @param {GPU_SpritePicture} picture
     */
    SetSpritePicture(sprite, picture) {
        sprite.picture = picture;
    }

    /**
     * Make sprite blinking for some time
     * @param {GPU_Sprite} sprite
     * @param {number} duration
     */
    MakeSpriteBlink(sprite, duration) {
        let now = this.fpsLimiter.now;
        sprite.lastBlinkTime = now;
        sprite.blinkUntilTime = now + duration;
    }

    /**
     * Check if sprite is blinking
     * @param {GPU_Sprite} sprite
     */
    IsSpriteBlinking(sprite) {
        return sprite.blinkUntilTime > this.fpsLimiter.now;

    }

    /**
     *  Set sprite animation
     * @param {GPU_Sprite} sprite
     * @param {GPU_SpriteAnimation} animation
     * @param {GPU_AnimationMode} mode play mode
     */
    SetSpriteAnimation(sprite, animation, mode = GPU_AnimationMode.LOOP) {
        sprite.animationMode = mode;
        if (sprite.animation !== animation) {
            sprite.animationState = GPU_AnimationState.STARTED;
            sprite.animation = animation;
            sprite.animationCurrentFrameIndex = 0;
            sprite.animationCurrentTime = 0;
            sprite.picture = sprite.animation.frames[0].picture;
        }
    }

    /**
     *  Like ResetSpriteAnimation but always restart from first frame
     * @param {GPU_Sprite} sprite
     * @param {GPU_SpriteAnimation} animation
     * @param {GPU_AnimationMode} mode play mode
     */
    ResetSpriteAnimation(sprite, animation, mode = GPU_AnimationMode.LOOP) {
        sprite.animationMode = mode;
        sprite.animationState = GPU_AnimationState.STARTED;
        sprite.animation = animation;
        sprite.animationCurrentFrameIndex = 0;
        sprite.animationCurrentTime = 0;
        sprite.picture = sprite.animation.frames[0].picture;
    }

    /**
     * 
     * @param {GPU_Sprite} sprite
     * @param {boolean} visible
     */
    SetSpriteVisible(sprite, visible) {
        sprite.visible = visible;
    }

    /**
     * 
     * @param {GPU_Sprite} sprite
     * @param {number} x Horizontal position (0 = left margin)
     * @param {number} y Vertical position (0 = top margin)
     */
    SetSpritePosition(sprite, x, y) {
        sprite.x = x;
        sprite.y = y;
    }

    /**
     * 
     * @param {GPU_Sprite} sprite
     * @param {number} z order (greater = in front), Math.floor(z) give the layer index
     */
    SetSpriteZ(sprite, z) {
        sprite.z = z;
    }

    /**
     * Apply rotozoom effect on sprite
     * @param {GPU_Sprite} sprite
     * @param {number} scale size factor
     * @param {number} angle rotation angle in radians
     */
    SetSpriteRotozoom(sprite, scale = 1, angle = 0) {
        sprite.scale = scale;
        sprite.angle = angle;
    }

    /**
     * @param {number} z order (greater = in front), Math.floor(z) give the layer index
     * @returns {GPU_Layer}
     */
    GetLayer(z) {
        z = Math.floor(z);
        let layer = this.layers[z];
        if (!layer) {
            layer = new GPU_Layer();
            this.layers[z] = layer;
        }
        return layer;
    }

    /**
     * @param {GPU_Layer} layer
     */
    EnableLayer(layer) {
        layer.enabled = true;
    }

    /**
     * @param {GPU_Layer} layer
     */
    DisableLayer(layer) {
        layer.enabled = false;
    }

    /**
     * @param {GPU_Layer} layer
     * @param {number} scale size factor
     * @param {number} angle rotation angle in radians
     */
    SetLayerRotozoom(layer, scale = 1, angle = 0) {
        layer.scale = scale;
        layer.angle = angle;
    }

    /**
     * @param {GPU_Layer} layer
     * @param {number} alpha opacity
     */
    SetLayerOpacity(layer, alpha = 1) {
        layer.alpha = alpha;
    }

    /**
     * @param {GPU_Layer} layer
     * @param {number} parallaxX
     * @param {number} parallaxY 
     */
    SetLayerParallax(layer, parallaxX, parallaxY) {
        layer.parallaxX = parallaxX;
        layer.parallaxY = parallaxY;
    }

    /**
     * @returns {GPU_Sprite} sprite
     */
    CreateSprite() {
        let sprite = new GPU_Sprite();
        this.sprites.push(sprite);
        return sprite;
    }

    /**
     * Enable the sprite so it is drawn. 
     * @param {GPU_Sprite} sprite
     */
    EnableSprite(sprite) {
        sprite.enabled = true;
    }

    /**
     * Disables the sprite so it is not drawn. 
     * @param {GPU_Sprite} sprite
     */
    DisableSprite(sprite) {
        sprite.enabled = false;
    }

    /**
     * 
     * @param {HTMLCanvasElement} canvas
     */
    SetVideoOutput(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d", { alpha: false });
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * @param {number} frameDuration time elapsed since last frame for animation control
     */
    SetFrameDuration(frameDuration) {
        this.frameDuration = frameDuration;
    }

    /**
     * Draws the frame to the previously specified render target.
     */
    DrawFrame() {
        this.ctx.save();
        this._UpdateSprites();
        if (this.ctx) {
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            if (!this.drawLoadingOnly) {
                this._DrawSprites();
            }
            PPU.DebugDraw(this.ctx);
            this._DrawHUD(this.HUD);
            this._DrawVirtualPad();
        }
        this.ctx.restore();
    }

    _UpdateSprites() {
        this.sprites.forEach(sprite => sprite.enabled && this._UpdateSprite(sprite));
    }

    /**
     * 
     * @param {GPU_Sprite} sprite
     */
    _UpdateSprite(sprite) {
        if (sprite.animation) {
            this._UpdateSpriteAnimation(sprite);
        }
    }

    /**
     * 
     * @param {GPU_Sprite} sprite
     */
    _UpdateSpriteAnimation(sprite) {
        if (sprite.animationStopped) {
            return;
        }
        let frames = sprite.animation.frames;
        sprite.animationCurrentTime += this.frameDuration;
        if (sprite.animationCurrentTime >= sprite.animation.totalDuration) {
            switch (sprite.animationMode) {
                case GPU_AnimationMode.ONCE:
                    sprite.animationCurrentFrameIndex = frames.length - 1;
                    sprite.animationState = GPU_AnimationState.STOPPED;
                    return;
                case GPU_AnimationMode.LOOP:
                    sprite.animationCurrentFrameIndex = 0;
                    sprite.animationCurrentTime %= sprite.animation.totalDuration;
                    break;
            }
        }
        while (sprite.animationCurrentTime > frames[sprite.animationCurrentFrameIndex].endTime) {
            ++sprite.animationCurrentFrameIndex;
        }
        sprite.picture = sprite.animation.frames[sprite.animationCurrentFrameIndex].picture;
    }

    _DrawSprites() {
        for (let z = 0; z < this.layers.length; ++z) {
            let layer = this.layers[z];
            if (layer && layer.enabled) {
                this.ctx.save();
                this.ctx.filter = layer.filter;
                this.ctx.translate(layer.x + layer.parallaxX * this.scrollX, layer.y + layer.parallaxY + this.scrollY);
                if (layer.angle !== 0 || layer.scale !== 1) {
                    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                    this.ctx.rotate(layer.angle);
                    this.ctx.scale(layer.scale, layer.scale);
                    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
                }
                if (layer.alpha < 1) {
                    this.ctx.globalAlpha = layer.alpha;
                }
                for (let sprite of this.sprites) {
                    if (z === Math.floor(sprite.z)) {
                        if (this._IsSpriteVisible(sprite)) {
                            this._DrawSprite(sprite);
                        }
                    }
                }
                this.ctx.restore();
            }
        }
    }

    /**
     * 
     * @param {GPU_Sprite} sprite
     * @returns {boolean} 
     */
    _IsSpriteVisible(sprite) {
        return sprite.enabled && sprite.picture && sprite.visible;
    }
    /**
     * 
     * @param {GPU_Sprite} sprite
     */
    _DrawSprite(sprite) {
        const now = this.fpsLimiter.now;
        if (sprite.blinkUntilTime > now) {
            if ((now - sprite.lastBlinkTime) > 100) {
                sprite.lastBlinkTime = now;
                return;
            }
        }
        if (sprite.scale !== 1 || sprite.angle !== 0) {
            this.ctx.save();
            this.ctx.translate(sprite.x + sprite.picture.w / 2, sprite.y + sprite.picture.h / 2);
            this.ctx.rotate(sprite.angle);
            this.ctx.scale(sprite.scale, sprite.scale);
            this.ctx.drawImage(sprite.picture.bitmap, sprite.picture.x, sprite.picture.y, sprite.picture.w, sprite.picture.h, -sprite.picture.w / 2, -sprite.picture.h / 2, sprite.picture.w, sprite.picture.h);
            this.ctx.restore();
        } else {
            this.ctx.drawImage(sprite.picture.bitmap, sprite.picture.x, sprite.picture.y, sprite.picture.w, sprite.picture.h, sprite.x, sprite.y, sprite.picture.w, sprite.picture.h);
        }
    }

    /**
     * 
     * @param {GPU_HUD} hud 
     */
    _DrawHUD(hud) {
        if (hud.enabled) {
            if (!this.drawLoadingOnly) {
                this.ctx.save();
                for (let bar of hud.bars) {
                    this._DrawBar(bar);
                }
                for (let label of hud.labels) {
                    this._DrawLabel(label);
                }
                this.ctx.restore();
            }
            this.ctx.save();
            this._DrawLoadingText(hud);
            if (!this.drawLoadingOnly) {
                this._DrawPausedText(hud);
            }
            this.ctx.restore();
        }
    }

    _DrawVirtualPad() {
        if ((this.fpsLimiter.now - CTRL.lastVirtualPadLastUsageTime) > 5000) {
            return;
        }
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#00FF00";
        this.ctx.font = "bold 48px monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        for (let button of CTRL.virtualPadButtons) {
            this.ctx.beginPath();
            if (button.pressed) {
                this.ctx.fillStyle = "rgba(128, 128, 0, 0.5)";
            } else {
                this.ctx.fillStyle = "rgba(0, 128, 0, 0.5)";
            }
            this.ctx.arc(button.x, button.y, button.radius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            this.ctx.fillText(button.label, button.x, button.y, button.radius * 2);
        }
        this.ctx.restore();
    }

    /**
     * 
     * @param {GPU_Label} label
     */
    _DrawLabel(label) {
        if (label.enabled) {
            if (label.background) {
                this.ctx.fillStyle = label.background.color;
                this.ctx.fillRect(label.background.x, label.background.y, label.background.width, label.background.height);
            }
            if (label.text) {
                this.ctx.font = label.font;
                this.ctx.textAlign = label.align;
                this.ctx.fillStyle = label.color;
                this.ctx.fillText(label.text, label.x, label.y);
            }
        }
    }

    /**
     * 
     * @param {GPU_HUD} hud 
     */
    _DrawLoadingText(hud) {
        if (hud.loadingText) {
            let now = this.fpsLimiter.now;
            if (now > hud.currentLoadingFrameEndTime) {
                hud.currentLoadingFrameEndTime = now + hud.loadingFrameDuration;
                hud.currentLoadingFrame = (hud.currentLoadingFrame + 1) % hud.loadingFrames.length;
            }
            let loadingText = `${hud.loadingFrames[hud.currentLoadingFrame]}${hud.loadingText}`;
            this.ctx.font = "bold 48px monospace";
            this.ctx.fillStyle = "#ffffff";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "bottom";
            this.ctx.fillText(loadingText, this.canvas.width / 2, this.canvas.height);
        }
    }

    /**
     * 
     * @param {GPU_HUD} hud 
     */
    _DrawPausedText(hud) {
        if (hud.pausedText) {
            this.ctx.font = "bold 32px monospace";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";

            let pausedTextLines = hud.pausedText.split("\n");
            let y = this.canvas.height / 2;

            this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            this.ctx.fillRect(0, y - 32, this.canvas.width, 32 * (pausedTextLines.length+1));
            
            this.ctx.fillStyle = "#ffffff";
            for(let line of pausedTextLines) {
                this.ctx.fillText(line, this.canvas.width / 2, y, this.canvas.width);
                let measure = this.ctx.measureText(line);
                y += 32;
            }            
        }
    }

    /**
     * 
     * @param {GPU_Bar} bar 
     */
    _DrawBar(bar) {
        if (bar.enabled) {
            let level = bar.level;
            for (let x = 0; x < bar.nbColumns; ++x) {
                for (let y = 0; y < bar.nbRows; ++y) {
                    this.ctx.beginPath();
                    this.ctx.rect(-0.5 + bar.x + x * (bar.cellWidth + bar.cellSpacing), -0.5 + bar.y + y * (bar.cellHeight + bar.cellSpacing), bar.cellWidth, bar.cellHeight);
                    this.ctx.fillStyle = level-- > 0 ? bar.filledColor : bar.emptyColor;
                    this.ctx.fill();
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeStyle = bar.borderColor;
                    this.ctx.stroke();
                }
            }
        }
    }
}

/**
 * 
 * @type PPU_Shape
 */
class PPU_Shape {

    get left() {
        return 0;
    }
    get top() {
        return 0;
    }

    get right() {
        return 0;
    }
    get bottom() {
        return 0;
    }

    get width() {
        return this.right - this.left;
    }

    get height() {
        return this.bottom - this.top;
    }
}

const PPU_DEFAULT_SHAPE = new PPU_Shape();


/**
 * 
 * @type PPU_Circle
 */
export class PPU_Circle extends PPU_Shape {
    /**
     * 
     * @type number
     */
    x = 0;
    /**
     * 
     * @type number
     */
    y = 0;
    /**
     * 
     * @type number
     */
    radius = 16;

    get left() {
        return this.x - this.radius;
    }
    get top() {
        return this.y - this.radius;
    }

    get right() {
        return this.x + this.radius;
    }
    get bottom() {
        return this.y + this.radius;
    }

}

/**
 * 
 * @type PPU_Rectangle
 */
export class PPU_Rectangle extends PPU_Shape {

    /**
     * 
     * @type number
     */
    x = 0;
    /**
     * 
     * @type number
     */
    y = 0;
    /**
     * 
     * @type number
     */
    w = 32;
    /**
     * 
     * @type number
     */
    h = 32;

    get left() {
        return this.x;
    }
    get top() {
        return this.y;
    }

    get right() {
        return this.left + this.w;
    }
    get bottom() {
        return this.top + this.h;
    }

    /**
     * 
     * @returns {number}
     */
    get centerX() {
        return (this.left + this.right) / 2;
    }

    /**
     * 
     * @returns {number}
     */
    get centerY() {
        return (this.left + this.right) / 2;
    }
}

export class PPU_Point {
    /**
     * 
     * @type number
     */
    x;
    /**
     * 
     * @type number
     */
    y;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/**
 * 
 * @type PPU_Vector
 */
class PPU_Vector {
    /**
     * 
     * @type number
     */
    x;
    /**
     * 
     * @type number
     */
    y;

    /**
     * 
     * @param {number} x
     * @param {number} y
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * 
     * @param {PPU_Vector} force
     */
    addForce(force) {
        this.x += force.x;
        this.y += force.y;
    }
}

/**
 * 
 * @type PPU_World
 */
class PPU_World {

    constructor() {
        this.bounds = new PPU_Rectangle();
        this.bounds.x = 0;
        this.bounds.y = 0;
        this.bounds.w = PLAYNEWTON_DEFAULT_SCREEN_WIDTH;
        this.bounds.h = PLAYNEWTON_DEFAULT_SCREEN_HEIGHT;
    }
    /**
     * 
     * @type PPU_Rectangle
     */
    bounds = new PPU_Rectangle();
    /**
     * 
     * @type PPU_Vector
     */
    gravity = new PPU_Vector();
}

export class PPU_BodyPassable {
    /**
     * @type boolean
     */
    fromLeftToRight = false;

    /**
     * @type boolean
     */
    fromRightToLeft = false;

    /**
     * @type boolean
     */
    fromTopToBottom = false;

    /**
     * @type boolean
     */
    fromBottomToTop = false;
}

/**
 * 
 * @type PPU_BodyTouches
 */
class PPU_BodyTouches {
    /**
     * @type PPU_Body
     */
    left;
    /**
     * @type PPU_Body
     */
    right;
    /**
     * @type PPU_Body
     */
    top;
    /**
     * @type PPU_Body
     */
    bottom;

    reset() {
        this.left = null;
        this.right = null;
        this.top = null;
        this.bottom = null;
    }
}

/**
 * 
 * @type PPU_Body
 */
export class PPU_Body {

    /**
     * 
     * @type string
     */
    tag;

    /**
     * 
     * @type PPU_Vector
     */
    previousPosition = new PPU_Vector();

    /**
     * 
     * @type PPU_Vector
     */
    position = new PPU_Vector();

    /**
     * 
     * @type PPU_Vector
     */
    velocity = new PPU_Vector();

    /**
     * 
     * @type number
     */
    minXVelocity = -10000;

    /**
     * 
     * @type number
     */
    maxXVelocity = 10000;
    /**
     * 
     * @type number
     */
    minYVelocity = -10000;

    /**
     * 
     * @type number
     */
    maxYVelocity = 10000;

    /**
     * @type boolean 
     */
    affectedByGravity = true;

    /**
     * @type boolean 
     */
    immovable = false;

    /**
     * @type PPU_BodyPassable
     */
    passable = new PPU_BodyPassable();

    /**
     * PPU perform bitwise AND between 
     * bodies collision masks to determin
     * if they can collide
     * @type number 
     */
    collisionMask = 1;

    /**
     * 
     * @type PPU_Shape
     */
    shape = PPU_DEFAULT_SHAPE;

    /**
     * Keep the body in world bounds?
     * @type boolean
     */
    collideWorldBounds = false;

    /**
     * @type PPU_BodyTouches
     */
    touches = new PPU_BodyTouches();

    /**
     * 
     * @type boolean
     */
    enabled = false;

    /**
     * @type string
     */
    debugColor;

    /**
     * 
     * @returns {boolean}
     */
    get movable() {
        return !this.immovable;
    }

    /**
     * @param {boolean} movable
     */
    set movable(movable) {
        this.immovable = !movable;
    }

    /**
     * 
     * @returns {number}
     */
    get left() {
        return this.position.x + this.shape.left;
    }

    /**
     * @param {number} x
     */
    set left(x) {
        this.position.x = x - this.shape.left;
    }

    /**
     * 
     * @returns {number}
     */
    get previousLeft() {
        return this.previousPosition.x + this.shape.left;
    }

    /**
     * 
     * @returns {number}
     */
    get top() {
        return this.position.y + this.shape.top;
    }

    /**
     * @param {number} y
     */
    set top(y) {
        this.position.y = y - this.shape.top;
    }

    /**
     * 
     * @returns {number}
     */
    get previousTop() {
        return this.previousPosition.y + this.shape.top;
    }

    /**
     * 
     * @returns {number}
     */
    get right() {
        return this.position.x + this.shape.right;
    }

    /**
     * @param {number} x
     */
    set right(x) {
        this.position.x = x - this.shape.right;
    }

    /**
     * 
     * @returns {number}
     */
    get previousRight() {
        return this.previousPosition.x + this.shape.right;
    }

    /**
     * 
     * @returns {number}
     */
    get bottom() {
        return this.position.y + this.shape.bottom;
    }

    /**
     * @param {number} y
     */
    set bottom(y) {
        this.position.y = y - this.shape.bottom;
    }

    /**
     * 
     * @returns {number}
     */
    get previousBottom() {
        return this.previousPosition.y + this.shape.bottom;
    }

    /**
     * 
     * @returns {number}
     */
    get width() {
        return this.shape.width;
    }

    /**
     * 
     * @returns {number}
     */
    get height() {
        return this.shape.height;
    }

    /**
     * 
     * @returns {number}
     */
    get centerX() {
        return (this.left + this.right) / 2;
    }

    /**
     * @param {number} x
     */
    set centerX(x) {
        this.position.x = x - (this.shape.left + this.shape.right) / 2;
    }

    /**
     * 
     * @returns {number}
     */
    get centerY() {
        return (this.top + this.bottom) / 2;
    }

    /**
     * @param {number} y
     */
    set centerY(y) {
        this.position.y = y - (this.shape.top + this.shape.bottom) / 2;
    }


    /**
     * 
     * @returns {number}
     */
    get previousCenterX() {
        return (this.previousPosition.x + this.shape.left + this.previousPosition.x + this.shape.right) / 2;
    }

    /**
     * 
     * @returns {number}
     */
    get previousCenterY() {
        return (this.previousPosition.y + this.shape.top + this.previousPosition.y + this.shape.bottom) / 2;
    }

    /**
     * 
     * @returns {boolean}
     */
    get isGoingLeft() {
        return this.position.x < this.previousPosition.x;
    }

    /**
     * 
     * @returns {boolean}
     */
    get isGoingRight() {
        return this.position.x > this.previousPosition.x;
    }

    /**
     * 
     * @returns {boolean}
     */
    get isGoingUp() {
        return this.position.y < this.previousPosition.y;
    }

    /**
     * 
     * @returns {boolean}
     */
    get isGoingDown() {
        return this.position.y > this.previousPosition.y;
    }
}

/**
 * Physics Processing Unit for arcade physic and collision detection
 * @type Playnewton_PPU
 */
class Playnewton_PPU {
    /**
     * 
     * @type PPU_World
     */
    world;

    /**
     * 
     * @type PPU_Body[] 
     */
    bodies = [];

    /**
     * @type boolean
     */
    debugDrawEnabled = false;


    /**
     * 
     */
    constructor() {
        this.world = new PPU_World();
    }

    Reset() {
        this.bodies = [];
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     */
    SetWorldBounds(x, y, w, h) {
        this.world.bounds.x = x;
        this.world.bounds.y = y;
        this.world.bounds.w = w;
        this.world.bounds.h = h;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    SetWorldGravity(x, y) {
        this.world.gravity.x = x;
        this.world.gravity.y = y;
    }

    /**
     * @returns {PPU_Body} body
     */
    CreateBody() {
        let body = new PPU_Body();
        this.bodies.push(body);
        return body;
    }

    /**
     * Enable the body so it is updated. 
     * @param {PPU_Body} body
     */
    EnableBody(body) {
        body.enabled = true;
    }

    /**
     * Set collision rectangle on body
     * @param {PPU_Body} body
     * @param {number} leftx left x
     * @param {number} topy top y
     * @param {number} w
     * @param {number} h
     */
    SetBodyRectangle(body, leftx, topy, w, h) {
        let rectangle = new PPU_Rectangle();
        rectangle.x = leftx;
        rectangle.y = topy;
        rectangle.w = w;
        rectangle.h = h;
        body.shape = rectangle;
    }

    /**
     * Set collision circle on body
     * @param {PPU_Body} body
     * @param {number} centerx
     * @param {number} centery
     * @param {number} radius
     */
    SetBodyCircle(body, centerx, centery, radius) {
        let circle = new PPU_Circle();
        circle.x = centerx;
        circle.y = centery;
        circle.radius = radius;
        body.shape = circle;
    }

    /**
     * Disables the body so it is not updated. 
     * @param {PPU_Body} body
     */
    DisableBody(body) {
        body.enabled = false;
    }

    /**
     * @param {PPU_Body} body
     * @param {number} minX
     * @param {number} maxX
     * @param {number} minY
     * @param {number} maxY
     */
    SetBodyVelocityBounds(body, minX, maxX, minY, maxY) {
        body.minXVelocity = minX;
        body.maxXVelocity = maxX;
        body.minYVelocity = minY;
        body.maxYVelocity = maxY;
    }

    /**
     * @param {PPU_Body} body
     * @param {number} collisionMask 
     */
    SetBodyCollisionMask(body, collisionMask) {
        body.collisionMask = collisionMask;
    }

    /**
     * @param {PPU_Body} body
     * @param {boolean} affectedByGravity 
     */
    SetBodyAffectedByGravity(body, affectedByGravity) {
        body.affectedByGravity = affectedByGravity;
    }


    /**
     * @param {PPU_Body} body
     * @param {number} x 
     * @param {number} y 
     */
    SetBodyPosition(body, x, y) {
        body.position.x = x;
        body.position.y = y;
    }

    /**
     * @param {PPU_Body} body
     * @param {number} vx 
     * @param {number} vy 
     */
    SetBodyVelocity(body, vx, vy) {
        body.velocity.x = vx;
        body.velocity.y = vy;
    }

    /**
     * @param {PPU_Body} body
     * @param {boolean} immovable 
     */
    SetBodyImmovable(body, immovable) {
        body.immovable = immovable;
    }

    /**
     * @param {PPU_Body} body
     * @param {PPU_BodyPassable} passable 
     */
    SetBodyPassable(body, passable) {
        body.passable = passable;
    }

    /**
     * @param {PPU_Body} body
     * @param {boolean} collide 
     */
    SetBodyCollideWorldBounds(body, collide) {
        body.collideWorldBounds = collide;
    }

    /**
     * 
     * @param {PPU_Body} bodyA
     * @param {PPU_Body} bodyB
     */
    CheckIfBodiesIntersects(bodyA, bodyB) {
        if (bodyA.right < bodyB.left) {
            return false;
        }
        if (bodyA.left > bodyB.right) {
            return false;
        }
        if (bodyA.bottom < bodyB.top) {
            return false;
        }
        if (bodyA.top > bodyB.bottom) {
            return false;
        }
        return true;
    }

    /**
     * 
     * @param {PPU_Body} stomper
     * @param {PPU_Body} stomped
     */
    CheckIfBodyStompOther(stomper, stomped) {
        return this.CheckIfBodiesIntersects(stomper, stomped) && stomper.bottom >= stomped.top && stomper.isGoingDown;
    }

    /**
     * 
     * @param {PPU_Body} runner
     * @param {PPU_Body} runned
     */
    CheckIfBodyRunIntoOther(runner, runned) {
        return this.CheckIfBodiesIntersects(runner, runned)
            && ((runner.right > runned.left && runner.isGoingRight)
                || (runner.left < runned.right && runner.isGoingLeft)
            );
    }

    /**
     * 
     * @param {PPU_Body} body
     */
    CheckIfBodyIsInWorldBound(body) {
        if (body.right < this.world.bounds.left) {
            return false
        }
        if (body.bottom < this.world.bounds.top) {
            return false;
        }
        if (body.left > this.world.bounds.right) {
            return false;
        }
        if (body.top > this.world.bounds.bottom) {
            return false;
        }
        return true;
    }

    Update() {
        for (let body of this.bodies) {
            this._MoveBody(body);
        }
        for (let body of this.bodies) {
            body.debugColor = "#00FF00";
            body.touches.reset();
        }
        for (let body of this.bodies) {
            this._KeepBodyInWorldBound(body);
        }
        for (let bodyA of this.bodies) {
            for (let bodyB of this.bodies) {
                this._CollideBodies(bodyA, bodyB);
            }
        }
        for (let body of this.bodies) {
            this._KeepBodyInWorldBound(body);
        }
    }

    /**
     * 
     * @param ctx CanvasRenderingContext2D
     */
    DebugDraw(ctx) {
        if (!this.debugDrawEnabled) {
            return;
        }
        for (let body of this.bodies) {
            if (body.enabled) {
                ctx.strokeStyle = body.debugColor || "#00FF00";
                if (body.width < 1 && body.height < 1) {
                    ctx.beginPath();
                    ctx.moveTo(body.centerX - 16, body.centerY);
                    ctx.lineTo(body.centerX + 16, body.centerY);
                    ctx.moveTo(body.centerX, body.centerY - 16);
                    ctx.lineTo(body.centerX, body.centerY + 16);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(body.centerX, body.centerY, 16, 0, 2 * Math.PI);
                    ctx.stroke();
                } else {
                    ctx.strokeRect(body.left, body.top, body.width, body.height);
                }
            }
        }
    }

    /**
     * 
     * @param {PPU_Body} bodyA
     * @param {PPU_Body} bodyB
     */
    _CollideBodies(bodyA, bodyB) {
        if (bodyA !== bodyB && bodyA.enabled && bodyB.enabled && (bodyA.collisionMask & bodyB.collisionMask)) {
            if (bodyA.movable && bodyB.immovable) {
                this._CollideMovableAndImmovableBodies(bodyA, bodyB);
            } else if (bodyA.immovable && bodyB.movable) {
                this._CollideMovableAndImmovableBodies(bodyB, bodyA);
            } else if (bodyA.movable && bodyB.movable) {
                //TODO
            }
        }
    }

    /**
     * 
     * @param {PPU_Body} movableBody
     * @param {PPU_Body} immovableBody
     */
    _CollideMovableAndImmovableBodies(movableBody, immovableBody) {
        if (this._CheckIfMovableBodyIntersectsImmovableBody(movableBody, immovableBody)) {
            movableBody.debugColor = "#ff0000";
            immovableBody.debugColor = "#ff0000";
            if (!immovableBody.passable.fromTopToBottom && movableBody.isGoingDown && movableBody.top < immovableBody.top && movableBody.bottom > immovableBody.top) {
                movableBody.bottom = immovableBody.top;
                movableBody.touches.bottom = immovableBody;
                return;
            }
            if (!immovableBody.passable.fromBottomToTop && movableBody.isGoingUp && movableBody.bottom > immovableBody.bottom && movableBody.top < immovableBody.bottom) {
                movableBody.top = immovableBody.bottom;
                movableBody.touches.top = immovableBody;
                return;
            }
            if (!immovableBody.passable.fromLeftToRight && movableBody.isGoingRight && movableBody.left < immovableBody.left && movableBody.right > immovableBody.left) {
                movableBody.right = immovableBody.left;
                movableBody.touches.right = immovableBody;
                return;
            }
            if (!immovableBody.passable.fromRightToLeft && movableBody.isGoingLeft && movableBody.right > immovableBody.right && movableBody.left < immovableBody.right) {
                movableBody.left = immovableBody.right;
                movableBody.touches.left = immovableBody;
                return;
            }
        }
    }

    /**
     * 
     * @param {PPU_Body} movableBody
     * @param {PPU_Body} immovableBody
     * @returns {boolean}
     */
    _CheckIfMovableBodyIntersectsImmovableBody(movableBody, immovableBody) {
        if (movableBody.right <= immovableBody.left) {
            return false;
        }
        if (movableBody.left >= immovableBody.right) {
            return false;
        }
        if (movableBody.bottom <= immovableBody.top) {
            return false;
        }
        if (movableBody.top >= immovableBody.bottom) {
            return false;
        }
        return true;
    }

    /**
     * 
     * @param {PPU_Body} body
     */
    _MoveBody(body) {
        if (body.enabled && !body.immovable) {
            body.previousPosition.x = body.position.x;
            body.previousPosition.y = body.position.y;

            if (body.affectedByGravity) {
                body.velocity.addForce(this.world.gravity);
            }

            if (body.velocity.x > body.maxXVelocity) {
                body.velocity.x = body.maxXVelocity;
            } else if (body.velocity.x < body.minXVelocity) {
                body.velocity.x = body.minXVelocity;
            }

            if (body.velocity.y > body.maxYVelocity) {
                body.velocity.y = body.maxYVelocity;
            } else if (body.velocity.y < body.minYVelocity) {
                body.velocity.y = body.minYVelocity;
            }

            body.position.addForce(body.velocity);
        }
    }

    /**
     * 
     * @param {PPU_Body} body
     */
    _KeepBodyInWorldBound(body) {
        if (body.enabled && body.collideWorldBounds) {
            if (body.left < this.world.bounds.left) {
                body.left = this.world.bounds.left;
            }
            if (body.top < this.world.bounds.top) {
                body.top = this.world.bounds.top;
            }
            if (body.right > this.world.bounds.right) {
                body.right = this.world.bounds.right;
            }
            if (body.bottom > this.world.bounds.bottom) {
                body.bottom = this.world.bounds.bottom;
            }
        }

    }
}

/**
 * Math utilities
 * @type Playnewton_FPU
 */
class Playnewton_FPU {
    /**
     * 
     * @param {number} min 
     * @param {number} value 
     * @param {number} max 
     */
    bound(min, value, max) {
        if (value < min) {
            return min;
        } else if (value > max) {
            return max;
        } else {
            return value;
        }
    }

    /**
 * 
 * @param {number} min 
 * @param {number} value 
 * @param {number} max 
 */
    wrap(min, value, max) {
        if (value < min) {
            return max;
        } else if (value > max) {
            return min;
        } else {
            return value;
        }
    }
}

class Playnewton_RAND {

    /**
     * @template T
     * @param {Array<T>} array
     */
    pickOne(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * @template T
     * @param {Array<T>} array
     * @param {(value: T, index: number, array: Array<T>) => boolean} predicate
     * @returns {T}
     */
    pickOneFiltered(array, predicate) {
        let filteredArray = array.filter(predicate);
        return filteredArray[Math.floor(Math.random() * filteredArray.length)];
    }

    /**
     * @template T
     * @param {Array<T>} array
     * @param {number} n
     * @param {(value: T, index: number, array: Array<T>) => boolean} predicate
     * @returns {Array<T>}
     */
    pickNFiltered(array, n, predicate) {
        let filteredArray = array.filter(predicate);
        let resultArray = [];
        for (let i = 0; i < n; ++i) {
            resultArray.push(filteredArray[Math.floor(Math.random() * filteredArray.length)]);
        }
        return resultArray;
    }
}

/**
 * Sound stuff
 */
class Playnewton_APU {

    /**
     * @type AudioContext
     */
    ctx;

    /**
     * @type AudioBufferSourceNode
     */
    musicBufferSource;

    /**
     * @type string
     */
    musicUrl;

    /**
     * @type Map<String, AudioBuffer>
     */
    audioBuffersCache = new Map();

    constructor() {
        try {
          //  this.ctx = new AudioContext();
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * @param {string} musicUrl 
     */
    async PlayMusic(musicUrl) {
        if (this.ctx) {
            let audioBuffer = await this.loadAudioBuffer(musicUrl);
            this.closeMusicBufferSource();
            this.musicBufferSource = this.ctx.createBufferSource();
            this.musicBufferSource.loop = true;
            this.musicBufferSource.buffer = audioBuffer;
            this.musicBufferSource.connect(this.ctx.destination);
            this.musicBufferSource.start();
        }
    }

    /**
     * @param {string} musicUrl 
     */
    async Preload(musicUrl) {
        if (this.ctx) {
            await this.loadAudioBuffer(musicUrl);
        }
    }

    /**
     * @param {string} soundUrl 
     */
    async PlaySound(soundUrl) {
        if (this.ctx) {
            let audioBuffer = await this.loadAudioBuffer(soundUrl);
            let soundBufferSource = this.ctx.createBufferSource();
            soundBufferSource.buffer = audioBuffer;
            soundBufferSource.connect(this.ctx.destination);
            soundBufferSource.start();
        }
    }

    Reset() {
        if (this.ctx) {
            this.closeMusicBufferSource();
        }
    }

    /**
     * @param {string} url
     * @returns AudioBuffer
     */
    async loadAudioBuffer(url) {
        let audioBuffer = this.audioBuffersCache.get(url);
        if (!audioBuffer) {
            let response = await fetch(url);
            let arrayBuffer = await response.arrayBuffer();
            audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.audioBuffersCache.set(url, audioBuffer);
        }
        return audioBuffer;
    }

    closeMusicBufferSource() {
        if (this.musicBufferSource) {
            try {
                this.musicBufferSource.disconnect();
                this.musicBufferSource = null;
            } catch (e) {
                console.log(e);
            }
        }
    }
}

export const CLOCK = new Playnewton_CLOCK();
export const DRIVE = new Playnewton_DRIVE();
export const FPU = new Playnewton_FPU();
export const GPU = new Playnewton_GPU();
export const PPU = new Playnewton_PPU();
export const APU = new Playnewton_APU();
export const CTRL = new Playnewton_CTRL(4);
export const RAND = new Playnewton_RAND();

