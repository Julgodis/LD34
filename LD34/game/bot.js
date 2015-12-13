var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BotAnimationState;
(function (BotAnimationState) {
    BotAnimationState[BotAnimationState["None"] = 0] = "None";
    BotAnimationState[BotAnimationState["Fist"] = 1] = "Fist";
})(BotAnimationState || (BotAnimationState = {}));
var Bot = (function (_super) {
    __extends(Bot, _super);
    function Bot(position, size) {
        _super.call(this, position, size);
        this.moveDirection = 1;
        this.moving = 0;
        this.speed = 5.5;
        this.cc = 0;
        this.dead = false;
        this.hp_start = 1;
        this.blood_system = setup_blood_emitter();
        this.animation = new AnimationManager();
        this.animation_state = BotAnimationState.None;
    }
    Bot.prototype.initialize_animations = function (ewidth, eheight, width, height) {
        this.animation.sprite = this.sprite;
        this.animation.coord_width = ewidth / width;
        this.animation.coord_height = eheight / height;
    };
    Bot.prototype.initialize_health = function (name, hp_position, pass) {
        this.hp = new HP(name, this.hp_start, hp_position);
        pass.addSprite(this.hp.base_sprite);
        pass.addSprite(this.hp.current_sprite);
        pass.addSprite(this.hp.update_sprite);
    };
    Bot.prototype.attacked = function (damage) {
        data.sounds["hurt"].sound.play();
        this.hp.damage(damage);
        this.cc += 0.1 * (damage / 10 + 1);
    };
    Bot.prototype.update = function (time, delta, player) { return false; };
    Bot.prototype.setup_attack_particles = function (color) {
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
        this.attack_particles.on_ground = (function (particle) { particle.scale_velocity = 0; });
        this.attack_particles.gravity_effect = 0.4;
        this.attack_particles.lifetime = 0.8;
        this.attack_particles.spawn_max = 100;
        this.attack_particles.spawn_count = 0;
        this.attack_particles.spawn_rate = -1;
        this.attack_particles.textures = [data.textures["particle"].texture];
    };
    Bot.prototype.cleanup = function () {
        this.sprite.remove();
        this.hp.cleanup();
        this.blood_system.cleanup();
        this.attack_particles.cleanup();
    };
    return Bot;
})(GameObject);
var DummyBot = (function (_super) {
    __extends(DummyBot, _super);
    function DummyBot(position, size) {
        _super.call(this, position, size);
        this.setup_attack_particles(new vec4([1, 0, 1, 1]));
    }
    DummyBot.prototype.update = function (time, delta, player) {
        var d = player.position.copy().sub(this.position);
        this.moveDirection = (d.x > 0 ? 1 : (d.x < 0 ? -1 : this.moveDirection));
        return false;
    };
    return DummyBot;
})(Bot);
var GodBot = (function (_super) {
    __extends(GodBot, _super);
    function GodBot(position, size) {
        _super.call(this, position, size);
        this.dash = 0;
        this.jump = 0;
        this.attack = 0;
        this.basic_punch_damage = 5;
        this.basic_punch_damage_random = 3;
        this.hp_start = 100;
        this.speed = 10;
        this.setup_attack_particles(new vec4([1, 0, 1, 1]));
    }
    GodBot.prototype.update = function (time, delta, player) {
        var hit = false;
        var d = player.position.copy().sub(this.position);
        this.moveDirection = (d.x > 0 ? 1 : (d.x < 0 ? -1 : this.moveDirection));
        var distance = d.length();
        this.dash -= delta;
        this.jump -= delta;
        this.attack -= delta;
        this.cc -= delta;
        if (this.cc > 0)
            return hit;
        if (this.cc < 0)
            this.cc = 0;
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
        }
        else {
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
    };
    return GodBot;
})(Bot);
var ChunkNorrisBot = (function (_super) {
    __extends(ChunkNorrisBot, _super);
    function ChunkNorrisBot(position, size) {
        _super.call(this, position, size);
        this.dash = 0;
        this.jump = 0;
        this.attack = 0;
        this.basic_punch_damage = 6;
        this.basic_punch_damage_random = 2;
        this.hp_start = 250;
        this.speed = 15;
        this.setup_attack_particles(new vec4([1, 0, 1, 1]));
    }
    ChunkNorrisBot.prototype.update = function (time, delta, player) {
        var _this = this;
        var hit = false;
        var d = player.position.copy().sub(this.position);
        this.moveDirection = (d.x > 0 ? 1 : (d.x < 0 ? -1 : this.moveDirection));
        var distance = d.length();
        this.dash -= delta;
        this.jump -= delta;
        this.attack -= delta;
        this.cc -= delta;
        if (this.cc > 0)
            return hit;
        if (this.cc < 0)
            this.cc = 0;
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
                repate_function(data, function (i, data) {
                    _this.attack_particles.lifetime = 0.5;
                    _this.attack_particles.random_velocity = new vec2([0, 0]);
                    _this.attack_particles.velocity = new vec2([_this.moveDirection * 2, 0]);
                    _this.attack_particles.position = _this.position.copy().add(_this.size.copy().mul(0.5 * ppm));
                    _this.attack_particles.relative_random_position = _this.size.copy().mul(0.5 * ppm).mul(new vec2([1, 1]));
                    _this.attack_particles.spawn_max = 2;
                    _this.attack_particles.spawn(time, delta);
                }, 10, delta);
            }
        }
        else {
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
    };
    return ChunkNorrisBot;
})(Bot);
var JohnCenaBot = (function (_super) {
    __extends(JohnCenaBot, _super);
    function JohnCenaBot(position, size) {
        _super.call(this, position, size);
        this.dash = 0;
        this.jump = 0;
        this.attack = 0;
        this.basic_punch_damage = 7;
        this.basic_punch_damage_random = 4;
        this.hp_start = 450;
        this.speed = 23;
        this.setup_attack_particles(new vec4([1, 0, 1, 1]));
    }
    JohnCenaBot.prototype.update = function (time, delta, player) {
        var _this = this;
        var hit = false;
        var d = player.position.copy().sub(this.position);
        this.moveDirection = (d.x > 0 ? 1 : (d.x < 0 ? -1 : this.moveDirection));
        var distance = d.length();
        this.dash -= delta;
        this.jump -= delta;
        this.attack -= delta;
        this.cc -= delta;
        if (this.cc > 0)
            return hit;
        if (this.cc < 0)
            this.cc = 0;
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
                this.jump = 5 + Math.random() * 2;
            }
            if (this.attack <= 0 && Math.random() > 0.8) {
                this.animation_state = BotAnimationState.Fist;
                this.animation.play_ifn("fist");
                player.attacked(time, delta, this.basic_punch_damage + this.basic_punch_damage_random * (Math.random() - 0.5));
                this.attack = 1;
                hit = true;
                repate_function(data, function (i, data) {
                    _this.attack_particles.lifetime = 0.5;
                    _this.attack_particles.random_velocity = new vec2([0, 0]);
                    _this.attack_particles.velocity = new vec2([_this.moveDirection * 2, 0]);
                    _this.attack_particles.position = _this.position.copy().add(_this.size.copy().mul(0.5 * ppm));
                    _this.attack_particles.relative_random_position = _this.size.copy().mul(0.5 * ppm).mul(new vec2([1, 1]));
                    _this.attack_particles.spawn_max = 2;
                    _this.attack_particles.spawn(time, delta);
                }, 20, delta);
            }
        }
        else {
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
    };
    return JohnCenaBot;
})(Bot);
//# sourceMappingURL=bot.js.map