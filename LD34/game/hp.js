var HP = (function () {
    function HP(n, max_hp, position) {
        this.max_hp = max_hp;
        this.current_hp = this.max_hp;
        this.last_update_hp = this.max_hp;
        var width = 400;
        var height = 20;
        this.base_sprite = new Sprite(position.x, position.y, 10, width, height);
        this.base_sprite.color = new vec4([0.5, 0.1, 0.1, 1]);
        this.base_sprite.textures = [empty_texture];
        this.current_sprite = new Sprite(position.x, position.y, 11, width, height);
        this.current_sprite.color = new vec4([1, 0.2, 0.2, 1]);
        this.current_sprite.textures = [empty_texture];
        this.update_sprite = new Sprite(position.x, position.y, 12, width, height);
        this.update_sprite.color = new vec4([1, 1, 0.2, 1]);
        this.update_sprite.textures = [empty_texture];
        this.name = new TextSprite(n, position.x, position.y - 30, 11, 250, 30, { center: false });
        this.percent = new TextSprite("100.00%", position.x + width - 105, position.y - 30, 11, 85, 30, { center: false });
        context.passes[0].addSprite(this.name);
        context.passes[0].addSprite(this.percent);
    }
    HP.prototype.cleanup = function () {
        this.base_sprite.remove();
        this.current_sprite.remove();
        this.update_sprite.remove();
        this.name.remove();
        this.percent.remove();
    };
    HP.prototype.damage = function (dmg) {
        this.current_hp -= dmg;
        if (this.current_hp < 0)
            this.current_hp = 0;
        this.percent.data = parseFloat("" + Math.floor((this.current_hp / this.max_hp) * 1000) * 0.1).toFixed(2) + "%";
        this.percent.update();
    };
    HP.prototype.hide = function () {
        this.base_sprite.enabled = false;
        this.current_sprite.enabled = false;
        this.update_sprite.enabled = false;
        this.name.enabled = false;
        this.percent.enabled = false;
    };
    HP.prototype.update = function (delta) {
        this.current_sprite.width = 400 * (this.current_hp / this.max_hp);
        this.update_sprite.x = this.current_sprite.x + 400 * (this.current_hp / this.max_hp);
        this.update_sprite.width = 400 * ((this.last_update_hp - this.current_hp) / this.max_hp);
        if (this.last_update_hp > this.current_hp) {
            var d = (this.last_update_hp - this.current_hp);
            var step = 10 * (d / Math.abs(d)) * delta;
            if (this.last_update_hp - step < this.current_hp)
                this.last_update_hp = this.current_hp;
            else
                this.last_update_hp -= step;
        }
    };
    return HP;
})();
//# sourceMappingURL=hp.js.map