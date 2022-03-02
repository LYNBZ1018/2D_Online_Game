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
            if (e.which === 3) {  // e.which 是点击的键对应的值 == 3 是右键
                outer.move_to(e.clientX, e.clientY);  // e.clientX 是鼠标的x坐标  移动到鼠标的位置
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX, e.clientY);
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
        this.radius -= damage;
        console.log(this.radius - damage);
        if (this.radius < 10) {
            console.log("destroy", this.radius);
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 90;
    }

    update() {
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
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
