
enum BotAnimationState {
    None,
    Fist,
}

class Bot extends GameObject {
    moveDirection: number = 1;
    moving: number = 0;
    speed: number = 5.5;
    cc: number = 0;

    hp: HP;
    dead: boolean = false;

    blood_system: ParticleEmitter;
    attack_particles: ParticleEmitter;

    animation: AnimationManager;
    animation_state: BotAnimationState;
    hp_start: number = 100;

    constructor(position: vec2, size: vec2) {
        super(position, size);
        this.blood_system = setup_blood_emitter();
        this.animation = new AnimationManager();
        this.animation_state = BotAnimationState.None;
    }

    initialize_animations(ewidth: number, eheight: number, width: number, height: number) {
        this.animation.sprite = this.sprite;
        this.animation.coord_width = ewidth / width;
        this.animation.coord_height = eheight / height;
    }


    initialize_health(name: string, hp_position: vec2, pass: Pass) {
        this.hp = new HP(name, this.hp_start, hp_position);
        pass.addSprite(this.hp.base_sprite);
        pass.addSprite(this.hp.current_sprite);
        pass.addSprite(this.hp.update_sprite);
    }

    attacked(damage: number) {
        data.sounds["hurt"].sound.play();
        this.hp.damage(damage);
        this.cc += 0.1 * (damage / 10 + 1);
    }

    update(time: number, delta: number, player: Player): boolean { return false; }

    setup_attack_particles(color: vec4) {

        this.attack_particles = new ParticleEmitter(context.passes[0], new vec2([5, 5]));
        this.attack_particles.position = new vec2([450 * ppm, 300 * ppm]);
        this.attack_particles.relative_position = new vec2([0, 0]);
        this.attack_particles.relative_random_position = new vec2([0.1, 0.1]);

        this.attack_particles.velocity = new vec2([0.0, 0.0]);
        this.attack_particles.random_velocity = new vec2([0.0, 0.0]);

        this.attack_particles.color1 = color;
        this.attack_particles.color2 = new vec4([color.x, color.y, color.z, 0]);
        this.attack_particles.random_color1 = new vec4([0.1, 0.1, 0.1, 0]);
        this.attack_particles.random_color2 = new vec4([0.1, 0.1, 0.1, 0]);

        this.attack_particles.rotation = Math.PI / 4;
        this.attack_particles.random_rotation = 1;
        this.attack_particles.rotation_velocity = 1;
        this.attack_particles.random_rotation_velocity = 1.0;

        this.attack_particles.scale = 1.0;
        this.attack_particles.random_scale = 0.05;
        this.attack_particles.scale_velocity = -0.2;
        this.attack_particles.random_scale_velocity = 0.1;
        this.attack_particles.on_ground = ((particle: Particle) => { particle.scale_velocity = 0; });
        this.attack_particles.gravity_effect = 0.4;

        this.attack_particles.lifetime = 0.8;
        this.attack_particles.spawn_max = 100;
        this.attack_particles.spawn_count = 0;
        this.attack_particles.spawn_rate = -1;
        this.attack_particles.textures = [data.textures["particle"].texture];
    }

    cleanup() {
        this.sprite.remove();
        this.hp.cleanup();
        this.blood_system.cleanup();
        this.attack_particles.cleanup();
    }
}

class DummyBot extends Bot {
    constructor(position: vec2, size: vec2) {
        super(position, size);

        this.setup_attack_particles(new vec4([1, 0, 1, 1]));
    }

    update(time: number, delta: number, player: Player): boolean {
        var d = player.position.copy().sub(this.position);
        this.moveDirection = (d.x > 0 ? 1 : (d.x < 0 ? -1 : this.moveDirection));
        return false;
    }
}

class RandomBot extends Bot {
    dash: number = 0;
    jump: number = 0;
    attack: number = 0;

    basic_punch_damage: number = 4;
    basic_punch_damage_random: number = 1;

    constructor(position: vec2, size: vec2) {
        super(position, size);

        this.hp_start = 100;
        this.speed = 10;
        this.setup_attack_particles(new vec4([1, 0, 1, 1]));
    }

