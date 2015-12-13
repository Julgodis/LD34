var Particle = (function () {
    function Particle() {
    }
    return Particle;
})();
var ParticleEmitter = (function () {
    function ParticleEmitter(pass, size) {
        this.gravity_effect = 1;
        this.pass = pass;
        this.size = size;
        this.particles = [];
        this.dead = [];
    }
    ParticleEmitter.prototype.spawn_particle = function (time, delta) {
        var p_position = new vec2([2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5)]);
        p_position.mul(this.relative_random_position);
        p_position.add(this.relative_position);
        p_position.add(this.position);
        var p_color1 = new vec4([2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5), 1]);
        p_color1.mul(this.random_color1);
        p_color1.add(this.color1);
        var p_color2 = new vec4([2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5), 1]);
        p_color2.mul(this.random_color2);
        p_color2.add(this.color2);
        var p_velocity = new vec2([2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5)]);
        p_velocity.mul(this.random_velocity);
        p_velocity.add(this.velocity);
        var p_rotation = Math.random();
        p_rotation *= this.random_rotation;
        p_rotation += this.rotation;
        var p_rotation_velocity = 2 * (Math.random() - 0.5);
        p_rotation_velocity *= this.random_rotation_velocity;
        p_rotation_velocity += this.rotation_velocity;
        var p_scale = Math.random();
        p_scale *= this.random_scale;
        p_scale += this.scale;
        var p_scale_velocity = 2 * (Math.random() - 0.5);
        p_scale_velocity *= this.random_scale_velocity;
        p_scale_velocity += this.scale_velocity;
        var p_texture = this.textures[Math.floor(Math.random() * this.textures.length)];
        if (this.dead.length > 0) {
            var index = this.dead[0];
            this.dead.splice(0, 1);
            this.particles[index].sprite.textures = [p_texture];
            this.particles[index].sprite.enabled = true;
            this.particles[index].position = p_position;
            this.particles[index].velocity = p_velocity;
            this.particles[index].color1 = p_color1;
            this.particles[index].color2 = p_color2;
            this.particles[index].texture = p_texture;
            this.particles[index].life = time + this.lifetime;
            this.particles[index].rotation = p_rotation;
            this.particles[index].rotation_velocity = p_rotation_velocity;
            this.particles[index].scale = p_scale;
            this.particles[index].scale_velocity = p_scale_velocity;
            this.particles[index].dead = false;
            this.particles[index].lifetime = this.lifetime;
            this.particles[index].sprite.color = this.particles[index].color1;
            this.particles[index].sprite.rotation = this.particles[index].rotation;
            var matrix = mat3.makeIdentity();
            matrix.multiply(mat3.makeScale(this.particles[index].scale, this.particles[index].scale));
            matrix.multiply(mat3.makeTranslate(-this.size.x * 0.5, -this.size.y * 0.5));
            matrix.multiply(mat3.makeRotation(this.particles[index].sprite.rotation));
            matrix.multiply(mat3.makeTranslate(this.size.x * 0.5, this.size.y * 0.5));
            matrix.multiply(mat3.makeTranslate(this.particles[index].position.x * mpp, this.particles[index].position.y * mpp));
            this.particles[index].sprite.matrix = matrix;
            this.spawn_count++;
        }
        else {
            var sprite = new Sprite(0, 0, 0, this.size.x, this.size.y);
            sprite.textures = [p_texture];
            sprite.z = 10;
            var particle = new Particle();
            particle.position = p_position;
            particle.velocity = p_velocity;
            particle.color1 = p_color1;
            particle.color2 = p_color2;
            particle.texture = p_texture;
            particle.life = time + this.lifetime;
            particle.sprite = sprite;
            particle.rotation = p_rotation;
            particle.rotation_velocity = p_rotation_velocity;
            particle.scale = p_scale;
            particle.scale_velocity = p_scale_velocity;
            particle.dead = false;
            particle.lifetime = this.lifetime;
            sprite.color = particle.color1;
            sprite.rotation = particle.rotation;
            var matrix = mat3.makeIdentity();
            matrix.multiply(mat3.makeScale(particle.scale, particle.scale));
            matrix.multiply(mat3.makeTranslate(-this.size.x * 0.5, -this.size.y * 0.5));
            matrix.multiply(mat3.makeRotation(particle.sprite.rotation));
            matrix.multiply(mat3.makeTranslate(this.size.x * 0.5, this.size.y * 0.5));
            matrix.multiply(mat3.makeTranslate(particle.position.x * mpp, particle.position.y * mpp));
            sprite.matrix = matrix;
            this.pass.addSprite(sprite);
            this.particles[this.spawn_count] = particle;
            this.spawn_count++;
        }
    };
    ParticleEmitter.prototype.cleanup = function () {
        for (var index in this.particles) {
            this.particles[index].sprite.remove();
        }
        this.particles = [];
        this.dead = [];
    };
    ParticleEmitter.prototype.spawn = function (time, delta) {
        if (this.spawn_max < 0 || this.spawn_rate < 0 || this.spawn_count < this.spawn_max) {
            if (this.spawn_rate == 0)
                return;
            if (this.spawn_rate < 0) {
                for (var i = 0; i < this.spawn_max; i++) {
                    this.spawn_particle(time, delta);
                }
            }
            else {
            }
        }
    };
    ParticleEmitter.prototype.update = function (time, delta, gravity, ppm) {
        for (var index in this.particles) {
            var particle = this.particles[index];
            if (particle.dead)
                continue;
            if (time > particle.life) {
                this.dead.push(index);
                particle.sprite.enabled = false;
                particle.dead = true;
                continue;
            }
            var g = gravity.copy().mul(this.gravity_effect).mul(delta);
            particle.velocity.add(g);
            particle.position.add(particle.velocity.copy().mul(delta));
            particle.rotation += particle.rotation_velocity * delta;
            particle.scale += particle.scale_velocity * delta;
            if (particle.scale <= 0.1)
                particle.scale = 0.1;
            var ground = false;
            if (particle.position.y > world.w - this.size.y * ppm) {
                particle.position.y = world.w - this.size.y * ppm;
                particle.velocity.y = -1 * 0.3;
                ground = true;
                this.on_ground(particle);
            }
            if (particle.position.x < world.x) {
                particle.position.x = world.x;
                particle.velocity.x *= -1 * 0.5;
            }
            else if (particle.position.x > world.z - this.size.x * ppm) {
                particle.position.x = world.z - this.size.x * ppm;
                particle.velocity.x *= -1 * 0.5;
            }
            particle.sprite.color = lerp_vec4(particle.color1, particle.color2, 1 - (particle.life - time) / particle.lifetime);
            particle.sprite.rotation = particle.rotation;
            if (ground) {
                particle.velocity.x *= Math.pow(0.8, (delta / update_time));
                particle.rotation_velocity *= Math.pow(0.9, (delta / update_time));
            }
            else {
                particle.velocity.x *= Math.pow(0.99, (delta / update_time));
            }
            var matrix = mat3.makeIdentity();
            matrix.multiply(mat3.makeScale(particle.scale, particle.scale));
            matrix.multiply(mat3.makeTranslate(-this.size.x * 0.5, -this.size.y * 0.5));
            matrix.multiply(mat3.makeRotation(particle.sprite.rotation));
            matrix.multiply(mat3.makeTranslate(this.size.x * 0.5, this.size.y * 0.5));
            matrix.multiply(mat3.makeTranslate(particle.position.x * mpp, particle.position.y * mpp));
            particle.sprite.matrix = matrix;
        }
    };
    return ParticleEmitter;
})();
//# sourceMappingURL=particle_system.js.map