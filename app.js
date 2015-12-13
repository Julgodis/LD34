/*

 TODO:

* Particles
* display the current combo
* Blood


*/
var context;
var keyboard;
var mouse;
var updateHandle;
var renderHandle;
var state = 0;
var todoTime = 6;
var update_time = 1.0 / 60.0;
var render_time = 1.0 / 120.0;
var elapsedTime = 0;
var frameCount = 0;
var lastTime = 0;
var fps = 0;
var fps_counter = 0;
var time = 0;
var mpp = 100.0;
var ppm = 1.0 / mpp;
var empty_texture;
var data = {
    shaders: {},
    textures: {},
    music: {},
    sounds: {},
};
window.onload = function () {
    data.shaders["basic"] = Loader.ReadShaderResource("assets/shaders/shader.vert", "assets/shaders/shader.frag", {
        "pixelSize": {
            type: "vec2",
            value: new vec2([8, 8])
        }
    });
    data.textures["hej"] = Loader.ReadTextureResource("assets/textures/cat4.png", { pixelate: true });
    data.textures["particle"] = Loader.ReadTextureResource("assets/textures/particle.png", { pixelate: true });
    data.textures["player_spritesheet"] = Loader.ReadTextureResource("assets/textures/player.png", { pixelate: true });
    data.textures["john_cena_spritesheet"] = Loader.ReadTextureResource("assets/textures/john_cena.png", { pixelate: true });
    data.textures["tutorial_spritesheet"] = Loader.ReadTextureResource("assets/textures/tutorial_box.png", { pixelate: true });
    data.textures["ground_texture_1"] = Loader.ReadTextureResource("assets/textures/ground_texture_1.png", { pixelate: true, repeat_x: true, repeat_y: true });
    data.textures["tree1"] = Loader.ReadTextureResource("assets/textures/tree_spritesheet1.png", { pixelate: true });
    data.textures["tree2"] = Loader.ReadTextureResource("assets/textures/tree_spritesheet2.png", { pixelate: true });
    data.textures["background_1"] = Loader.ReadTextureResource("assets/textures/background_1.png", { pixelate: true });
    data.textures["sky"] = Loader.ReadTextureResource("assets/textures/sky.png", { pixelate: true });
    data.textures["a_button"] = Loader.ReadTextureResource("assets/textures/a_button.png", { pixelate: true });
    data.textures["b_button"] = Loader.ReadTextureResource("assets/textures/b_button.png", { pixelate: true });
    data.textures["a_button_combo"] = Loader.ReadTextureResource("assets/textures/a_button_combo.png", { pixelate: true });
    data.textures["b_button_combo"] = Loader.ReadTextureResource("assets/textures/b_button_combo.png", { pixelate: true });
    data.textures["a_button_combo_up"] = Loader.ReadTextureResource("assets/textures/a_button_combo_up.png", { pixelate: true });
    data.textures["a_button_combo_down"] = Loader.ReadTextureResource("assets/textures/a_button_combo_down.png", { pixelate: true });
    data.textures["b_button_combo_up"] = Loader.ReadTextureResource("assets/textures/b_button_combo_up.png", { pixelate: true });
    data.textures["b_button_combo_down"] = Loader.ReadTextureResource("assets/textures/b_button_combo_down.png", { pixelate: true });
    data.textures["jump_combo"] = Loader.ReadTextureResource("assets/textures/jump_combo.png", { pixelate: true });
    data.textures["fist_combo"] = Loader.ReadTextureResource("assets/textures/fist_combo.png", { pixelate: true });
    data.textures["arrow"] = Loader.ReadTextureResource("assets/textures/arrow.png", { pixelate: true });
    data.textures["menu"] = Loader.ReadTextureResource("assets/textures/menu.png", { pixelate: true });
    data.textures["button"] = Loader.ReadTextureResource("assets/textures/button.png", { pixelate: true });
    data.music["music"] = Loader.ReadMusicResource("assets/music/LD34.ogg", { loop: true });
    data.sounds["combo"] = Loader.ReadSoundResource("assets/music/combo.ogg", 6);
    data.sounds["hurt"] = Loader.ReadSoundResource("assets/music/hurt.ogg", 10);
    data.sounds["select"] = Loader.ReadSoundResource("assets/music/select.ogg", 10);
    //
    var newCanvas = document.createElement("canvas");
    newCanvas.setAttribute("id", name);
    newCanvas.setAttribute("width", "" + 900);
    newCanvas.setAttribute("height", "" + 600);
    newCanvas.innerHTML = "Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.";
    document.body.appendChild(newCanvas);
    var ctx = newCanvas.getContext("2d");
    var loadInterval = setInterval(function () {
        console.log("loaded: " + Loader.Loaded);
        if (Loader.Loaded) {
            clearInterval(loadInterval);
            clearInterval(loadDraw);
            newCanvas.parentNode.removeChild(newCanvas);
            start();
        }
    }, 1000);
    var loadDraw = setInterval(function () {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 900, 600);
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 300 - 10, 900, 20);
        var a = Loader.Resources.length;
        var b = 0;
        for (var id in Loader.Resources) {
            var res = Loader.Resources[id];
            if (res.loaded) {
                b++;
            }
        }
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 300 - 10, 900 * (b / a), 20);
    }, 1 / 60);
};
function setup_blood_emitter() {
    var pf = new ParticleEmitter(context.passes[0], new vec2([20, 20]));
    pf.position = new vec2([450 * ppm, 300 * ppm]);
    pf.relative_position = new vec2([0, 0]);
    pf.relative_random_position = new vec2([0.1, 0.1]);
    pf.velocity = new vec2([0.0, 0.0]);
    pf.random_velocity = new vec2([2.0, 2.0]);
    pf.color1 = new vec4([0.8, 0.2, 0.2, 1]);
    pf.color2 = new vec4([0.9, 0.1, 0.1, 0]);
    pf.random_color1 = new vec4([0.1, 0.1, 0.1, 0]);
    pf.random_color2 = new vec4([0.05, 0.05, 0.05, 0]);
    pf.rotation = Math.PI / 4;
    pf.random_rotation = 1;
    pf.rotation_velocity = 1;
    pf.random_rotation_velocity = 1.0;
    pf.scale = 0.3;
    pf.random_scale = 0.05;
    pf.scale_velocity = -0.2;
    pf.random_scale_velocity = 0.1;
    pf.on_ground = (function (particle) { particle.scale_velocity = 0; });
    pf.lifetime = 5;
    pf.spawn_max = 100;
    pf.spawn_count = 0;
    pf.spawn_rate = -1;
    pf.textures = [data.textures["particle"].texture];
    return pf;
}
function start() {
    context = new WebGL("glCanvas", 900, 600, true);
    context.initialize();
    keyboard = new Keyboard(context.canvasElement);
    mouse = new Mouse(context.canvasElement);
    for (var id in data.shaders)
        context.addShader(data.shaders[id].shader);
    for (var id in data.textures)
        context.addTexture(data.textures[id].texture);
    data.sounds["combo"].sound.volume = 0.1;
    context.addPassBasic("pass1");
    context.passes[0].shader = data.shaders["basic"].shader;
    //context.addPassBasic("GUI");
    //context.passes[1].shader = data.shaders["basic"].shader;
    empty_texture = data.textures["particle"].texture;
    var baseMusic = data.music["music"].music;
    baseMusic.volume = 0.1;
    //baseMusic.play();
    // var matchscene = new MatchScene();
    // matchscene.match_id = MatchID.Level1;
    // matchscene.setup();
    // current_scene = matchscene;
    var introscene = new IntroScene();
    introscene.setup();
    current_scene = introscene;
    {
        player_damage = new Sprite(0, 0, 999, 900, 600);
        player_damage.color = new vec4([1, 0, 0, 0]);
        player_damage.textures = [data.textures["particle"].texture];
        player_damage.enabled = false;
        context.passes[0].addSprite(player_damage);
    }
    {
        fps_text = new TextSprite("FPS: " + fps, 5, 5, 1000, 100, 30, { center: false, font: "20px monospace" });
        context.passes[0].addSprite(fps_text);
    }
    updateHandle = setInterval(update, update_time * 1000);
    requestAnimationFrame(render);
    lastTime = new Date().getTime();
}
function OpenInNewTabRate() {
    window.location.href = "http://ludumdare.com/compo";
}
var current_scene;
var fps_text;
var player_damage;
var player_damage_time = 0;
var player_damage_maxtime = 0.2;
var slowmo_value = 0.25;
var base_gravity = (new vec2([0, 0.2])).div(update_time);
var slow_gravity = base_gravity.copy().mul(slowmo_value);
var gravity = base_gravity;
var world = new vec4([10 * ppm, 10 * ppm, 890 * ppm, 520 * ppm]);
var camera_position = new vec2([0, 0]);
var camera_zoom = 1.0;
var slowmo = false;
function slow_motion(e) {
    slowmo = e;
    // if (slowmo) gravity = slow_gravity;
    //else gravity = base_gravity;
}
function update() {
    keyboard.update();
    var delta = update_time;
    if (slowmo)
        delta = update_time * slowmo_value;
    time += delta;
    if (player_damage_time > 0) {
        player_damage.enabled = true;
        player_damage.color.a = ((player_damage_time - 0.2 / player_damage_maxtime) / player_damage_maxtime);
        player_damage_time -= update_time;
    }
    else {
        player_damage.enabled = false;
        player_damage.color.a = 0;
    }
    current_scene.update(time, delta);
    /*

    if (gamestate == GameState.Match) {
        var action_queue: ActionType[] = [];
        if (keyboard.press(39)) {
            action_queue.push(ActionType.BeginWalk);
        } else if (keyboard.release(39)) {
            action_queue.push(ActionType.EndWalk);
        }

        if (keyboard.press(32)) {
            action_queue.push(ActionType.Turn);
        }

        if (action_queue.length > 0) {
            var action = action_queue[action_queue.length - 1];

            var new_ca: ActionType[] = [];
            var combo_actions = resolve_combo_actions(action);
            //new_ca = combo_actions;
            for (var index in combo_actions) {
                var caction = combo_actions[index];
                var ca = resolve_combo_actions(caction);

                if (ca.length > 0) {
                    for (var i in ca)
                        new_ca.push(ca[i]);
                } else
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
                    player.moving = 1;
                else if (action == ActionType.EndWalk)
                    player.moving = 0;
                else if (action == ActionType.Dash) {
                    player.velocity.x += 5800 * player.moveDirection;
                    player.velocity.y -= 0.5;
                }
                else if (action == ActionType.JumpPunch) {
                    player.velocity.y += 40;
                    player.jump_punch = true;
                } else if (action == ActionType.Turn)
                    player.moveDirection *= -1;
                else if (action == ActionType.Jump) {
                    player.jump_count++;
                    player.velocity.y -= 5 + (player.onGround ? 0 : 2);
                } else if (action == ActionType.BasicPunch) {
                    player.moveDirection *= -1;

                    console.log("B Punch")
                    for (var id in objects) {
                        var obj = objects[id];

                        if (obj.remove || obj.isStatic || obj instanceof Player)
                            continue;

                        var dx = obj.position.x - player.position.x;
                        var dy = obj.position.y - player.position.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= (player.size.x * 0.5) * ppm || (dx * player.moveDirection > 0 && dist <= (player.size.x * 1.5) * ppm)) {
                            var angle = Math.tan(dy / dx);

                            var strength = 5 * (angle / 4 + 1);
                            var punch_velocity = new vec2([player.moveDirection * Math.cos(Math.PI / 4), -Math.sin(angle + Math.PI / 4)]);
                            punch_velocity.mul(strength);
                            obj.velocity.add(punch_velocity);

                            var pe: ParticleEmitter = null;
                            if (obj instanceof Bot) {
                                pe = (<Bot>obj).blood_system;
                                (<Bot>obj).attacked(player.bpunch_damage());

                                pe.velocity = new vec2([player.moveDirection * Math.cos(Math.PI / 4), -Math.sin(angle + Math.PI / 4)]);
                                pe.spawn_max = 30;
                                pe.position = obj.position.copy().add(obj.size.copy().mul(0.5 * ppm));
                                pe.spawn(time);
                            }
                        }
                    }
                } else if (action == ActionType.CirclePunch) {
                    player.moveDirection *= -1;
                    player.velocity.y += 5;

                    console.log("C Punch")
                    for (var id in objects) {
                        var obj = objects[id];

                        if (obj.remove || obj.isStatic || obj instanceof Player)
                            continue;

                        var dx = obj.position.x - player.position.x;
                        var dy = obj.position.y - player.position.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= (player.size.x * 10) * ppm) {
                            var dt = dist / (player.size.x * 10 * ppm);
                            var angle = Math.atan2(-dy, dx);
                            var punch_velocity = new vec2([(16000 + dt * 10000) * Math.cos(angle), -20 * Math.sin(angle)]);
                            obj.velocity.add(punch_velocity);

                            player_attack_particle.velocity = new vec2([0, 0]);
                            player_attack_particle.random_velocity = new vec2([10, 10]);
                            player_attack_particle.position = player.position.copy().add(player.size.copy().mul(0.5 * ppm));
                            player_attack_particle.relative_random_position = player.size.copy().mul(0.5 * ppm);
                            player_attack_particle.spawn_max = 200;
                            player_attack_particle.lifetime = 0.4;
                            player_attack_particle.spawn(time);

                            var pe: ParticleEmitter = null;
                            if (obj instanceof Bot) {
                                pe = (<Bot>obj).blood_system;
                                (<Bot>obj).attacked(player.cpunch_damage());

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
    }

    //

    var gravity = new vec2([0, 0.2]);

    for (var index in repeats) {
        var rep = repeats[index];
        if (rep.times == 0) return;

        if (time >= rep.last_time) {
            rep.func(rep.times, rep.data);
            rep.last_time = time + rep.interval;
            rep.times--;
        }
    }

    repeats = repeats.filter(
        (value: Repeat, index: number, array: Repeat[]): boolean =>
        {
            return value.times != 0;
        });

    if (player_damage_time > 0) {
        player_damage.enabled = true;
        player_damage.color.a = ((player_damage_time - 0.2 / player_damage_maxtime) / player_damage_maxtime);
        player_damage_time -= updateDt;
    } else {
        player_damage.enabled = false;
        player_damage.color.a = 0;
    }

    ground_particle.update(time, updateDt, gravity, ppm);
    player_attack_particle.update(time, updateDt, gravity, ppm);

    for (var id in objects) {
        var obj = objects[id];

        if (obj.remove || !obj.isStatic) {
            
            obj.velocity.add(gravity);
            if (obj instanceof Player) {
                var pl = <Player>obj;

                pl.hp.update(updateDt);
                pl.blood_system.update(time, updateDt, gravity, ppm);

                var walking_velocity = new vec2([1, 0]);
                walking_velocity.mul(pl.speed);
                walking_velocity.mul(pl.moving);
                walking_velocity.mul(pl.moveDirection);
                //walking_velocity.mul(ppm);

                pl.cc -= updateDt;
                if (pl.cc <= 0) {
                    pl.velocity.add(walking_velocity);
                    obj.sprite.flip = (pl.moveDirection == -1);
                }

                if (obj.onGround && pl.jump_punch) {
                    player.moveDirection *= -1;

                    var data = [
                        new vec2([0, -3.5]),
                        obj.position.copy().add(new vec2([obj.size.x * 0.5 * ppm, obj.size.y * ppm - 10 * ppm])),
                        new vec2([(player.size.x * 4) * ppm, 0])
                    ];

                    repate_function(data, (i, data) => {
                        player_attack_particle.lifetime = 0.5;
                        player_attack_particle.random_velocity = new vec2([0, 0]);
                        player_attack_particle.velocity = <vec2>data[0];
                        player_attack_particle.velocity.add(new vec2([0.2 * (Math.random() - 0.5), -(Math.random() - 0.5) * 1]));
                        player_attack_particle.position = <vec2>data[1];
                        player_attack_particle.relative_random_position = <vec2>data[2];
                        player_attack_particle.spawn_max = 8;
                        player_attack_particle.spawn(time);

                        player_attack_particle.velocity = new vec2([0, 0]);
                        player_attack_particle.position = <vec2>data[1];
                        player_attack_particle.relative_random_position = <vec2>data[2];
                        player_attack_particle.spawn_max = 8;
                        player_attack_particle.spawn(time);

                    }, 10, 0)

                    for (var id in objects) {
                        var obj = objects[id];

                        if (obj.isStatic || obj instanceof Player || !obj.onGround)
                            continue;

                        var dx = obj.position.x - player.position.x;
                        var dy = obj.position.y - player.position.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= (player.size.x * 4) * ppm) {
                            var punch_velocity = new vec2([0, -8]);
                            obj.velocity.add(punch_velocity);

                            var pe: ParticleEmitter = null;
                            if (obj instanceof Bot) {
                                pe = (<Bot>obj).blood_system;
                                (<Bot>obj).attacked(player.jpunch_damage());

                                pe.velocity = new vec2([0, -5]);
                                pe.spawn_max = 15;
                                pe.position = obj.position.copy().add(obj.size.copy().mul(0.5 * ppm));
                                pe.spawn(time);
                            }
                        }
                    }

                    pl.jump_punch = false;
                }

            
            } else if (obj instanceof Bot) {
                var bot = <Bot>obj;
                bot.blood_system.update(time, updateDt, gravity, ppm);
                if (gamestate == GameState.Match) {
                    bot.hp.update(updateDt);
                    bot.update(time, updateDt, player);
                }

                if (gamestate == GameState.Match) {

                }

                if (bot.hp.current_hp <= 0) {
                    if (gamestate == GameState.Match) {
                        gamestate = GameState.Won;

                        bot.hp.hide();
                    }

                    var pe = bot.blood_system;
                    pe.velocity = new vec2([0, -5]);
                    pe.spawn_max = 2;
                    pe.position = obj.position.copy().add(obj.size.copy().mul(0.5 * ppm));
                    pe.spawn(time);
                }

                obj.sprite.flip = (bot.moveDirection == -1);
            }

            if (obj.onGround)
                obj.velocity.x *= 0.8;
            else
                obj.velocity.x *= 0.99;


            var prev_ground = obj.onGround;
            obj.onGround = false;



            if (obj.velocity.x > obj.maxVelocity.x) obj.velocity.x = obj.maxVelocity.x;
            else if (obj.velocity.x < -obj.maxVelocity.x) obj.velocity.x = -obj.maxVelocity.x;

            if (obj.velocity.y > obj.maxVelocity.y) obj.velocity.y = obj.maxVelocity.y;
            else if (obj.velocity.y < -obj.maxVelocity.y) obj.velocity.y = -obj.maxVelocity.y;

            obj.position.add(obj.velocity.copy().mul(updateDt));
            
            if (obj.position.y > (550 - obj.size.y) * ppm) {
                obj.position.y = (550 - obj.size.y) * ppm;
                obj.velocity.y = 0;//-1 * 0.1;
                obj.onGround = true;

                if (obj.onGround && !prev_ground) {
                    ground_particle.velocity = (new vec2([0, -3])).add(obj.velocity.copy().mul(-1*0.1));
                    ground_particle.position = obj.position.copy().add(new vec2([obj.size.x * 0.5 * ppm, obj.size.y * ppm]));
                    ground_particle.relative_random_position = new vec2([obj.size.x * ppm * 0.5, 0]);
                    ground_particle.spawn_max = 10;
                    ground_particle.spawn(time);
                }
            }

            if (obj.position.x < 0 * ppm) {
                obj.position.x = 0 * ppm;
                obj.velocity.x *= -1 * 0.8;
            } else if (obj.position.x > (900 - obj.size.x) * ppm) {
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
                var bot = <Bot>obj;
                context.passes[0].removeSprite(bot.hp.base_sprite);
                context.passes[0].removeSprite(bot.hp.current_sprite);
                context.passes[0].removeSprite(bot.hp.update_sprite);
            }
        }
    }

    objects = objects.filter(
        (value: GameObject, index: number, array: GameObject[]) =>
            !value.remove);
    */
}
function render() {
    var now = new Date().getTime();
    var elapsed = (now - lastTime);
    elapsedTime += elapsed;
    lastTime = now;
    fps_text.data = "FPS: " + fps;
    fps_text.update();
    context.preRender();
    //context.render(mat3.makeIdentity());
    var matrix = mat3.makeIdentity();
    matrix.multiply(mat3.makeScale(camera_zoom, camera_zoom));
    matrix.multiply(mat3.makeTranslate(-(camera_position.x) / 900, (camera_position.y) / 600));
    context.render(matrix); //-camera.x * mpp / worldBound.x, camera.y * mpp / worldBound.y));
    context.postRender();
    fps_counter++;
    if (elapsedTime >= 1000) {
        fps = fps_counter;
        fps_counter = 0;
        elapsedTime -= 1000;
    }
    requestAnimationFrame(render);
}
//# sourceMappingURL=app.js.map