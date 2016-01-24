'use strict';

var misc = require('./misc');

function SpriteAnimation(start, delta, time, topHeight, imgSrc) {
    this.start = start.clone();
    this.totalTime = time;
    this.imgSrc = imgSrc;

    this.currentStep = 0;
    this.steps = Math.ceil(time / 1000 * 60);
    this.position = start.clone();
    this.velocity = delta.clone().multiplyScalar(1 / this.steps);
    /*
        We have that a parabola can be defined as
        y = c(x-a)(x-b) where a, b are it's zeroes
        we know that if c is negative, then the function will max out at
        x = (a+b)/2
        at this x, we can calculate that y = c(2ba - b^2 - a^2)/4
        since in our case, a = 0
        we can simplify to
        y = c * (-b^2) / 4
        and if we isolate c we have
        c = 4 * y / (-b^2)
        for c is our modifier and y the height we want to reach
    */
    this.topModifier = -4 * topHeight / (this.steps * this.steps);
}
misc.merge(SpriteAnimation.prototype, {
    step: function() {
        this.currentStep = Math.min(this.currentStep + 1, this.steps);
        let decal = this.topModifier
            * (this.currentStep)
            * (this.currentStep - this.steps);
        this.position
            .copy(this.velocity)
            .multiplyScalar(this.currentStep)
            .add(this.start)
            .setY(this.position.y - decal);
    },
    render: function(ctx) {
        var img = this.imgSrc(this.currentStep / this.steps);
        ctx.drawImage(img,
            Math.round(this.position.x - img.width),
            Math.round(this.position.y - img.height/2),
            img.width*2,
            img.height*2
        );
    },
    get finished() {
        return this.currentStep === this.steps;
    }
});

module.exports = SpriteAnimation;