    update(time: number, delta: number, player: Player): boolean {
        var hit = false;
        var d = player.position.copy().sub(this.position);
        this.moveDirection = (d.x > 0 ? 1 : (d.x < 0 ? -1 : this.moveDirection));

        var distance = d.length();

        this.dash -= delta;
        this.jump -= delta;
        this.attack -= delta;
        this.cc -= delta;

        if (this.cc > 0) return hit;
        if (this.cc < 0) this.cc = 0;

        if (distance < this.size.x * 0.45 * ppm) {
            if (Math.random() < 0.3 && this.onGround && this.jump <= 0) {
                this.velocity.add(new vec2([0, -5]));
                this.jump = 8 + Math.random() * 2;
            }

            if (this.attack <= 0 && Math.random() > 0.8) {
                this.animation_state = BotAnimationState.Fist;
                this.animation.play_ifn("fist");
                player.attacked(time, delta, this.basic_punch_damage + this.basic_punch_damage_random * (Math.random() - 0.5));
                this.attack = 4;
                hit = true;
            }

        } else {
            var speed = this.speed;
            if (!this.onGround)
                speed *= 0.4;

            var direction = d.copy().div(distance).mul(speed);
            if (distance > 100 * ppm && this.dash <= 0) {
                this.velocity.x += 4800 * this.moveDirection;
                this.velocity.y -= 0.5;
                this.dash = 4 + Math.random();
            }

            this.velocity.add((new vec2([1, 0])).mul(direction).mul(delta));

            if (Math.random() < 0.2 && this.onGround && this.jump <= 0) {
                this.velocity.add(new vec2([0, -5]));
                this.jump = 8 + Math.random() * 2;
            }
        }

        return hit;
    }
}



class GodBot extends Bot {
    dash: number = 0;
    jump: number = 0;
    attack: number = 0;

    basic_punch_damage: number = 7;
    basic_punch_damage_random: number = 3;

    constructor(position: vec2, size: vec2) {
        super(position, size);

        this.hp_start = 100;
        this.speed = 10;
        this.setup_attack_particles(new vec4([1, 0, 1, 1]));
    } 

    update(time: number, delta: number, player: Player): boolean {
        var hit = false;
        var d = player.position.copy().sub(this.position);
        this.moveDirection = (d.x > 0 ? 1 : (d.x < 0 ? -1 : this.moveDirection));

        var distance = d.length();

        this.dash -= delta;
        this.jump -= delta;
        this.attack -= delta;
        this.cc -= delta;

        if (this.cc > 0) return hit;
        if (this.cc < 0) this.cc = 0;

        if (distance < this.size.x * 0.45 * ppm) {
            if (Math.random() < 0.3 && this.onGround && this.jump <= 0) {
                this.velocity.add(new vec2([0, -5]));
                this.jump = 5 + Math.random() * 2;
            }

            if (this.attack <= 0 && Math.random() > 0.8) {
                this.animation_state = BotAnimationState.Fist;
                this.animation.play_ifn("fist");
                player.attacked(time, delta, this.basic_punch_damage + this.basic_punch_damage_random * (Math.random() - 0.5));
                this.attack = 2;
                hit = true;
            }

        } else {
            var speed = this.speed;
            if (!this.onGround)
                speed *= 0.4;

            var direction = d.copy().div(distance).mul(speed);
            if (distance > 100 * ppm && this.dash <= 0) {
                this.velocity.x += 4800 * this.moveDirection;
                this.velocity.y -= 0.5;
                this.dash = 2 + Math.random();
            }

            this.velocity.add((new vec2([1, 0])).mul(direction).mul(delta));

            if (Math.random() < 0.2 && this.onGround && this.jump <= 0) {
                this.velocity.add(new vec2([0, -5]));
                this.jump = 5 + Math.random() * 2;
            }
        }

        return hit;
    }
}


class ChunkNorrisBot extends Bot {
    dash: number = 0;
    jump: number = 0;
    attack: number = 0;

    basic_punch_damage: number = 6;
    basic_punch_damage_random: number = 2;

    constructor(position: vec2, size: vec2) {
        super(position, size);

        this.hp_start = 250;
        this.speed = 15;
        this.setup_attack_particles(new vec4([1, 0, 1, 1]));
    }

