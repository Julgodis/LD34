var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ActionType;
(function (ActionType) {
    ActionType[ActionType["None"] = 0] = "None";
    ActionType[ActionType["BeginWalk"] = 1] = "BeginWalk";
    ActionType[ActionType["EndWalk"] = 2] = "EndWalk";
    ActionType[ActionType["Turn"] = 3] = "Turn";
    ActionType[ActionType["Jump"] = 4] = "Jump";
    ActionType[ActionType["Dash"] = 5] = "Dash";
    ActionType[ActionType["BasicPunch"] = 6] = "BasicPunch";
    ActionType[ActionType["CirclePunch"] = 7] = "CirclePunch";
    ActionType[ActionType["JumpPunch"] = 8] = "JumpPunch";
})(ActionType || (ActionType = {}));
;
function combo_check_basic(player, index, cb) {
    return combo_data[cb][2] <= 0;
}
function combo_check_jump(player, index, cb) {
    if (index >= 1)
        return !player.onGround && combo_data[cb][2] <= 0;
    else
        return player.onGround && combo_data[cb][2] <= 0;
}
var combos = [
    [[ActionType.Turn, ActionType.Turn], ActionType.Jump, 0.5, combo_check_basic, "JUMP", 0],
    [[ActionType.BeginWalk, ActionType.BeginWalk, ActionType.BeginWalk], ActionType.Dash, 0.3, combo_check_basic, "DASH", 1],
    [[ActionType.BeginWalk, ActionType.Turn], ActionType.BasicPunch, 0.2, combo_check_basic, "FIST", 0],
    [[ActionType.BasicPunch, ActionType.BasicPunch], ActionType.CirclePunch, 0.5, combo_check_basic, "ENERGY PUSH", 3.5],
    [[ActionType.Jump, ActionType.Jump, ActionType.Turn], ActionType.JumpPunch, 0.6, combo_check_jump, "CANNONBALL", 2],
];
var combo_data = [
    [-1, 0, 0],
    [-1, 0, 0],
    [-1, 0, 0],
    [-1, 0, 0],
    [-1, 0, 0],
];
var PlayerAnimationState;
(function (PlayerAnimationState) {
    PlayerAnimationState[PlayerAnimationState["None"] = 0] = "None";
    PlayerAnimationState[PlayerAnimationState["BPunch"] = 1] = "BPunch";
    PlayerAnimationState[PlayerAnimationState["CPunch"] = 2] = "CPunch";
    PlayerAnimationState[PlayerAnimationState["JPunch"] = 3] = "JPunch";
})(PlayerAnimationState || (PlayerAnimationState = {}));
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(position, size) {
        _super.call(this, position, size);
        this.moveDirection = 1;
        this.moving = 0;
        this.speed = 0.5;
        this.jump_count = 0;
        this.cc = 0;
        this.level = 0;
        this.dead = false;
        this.jump_punch = false;
        this.attack_particles = new ParticleEmitter(context.passes[0], new vec2([5, 5]));
        this.attack_particles.position = new vec2([450 * ppm, 300 * ppm]);
        this.attack_particles.relative_position = new vec2([0, 0]);
        this.attack_particles.relative_random_position = new vec2([0.1, 0.1]);
        this.attack_particles.velocity = new vec2([0.0, 0.0]);
        this.attack_particles.random_velocity = new vec2([0.0, 0.0]);
        this.attack_particles.color1 = new vec4([43 / 255.0, 218 / 255.0, 255 / 255.0, 1]);
        this.attack_particles.color2 = new vec4([43 / 255.0, 218 / 255.0, 255 / 255.0, 0]);
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
        this.blood_system = setup_blood_emitter();
        this.animation = new AnimationManager();
        this.animation_state = PlayerAnimationState.None;
    }
    Player.prototype.initialize_animations = function (ewidth, eheight, width, height) {
        this.animation.sprite = this.sprite;
        this.animation.coord_width = ewidth / width;
        this.animation.coord_height = eheight / height;
    };
    Player.prototype.initialize_health = function (hp_position, pass) {
        this.hp = new HP("You", 100, hp_position);
        pass.addSprite(this.hp.base_sprite);
        pass.addSprite(this.hp.current_sprite);
        pass.addSprite(this.hp.update_sprite);
    };
    Player.prototype.cleanup = function () {
        this.sprite.remove();
        if (this.hp != null)
            this.hp.cleanup();
        this.blood_system.cleanup();
        this.attack_particles.cleanup();
    };
    Player.prototype.attacked = function (time, delta, damage) {
        data.sounds["hurt"].sound.play();
        this.hp.damage(damage);
        this.cc += 0.1 * (damage / 10 + 1);
        player_damage_time = player_damage_maxtime;
        var strength = 5 * (damage / 10 + 1);
        var punch_velocity = new vec2([this.moveDirection * Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4) * 0.5]);
        punch_velocity.mul(strength);
        this.velocity.add(punch_velocity);
        this.blood_system.velocity = new vec2([this.moveDirection * Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4)]);
        this.blood_system.spawn_max = 30;
        this.blood_system.position = this.position.copy().add(this.size.copy().mul(0.5 * ppm));
        this.blood_system.spawn(time, delta);
    };
    Player.prototype.bpunch_damage = function () {
        return 4;
    };
    Player.prototype.cpunch_damage = function () {
        return 7 + (Math.random() - 0.5) * 4;
    };
    Player.prototype.jpunch_damage = function () {
        return 7 + (Math.random() - 0.5) * 8;
    };
    return Player;
})(GameObject);
//# sourceMappingURL=player.js.map