class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            设置
        <div>
    </div>
</div>
`);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
            outer.root.settings.logout_on_remote();
        });
    }

        show() {
            this.$menu.show();
        }

        hide() {
            this.$menu.hide();
        }
}
let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;  // 是否执行过start函数
        this.timedelta = 0;  // 当前帧距离上一帧的时间间隔
    }

    start() {  // 只会在第一帧执行一次
    }

    update() {  // 每一帧均会执行一次
    }

    on_destroy() {  // 在被销毁前执行一次
    }

    destroy() {  // 删掉该物体
        this.on_destroy();

        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp) {
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        }
        else {
            obj.timedelta = timestamp - last_timestamp;  // 和上一帧的时间差
            obj.update();  // 不断调用
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);
}


requestAnimationFrame(AC_GAME_ANIMATION);
class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;  // 传入playground
        this.$canvas = $(`<canvas></canvas>`);  // canvas 画布
        this.ctx = this.$canvas[0].getContext("2d");  // 用 ctx 操作画布 canvas

        this.ctx.canvas.width = this.playground.width;  // 设置画布的宽度  在playground中记录了playground的宽度和高度
        this.ctx.canvas.height = this.playground.height;  // 设置画布的高度

        this.playground.$playground.append(this.$canvas);  // 将这个画布加入到playground
    }

    start() {

    }

    update() {
        this.render();  // 这个地图要一直执行画面渲染
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";  // 设置颜色
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);  // 设置长方形
    }
}
class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 10;
        this.eps = 0.01;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps || this.speed <this.eps) {  // move_length减小到一定值后就消失或者速度减小到一定值
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends AcGameObject
{
    constructor(playground, x, y, radius, color, is_me, speed){
        super(true);

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        
        this.x = x;  // 起始位置
        this.y = y;
        this.vx = 0;  // 速度
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;  // 移动距离
        this.radius = radius;  // 半径
        this.color = color;  // 颜色
        this.is_me = is_me;  // 玩家类型

        this.speed = speed;  // 速度
        this.is_alive = true;  // 玩家是否存活

        this.eps = 0.01  // 精度 小于多少是0
        this.friction = 0.7;
        this.cur_skill = null;  // 判断是否选择技能
        this.spent_time = 0;  // 冷静期
        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start() {
        if (this.is_me) {  // 只有是自己时才可以用鼠标控制
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {  // 关闭画布上的鼠标监听右键
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {  // 鼠标监听
            const rect = outer.ctx.canvas.getBoundingClientRect();  // 画布距离屏幕左上角的距离
            if (e.which === 3) {  // e.which 是点击的键对应的值 == 3 是右键
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);  // e.clientX 是鼠标的x坐标  移动到鼠标的位置  减去画布距离左上角的距离
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);  // 减去距离左上角的距离
                }

                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if (e.which === 81) {  // 81 是q的keycode
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
    }

    get_dist(x1, y1, x2, y2) {  // 获得两点之间的直线距离
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {  // 移动到 tx ty
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);  // 获得x y 方向的分量系数
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 6 + Math.random() * 5; i ++ ) {  // 攻击后的粒子效果
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.18;  // 随机半径
            let angle = Math.PI * 2 * Math.random();  // 随机角度
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;  // 颜色和母体保持一致
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 3;  // 设置一个距离
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        this.radius -= damage;
        if (this.radius < 10) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 90;
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        if (!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }
        if (this.damage_speed > 40) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);  // 每两帧之间的时间差是毫秒需要除1000 和要移动的距离取min防止越界
                this.x += this.vx * moved;  // 用分量系数乘实际走的距离获得分量距离
                this.y += this.vy * moved;
                this.move_length -= moved;  // 每次减去实际走的距离
            }
        }
            this.render();
    }

        render() {
            if (this.is_me) {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                this.ctx.stroke();
                this.ctx.clip();
                this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
                this.ctx.restore();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                this.ctx.fillStyle = this.color;
                this.ctx.fill();
            }
        }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}
class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;

        this.x = x;  // 火球的基本参数 位置 速度 大小 距离
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.01;  // 精度用来判断 当*小于eps时为0
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);  // timedelta记录的是毫秒需要除1000
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
                break;
            }
        }

        this.render();  // 不断地执行 知道destroy
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide();
        
        this.start();
    }

    start() {

    }

    show() {
        this.$playground.show();  // 打开playground界面

        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();  // 记录playground的宽度
        this.height = this.$playground.height();  // 记录高度
        this.game_map = new GameMap(this);  // 需要传入playground参数 加入画布
        this.players = [];  // 创建用户队列
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", true, this.height * 0.15));  // playground, x, y, radius, color, is_me, speed
        
        this.playercolor = ["Dodgerblue", "Tomato", "MediumseaGreen", "SlateBlue", "pink"];
        for (let i = 0; i < 5; i ++ ) {
            let pcolor = this.playercolor[i];
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, pcolor, false, this.height * 0.15));
        }

    }

    hide() {
        this.$playground.hide();
    }
}
class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-title">
            登录
        </div>
        <div class="ac-game-settings-uername">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app1832.acapp.acwing.com.cn/static/image/settings/acwing_logo.jpg">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
    <div cladd="ac-game-settings-register">
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="ac-game-settings-option">
            登陆
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app1832.acapp.acwing.com.cn/static/image/settings/acwing_logo.jpg">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
</div>
`);
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit-button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();

        this.root.$ac_game.append(this.$settings);

        this.start();
    }

    start() {
        this.getinfor();
        this.add_listening_events();
    }

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    add_listening_events_login() {
        let outer = this;
        this.$login_register.click(function() {
            outer.register();  // 跳转到注册界面
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }


    add_listening_events_register() {
        let outer = this;
        this.$register_login.click(function() {
            outer.login();  // 跳转到登陆界面
        });
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    login_on_remote() {
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $ajax({
            url: "https://app1832.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.register_password_confirm.val();
        this.$register_error_message.empty();

        $ajax({
            url: "https://app1832.acapp.acwing.com.cn/settings/register",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$register_error-message.html(resp.result);
                }
            }
        })
    }

    register() {
        this.$login.hide();
        this.$register.show();
    }

    login() {
        this.$register.hide();
        this.$login.show();
    }

    getinfor() {
        let outer = this;
        $.ajax({
            url: "https://app1832.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {  // 登录成功，关闭登录界面，打开主菜单
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$setting.show();
    }
}
export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {
    }
}
