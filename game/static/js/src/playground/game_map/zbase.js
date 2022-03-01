class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;  // 传入playground
        this.$canvas = $('<canvas></canvas>');  // canvas 画布
        this.ctx = this.$canvas[0].getContext('2d');  // 用 ctx 操作画布 canvas

        this.ctx.canvas.width = this.playground.width;  // 设置画布的宽度  在playground中记录了playground的宽度和高度
        this.ctx.canvas.height = this.playground.height;  // 设置画布的高度

        this.playground.$playground.append(this.$canvas);  // 将这个画布加入到playground
    }

    render() {
        this.ctx.fillStyle = "rgb(0, 0, 0)";  // 设置颜色
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);  // 设置长方形
    }

    start() {

    }

    update() {
        this.render();  // 这个地图要一直执行画面渲染
    }
}
