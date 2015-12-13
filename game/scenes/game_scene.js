var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Repeat = (function () {
    function Repeat() {
    }
    return Repeat;
})();
var repeats = [];
function repate_function(data, func, times, interval) {
    var rep = new Repeat();
    rep.data = data;
    rep.func = func;
    rep.times = times;
    rep.interval = interval;
    rep.last_time = 0;
    repeats.push(rep);
}
var MatchState;
(function (MatchState) {
    MatchState[MatchState["Loading"] = 0] = "Loading";
    MatchState[MatchState["Inprogress"] = 1] = "Inprogress";
    MatchState[MatchState["Won"] = 2] = "Won";
    MatchState[MatchState["Lose"] = 3] = "Lose";
})(MatchState || (MatchState = {}));
var MatchScene = (function (_super) {
    __extends(MatchScene, _super);
    function MatchScene() {
        _super.call(this);
        this.gravity = new vec2([0, 0.2]);
        this.match_state = MatchState.Loading;
    }
    MatchScene.prototype.setup = function () {
        this.setup_ground_particles();
        this.opponents = [];
        this.objects = [];
        this.repeats = [];
        this.opponents_dead = 0;
    };
    MatchScene.prototype.add_player = function (player) {
        this.player = player;
        this.add_object(this.player);
    };
    MatchScene.prototype.add_opponent = function (opponent) {
        this.opponents.push(opponent);
        this.add_object(opponent);
    };
    MatchScene.prototype.add_object = function (obj) {
        this.objects.push(obj);
    };
    MatchScene.prototype.update = function (time, delta) {
        if (this.match_state == MatchState.Loading)
            this.match_state = MatchState.Inprogress;
        if (this.match_state == MatchState.Loading)
            return;
        for (var index in repeats) {
            var rep = repeats[index];
            if (rep.times == 0)
                return;
            if (time >= rep.last_time) {
                rep.func(rep.times, rep.data);
                rep.last_time = time + rep.interval;
                rep.times--;
            }
        }
        repeats = repeats.filter(function (value, index, array) {
            return value.times != 0;
        });
        if (this.opponents_dead == this.opponents.length) {
            this.match_state = MatchState.Won;
        }
        this.update_player(time, delta);
        for (var index in this.opponents)
            this.update_opponent(time, delta, this.opponents[index]);
        this.update_world(time, delta);
    };
    MatchScene.prototype.resolve_combo_actions = function (action) {
        var combo_actions = [];
        for (var i = 0; i < combos.length; i++) {
            var combo_ac = combos[i][0];
            var combo_max_time = combos[i][2];
            var combo_id = combo_data[i][0];
            var combo_time = combo_data[i][1];
            if ((combo_id == -1 || time - combo_time > combo_max_time) && action == combo_ac[0]) {
                console.log("begin : " + ActionType[combos[i][1]]);
                combo_data[i] = [1, time];
            }
            else if (combo_id != -1) {
                if (time - combo_time > combo_max_time) {
                    console.log("exit  : " + ActionType[combos[i][1]]);
                    combo_data[i] = [-1, 0];
                }
                else if (action == combo_ac[combo_id]) {
                    console.log("update: " + ActionType[combos[i][1]]);
                    combo_data[i] = [combo_id + 1, combo_time + combo_max_time];
                    if (combo_id + 1 >= combo_ac.length) {
                        console.log("do    : " + ActionType[combos[i][1]]);
                        combo_actions.push(combos[i][1]);
                        combo_data[i] = [-1, 0];
                    }
                }
            }
        }
        return combo_actions;
    };
    MatchScene.prototype.update_player = function (time, delta) {
        var _this = this;
        if (this.match_state != MatchState.Inprogress)
            return;
        var action_queue = [];
        if (keyboard.press(39)) {
            action_queue.push(ActionType.BeginWalk);
        }
        else if (keyboard.release(39)) {
            action_queue.push(ActionType.EndWalk);
        }
        if (keyboard.press(32)) {
            action_queue.push(ActionType.Turn);
        }
        if (action_queue.length > 0) {
            var action = action_queue[action_queue.length - 1];
            var new_ca = [];
            var combo_actions = this.resolve_combo_actions(action);
            for (var index in combo_actions) {
                var caction = combo_actions[index];
                var ca = this.resolve_combo_actions(caction);
                if (ca.length > 0) {
                    for (var i in ca)
                        new_ca.push(ca[i]);
                }
                else
                    new_ca.push(caction);
            }
            for (var index in new_ca) {
                action_queue.push(new_ca[index]);
            }
        }
        for (var index in action_queue) {
            var action = action_queue[index];
            if (action != ActionType.None) {
                if (action == ActionType.BeginWalk)
                    this.player.moving = 1;
                else if (action == ActionType.EndWalk)
                    this.player.moving = 0;
                else if (action == ActionType.Dash) {
                    this.player.velocity.x += 5800 * this.player.moveDirection;
                    this.player.velocity.y -= 0.5;
                }
                else if (action == ActionType.JumpPunch) {
                    this.player.velocity.y += 40;
                    this.player.jump_punch = true;
                }
                else if (action == ActionType.Turn)
                    this.player.moveDirection *= -1;
                else if (action == ActionType.Jump) {
                    this.player.jump_count++;
                    this.player.velocity.y -= 5 + (this.player.onGround ? 0 : 2);
                }
                else if (action == ActionType.BasicPunch) {
                    this.player.moveDirection *= -1;
                    console.log("B Punch");
                    for (var id in this.objects) {
                        var obj = this.objects[id];
                        if (obj.remove || obj.isStatic || obj instanceof Player)
                            continue;
                        var dx = obj.position.x - this.player.position.x;
                        var dy = obj.position.y - this.player.position.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= (this.player.size.x * 0.5) * ppm || (dx * this.player.moveDirection > 0 && dist <= (this.player.size.x * 1.5) * ppm)) {
                            var angle = Math.tan(dy / dx);
                            var strength = 5 * (angle / 4 + 1);
                            var punch_velocity = new vec2([this.player.moveDirection * Math.cos(Math.PI / 4), -Math.sin(angle + Math.PI / 4)]);
                            punch_velocity.mul(strength);
                            obj.velocity.add(punch_velocity);
                            var pe = null;
                            if (obj instanceof Bot) {
                                pe = obj.blood_system;
                                obj.attacked(this.player.bpunch_damage());
                                pe.velocity = new vec2([this.player.moveDirection * Math.cos(Math.PI / 4), -Math.sin(angle + Math.PI / 4)]);
                                pe.spawn_max = 30;
                                pe.position = obj.position.copy().add(obj.size.copy().mul(0.5 * ppm));
                                pe.spawn(time);
                            }
                        }
                    }
                }
                else if (action == ActionType.CirclePunch) {
                    this.player.moveDirection *= -1;
                    this.player.velocity.y += 5;
                    console.log("C Punch");
                    for (var id in this.objects) {
                        var obj = this.objects[id];
                        if (obj.remove || obj.isStatic || obj instanceof Player)
                            continue;
                        var dx = obj.position.x - this.player.position.x;
                        var dy = obj.position.y - this.player.position.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= (this.player.size.x * 10) * ppm) {
                            var dt = dist / (this.player.size.x * 10 * ppm);
                            var angle = Math.atan2(-dy, dx);
                            var punch_velocity = new vec2([(16000 + dt * 10000) * Math.cos(angle), -20 * Math.sin(angle)]);
                            obj.velocity.add(punch_velocity);
                            this.player.attack_particles.velocity = new vec2([0, 0]);
                            this.player.attack_particles.random_velocity = new vec2([10, 10]);
                            this.player.attack_particles.position = this.player.position.copy().add(this.player.size.copy().mul(0.5 * ppm));
                            this.player.attack_particles.relative_random_position = this.player.size.copy().mul(0.5 * ppm);
                            this.player.attack_particles.spawn_max = 200;
                            this.player.attack_particles.lifetime = 0.4;
                            this.player.attack_particles.spawn(time);
                            var pe = null;
                            if (obj instanceof Bot) {
                                pe = obj.blood_system;
                                obj.attacked(this.player.cpunch_damage());
                                pe.velocity = new vec2([Math.cos(angle), -Math.sin(Math.PI / 4)]);
                                pe.spawn_max = 10;
                                pe.position = obj.position.copy().add(obj.size.copy().mul(0.5 * ppm));
                                pe.spawn(time);
                            }
                        }
                    }
                }
            }
        }
        this.player.hp.update(updateDt);
        this.player.blood_system.update(time, delta, this.gravity, ppm);
        var walking_velocity = new vec2([1, 0]);
        walking_velocity.mul(this.player.speed);
        walking_velocity.mul(this.player.moving);
        walking_velocity.mul(this.player.moveDirection);
        //walking_velocity.mul(ppm);
        this.player.cc -= delta;
        if (this.player.cc <= 0) {
            this.player.velocity.add(walking_velocity);
            this.player.sprite.flip = (this.player.moveDirection == -1);
        }
        if (this.player.onGround && this.player.jump_punch) {
            this.player.moveDirection *= -1;
            var data = [
                new vec2([0, -3.5]),
                this.player.position.copy().add(new vec2([this.player.size.x * 0.5 * ppm, this.player.size.y * ppm - 10 * ppm])),
                new vec2([(this.player.size.x * 4) * ppm, 0])
            ];
            repate_function(data, function (i, data) {
                _this.player.attack_particles.lifetime = 0.5;
                _this.player.attack_particles.random_velocity = new vec2([0, 0]);
                _this.player.attack_particles.velocity = data[0];
                _this.player.attack_particles.velocity.add(new vec2([0.2 * (Math.random() - 0.5), -(Math.random() - 0.5) * 1]));
                _this.player.attack_particles.position = data[1];
                _this.player.attack_particles.relative_random_position = data[2];
                _this.player.attack_particles.spawn_max = 8;
                _this.player.attack_particles.spawn(time);
                _this.player.attack_particles.velocity = new vec2([0, 0]);
                _this.player.attack_particles.position = data[1];
                _this.player.attack_particles.relative_random_position = data[2];
                _this.player.attack_particles.spawn_max = 8;
                _this.player.attack_particles.spawn(time);
            }, 10, 0);
            for (var id in this.objects) {
                var obj = this.objects[id];
                if (obj.isStatic || obj instanceof Player || !obj.onGround)
                    continue;
                var dx = obj.position.x - this.player.position.x;
                var dy = obj.position.y - this.player.position.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= (this.player.size.x * 4) * ppm) {
                    var punch_velocity = new vec2([0, -8]);
                    obj.velocity.add(punch_velocity);
                    var pe = null;
                    if (obj instanceof Bot) {
                        pe = obj.blood_system;
                        obj.attacked(this.player.jpunch_damage());
                        pe.velocity = new vec2([0, -5]);
                        pe.spawn_max = 15;
                        pe.position = obj.position.copy().add(obj.size.copy().mul(0.5 * ppm));
                        pe.spawn(time);
                    }
                }
            }
            this.player.jump_punch = false;
        }
        this.player.attack_particles.update(time, delta, this.gravity, ppm);
    };
    MatchScene.prototype.update_opponent = function (time, delta, bot) {
        bot.attack_particles.update(time, delta, this.gravity, ppm);
        bot.blood_system.update(time, updateDt, this.gravity, ppm);
        if (this.match_state == MatchState.Inprogress) {
            bot.hp.update(updateDt);
            bot.update(time, delta, this.player);
        }
        if (bot.hp.current_hp <= 0) {
            if (!bot.dead) {
                this.opponents_dead++;
                bot.dead = true;
            }
            var pe = bot.blood_system;
            pe.velocity = new vec2([0, -4]);
            pe.spawn_max = 2;
            pe.position = bot.position.copy().add(bot.size.copy().mul(0.5 * ppm));
            pe.spawn(time);
        }
        bot.sprite.flip = (bot.moveDirection == -1);
    };
    MatchScene.prototype.update_world = function (time, delta) {
        this.ground_particle.update(time, delta, this.gravity, ppm);
        for (var id in this.objects) {
            var obj = this.objects[id];
            if (obj.remove || !obj.isStatic) {
                obj.velocity.add(this.gravity);
                if (obj.onGround)
                    obj.velocity.x *= 0.8;
                else
                    obj.velocity.x *= 0.99;
                var prev_ground = obj.onGround;
                obj.onGround = false;
                if (obj.velocity.x > obj.maxVelocity.x)
                    obj.velocity.x = obj.maxVelocity.x;
                else if (obj.velocity.x < -obj.maxVelocity.x)
                    obj.velocity.x = -obj.maxVelocity.x;
                if (obj.velocity.y > obj.maxVelocity.y)
                    obj.velocity.y = obj.maxVelocity.y;
                else if (obj.velocity.y < -obj.maxVelocity.y)
                    obj.velocity.y = -obj.maxVelocity.y;
                obj.position.add(obj.velocity.copy().mul(updateDt));
                if (obj.position.y > (550 - obj.size.y) * ppm) {
                    obj.position.y = (550 - obj.size.y) * ppm;
                    obj.velocity.y = -1 * 0.1;
                    obj.onGround = true;
                    if (obj.onGround && !prev_ground) {
                        this.ground_particle.velocity = (new vec2([0, -3])).add(obj.velocity.copy().mul(-1 * 0.1));
                        this.ground_particle.position = obj.position.copy().add(new vec2([obj.size.x * 0.5 * ppm, obj.size.y * ppm]));
                        this.ground_particle.relative_random_position = new vec2([obj.size.x * ppm * 0.5, 0]);
                        this.ground_particle.spawn_max = 10;
                        this.ground_particle.spawn(time);
                    }
                }
                if (obj.position.x < 0 * ppm) {
                    obj.position.x = 0 * ppm;
                    obj.velocity.x *= -1 * 0.8;
                }
                else if (obj.position.x > (900 - obj.size.x) * ppm) {
                    obj.position.x = (900 - obj.size.x) * ppm;
                    obj.velocity.x *= -1 * 0.8;
                }
                var matrix = mat3.makeIdentity();
                matrix.multiply(mat3.makeTranslate(obj.position.x * mpp, obj.position.y * mpp));
                obj.sprite.matrix = matrix;
            }
            if (obj.remove) {
                if (obj.sprite != null) {
                    context.passes[0].removeSprite(obj.sprite);
                }
                if (obj instanceof Bot) {
                    var bot = obj;
                    context.passes[0].removeSprite(bot.hp.base_sprite);
                    context.passes[0].removeSprite(bot.hp.current_sprite);
                    context.passes[0].removeSprite(bot.hp.update_sprite);
                }
            }
        }
        this.objects = this.objects.filter(function (value, index, array) {
            return !value.remove;
        });
    };
    MatchScene.prototype.setup_ground_particles = function () {
        this.ground_particle = new ParticleEmitter(context.passes[0], new vec2([5, 5]));
        this.ground_particle.position = new vec2([450 * ppm, 300 * ppm]);
        this.ground_particle.relative_position = new vec2([0, 0]);
        //ground_particle.relative_random_position = new vec2([0.1, 0.1]);
        this.ground_particle.velocity = new vec2([0.0, 0.0]);
        this.ground_particle.random_velocity = new vec2([0.5, 0.5]);
        this.ground_particle.color1 = new vec4([91 / 255.0, 140 / 255.0, 90 / 255.0, 1]);
        this.ground_particle.color2 = new vec4([91 / 255.0, 140 / 255.0, 90 / 255.0, 0]);
        this.ground_particle.random_color1 = new vec4([0.1, 0.1, 0.1, 0]);
        this.ground_particle.random_color2 = new vec4([0.1, 0.1, 0.1, 0]);
        this.ground_particle.rotation = Math.PI / 4;
        this.ground_particle.random_rotation = 1;
        this.ground_particle.rotation_velocity = 1;
        this.ground_particle.random_rotation_velocity = 1.0;
        this.ground_particle.scale = 1.0;
        this.ground_particle.random_scale = 0.05;
        this.ground_particle.scale_velocity = -0.2;
        this.ground_particle.random_scale_velocity = 0.1;
        this.ground_particle.on_ground = (function (particle) { particle.scale_velocity = 0; });
        this.ground_particle.lifetime = 2;
        this.ground_particle.spawn_max = 100;
        this.ground_particle.spawn_count = 0;
        this.ground_particle.spawn_rate = -1;
        this.ground_particle.textures = [data.textures["particle"].texture];
    };
    return MatchScene;
})(Scene);
//# sourceMappingURL=game_scene.js.map