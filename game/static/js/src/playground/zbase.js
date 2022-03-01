class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        //this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();  // 记录playground的宽度
        this.height = this.$playground.height();  // 记录高度
        this.game_map = new GameMap(this);  // 需要传入playground参数 加入画布
        this.players = [];  // 创建用户队列
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "Dodgerblue", true, this.height * 0.15));  // playground, x, y, radius, color, is_me, speed

        this.start();
    }

    start() {

    }

    show() {
        this.$playground.show();
    }

    hide() {
        this.$playground.hide();
    }
}
