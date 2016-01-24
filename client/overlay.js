var misc = require('./misc');

function Overlay() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.renderables = [];
}
misc.merge(Overlay.prototype, {
    render: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderables.forEach(renderable => renderable.render(this.ctx));
    },
    attach: function(tag) {
        tag.appendChild(this.canvas);
    },
    setSize: function(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.imageSmoothingEnabled = false;
    }
});

module.exports = Overlay;