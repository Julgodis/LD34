var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ButtonSprite = (function (_super) {
    __extends(ButtonSprite, _super);
    function ButtonSprite(button_text, x, y, z, width, height) {
        _super.call(this, x, y, z, width, height);
        this.text = new TextSprite(button_text, x, y, z + 1, width, height);
    }
    ButtonSprite.prototype.update = function (position) {
        if (this.inside(position))
            this.color = new vec4([1, 1, 1, 1]);
        else
            this.color = new vec4([0.8, 0.8, 0.8, 1]);
    };
    ButtonSprite.prototype.inside = function (position) {
        if (position.x >= this.x && position.x <= this.x + this.width)
            if (position.y >= this.y && position.y <= this.y + this.height)
                return true;
        return false;
    };
    ButtonSprite.prototype.cleanup = function () {
        this.remove();
        this.text.remove();
    };
    return ButtonSprite;
})(Sprite);
//# sourceMappingURL=button.js.map