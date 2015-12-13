

class Animation {
    name: string;

    height_index: number;
    frames: number;
    frame_time: number[];

    current_frame: number;
    next_frame_time: number;

    repeat: boolean;
    repeat_count: number;

    constructor(name: string, height_index: number, frames: number, frame_time: number[]) {
        this.name = name;
        this.height_index = height_index;
        this.frames = frames;
        this.frame_time = frame_time;
        this.repeat = true;
        this.current_frame = -1;
        this.next_frame_time = 0;
        this.repeat_count = 0;
    }

    update(time: number, delta: number) {
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
            } else if (this.current_frame >= this.frames)
                this.current_frame--;
            else
                this.next_frame_time = time + this.frame_time[this.current_frame];
        }
    }

    reset() {
        this.current_frame = -1;
        this.next_frame_time = 0;
        this.repeat_count = 0;
    }
}


class AnimationManager {
    sprite: Sprite;

    coord_width: number;
    coord_height: number;

    animations: { [id: string]: Animation };
    current_animation: string;

    animate: boolean = true;

    constructor() {
        this.animations = {};
        this.current_animation = null;
        this.sprite = null;
    }

    update(time: number, delta: number) {
        var animation = this.animations[this.current_animation];
        if (animation == null) return;

        if(this.animate) 
            animation.update(time, delta);

        this.sprite.texCoords = new vec4([
            this.coord_width * (animation.current_frame < 0 ? 0 : animation.current_frame),
            this.coord_height * animation.height_index,
            this.coord_width - 0.01,
            this.coord_height]);
    }

    play(name: string): Animation {
        if (this.animations[name] == null)
            return null;

        if (this.animations[this.current_animation] != null)
            this.animations[this.current_animation].reset();

        this.current_animation = name;
        return this.animations[this.current_animation];
    }


    play_ifn(name: string): Animation {
        if (this.current_animation == name)
            return this.animations[this.current_animation];
        
        return this.play(name);
    }

    add_animation(name: string, height_index: number, frames: number, frame_time: number[], repeat: boolean = false) {
        var animation = new Animation(name, height_index, frames, frame_time);
        animation.repeat = repeat;
        this.animations[name] = animation;
    }
}