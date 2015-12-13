
class IntroScene extends Scene {

    trees: Tree[];

    ground_sprite: Sprite;
    sky_sprite: Sprite;
    background_sprite: Sprite;
    overlay_sprite: Sprite;
    title_text: TextSprite;
    copy_text: TextSprite;
    ld_text1: TextSprite;
    ld_text2: TextSprite;

    player: Player;

    play_button: ButtonSprite;
    rate_button: ButtonSprite;

    constructor() {
        super();
    }

    setup() {
        this.trees = [];

        this.ground_sprite = new Sprite(0, 600 - 80, 0, 11 * 88, 80);
        this.ground_sprite.texCoords = new vec4([0, 0, 11, 1]);
        this.ground_sprite.textures = [data.textures["ground_texture_1"].texture];
        context.passes[0].addSprite(this.ground_sprite);

        this.background_sprite = new Sprite(0, 100, -100, 15 * 64, 15 * 32);
        this.background_sprite.color = new vec4([0.6, 0.6, 0.6, 1]);
        this.background_sprite.textures = [data.textures["background_1"].texture];
        context.passes[0].addSprite(this.background_sprite);

        this.overlay_sprite = new Sprite(500/1.8, 0, 100/1.8, 400, 600);
        this.overlay_sprite.color = new vec4([0.0, 0.0, 0.0, 0.4]);
        this.overlay_sprite.textures = [empty_texture];
        context.passes[0].addSprite(this.overlay_sprite);

        this.title_text = new TextSprite("Game", 500 / 1.8, 250, 101, 400, 80, { font: "60px monospace" });
        this.title_text.width = 200;
        this.title_text.height = 40;
        context.passes[0].addSprite(this.title_text);

        this.ld_text1 = new TextSprite("Ludum Dare 34 -", 560 / 1.8, 270, 101, 400, 80, { font: "20px monospace", center: false });
        this.ld_text1.width = 200;
        this.ld_text1.height = 40;
        context.passes[0].addSprite(this.ld_text1);

        this.ld_text2 = new TextSprite("Two button controls", 590 / 1.8, 280, 101, 400, 80, { font: "20px monospace", center: false });
        this.ld_text2.width = 200;
        this.ld_text2.height = 40;
        context.passes[0].addSprite(this.ld_text2);

        this.copy_text = new TextSprite("Julgodis 2015", 520 / 1.8, 530, 101, 400, 80, { font: "40px monospace" });
        this.copy_text.width = 200;
        this.copy_text.height = 40;
        context.passes[0].addSprite(this.copy_text);

        this.play_button = new ButtonSprite("Start game", 520 / 1.8, 350, 102, 400, 100);
        this.play_button.textures = [data.textures["button"].texture];
        this.play_button.width = 200;
        this.play_button.height = 50;
        this.play_button.text.width = 200;
        this.play_button.text.height = 50;
        this.play_button.text.options = { font: "30px monospace" };
        this.play_button.text.update();
        context.passes[0].addSprite(this.play_button.text);
        context.passes[0].addSprite(this.play_button);

        this.rate_button = new ButtonSprite("Rate (Ludum Dare)", 520 / 1.8, 430, 102, 400, 100);
        this.rate_button.textures = [data.textures["button"].texture];
        this.rate_button.width = 200;
        this.rate_button.height = 50;
        this.rate_button.text.width = 200;
        this.rate_button.text.height = 50;
        this.rate_button.text.options = { font: "30px monospace" };
        this.rate_button.text.update();
        context.passes[0].addSprite(this.rate_button.text);
        context.passes[0].addSprite(this.rate_button);

        this.sky_sprite = new Sprite(-450, -300, -200, 1800, 1200);
        this.sky_sprite.textures = [data.textures["sky"].texture];
        context.passes[0].addSprite(this.sky_sprite);

        for (var i = 0; i < 20; i++) {
            this.add_tree(new vec2([(900 / 20) * i + (Math.random() - 0.5) * 100, world.w * mpp]), 10 + Math.random() * 5);
        }
        for (var i = 0; i < 15; i++) {
            this.add_tree(new vec2([(900 / 15) * i + (Math.random() - 0.5) * 10, world.w * mpp]), 5 + Math.random() * 5);
        }

        this.spawn_player();
    }

