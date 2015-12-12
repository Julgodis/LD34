
/*

 TODO:

* Particles
* Disable the current combo
* Blood


*/

var context: WebGL;
var keyboard: Keyboard;
var mouse: Mouse;
var updateHandle: number;
var renderHandle: number;

var state: number = 0;
var todoTime: number = 6;

var updateDt: number = 1.0 / 60.0;
var renderDt: number = 1.0 / 120.0;

var elapsedTime = 0;
var frameCount = 0;
var lastTime = 0;
var fps = 0;

var time = 0;
var mpp = 100.0;
var ppm = 1.0 / mpp;

interface StartData {
    shaders: { [id: string]: ShaderResource }
    textures: { [id: string]: TextureResource }
    music: { [id: string]: MusicResource }
    sounds: { [id: string]: SoundResource }
}

var data: StartData = {
    shaders: {},
    textures: {},
    music: {},
    sounds: {},
};

window.onload = () => {

    data.shaders["basic"] = Loader.ReadShaderResource(
        "assets/shaders/shader.vert",
        "assets/shaders/shader.frag",
        {
            "pixelSize": {
                type: "vec2",
                value: new vec2([8, 8])
            }
        });

    data.textures["hej"] = Loader.ReadTextureResource("assets/textures/cat4.png", { pixelate: true });
    data.textures["particle"] = Loader.ReadTextureResource("assets/textures/particle.png", { pixelate: true });




    //

    var newCanvas = document.createElement("canvas");
    newCanvas.setAttribute("id", name);
    newCanvas.setAttribute("width", "" + 900);
    newCanvas.setAttribute("height", "" + 600);
    newCanvas.innerHTML = "Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.";
    document.body.appendChild(newCanvas);
    var ctx = newCanvas.getContext("2d");

    var loadInterval = setInterval(() => {
        console.log("loaded: " + Loader.Loaded);


        if (Loader.Loaded) {
            clearInterval(loadInterval);
            clearInterval(loadDraw);

            newCanvas.parentNode.removeChild(newCanvas);
            start();
        }
    }, 1000);

    var loadDraw = setInterval(() => {

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

class Test {

    position: vec2;
    sprite: Sprite;

    constructor() {
        this.position = new vec2([0, 0]);
    }
}

var particle_test: ParticleEmitter;

function start() {
    context = new WebGL("glCanvas", 900, 600, true);
    context.initialize();

    keyboard = new Keyboard(context.canvasElement);
    mouse = new Mouse(context.canvasElement);

    for (var id in data.shaders)
        context.addShader(data.shaders[id].shader);

    for (var id in data.textures)
        context.addTexture(data.textures[id].texture);

    context.addPassBasic("pass1");
    context.passes[0].shader = data.shaders["basic"].shader;

    {
        var sprite = new Sprite(0, 0, 1.0, 20, 50);
        sprite.color = new vec4([1.0, 1.0, 1.0, 1.0]);
        sprite.textures = [data.textures["hej"].texture];


        player = new Player(new vec2([20 * ppm, 300 * ppm]), new vec2([20, 50]));
        player.sprite = sprite;

        context.passes[0].addSprite(sprite);
        objects.push(player);
    }

    {
        var sprite = new Sprite(0, 0, 1.0, 20, 50);
        sprite.color = new vec4([0.5, 0.5, 1.0, 1.0]);
        sprite.textures = [data.textures["hej"].texture];


        var bot = new Bot(new vec2([400 * ppm, 300 * ppm]), new vec2([20, 50]));
        bot.sprite = sprite;

        context.passes[0].addSprite(sprite);
        objects.push(bot);
    }

    {
        particle_test = new ParticleEmitter(context.passes[0], new vec2([20, 20]));
        particle_test.position = new vec2([450 * ppm, 300 * ppm]);
        particle_test.relative_position = new vec2([0, 0]);
        particle_test.relative_random_position = new vec2([0, 0]);

        particle_test.velocity = new vec2([0.01, 0.01]);
        particle_test.random_velocity = new vec2([1, 1]);

        particle_test.color = new vec4([1, 1, 1, 1]);
        particle_test.random_color = new vec4([0.5, 0.5, 0.5, 0]);

        particle_test.lifetime = 1;
        particle_test.spawn_max = 1000;
        particle_test.spawn_count = 0;
        particle_test.spawn_rate = -1;
        particle_test.textures = [data.textures["particle"].texture];
    }

    updateHandle = setInterval(update, updateDt * 1000);
    requestAnimationFrame(render);

    lastTime = new Date().getTime();
}

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

var objects: GameObject[] = [];
var player: Player;

var combos: [ActionType[], ActionType, number][] = [
    [[ActionType.Turn, ActionType.Turn], ActionType.Jump, 0.5],
    [[ActionType.BeginWalk, ActionType.EndWalk, ActionType.BeginWalk], ActionType.Dash, 0.5],
    [[ActionType.BeginWalk, ActionType.EndWalk, ActionType.Turn], ActionType.BasicPunch, 0.3],
    [[ActionType.BasicPunch, ActionType.BasicPunch], ActionType.CirclePunch, 0.5],
    [[ActionType.Jump, ActionType.Jump, ActionType.Turn], ActionType.JumpPunch, 0.6],
];

var combo_data: [number, number][] = [
    [-1, 0],
    [-1, 0],
    [-1, 0],
    [-1, 0],
    [-1, 0],
];

function resolve_combo_actions(action: ActionType): ActionType[] {
    var combo_actions: ActionType[] = [];
    for (var i = 0; i < combos.length; i++) {
        var combo_ac = combos[i][0];
        var combo_max_time = combos[i][2];
        var combo_id = combo_data[i][0];
        var combo_time = combo_data[i][1];

        if ((combo_id == -1 || time - combo_time > combo_max_time) && action == combo_ac[0]) {
            console.log("begin : " + ActionType[combos[i][1]])
            combo_data[i] = [1, time];
        } else if (combo_id != -1) {
            if (time - combo_time > combo_max_time) { // Out of time
                console.log("exit  : " + ActionType[combos[i][1]])
                combo_data[i] = [-1, 0];
            } else if (action == combo_ac[combo_id]) {
                console.log("update: " + ActionType[combos[i][1]])

                combo_data[i] = [combo_id + 1, combo_time + combo_max_time];
                if (combo_id + 1 >= combo_ac.length) {
                    console.log("do    : " + ActionType[combos[i][1]])

                    combo_actions.push(combos[i][1]);
                    combo_data[i] = [-1, 0];
                }
            }
        }
    }

    return combo_actions;
}

function update() {
    keyboard.update();
    time += updateDt;

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
                player.velocity.y -= 5 + (player.onGround ? 0 : 2);
            } else if (action == ActionType.BasicPunch) {
                player.moveDirection *= -1;

                console.log("B Punch")
                for (var id in objects) {
                    var obj = objects[id];

                    if (obj.isStatic || obj instanceof Player)
                        continue;

                    var dx = obj.position.x - player.position.x;
                    var dy = obj.position.y - player.position.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= (player.size.x * 0.5) * ppm || (dx * player.moveDirection > 0 && dist <= (player.size.x * 1.5) * ppm)) {
                        var angle = Math.tan(dy / dx);

                        var strength = 5 * (angle/4 + 1);
                        var punch_velocity = new vec2([player.moveDirection * Math.cos(Math.PI / 4), -Math.sin(angle + Math.PI / 4)]);
                        punch_velocity.mul(strength);

                        obj.velocity.add(punch_velocity);
                    }
                }
            } else if (action == ActionType.CirclePunch) {
                player.moveDirection *= -1;
                player.velocity.y += 5;

                console.log("C Punch")
                for (var id in objects) {
                    var obj = objects[id];

                    if (obj.isStatic || obj instanceof Player)
                        continue;

                    var dx = obj.position.x - player.position.x;
                    var dy = obj.position.y - player.position.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= (player.size.x * 6) * ppm) {
                        var angle = Math.atan2(-dy, dx);
                        var punch_velocity = new vec2([-500 * Math.cos(angle), -Math.sin(Math.PI / 4)]); 
                        obj.velocity.add(punch_velocity);
                    }
                }
            }
               
            
        }
    }

    // 

    var gravity = new vec2([0, 0.2]);

    particle_test.spawn(time);
    particle_test.update(updateDt, new vec2([0, 0]));

    for (var id in objects) {
        var obj = objects[id];

        if (!obj.isStatic) {
            
            obj.velocity.add(gravity);
            if (obj instanceof Player) {
                var pl = <Player>obj;

                var walking_velocity = new vec2([1, 0]);
                walking_velocity.mul(pl.speed);
                walking_velocity.mul(pl.moving);
                walking_velocity.mul(pl.moveDirection);
                //walking_velocity.mul(ppm);

                pl.velocity.add(walking_velocity);
                obj.sprite.flip = (pl.moveDirection == -1);

                if (obj.onGround && pl.jump_punch) {
                    for (var id in objects) {
                        var obj = objects[id];

                        if (obj.isStatic || obj instanceof Player)
                            continue;

                        var dx = obj.position.x - player.position.x;
                        var dy = obj.position.y - player.position.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= (player.size.x * 4) * ppm) {
                            var punch_velocity = new vec2([0, -8]);
                            obj.velocity.add(punch_velocity);
                        }
                    }

                    pl.jump_punch = false;
                }
            
            } else if (obj instanceof Bot) {
                var bot = <Bot>obj;

 
                obj.sprite.flip = (bot.moveDirection == -1);
            }

            if (obj.onGround) 
                obj.velocity.x *= 0.8;
            else
                obj.velocity.x *= 0.99;

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
            }

            if (obj.position.x < 0 * ppm) {
                obj.position.x = 0 * ppm;
                obj.velocity.x *= -1 * 0.1;
            } else if (obj.position.x > (900 - obj.size.x) * ppm) {
                obj.position.x = (900 - obj.size.x) * ppm;
                obj.velocity.x *= -1 * 0.1;
            }

            var matrix = mat3.makeIdentity();
            matrix.multiply(mat3.makeTranslate(obj.position.x * mpp, obj.position.y * mpp));
            obj.sprite.matrix = matrix;
        }

        if (obj.remove && obj.sprite != null) {
            context.passes[0].removeSprite(obj.sprite);
        }
    }
}

function render() {
    var now = new Date().getTime();
    var elapsed = (now - lastTime);


    elapsedTime += elapsed;
    lastTime = now;

    context.preRender();
    context.render(mat3.makeIdentity());
    //context.render(mat3.makeTranslate(-(camera.x) / worldBound.x, (camera.y) / worldBound.y));//-camera.x * mpp / worldBound.x, camera.y * mpp / worldBound.y));

    context.postRender();
    fps++;

    if (elapsedTime >= 1000) {
        fps = 0;
        elapsedTime -= 1000;
    }

    requestAnimationFrame(render);
}