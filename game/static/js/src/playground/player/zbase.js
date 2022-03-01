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
        this.move_length = 0;  // 移动距离
        this.radius = radius;  // 半径
        this.color = color;  // 颜色
        this.is_me = is_me;  // 玩家类型

        this.speed = speed;  // 速度
        this.is_alive = true;  // 玩家是否存活

        this.eps = 0.01  // 精度 小于多少是0
    }

    start() {
        if (this.is_me) {  // 只有是自己时才可以用鼠标控制
            this.add_listening_events();
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
            }
        });
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

    update() {
        if (this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
        } else {
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);  // 每两帧之间的时间差是毫秒需要除1000 和要移动的距离取min防止越界
            console.log(this.timedelta);
            this.x += this.vx * moved;  // 用分量系数乘实际走的距离获得分量距离
            this.y += this.vy * moved;
            this.move_length -= moved;  // 每次减去实际走的距离
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
