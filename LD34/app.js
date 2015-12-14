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
var game_score = 0;
window.onload = function () {
    data.shaders["basic"] = Loader.ReadShaderResource("assets/shaders/shader.vert", "assets/shaders/shader.frag", {
        "pixelSize": {
            type: "vec2",
            value: new vec2([8, 8])
        }
    });
    data.textures["particle"] = Loader.ReadTextureResource("assets/textures/particle.png", { pixelate: true });
    data.textures["player_spritesheet"] = Loader.ReadTextureResource("assets/textures/player.png", { pixelate: true });
    data.textures["random_spritesheet"] = Loader.ReadTextureResource("assets/textures/random_dude.png", { pixelate: true });
    data.textures["god_spritesheet"] = Loader.ReadTextureResource("assets/textures/god.png", { pixelate: true });
    data.textures["chuck_norris_spritesheet"] = Loader.ReadTextureResource("assets/textures/chuck_norris.png", { pixelate: true });
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
    data.textures["sound_button"] = Loader.ReadTextureResource("assets/textures/sound_button.png", { pixelate: true });
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
    data.sounds["select"].sound.volume = 0.08;
    context.addPassBasic("pass1");
    context.passes[0].shader = data.shaders["basic"].shader;
    //context.addPassBasic("GUI");
    //context.passes[1].shader = data.shaders["basic"].shader;
    empty_texture = data.textures["particle"].texture;
    var baseMusic = data.music["music"].music;
    baseMusic.volume = 0.08;
    baseMusic.play();
    // var matchscene = new MatchScene();
    // matchscene.match_id = MatchID.Level1;
    // matchscene.setup();
    // current_scene = matchscene;
    var introscene = new IntroScene();
    introscene.setup();
    current_scene = introscene;
    {
        player_damage = new Sprite(0, 0, 9999, 900, 600);
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
    window.location.href = "http://ludumdare.com/compo/ludum-dare-34/?action=preview&uid=16119";
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
        player_damage.color.a = (player_damage_time / player_damage_maxtime) * 0.5;
        player_damage_time -= update_time;
    }
    else {
        player_damage.enabled = false;
        player_damage.color.a = 0;
    }
    current_scene.update(time, delta);
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
    if (player_damage_time > 0) {
        matrix.multiply(mat3.makeTranslate(-(camera_position.x + (Math.random() - 0.5) * 10) / 900, (camera_position.y + (Math.random() - 0.5) * 10) / 600));
    }
    else
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