    add_tree(position: vec2, scale: number) {
        var s = (scale - 10) / 10;
        if (s < 0)
            s = 0;
        var tree_sprite = new Sprite(position.x - 8 * scale, position.y - 19.5 * scale, -10 + scale / 20, 0.5 * 32 * scale, 20 * scale);
        tree_sprite.color = new vec4([s, s, s, 1.0]);
        if (Math.random() > 0.5)
            tree_sprite.textures = [data.textures["tree1"].texture];
        else
            tree_sprite.textures = [data.textures["tree2"].texture];
        context.passes[0].addSprite(tree_sprite);

        var tree = new Tree();
        tree.sprite = tree_sprite;
        tree.update(0);
        this.trees.push(tree);
    }

    spawn_player() {
        var sprite = new Sprite(100, world.w * mpp - 80, 1.0, 44, 80);
        sprite.color = new vec4([1.0, 1.0, 1.0, 1.0]);
        sprite.textures = [data.textures["player_spritesheet"].texture];

        var player = new Player(new vec2([40 * ppm, world.w - 80 * ppm]), new vec2([sprite.width, sprite.height]));
        player.sprite = sprite;


        player.animation.add_animation("bpunch", 1, 4, [0.1, 0.1, 0.1, 0.1], true);
        player.initialize_animations(11, 20, 44, 80);
        player.animation.play("bpunch");

 
        this.player = player;
        context.passes[0].addSprite(this.player.sprite);
    }

    cleanup() {
        this.player.cleanup();
        this.play_button.cleanup();
        this.rate_button.cleanup();
        this.overlay_sprite.remove();
        this.sky_sprite.remove();
        this.background_sprite.remove();
        this.ground_sprite.remove();
        this.title_text.remove();
        this.ld_text1.remove();
        this.ld_text2.remove();
        this.copy_text.remove();
    }

    update(time: number, delta: number) {

        camera_zoom = 1.8;
        // var screen = new vec2([450, 300]);
        //screen.div(camera_zoom);

       var camera_pos = this.player.position.copy().add(this.player.size.copy().mul(0.5 * ppm)).mul(mpp);
       camera_pos.add(new vec2([0, -75]));

        if (camera_pos.y + 300 / camera_zoom > 600)
            camera_pos.y = 600 - 300 / camera_zoom;
        if (camera_pos.y - 300 / camera_zoom < 0)
            camera_pos.y = 0 + 300 / camera_zoom;

        if (camera_pos.x + 450 / camera_zoom > 900)
            camera_pos.x = 900 - 450 / camera_zoom;
        if (camera_pos.x - 450 / camera_zoom < 0)
            camera_pos.x = 0 + 450 / camera_zoom;

        camera_position = camera_pos.copy().sub(new vec2([450, 300])).mul(2 * camera_zoom);

        var mouse_position = mouse.position.copy();
        mouse_position.div(new vec2([900, 600]));
        mouse_position.mul(new vec2([900 / camera_zoom, 600 / camera_zoom]));
        mouse_position.add(camera_pos);
        mouse_position.sub(new vec2([450 / camera_zoom, 300 / camera_zoom]));

        this.play_button.update(mouse_position);
        this.rate_button.update(mouse_position);

        if (mouse.leftDown && this.play_button.inside(mouse_position)) {
            data.sounds["select"].sound.play();

           this.cleanup();
           var matchscene = new MatchScene();
           matchscene.match_id = MatchID.Tutorial;
           matchscene.setup();
           current_scene = matchscene;

            mouse.leftDown = false;
        }

        if (mouse.leftDown && this.rate_button.inside(mouse_position)) {
            data.sounds["select"].sound.play();

            OpenInNewTabRate();
            mouse.leftDown = false;
        }

        this.player.animation.update(time, delta);


        for (var index in this.trees) {
            this.trees[index].update(time);
        }
    }
}