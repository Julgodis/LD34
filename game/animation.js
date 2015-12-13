var Animation = (function () {
    function Animation(name, height_index, frames, frame_time) {
        this.name = name;
        this.height_index = height_index;
        this.frames = frames;
        this.frame_time = frame_time;
        this.repeat = true;
        this.current_frame = -1;
        this.next_frame_time = 0;
        this.repeat_count = 0;
    }
    Animation.prototype.update = function (time, delta) {
        if (this.current_frame == -1) {
            this.current_frame = 0;
            this.next_frame_time = time + this.frame_time[this.current_frame];
        }
        if (time > this.next_frame_time) {
            this.current_frame++;
            if (this.current_frame >= this.frames && this.repeat) {
                this.current_frame = 0;
                this.repeat_count++;
                this.next_frame_time = time + this.frame_time[this.current_frame];
            }
            else if (this.current_frame >= this.frames)
                this.current_frame--;
            else
                this.next_frame_time = time + this.frame_time[this.current_frame];
        }
    };
    Animation.prototype.reset = function () {
        this.current_frame = -1;
        this.next_frame_time = 0;
        this.repeat_count = 0;
    };
    return Animation;
})();
var AnimationManager = (function () {
    function AnimationManager() {
        this.animate = true;
        this.animations = {};
        this.current_animation = null;
        this.sprite = null;
    }
    AnimationManager.prototype.update = function (time, delta) {
        var animation = this.animations[this.current_animation];
        if (animation == null)
            return;
        if (this.animate)
            animation.update(time, delta);
        this.sprite.texCoords = new vec4([
            this.coord_width * (animation.current_frame < 0 ? 0 : animation.current_frame),
            this.coord_height * animation.height_index,
            this.coord_width - 0.01,
            this.coord_height]);
    };
    AnimationManager.prototype.play = function (name) {
        if (this.animations[name] == null)
            return null;
        if (this.animations[this.current_animation] != null)
            this.animations[this.current_animation].reset();
        this.current_animation = name;
        return this.animations[this.current_animation];
    };
    AnimationManager.prototype.play_ifn = function (name) {
        if (this.current_animation == name)
            return this.animations[this.current_animation];
        return this.play(name);
    };
    AnimationManager.prototype.add_animation = function (name, height_index, frames, frame_time, repeat) {
        if (repeat === void 0) { repeat = false; }
        var animation = new Animation(name, height_index, frames, frame_time);
        animation.repeat = repeat;
        this.animations[name] = animation;
    };
    return AnimationManager;
})();
//# sourceMappingURL=animation.js.map