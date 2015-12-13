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
var ComboText = (function () {
    function ComboText(n, position, size, time) {
        this.dead = false;
        this.text = new TextSprite(n, position.x, position.y, 100, size.x, size.y, { color: "#FFD800", font: "20px monospace" });
        this.despawn_time = time + 0.5;
    }
    ComboText.prototype.update = function (time, delta) {
        this.text.y += delta * (1000.0 / 3.0);
        this.text.color.a = Math.pow((this.despawn_time - time) / 0.5, 1 / 1.5);
    };
    return ComboText;
})();
var Tree = (function () {
    function Tree() {
        this.last_time = Math.random() * 0.4;
        this.frame = (Math.random() > 0.5 ? 1 : 0);
        this.sprite = null;
    }
    Tree.prototype.update = function (time) {
        if (time > this.last_time) {
            this.frame++;
            if (this.frame > 1)
                this.frame = 0;
            this.last_time = time + 0.3 + Math.random() * 0.3;
        }
        //console.log(this.frame);
        this.sprite.texCoords = new vec4([0.5 * this.frame, 0.0, 0.5, 1]);
    };
    return Tree;
})();
var MatchState;
(function (MatchState) {
    MatchState[MatchState["Loading"] = 0] = "Loading";
    MatchState[MatchState["Inprogress"] = 1] = "Inprogress";
    MatchState[MatchState["Won"] = 2] = "Won";
    MatchState[MatchState["Lose"] = 3] = "Lose";
    MatchState[MatchState["Next"] = 4] = "Next";
})(MatchState || (MatchState = {}));
var MatchID;
(function (MatchID) {
    MatchID[MatchID["Tutorial"] = 0] = "Tutorial";
    MatchID[MatchID["Level1"] = 1] = "Level1";
    MatchID[MatchID["Level2"] = 2] = "Level2";
    MatchID[MatchID["Level3"] = 3] = "Level3";
    MatchID[MatchID["Level4"] = 4] = "Level4";
})(MatchID || (MatchID = {}));
var MatchScene = (function (_super) {
    __extends(MatchScene, _super);
    function MatchScene() {
        _super.call(this);
        this.finish = false;
        this.tut_dash = false;
        this.tut_jump = false;
        this.tut_bpunch = false;
        this.tut_cpunch = false;
        this.tut_jpunch = false;
    }
    MatchScene.prototype.setup = function () {
        this.match_state = MatchState.Loading;
        this.setup_ground_particles();
        this.finish = false;
        this.last_dead = null;
        this.last_hit = null;
        this.opponents = [];
        this.objects = [];
        this.repeats = [];
        this.trees = [];
        this.combo_sprites = [];
        this.combo_text = [];
        this.combo_text_sprites = [];
        this.combo_cd_sprites = [];
        var start_y = 100;
        var start_x = 120;
        var cscale = 1.0;
        for (var index in combos) {
            this.combo_sprites[index] = ([]);
            var combo_name = new TextSprite(combos[index][4], 10, start_y + index * (10 + 32 * cscale), 100, 100, 32, { center: false, font: "16px monospace" });
            context.passes[0].addSprite(combo_name);
            this.combo_text_sprites[index] = combo_name;
            var x = 10;
            for (var ai in combos[index]) {
                var action = combos[index][0][ai];
                if (action == ActionType.BeginWalk) {
                    var combo_button_sprite = new Sprite(start_x + x, start_y + index * (10 + 32 * cscale), 100, 32 * cscale, 32 * cscale);
                    combo_button_sprite.color = new vec4([0.5, 0.5, 0.5, 0.5]);
                    combo_button_sprite.texCoords = new vec4([0, 0, 0.5, 1]);
                    combo_button_sprite.textures = [data.textures["b_button_combo"].texture];
                    context.passes[0].addSprite(combo_button_sprite);
                    this.combo_sprites[index].push([[combo_button_sprite], 0]);
                }
                else if (action == ActionType.EndWalk) {
                    /*var combo_button_sprite = new Sprite(x, start_y + index * (20 + 16 + 8), 100, 16, 16);
                    combo_button_sprite.color = new vec4([0.5, 0.5, 0.5, 0.5]);
                    combo_button_sprite.texCoords = new vec4([0, 0, 0.5, 1]);
                    combo_button_sprite.textures = [data.textures["b_button_combo_up"].texture];
                    context.passes[0].addSprite(combo_button_sprite);*/
                    this.combo_sprites[index].push([[], 0]);
                }
                else if (action == ActionType.Turn) {
                    var combo_button_sprite = new Sprite(start_x + x, start_y + index * (10 + 32 * cscale), 100, 32 * cscale, 32 * cscale);
                    combo_button_sprite.color = new vec4([0.5, 0.5, 0.5, 0.5]);
                    combo_button_sprite.texCoords = new vec4([0, 0, 0.5, 1]);
                    combo_button_sprite.textures = [data.textures["a_button_combo"].texture];
                    context.passes[0].addSprite(combo_button_sprite);
                    this.combo_sprites[index].push([[combo_button_sprite], 0]);
                }
                else if (action == ActionType.Jump) {
                    var combo_button_sprite = new Sprite(start_x + x, start_y + index * (10 + 32 * cscale), 100, 64 * cscale, 32 * cscale);
                    combo_button_sprite.color = new vec4([0.5, 0.5, 0.5, 0.5]);
                    combo_button_sprite.texCoords = new vec4([0, 0, 0.5, 1]);
                    combo_button_sprite.textures = [data.textures["jump_combo"].texture];
                    context.passes[0].addSprite(combo_button_sprite);
                    this.combo_sprites[index].push([[combo_button_sprite], 0]);
                    x += 32 * cscale;
                }
                else if (action == ActionType.BasicPunch) {
                    var combo_button_sprite = new Sprite(start_x + x, start_y + index * (10 + 32 * cscale), 100, 64 * cscale, 32 * cscale);
                    combo_button_sprite.color = new vec4([0.5, 0.5, 0.5, 0.5]);
                    combo_button_sprite.texCoords = new vec4([0, 0, 0.5, 1]);
                    combo_button_sprite.textures = [data.textures["fist_combo"].texture];
                    context.passes[0].addSprite(combo_button_sprite);
                    this.combo_sprites[index].push([[combo_button_sprite], 0]);
                    x += 32 * cscale;
                }
                else
                    this.combo_sprites[index].push([[], 0]);
                x += 10 + 32 * cscale;
            }
            var combo_cd = new Sprite(10, start_y + index * (10 + 32 * cscale), 100, 320, 32 * cscale);
            combo_cd.color = new vec4([1.0, 0.0, 0.0, 0.5]);
            combo_cd.texCoords = new vec4([0, 0, 1, 1]);
            combo_cd.textures = [empty_texture];
            context.passes[0].addSprite(combo_cd);
            this.combo_cd_sprites[index] = combo_cd;
        }
        this.opponents_dead = 0;
        this.setup_match();
        this.ground_sprite = new Sprite(0, 600 - 80, 0, 11 * 88, 80);
        this.ground_sprite.texCoords = new vec4([0, 0, 11, 1]);
        this.ground_sprite.textures = [data.textures["ground_texture_1"].texture];
        context.passes[0].addSprite(this.ground_sprite);
        this.background_sprite = new Sprite(0, 100, -100, 15 * 64, 15 * 32);
        this.background_sprite.color = new vec4([0.6, 0.6, 0.6, 1]);
        this.background_sprite.texCoords = new vec4([0, 0, 1, 1]);
        this.background_sprite.textures = [data.textures["background_1"].texture];
        context.passes[0].addSprite(this.background_sprite);
        this.sky_sprite = new Sprite(-450, -300, -200, 1800, 1200);
        this.sky_sprite.texCoords = new vec4([0, 0, 1, 1]);
        this.sky_sprite.textures = [data.textures["sky"].texture];
        context.passes[0].addSprite(this.sky_sprite);
        for (var i = 0; i < 20; i++) {
            this.add_tree(new vec2([(900 / 20) * i + (Math.random() - 0.5) * 100, world.w * mpp]), 10 + Math.random() * 5);
        }
        for (var i = 0; i < 15; i++) {
            this.add_tree(new vec2([(900 / 15) * i + (Math.random() - 0.5) * 10, world.w * mpp]), 5 + Math.random() * 5);
        }
        this.a_button_sprite = new Sprite(10, 600 - 70, 100, 64, 64);
        this.a_button_sprite.texCoords = new vec4([0, 0, 0.5, 1]);
        this.a_button_sprite.textures = [data.textures["a_button"].texture];
        context.passes[0].addSprite(this.a_button_sprite);
        this.b_button_sprite = new Sprite(94, 600 - 70, 100, 64, 64);
        this.b_button_sprite.texCoords = new vec4([0, 0, 0.5, 1]);
        this.b_button_sprite.textures = [data.textures["b_button"].texture];
        context.passes[0].addSprite(this.b_button_sprite);
    };
    MatchScene.prototype.add_tree = function (position, scale) {
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
    };
    MatchScene.prototype.spawn_player = function (level) {
        var sprite = new Sprite(0, 0, 1.0, 44, 80);
        sprite.color = new vec4([1.0, 1.0, 1.0, 1.0]);
        sprite.textures = [data.textures["player_spritesheet"].texture];
        var player = new Player(new vec2([20 * ppm, 300 * ppm]), new vec2([sprite.width, sprite.height]));
        player.sprite = sprite;
        player.animation.add_animation("walk", 0, 2, [0.15, 0.1], true);
        player.animation.add_animation("falling", 0, 2, [0.01, 0.5]);
        player.animation.add_animation("bpunch", 1, 4, [0.1, 0.1, 0.1, 0.1]);
        player.animation.add_animation("cpunch", 2, 2, [0.1, 0.1], true);
        player.animation.add_animation("jpunch", 3, 1, [0.5]);
        player.initialize_animations(11, 20, 44, 80);
        player.animation.play("walk");
        player.initialize_health(new vec2([40, 70]), context.passes[0]);
        player.level = level;
        this.add_player(player);
    };
    MatchScene.prototype.spawn_bot = function (name, tex, b) {
        var sprite = new Sprite(0, 0, 1.0, 44, 80);
        sprite.color = new vec4([1.0, 1.0, 1.0, 1.0]);
        sprite.textures = [data.textures[tex].texture];
        var opponent = new b(new vec2([400 * ppm, 300 * ppm]), new vec2([sprite.width, sprite.height]));
        opponent.sprite = sprite;
        opponent.animation.add_animation("walk", 0, 2, [0.15, 0.1], true);
        opponent.animation.add_animation("falling", 0, 2, [0.01, 0.5]);
        opponent.animation.add_animation("fist", 1, 4, [0.1, 0.1, 0.1, 0.1]);
        opponent.initialize_animations(11, 20, 44, 80);
        opponent.animation.play("walk");
        opponent.initialize_health(name, new vec2([900 - 400 - 40, 70 + this.opponents.length * 30]), context.passes[0]);
        this.add_opponent(opponent);
    };
    MatchScene.prototype.setup_match = function () {
        this.spawn_player(this.match_id);
        if (this.match_id == MatchID.Tutorial) {
            for (var index in this.combo_text_sprites) {
                this.combo_text_sprites[index].enabled = false;
            }
            for (var index in this.combo_text) {
                this.combo_text[index].text.enabled = false;
            }
            for (var index in this.combo_cd_sprites) {
                this.combo_cd_sprites[index].enabled = false;
            }
            for (var index in this.combo_sprites) {
                for (var it in this.combo_sprites[index]) {
                    for (var ih in this.combo_sprites[index][it][0]) {
                        this.combo_sprites[index][it][0][ih].enabled = false;
                    }
                }
            }
            this.player.hp.hide();
            var y_start = 50;
            var y = y_start;
            var y_size = 40;
            var tutorial_text1 = new TextSprite("Welcome!", 10, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            var tutorial_text2 = new TextSprite("This is a fighting game with", 10, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            var tutorial_text3 = new TextSprite("only two input button (A and B)", 10, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            y += 25;
            var tutorial_text4 = new TextSprite("A = Will turn the character around", 10, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            var tutorial_text5 = new TextSprite("B = Will move the character forward", 10, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            y += 25;
            var tutorial_text6 = new TextSprite("Because you only have two button you ", 10, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            var tutorial_text7 = new TextSprite("will need to combine them togather", 10, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            var tutorial_text8 = new TextSprite("to make COMBOS (Attacks etc.)", 10, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            y = y_start;
            var tutorial_text9 = new TextSprite("There is 5 combos (currently) in", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            var tutorial_text10 = new TextSprite("the game. ", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            y += 25;
            var tutorial_text11 = new TextSprite("JUMP         =: A A", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            var tutorial_text12 = new TextSprite("DASH         =: B B B", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            var tutorial_text13 = new TextSprite("FIST STRIKE  =: B A", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            var tutorial_text14 = new TextSprite("ENERGY PUSH  =: (B A) (B A)", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            var tutorial_text15 = new TextSprite("CANNONBALL   =: (A A) (A A) A", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            y += 25;
            var tutorial_text16 = new TextSprite("By 'A' I mean: press and release A", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            y += 25;
            var tutorial_text18 = new TextSprite("Complete every combo to continue.", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            this.tut_text_jump = new TextSprite("JUMP         [WAITING]", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            this.tut_text_dash = new TextSprite("DASH         [WAITING]", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            this.tut_text_bpunch = new TextSprite("FIST STRIKE  [WAITING]", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            this.tut_text_cpunch = new TextSprite("ENERGY PUSH  [WAITING]", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            this.tut_text_jpunch = new TextSprite("CANNONBALL   [WAITING]", 10 + 450, 10 + y, 100, 400, y_size, { center: false });
            y += 25;
            this.tut_text = [];
            this.tut_text.push(tutorial_text1);
            this.tut_text.push(tutorial_text2);
            this.tut_text.push(tutorial_text3);
            this.tut_text.push(tutorial_text4);
            this.tut_text.push(tutorial_text5);
            this.tut_text.push(tutorial_text6);
            this.tut_text.push(tutorial_text7);
            this.tut_text.push(tutorial_text8);
            this.tut_text.push(tutorial_text9);
            this.tut_text.push(tutorial_text10);
            this.tut_text.push(tutorial_text11);
            this.tut_text.push(tutorial_text12);
            this.tut_text.push(tutorial_text13);
            this.tut_text.push(tutorial_text14);
            this.tut_text.push(tutorial_text15);
            this.tut_text.push(tutorial_text16);
            this.tut_text.push(tutorial_text18);
            context.passes[0].addSprite(tutorial_text1);
            context.passes[0].addSprite(tutorial_text2);
            context.passes[0].addSprite(tutorial_text3);
            context.passes[0].addSprite(tutorial_text4);
            context.passes[0].addSprite(tutorial_text5);
            context.passes[0].addSprite(tutorial_text6);
            context.passes[0].addSprite(tutorial_text7);
            context.passes[0].addSprite(tutorial_text8);
            context.passes[0].addSprite(tutorial_text9);
            context.passes[0].addSprite(tutorial_text10);
            context.passes[0].addSprite(tutorial_text11);
            context.passes[0].addSprite(tutorial_text12);
            context.passes[0].addSprite(tutorial_text13);
            context.passes[0].addSprite(tutorial_text14);
            context.passes[0].addSprite(tutorial_text15);
            context.passes[0].addSprite(tutorial_text16);
            //context.passes[0].addSprite(tutorial_text17);
            context.passes[0].addSprite(tutorial_text18);
            //context.passes[0].addSprite(tutorial_text19);
            context.passes[0].addSprite(this.tut_text_jump);
            context.passes[0].addSprite(this.tut_text_dash);
            context.passes[0].addSprite(this.tut_text_bpunch);
            context.passes[0].addSprite(this.tut_text_cpunch);
            context.passes[0].addSprite(this.tut_text_jpunch);
        }
        else if (this.match_id == MatchID.Level1) {
            this.spawn_bot("Idiot", "tutorial_spritesheet", DummyBot);
        }
        else if (this.match_id == MatchID.Level2) {
            this.spawn_bot("God", "john_cena_spritesheet", GodBot);
        }
        else if (this.match_id == MatchID.Level3) {
            this.spawn_bot("Chuck Norris", "chuck_norris_spritesheet", ChunkNorrisBot);
        }
        else if (this.match_id == MatchID.Level4) {
            this.spawn_bot("John Cena", "john_cena_spritesheet", JohnCenaBot);
        }
    };
    MatchScene.prototype.print_combo = function (b) {
        if (this.match_id == MatchID.Tutorial)
            return;
        var text = new ComboText(b, new vec2([450 - 100, 100]), new vec2([200, 40]), time);
        context.passes[0].addSprite(text.text);
        this.combo_text.push(text);
    };
    MatchScene.prototype.cleanup = function () {
        this.player.cleanup();
        for (var index in this.opponents)
            this.opponents[index].cleanup();
        this.a_button_sprite.remove();
        this.b_button_sprite.remove();
        for (var index in this.combo_sprites) {
            for (var it in this.combo_sprites[index][0]) {
                for (var ih in this.combo_sprites[index][it][0]) {
                    this.combo_sprites[index][it][0][ih].remove();
                }
            }
        }
        for (var index in this.combo_text_sprites) {
            this.combo_text_sprites[index].remove();
        }
        for (var index in this.combo_cd_sprites) {
            this.combo_cd_sprites[index].remove();
        }
        for (var index in this.combo_text) {
            this.combo_text[index].text.remove();
        }
        for (var index in this.trees) {
            this.trees[index].sprite.remove();
        }
        this.sky_sprite.remove();
        this.ground_sprite.remove();
        this.background_sprite.remove();
        this.ground_particle.cleanup();
        if (this.menu_board != null)
            this.menu_board.remove();
        if (this.win_next_match != null)
            this.win_next_match.cleanup();
        if (this.win_text != null)
            this.win_text.remove();
        if (this.win_title != null)
            this.win_title.remove();
        if (this.lose_re_match != null)
            this.lose_re_match.cleanup();
        if (this.lose_rate != null)
            this.lose_rate.cleanup();
        if (this.lose_text != null)
            this.lose_text.remove();
        if (this.lose_title != null)
            this.lose_title.remove();
        if (this.match_id == MatchID.Tutorial) {
            for (var index in this.tut_text)
                this.tut_text[index].remove();
            this.tut_text_jump.remove();
            this.tut_text_dash.remove();
            this.tut_text_bpunch.remove();
            this.tut_text_cpunch.remove();
            this.tut_text_jpunch.remove();
        }
    };
    MatchScene.prototype.add_player = function (player) {
        this.player = player;
        context.passes[0].addSprite(this.player.sprite);
        this.add_object(this.player);
    };
    MatchScene.prototype.add_opponent = function (opponent) {
        this.opponents.push(opponent);
        context.passes[0].addSprite(opponent.sprite);
        this.add_object(opponent);
    };
    MatchScene.prototype.add_object = function (obj) {
        this.objects.push(obj);
    };
    MatchScene.prototype.setup_menu = function () {
        this.menu_board = new Sprite(450 - 150, 140, 1000, 300, 300);
        this.menu_board.color = new vec4([1, 1, 1, 1]);
        this.menu_board.textures = [data.textures["menu"].texture];
        context.passes[0].addSprite(this.menu_board);
    };
    MatchScene.prototype.update = function (time, delta) {
        var _this = this;
        if (this.match_state == MatchState.Loading)
            this.match_state = MatchState.Inprogress;
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
        if (this.match_id == MatchID.Tutorial &&
            this.match_state == MatchState.Inprogress &&
            this.tut_jump &&
            this.tut_dash &&
            this.tut_bpunch &&
            this.tut_cpunch &&
            this.tut_jpunch) {
            this.match_state = MatchState.Won;
            setTimeout(function () {
                slow_motion(false);
                _this.match_state = MatchState.Next;
                _this.cleanup();
                _this.match_id++;
                _this.setup();
            }, 2000);
            slow_motion(true);
        }
        if (this.match_state == MatchState.Inprogress &&
            this.opponents_dead == this.opponents.length &&
            this.opponents.length > 0) {
            slow_motion(true);
            this.finish = true;
            this.camera_pos = this.player.position.copy().add(this.player.size.copy().mul(0.5 * ppm)).mul(mpp);
            this.match_state = MatchState.Won;
            this.player.hp.hide();
            for (var index in this.opponents)
                this.opponents[index].hp.hide();
            this.a_button_sprite.enabled = false;
            this.b_button_sprite.enabled = false;
            for (var index in this.combo_sprites) {
                for (var it in this.combo_sprites[index]) {
                    for (var ih in this.combo_sprites[index][it][0]) {
                        this.combo_sprites[index][it][0][ih].enabled = false;
                    }
                }
            }
            for (var index in this.combo_text_sprites) {
                this.combo_text_sprites[index].enabled = false;
            }
            for (var index in this.combo_text) {
                this.combo_text[index].text.enabled = false;
            }
            for (var index in this.combo_cd_sprites) {
                this.combo_cd_sprites[index].enabled = false;
            }
            setTimeout(function () {
                _this.setup_menu();
                _this.win_title = new TextSprite("You won!", 450 - 100, 180, 1001, 220, 60, {
                    font: "46px monospace"
                });
                if (_this.match_id == MatchID.Level4) {
                    _this.win_next_match = new ButtonSprite("Rate", 450 - 250 * 0.5, 350, 1001, 250, 50);
                }
                else {
                    _this.win_next_match = new ButtonSprite("Next Fight", 450 - 100, 350, 1001, 200, 50);
                }
                _this.win_next_match.textures = [data.textures["button"].texture];
                _this.win_next_match.color = new vec4([0, 0, 1, 1]);
                context.passes[0].addSprite(_this.win_title);
                context.passes[0].addSprite(_this.win_next_match);
                context.passes[0].addSprite(_this.win_next_match.text);
            }, 8500);
            setTimeout(function () {
                slow_motion(false);
                _this.finish = false;
            }, 7500);
        }
        else if (this.match_state == MatchState.Inprogress &&
            this.player.hp.current_hp <= 0) {
            slow_motion(true);
            this.finish = true;
            this.camera_pos = this.opponents[this.last_hit].position.copy().add(this.opponents[this.last_hit].size.copy().mul(0.5 * ppm)).mul(mpp);
            this.match_state = MatchState.Lose;
            this.player.hp.hide();
            for (var index in this.opponents)
                this.opponents[index].hp.hide();
            this.a_button_sprite.enabled = false;
            this.b_button_sprite.enabled = false;
            for (var index in this.combo_sprites) {
                for (var it in this.combo_sprites[index]) {
                    for (var ih in this.combo_sprites[index][it][0]) {
                        this.combo_sprites[index][it][0][ih].enabled = false;
                    }
                }
            }
            for (var index in this.combo_text_sprites) {
                this.combo_text_sprites[index].enabled = false;
            }
            for (var index in this.combo_text) {
                this.combo_text[index].text.enabled = false;
            }
            for (var index in this.combo_cd_sprites) {
                this.combo_cd_sprites[index].enabled = false;
            }
            /* setTimeout(() => {
                 this.setup_menu();
 
                 this.win_title = new TextSprite("You won!", 450 - 100, 150, 1001, 200, 60,
                     {
                         stroke: true,
                         stroke_width: 1,
                         font: "46px monospace"
                     });
                 this.win_next_match = new ButtonSprite("Next match", 450 - 100, 375, 1001, 200, 50);
                 this.win_next_match.textures = [empty_texture];
                 this.win_next_match.color = new vec4([0, 0, 1, 1]);
 
                 context.passes[0].addSprite(this.win_title);
                 context.passes[0].addSprite(this.win_next_match);
                 context.passes[0].addSprite(this.win_next_match.text);
             }, 8500);*/
            setTimeout(function () {
                _this.setup_menu();
                _this.lose_title = new TextSprite("You Lost!", 450 - 250 * 0.5, 180, 1001, 250, 60, {
                    font: "46px monospace"
                });
                _this.lose_rate = new ButtonSprite("Rate", 450 - 100, 280, 1001, 200, 50);
                _this.lose_rate.textures = [data.textures["button"].texture];
                _this.lose_rate.color = new vec4([0, 0, 1, 1]);
                _this.lose_re_match = new ButtonSprite("Re-fight", 450 - 100, 350, 1001, 200, 50);
                _this.lose_re_match.textures = [data.textures["button"].texture];
                _this.lose_re_match.color = new vec4([0, 0, 1, 1]);
                context.passes[0].addSprite(_this.lose_title);
                context.passes[0].addSprite(_this.lose_re_match);
                context.passes[0].addSprite(_this.lose_re_match.text);
                context.passes[0].addSprite(_this.lose_rate);
                context.passes[0].addSprite(_this.lose_rate.text);
            }, 8500);
            setTimeout(function () {
                slow_motion(false);
                _this.finish = false;
            }, 7500);
        }
        if (this.match_state == MatchState.Won) {
            if (this.win_next_match != null) {
                this.win_next_match.update(mouse.position);
                if (mouse.leftDown && this.win_next_match.inside(mouse.position)) {
                    data.sounds["select"].sound.play();
                    this.match_state = MatchState.Next;
                    this.cleanup();
                    this.match_id++;
                    this.setup();
                }
            }
        }
        else if (this.match_state == MatchState.Lose) {
            if (this.lose_re_match != null) {
                this.lose_re_match.update(mouse.position);
                if (mouse.leftDown && this.lose_re_match.inside(mouse.position)) {
                    data.sounds["select"].sound.play();
                    this.match_state = MatchState.Next;
                    this.cleanup();
                    this.setup();
                }
            }
            if (this.lose_rate != null) {
                this.lose_rate.update(mouse.position);
                if (mouse.leftDown && this.lose_rate.inside(mouse.position)) {
                    data.sounds["select"].sound.play();
                    OpenInNewTabRate();
                    mouse.leftDown = false;
                }
            }
        }
        if (this.match_state == MatchState.Loading ||
            this.match_state == MatchState.Next) {
            return;
        }
        this.update_player(time, delta);
        for (var index in this.opponents)
            this.update_opponent(time, delta, index, this.opponents[index]);
        this.update_world(time, delta);
    };
    MatchScene.prototype.resolve_combo_actions = function (action) {
        var combo_actions = [];
        for (var i = 0; i < combos.length; i++) {
            var combo_ac = combos[i][0];
            var combo_max_time = combos[i][2];
            var combo_cd_time = combos[i][5];
            var combo_check = combos[i][3];
            var combo_id = combo_data[i][0];
            var combo_time = combo_data[i][1];
            if ((combo_id == -1 || time - combo_time > combo_max_time) && action == combo_ac[0] && combo_check(this.player, 0, i)) {
                console.log("begin : " + ActionType[combos[i][1]]);
                combo_data[i] = [1, time, 0];
                this.combo_sprites[i][0][1] = 1;
            }
            else if (combo_id != -1) {
                if (time - combo_time > combo_max_time) {
                    console.log("exit  : " + ActionType[combos[i][1]]);
                    combo_data[i] = [-1, 0, 0];
                }
                else if (action == combo_ac[combo_id] && combo_check(this.player, combo_id, i)) {
                    console.log("update: " + ActionType[combos[i][1]]);
                    if (combo_id + 1 >= combo_ac.length) {
                        data.sounds["combo"].sound.play();
                        console.log("do    : " + ActionType[combos[i][1]]);
                        for (var x = 0; x < combo_ac.length; x++)
                            this.combo_sprites[i][x][1] = 1;
                        combo_actions.push(combos[i][1]);
                        combo_data[i] = [-1, 0, combo_cd_time];
                    }
                    else {
                        combo_data[i] = [combo_id + 1, combo_time + combo_max_time, 0];
                        for (var x = 0; x < combo_id + 1; x++)
                            this.combo_sprites[i][x][1] = 1;
                    }
                }
            }
        }
        return combo_actions;
    };
    MatchScene.prototype.update_player = function (time, delta) {
        var _this = this;
        this.player.animation.update(time, delta);
        if (this.player.animation_state == PlayerAnimationState.None) {
            if (!this.player.onGround) {
                this.player.animation.play_ifn("falling");
            }
            else {
                this.player.animation.play_ifn("walk");
                this.player.animation.animate = false;
                if (Math.abs(this.player.velocity.x) > 0.5)
                    this.player.animation.animate = true;
            }
        }
        else if (this.player.animation_state == PlayerAnimationState.BPunch) {
            this.player.animation.animate = true;
            var animation = this.player.animation.play_ifn("bpunch");
            if (animation.current_frame + 1 == animation.frames && time >= animation.next_frame_time)
                this.player.animation_state = PlayerAnimationState.None;
        }
        else if (this.player.animation_state == PlayerAnimationState.CPunch) {
            this.player.animation.animate = true;
            var animation = this.player.animation.play_ifn("cpunch");
            if (animation.repeat_count > 1)
                this.player.animation_state = PlayerAnimationState.None;
        }
        else if (this.player.animation_state == PlayerAnimationState.JPunch) {
            this.player.animation.animate = true;
            this.player.animation.play_ifn("jpunch");
        }
        this.player.hp.update(delta);
        this.player.blood_system.update(time, delta, gravity, ppm);
        this.player.attack_particles.update(time, delta, gravity, ppm);
        if (this.match_state == MatchState.Lose) {
            if (!this.player.dead) {
                this.player.height_to_ground = this.player.size.x * 1.4;
                this.player.dead = true;
            }
            else {
                var rotation = this.player.sprite.rotation;
                if (this.player.sprite.flip) {
                    if (rotation > -Math.PI / 2) {
                        rotation += -(Math.PI / 2) * delta;
                    }
                    else if (rotation < -Math.PI / 2) {
                        rotation = -(Math.PI / 2);
                    }
                }
                else {
                    if (rotation < Math.PI / 2) {
                        rotation += (Math.PI / 2) * delta;
                    }
                    else if (rotation > Math.PI / 2) {
                        rotation = (Math.PI / 2);
                    }
                }
                this.player.sprite.rotation = rotation;
            }
            var pe = this.player.blood_system;
            var v = -(this.player.sprite.rotation) - (this.player.sprite.flip ? 0 : 1) * Math.PI;
            pe.velocity = new vec2([-3 * Math.cos(v), -3 * Math.sin(v)]);
            pe.spawn_max = (slowmo ? 1 : 2);
            pe.random_velocity = new vec2([0.5, 0.5]);
            pe.relative_random_position = new vec2([0.0, 0.0]);
            pe.lifetime = 1.2;
            pe.scale = 0.15;
            pe.random_scale = 0.05;
            pe.scale_velocity = -0.1;
            pe.random_scale_velocity = 0.1;
            pe.position = this.player.position.copy().add(this.player.size.copy().mul(0.5 * ppm));
            pe.spawn(time, delta);
            if (!slowmo) {
                pe.velocity = new vec2([0, 0]);
                pe.spawn_max = (slowmo ? 1 : 1);
                pe.random_velocity = new vec2([2.0, 2.0]);
                pe.relative_random_position = new vec2([0.0, 0.0]);
                pe.lifetime = 0.5;
                pe.scale = 0.2;
                pe.random_scale = 0.01;
                pe.scale_velocity = -0.05;
                pe.random_scale_velocity = 0.01;
                pe.position = this.player.position.copy().add(this.player.size.copy().mul(0.5 * ppm));
                pe.spawn(time, delta);
            }
            pe.random_velocity = new vec2([2.0, 2.0]);
            pe.relative_random_position = new vec2([0.1, 0.1]);
            pe.scale = 0.3;
            pe.random_scale = 0.05;
            pe.scale_velocity = -0.2;
            pe.random_scale_velocity = 0.1;
        }
        if (this.match_state != MatchState.Inprogress)
            return;
        this.a_button_sprite.texCoords.x = keyboard.isDown(65) ? 0.5 : 0.0;
        this.b_button_sprite.texCoords.x = keyboard.isDown(66) ? 0.5 : 0.0;
        for (var i = 0; i < combos.length; i++) {
            var combo_ac = combos[i][0];
            var combo_max_time = combos[i][2];
            var combo_check = combos[i][3];
            var combo_id = combo_data[i][0];
            var combo_time = combo_data[i][1];
            if (combo_id != -1) {
                if (time - combo_time > combo_max_time) {
                    console.log("exit  : " + ActionType[combos[i][1]]);
                    combo_data[i] = [-1, 0, 0];
                }
                else {
                    for (var x = 0; x < combo_id; x++)
                        this.combo_sprites[i][x][1] = 1;
                }
            }
            if (combo_data[i][2] > 0) {
                combo_data[i][2] -= delta;
                if (combo_data[i][2] < 0)
                    combo_data[i][2] = 0;
            }
        }
        for (var index in this.combo_cd_sprites) {
            this.combo_cd_sprites[index].color.w = (combo_data[index][2] / combos[index][5]) * 0.5;
        }
        var off = new vec4([0.5, 0.5, 0.5, 0.5]);
        var on = new vec4([1.0, 1.0, 1.0, 1.0]);
        for (var i = 0; i < combos.length; i++) {
            for (var u = 0; u < this.combo_sprites[i].length; u++) {
                var t = this.combo_sprites[i][u][1];
                if (t > 1)
                    t = 1;
                for (var tindex in this.combo_sprites[i][u][0]) {
                    this.combo_sprites[i][u][0][tindex].color = lerp_vec4(off, on, t);
                }
                this.combo_sprites[i][u][1] -= delta;
                if (this.combo_sprites[i][u][1] < 0)
                    this.combo_sprites[i][u][1] = 0;
            }
        }
        var action_queue = [];
        if (keyboard.press(66)) {
            action_queue.push(ActionType.BeginWalk);
        }
        else if (keyboard.release(66)) {
            action_queue.push(ActionType.EndWalk);
        }
        if (keyboard.press(65)) {
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
                    for (var ik in ca)
                        new_ca.push(ca[ik]);
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
                    if (this.match_id == MatchID.Tutorial && !this.tut_dash) {
                        this.tut_dash = true;
                        this.tut_text_dash.data = "DASH         [COMPLETED]";
                        this.tut_text_dash.update();
                    }
                    var data = [];
                    repate_function(data, function (i, data) {
                        _this.player.attack_particles.lifetime = 0.5;
                        _this.player.attack_particles.random_velocity = new vec2([0, 0]);
                        _this.player.attack_particles.velocity = _this.player.velocity.copy().mul(-1);
                        _this.player.attack_particles.velocity.add(new vec2([0.2 * _this.player.moveDirection, 0]));
                        _this.player.attack_particles.position = _this.player.position.copy().add(_this.player.size.copy().mul(0.5 * ppm));
                        _this.player.attack_particles.relative_random_position = _this.player.size.copy().mul(0.5 * ppm).mul(new vec2([0, 1]));
                        _this.player.attack_particles.spawn_max = 2;
                        _this.player.attack_particles.spawn(time, delta);
                    }, 10, delta);
                    this.print_combo("DASH");
                    this.player.velocity.x += 15800 * this.player.moveDirection;
                    this.player.velocity.y -= 0.5;
                }
                else if (action == ActionType.JumpPunch) {
                    this.print_combo("CANNONBALL");
                    this.player.moveDirection *= -1;
                    this.player.velocity.y += 40;
                    this.player.jump_punch = true;
                    this.player.animation_state = PlayerAnimationState.JPunch;
                }
                else if (action == ActionType.Turn)
                    this.player.moveDirection *= -1;
                else if (action == ActionType.Jump && !this.player.jump_punch && this.player.jump_count < 1) {
                    this.print_combo("JUMP");
                    this.player.jump_count++;
                    this.player.velocity.y -= 5;
                    var data = [];
                    repate_function(data, function (i, data) {
                        _this.player.attack_particles.lifetime = 0.5;
                        _this.player.attack_particles.random_velocity = new vec2([0, 0]);
                        _this.player.attack_particles.velocity = new vec2([0, 1]);
                        _this.player.attack_particles.velocity.add(new vec2([(Math.random() - 0.5) * 0.5, 0.2 * _this.player.moveDirection]));
                        _this.player.attack_particles.position = _this.player.position.copy().add(_this.player.size.copy().mul(0.5 * ppm));
                        _this.player.attack_particles.relative_random_position = _this.player.size.copy().mul(0.5 * ppm).mul(new vec2([0.1, 1]));
                        _this.player.attack_particles.spawn_max = 1;
                        _this.player.attack_particles.spawn(time, delta);
                    }, 4, delta);
                    if (this.match_id == MatchID.Tutorial && !this.tut_jump) {
                        this.tut_jump = true;
                        this.tut_text_jump.data = "JUMP         [COMPLETED]";
                        this.tut_text_jump.update();
                    }
                }
                else if (action == ActionType.BasicPunch) {
                    this.player.moveDirection *= -1;
                    this.player.animation_state = PlayerAnimationState.BPunch;
                    this.player.animation.play_ifn("bpunch");
                    this.print_combo("FIST");
                    if (this.match_id == MatchID.Tutorial && !this.tut_bpunch) {
                        this.tut_bpunch = true;
                        this.tut_text_bpunch.data = "FIST STRIKE  [COMPLETED]";
                        this.tut_text_bpunch.update();
                    }
                    repate_function(data, function (i, data) {
                        _this.player.attack_particles.lifetime = 0.5;
                        _this.player.attack_particles.random_velocity = new vec2([0, 0]);
                        _this.player.attack_particles.velocity = new vec2([_this.player.moveDirection, 0]);
                        _this.player.attack_particles.position = _this.player.position.copy().add(_this.player.size.copy().mul(0.5 * ppm));
                        _this.player.attack_particles.relative_random_position = _this.player.size.copy().mul(0.5 * ppm).mul(new vec2([1, 1]));
                        _this.player.attack_particles.spawn_max = 2;
                        _this.player.attack_particles.spawn(time, delta);
                    }, 10, delta);
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
                                pe.spawn(time, delta);
                            }
                        }
                    }
                }
                else if (action == ActionType.CirclePunch) {
                    this.player.moveDirection *= -1;
                    this.player.velocity.y += 5;
                    this.player.animation_state = PlayerAnimationState.CPunch;
                    this.player.animation.play_ifn("cpunch");
                    this.print_combo("ENERGY PUSH");
                    if (this.match_id == MatchID.Tutorial && !this.tut_cpunch) {
                        this.tut_cpunch = true;
                        this.tut_text_cpunch.data = "ENERGY PUSH  [COMPLETED]";
                        this.tut_text_cpunch.update();
                    }
                    this.player.attack_particles.velocity = new vec2([0, 0]);
                    this.player.attack_particles.random_velocity = new vec2([10, 10]);
                    this.player.attack_particles.position = this.player.position.copy().add(this.player.size.copy().mul(0.5 * ppm));
                    this.player.attack_particles.relative_random_position = this.player.size.copy().mul(0.5 * ppm);
                    this.player.attack_particles.spawn_max = 200;
                    this.player.attack_particles.lifetime = 0.2;
                    this.player.attack_particles.spawn(time, delta);
                    console.log("C Punch");
                    for (var id in this.objects) {
                        var obj = this.objects[id];
                        if (obj.remove || obj.isStatic || obj instanceof Player)
                            continue;
                        var dx = obj.position.x - this.player.position.x;
                        var dy = obj.position.y - this.player.position.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= (this.player.size.x * 5) * ppm) {
                            var dt = dist / (this.player.size.x * 5 * ppm);
                            var angle = Math.atan2(-dy, dx);
                            var punch_velocity = new vec2([(16000 + dt * 10000) * Math.cos(angle), -20 * Math.sin(angle)]);
                            obj.velocity.add(punch_velocity);
                            var pe = null;
                            if (obj instanceof Bot) {
                                pe = obj.blood_system;
                                obj.attacked(this.player.cpunch_damage());
                                pe.velocity = new vec2([Math.cos(angle), -Math.sin(Math.PI / 4)]);
                                pe.spawn_max = 10;
                                pe.position = obj.position.copy().add(obj.size.copy().mul(0.5 * ppm));
                                pe.spawn(time, delta);
                            }
                        }
                    }
                }
            }
        }
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
        if (this.player.onGround)
            this.player.jump_count = 0;
        if (this.player.onGround && this.player.jump_punch) {
            this.player.animation_state = PlayerAnimationState.None;
            if (this.match_id == MatchID.Tutorial && !this.tut_jpunch) {
                this.tut_jpunch = true;
                this.tut_text_jpunch.data = "CANNONBALL   [COMPLETED]";
                this.tut_text_jpunch.update();
            }
            var pdata = [
                new vec2([0, -3.5]),
                this.player.position.copy().add(new vec2([this.player.size.x * 0.5 * ppm, this.player.size.y * ppm - 10 * ppm])),
                new vec2([(this.player.size.x * 4) * ppm, 0])
            ];
            repate_function(pdata, function (i, data) {
                _this.player.attack_particles.lifetime = 0.5;
                _this.player.attack_particles.random_velocity = new vec2([0, 0]);
                _this.player.attack_particles.velocity = data[0];
                _this.player.attack_particles.velocity.add(new vec2([0.2 * (Math.random() - 0.5), -(Math.random() - 0.5) * 1]));
                _this.player.attack_particles.position = data[1];
                _this.player.attack_particles.relative_random_position = data[2];
                _this.player.attack_particles.spawn_max = 8;
                _this.player.attack_particles.spawn(time, delta);
                _this.player.attack_particles.velocity = new vec2([0, 0]);
                _this.player.attack_particles.position = data[1];
                _this.player.attack_particles.relative_random_position = data[2];
                _this.player.attack_particles.spawn_max = 8;
                _this.player.attack_particles.spawn(time, delta);
            }, 10, delta);
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
                        pe.spawn(time, delta);
                    }
                }
            }
            this.player.jump_punch = false;
        }
    };
    MatchScene.prototype.update_opponent = function (time, delta, id, bot) {
        bot.animation.update(time, delta);
        if (bot.animation_state == BotAnimationState.None) {
            if (!bot.onGround) {
                bot.animation.play_ifn("falling");
            }
            else {
                bot.animation.play_ifn("walk");
                bot.animation.animate = false;
                if (Math.abs(bot.velocity.x) > 0.2)
                    bot.animation.animate = true;
            }
        }
        else if (bot.animation_state == BotAnimationState.Fist) {
            bot.animation.animate = true;
            var animation = bot.animation.play_ifn("fist");
            if (animation.current_frame + 1 == animation.frames && time >= animation.next_frame_time)
                bot.animation_state = BotAnimationState.None;
        }
        bot.attack_particles.update(time, delta, gravity, ppm);
        bot.blood_system.update(time, delta, gravity, ppm);
        if (this.match_state == MatchState.Inprogress && !bot.dead) {
            bot.hp.update(delta);
            if (bot.update(time, delta, this.player))
                this.last_hit = id;
        }
        if (bot.dead) {
            var rotation = bot.sprite.rotation;
            if (bot.sprite.flip) {
                if (rotation > -Math.PI / 2) {
                    rotation += -(Math.PI / 2) * delta;
                }
                else if (rotation < -Math.PI / 2) {
                    rotation = -(Math.PI / 2);
                }
            }
            else {
                if (rotation < Math.PI / 2) {
                    rotation += (Math.PI / 2) * delta;
                }
                else if (rotation > Math.PI / 2) {
                    rotation = (Math.PI / 2);
                }
            }
            bot.sprite.rotation = rotation;
        }
        if (bot.hp.current_hp <= 0) {
            if (!bot.dead) {
                var dp = this.player.position.copy().sub(bot.position);
                dp.div(dp.length());
                bot.velocity.sub(dp.mul(2));
                bot.height_to_ground = bot.size.x * 1.4;
                this.opponents_dead++;
                bot.dead = true;
                this.last_dead = id;
            }
            var pe = bot.blood_system;
            var v = -(bot.sprite.rotation) - (bot.sprite.flip ? 0 : 1) * Math.PI;
            pe.velocity = new vec2([-3 * Math.cos(v), -3 * Math.sin(v)]);
            pe.spawn_max = (slowmo ? 1 : 2);
            pe.random_velocity = new vec2([0.5, 0.5]);
            pe.relative_random_position = new vec2([0.0, 0.0]);
            pe.lifetime = 1.2;
            pe.scale = 0.15;
            pe.random_scale = 0.05;
            pe.scale_velocity = -0.1;
            pe.random_scale_velocity = 0.1;
            pe.position = bot.position.copy().add(bot.size.copy().mul(0.5 * ppm));
            pe.spawn(time, delta);
            if (!slowmo) {
                pe.velocity = new vec2([0, 0]);
                pe.spawn_max = (slowmo ? 1 : 1);
                pe.random_velocity = new vec2([2.0, 2.0]);
                pe.relative_random_position = new vec2([0.0, 0.0]);
                pe.lifetime = 0.5;
                pe.scale = 0.2;
                pe.random_scale = 0.01;
                pe.scale_velocity = -0.05;
                pe.random_scale_velocity = 0.01;
                pe.position = bot.position.copy().add(bot.size.copy().mul(0.5 * ppm));
                pe.spawn(time, delta);
            }
            pe.random_velocity = new vec2([2.0, 2.0]);
            pe.relative_random_position = new vec2([0.1, 0.1]);
            pe.scale = 0.3;
            pe.random_scale = 0.05;
            pe.scale_velocity = -0.2;
            pe.random_scale_velocity = 0.1;
        }
        bot.sprite.flip = (bot.moveDirection == -1);
    };
    MatchScene.prototype.update_world = function (time, delta) {
        if (this.finish) {
            camera_zoom = 1.8;
            // var screen = new vec2([450, 300]);
            //screen.div(camera_zoom);
            if (this.camera_pos.y + 300 / camera_zoom > 600)
                this.camera_pos.y = 600 - 300 / camera_zoom;
            if (this.camera_pos.y - 300 / camera_zoom < 0)
                this.camera_pos.y = 0 + 300 / camera_zoom;
            if (this.camera_pos.x + 450 / camera_zoom > 900)
                this.camera_pos.x = 900 - 450 / camera_zoom;
            if (this.camera_pos.x - 450 / camera_zoom < 0)
                this.camera_pos.x = 0 + 450 / camera_zoom;
            camera_position = this.camera_pos.copy().sub(new vec2([450, 450 - (camera_zoom - 1) * 150])).mul(2 * camera_zoom);
            if (this.match_state == MatchState.Won) {
                var bot = this.opponents[this.last_dead];
                var target = bot.position.copy().add(bot.size.copy().mul(0.5 * ppm)).mul(mpp);
                target.sub(this.camera_pos);
                this.camera_pos.add(target.mul(0.1));
            }
            else if (this.match_state == MatchState.Lose) {
                var target = this.player.position.copy().add(this.player.size.copy().mul(0.5 * ppm)).mul(mpp);
                target.sub(this.camera_pos);
                this.camera_pos.add(target.mul(0.1));
            }
        }
        else {
            camera_zoom = 1.0;
            camera_position = new vec2([0, 0]);
        }
        //camera_position = (new vec2([900, 300])).sub(new vec2([450, 300])).mul(2);
        // var screen = new vec2([900, 600]);
        //screen.div(camera_zoom);
        //camera_position = this.player.position.copy().add(this.player.size.copy().mul(0.5 * ppm)).mul(mpp).sub(screen);
        //camera_position = (new vec2([0, 0])).sub(screen);
        this.ground_particle.update(time, delta, gravity, ppm);
        for (var index in this.trees) {
            this.trees[index].update(time);
        }
        for (var index in this.combo_text) {
            if (this.combo_text[index].dead)
                continue;
            this.combo_text[index].update(time, delta);
            if (time > this.combo_text[index].despawn_time) {
                this.combo_text[index].dead = true;
                this.combo_text[index].text.remove();
            }
        }
        this.combo_text = this.combo_text.filter(function (value, index, array) { return !value.dead; });
        //if (this.match_state != MatchState.Inprogress)
        //return;
        for (var id in this.objects) {
            var obj = this.objects[id];
            if (obj.remove || !obj.isStatic) {
                var g = gravity.copy().mul(delta);
                obj.velocity.add(g);
                if (obj.onGround)
                    obj.velocity.x *= 0.8;
                else
                    obj.velocity.x *= 0.95;
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
                obj.position.add(obj.velocity.copy().mul(delta));
                if (obj.position.y > world.w - obj.height_to_ground * ppm) {
                    obj.position.y = world.w - obj.height_to_ground * ppm;
                    obj.velocity.y = 0;
                    obj.onGround = true;
                    if (obj.onGround && !prev_ground) {
                        this.ground_particle.velocity = (new vec2([0, -3])).add(obj.velocity.copy().mul(-1 * 0.1));
                        this.ground_particle.position = obj.position.copy().add(new vec2([obj.size.x * 0.25 * ppm, obj.size.y * ppm]));
                        this.ground_particle.relative_random_position = new vec2([obj.size.x * ppm * 0.5, 0]);
                        this.ground_particle.spawn_max = 10;
                        this.ground_particle.spawn(time, delta);
                    }
                }
                if (obj.position.x < world.x) {
                    obj.position.x = world.x;
                    obj.velocity.x *= -1 * 0.5;
                }
                else if (obj.position.x > world.z - obj.size.x * ppm) {
                    obj.position.x = world.z - obj.size.x * ppm;
                    obj.velocity.x *= -1 * 0.5;
                }
                var matrix = mat3.makeIdentity();
                matrix.multiply(mat3.makeTranslate(-obj.size.x * 0.5, -obj.size.y * 0.5));
                matrix.multiply(mat3.makeRotation(obj.sprite.rotation));
                matrix.multiply(mat3.makeTranslate(obj.size.x * 0.5, obj.size.y * 0.5));
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
//# sourceMappingURL=match_scene.js.map