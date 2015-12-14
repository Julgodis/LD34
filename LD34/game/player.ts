enum ActionType {
    None,
    BeginWalk,
    EndWalk,
    Turn,
    Jump,
    Dash,
    BasicPunch,
    CirclePunch,
    JumpPunch
};

interface ComboCheck {
    (player: Player, index: number, cb: number): boolean;
}

function combo_check_basic(player: Player, index: number, cb: number) {
    return combo_data[cb][2] <= 0;
}

function combo_check_jump(player: Player, index: number, cb: number) {
    if (index >= 1)
        return !player.onGround && combo_data[cb][2] <= 0;
    else
        return player.onGround && combo_data[cb][2] <= 0;
}

var combos: [ActionType[], ActionType, number, ComboCheck, string, number][] = [
    [[ActionType.Turn, ActionType.Turn], ActionType.Jump, 0.5, combo_check_basic, "JUMP", 0],
    [[ActionType.BeginWalk, ActionType.BeginWalk, ActionType.BeginWalk], ActionType.Dash, 0.3, combo_check_basic, "DASH", 1],
    [[ActionType.BeginWalk, ActionType.Turn], ActionType.BasicPunch, 0.2, combo_check_basic, "FIST", 0],
    [[ActionType.BasicPunch, ActionType.BasicPunch], ActionType.CirclePunch, 0.5, combo_check_basic, "ENERGY PUSH", 3.5],
    [[ActionType.Jump, ActionType.Jump, ActionType.Turn], ActionType.JumpPunch, 0.6, combo_check_jump, "CANNONBALL", 2],
];

var combo_data: [number, number, number][] = [
    [-1, 0, 0],
    [-1, 0, 0],
    [-1, 0, 0],
    [-1, 0, 0],
    [-1, 0, 0],
];

enum PlayerAnimationState {
    None,
    BPunch,
    CPunch,
    JPunch
}

class Player extends GameObject {
    moveDirection: number = 1;
    moving: number = 0;
    speed: number = 0.5;
    jump_count: number = 0;
    cc: number = 0;
    level: number = 0;
    dead: boolean = false;

    hp: HP;

    jump_punch: boolean = false;
    blood_system: ParticleEmitter;
    attack_particles: ParticleEmitter;

    animation: AnimationManager;
    animation_state: PlayerAnimationState;

    constructor(position: vec2, size: vec2) {
        super(position, size);

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
        this.attack_particles.on_ground = ((particle: Particle) => { particle.scale_velocity = 0; });
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

    initialize_animations(ewidth: number, eheight: number, width: number, height: number) {
        this.animation.sprite = this.sprite;
        this.animation.coord_width = ewidth / width;
        this.animation.coord_height = eheight / height;
    }

    initialize_health(hp_position: vec2, pass: Pass) {
        this.hp = new HP("You", 100, hp_position);
        pass.addSprite(this.hp.base_sprite);
        pass.addSprite(this.hp.current_sprite);
        pass.addSprite(this.hp.update_sprite);
    }

    cleanup() {
        this.sprite.remove();
        if(this.hp != null) this.hp.cleanup();
        this.blood_system.cleanup();
        this.attack_particles.cleanup();
    }

    attacked(time: number, delta: number, damage: number) {
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
    }

    bpunch_damage(): number {
        return 4;
    }

    cpunch_damage(): number {
        return 7 + (Math.random() - 0.5) * 4;
    }

    jpunch_damage(): number {
        return 7 + (Math.random() - 0.5) * 8;
    }
}