
class ButtonSprite extends Sprite {
    text: TextSprite;

    constructor(button_text: String, x: number, y: number, z: number, width: number, height: number) {
        super(x, y, z, width, height);
        this.text = new TextSprite(button_text, x, y, z + 1, width, height);
    }

    update(position: vec2) {
        if (this.inside(position)) this.color = new vec4([1, 1, 1, 1]);
        else this.color = new vec4([0.8, 0.8, 0.8, 1]);
    }

    inside(position: vec2): boolean {
        if (position.x >= this.x && position.x <= this.x + this.width)
            if (position.y >= this.y && position.y <= this.y + this.height)
                return true;

        return false;
    }

    cleanup() {
        this.remove();
        this.text.remove();
    }
}