    update(time: number, delta: number, player: Player): boolean {
        var hit = false;
        var d = player.position.copy().sub(this.position);
        this.moveDirection = (d.x > 0 ? 1 : (d.x < 0 ? -1 : this.moveDirection));

        var distance = d.length();

        this.dash -= delta;
        this.jump -= delta;
        this.attack -= delta;
        this.cc -= delta;

        if (this.cc > 0) return hit;
        if (this.cc < 0) this.cc = 0;


        if (distance < this.size.x * 0.45 * ppm) {
            if (Math.random() < 0.3 && this.onGround && this.jump <= 0) {
                this.velocity.add(new vec2([0, -5]));
                this.jump = 5 + Math.random() * 2;
            }

            if (this.attack <= 0 && Math.random() > 0.8) {
                this.animation_state = BotAnimationState.Fist;
                this.animation.play_ifn("fist");
                player.attacked(time, delta, this.basic_punch_damage + this.basic_punch_damage_random * (Math.random() - 0.5));
                this.attack = 1;
                hit = true;

                repate_function(data, (i, data) => {
                    this.attack_particles.lifetime = 0.5;
                    this.attack_particles.random_velocity = new vec2([0, 0]);
                    this.attack_particles.velocity = new vec2([this.moveDirection * 2, 0]);
                    this.attack_particles.position = this.position.copy().add(this.size.copy().mul(0.5 * ppm));
                    this.attack_particles.relative_random_position = this.size.copy().mul(0.5 * ppm).mul(new vec2([1, 1]));
                    this.attack_particles.spawn_max = 2;
                    this.attack_particles.spawn(time, delta);
                }, 10, delta)
            }

        } else {
            var speed = this.speed;
            if (!this.onGround)
                speed *= 0.4;

            var direction = d.copy().div(distance).mul(speed);
            if (distance > 100 * ppm && this.dash <= 0) {
                this.velocity.x += 4800 * this.moveDirection;
                this.velocity.y -= 0.5;
                this.dash = 2 + Math.random();
            }

            this.velocity.add((new vec2([1, 0])).mul(direction).mul(delta));

            if (Math.random() < 0.2 && this.onGround && this.jump <= 0) {
                this.velocity.add(new vec2([0, -5]));
                this.jump = 2 + Math.random() * 2;
            }
        }

        return hit;
    }
}


class JohnCenaBot extends Bot {
    dash: number = 0;
    jump: number = 0;
    attack: number = 0;

    basic_punch_damage: number = 7;
    basic_punch_damage_random: number = 4;

    constructor(position: vec2, size: vec2) {
        super(position, size);

        this.hp_start = 450;
        this.speed = 23;
        this.setup_attack_particles(new vec4([1, 0, 1, 1]));
    }

    update(time: number, delta: number, player: Player): boolean {
        var hit = false;
        var d = player.position.copy().sub(this.position);
        this.moveDirection = (d.x > 0 ? 1 : (d.x < 0 ? -1 : this.moveDirection));

        var distance = d.length();

        this.dash -= delta;
        this.jump -= delta;
        this.attack -= delta;
        this.cc -= delta;

        if (this.cc > 0) return hit;
        if (this.cc < 0) this.cc = 0;

        this.attack_particles.lifetime = 0.5;
        this.attack_particles.random_velocity = new vec2([0.2, 0.2]);
        this.attack_particles.velocity = this.velocity.copy().mul(-1);
        this.attack_particles.position = this.position.copy().add(this.size.copy().mul(0.5 * ppm));
        this.attack_particles.relative_random_position = this.size.copy().mul(0.5 * ppm).mul(new vec2([1, 1]));
        this.attack_particles.spawn_max = 2;
        this.attack_particles.spawn(time, delta);

        if (distance < this.size.x * 0.45 * ppm) {
            if (Math.random() < 0.3 && this.onGround && this.jump <= 0) {
                this.velocity.add(new vec2([0, -5]));
                this.jump = 3 + Math.random() * 1;
            }

            if (this.attack <= 0 && Math.random() > 0.8) {
                this.animation_state = BotAnimationState.Fist;
                this.animation.play_ifn("fist");
                player.attacked(time, delta, this.basic_punch_damage + this.basic_punch_damage_random * (Math.random() - 0.5));
                this.attack = 1;
                hit = true;

                repate_function(data, (i, data) => {
                    this.attack_particles.lifetime = 0.5;
                    this.attack_particles.random_velocity = new vec2([0, 0]);
                    this.attack_particles.velocity = new vec2([this.moveDirection * 2, 0]);
                    this.attack_particles.position = this.position.copy().add(this.size.copy().mul(0.5 * ppm));
                    this.attack_particles.relative_random_position = this.size.copy().mul(0.5 * ppm).mul(new vec2([1, 1]));
                    this.attack_particles.spawn_max = 2;
                    this.attack_particles.spawn(time, delta);
                }, 20, delta)
            }

        } else {
            var speed = this.speed;
            if (!this.onGround)
                speed *= 0.4;

            var direction = d.copy().div(distance).mul(speed);
            if (distance > 100 * ppm && this.dash <= 0) {
                this.velocity.x += 4800 * this.moveDirection;
                this.velocity.y -= 0.5;
                this.dash = 2 + Math.random();
            }

            this.velocity.add((new vec2([1, 0])).mul(direction).mul(delta));

            if (Math.random() < 0.2 && this.onGround && this.jump <= 0) {
                this.velocity.add(new vec2([0, -5]));
                this.jump = 2 + Math.random() * 1;
            }
        }

        return hit;
    }
}