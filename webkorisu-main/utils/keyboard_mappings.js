
export function IngameMapKeyboardEventToPadButton(pad, event, down){
    switch (event.code) {
        case "Space":
            pad.B = down;
            return true;
        case "ArrowUp":
            pad.A = down;
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

export function MenuMapKeyboardEventToPadButton(pad, event, down){
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