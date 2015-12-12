
class Particle {
    position: vec2;
    velocity: vec2;
    color: vec4;
    texture: Texture;
    life: number;
    sprite: Sprite;
}

class ParticleEmitter {
    sprites: Sprite[];
    particles: Particle[];
    dead: number[];

    pass: Pass;

    spawn_rate: number; // -1, all at the same time
    spawn_count: number;
    spawn_max: number;
    lifetime: number;

    size: vec2;

    position: vec2;
    relative_position: vec2;
    relative_random_position: vec2;

    color: vec4;
    random_color: vec4;

    velocity: vec2;
    random_velocity: vec2;

    textures: Texture[];

    constructor(pass: Pass, size: vec2) {
        this.pass = pass;
        this.size = size;
        this.sprites = [];
        this.particles = [];
        this.dead = [];
    }

    spawn_particle(time: number) {

        var p_position = new vec2([2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5)]);
        p_position.mul(this.relative_random_position);
        p_position.add(this.relative_position);
        p_position.add(this.position);

        var p_color = new vec4([2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5), 1])
        p_color.mul(this.random_color);
        p_color.add(this.color);

        var p_velocity = new vec2([2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5)])
        p_velocity.mul(this.random_velocity);
        p_velocity.add(this.velocity);

        var p_texture = this.textures[Math.floor(Math.random() * this.textures.length)];

        if (this.dead.length > 0) {
            var index = this.dead[0];
            this.dead.splice(0, 1);

            this.sprites[index].textures = [p_texture];

            this.particles[index].position = p_position;
            this.particles[index].velocity = p_velocity;
            this.particles[index].color = p_color;
            this.particles[index].texture = p_texture;
            this.particles[index].life = time + this.lifetime;
            this.particles[index].sprite = sprite;

            this.spawn_count++;

        } else {

            var sprite = new Sprite(0, 0, 0, this.size.x, this.size.y);
            sprite.textures = [p_texture];

            var particle = new Particle();
            particle.position = p_position;
            particle.velocity = p_velocity;
            particle.color = p_color;
            particle.texture = p_texture;
            particle.life = time + this.lifetime;
            particle.sprite = sprite;

            this.pass.addSprite(sprite);
            this.sprites[this.spawn_count] = sprite;
            this.particles[this.spawn_count] = particle;
            this.spawn_count++;
        }
    }

    spawn(time: number) {
        
        if (this.spawn_max < 0 || this.spawn_count < this.spawn_max) {
            if (this.spawn_rate == 0) return;
            if (this.spawn_rate < 0) {
                for (var i = 0; i < this.spawn_max - this.spawn_count; i++) {
                    this.spawn_particle(time);
                }
            } else {

            }
        }
    }

    update(delta: number, gravity) {
        for (var index in this.particles) {
            var particle = this.particles[index];

            particle.velocity.add(gravity);
            particle.position.add(particle.velocity.copy().mul(delta));

            particle.sprite.color = particle.color;

            var matrix = mat3.makeIdentity();
            matrix.multiply(mat3.makeTranslate(particle.position.x * mpp, particle.position.y * mpp));
            particle.sprite.matrix = matrix;
        }
    }
}