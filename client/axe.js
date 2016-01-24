'use strict';

var SpriteAnimation = require('./sprite-animation'),
    misc = require('./misc.js');

var minPixels = 200, minTime = 1000;

function Swing(frames) {
    this.frames = frames;
    this.start = new THREE.Vector2(0, 0);
    this.end = new THREE.Vector2(0, 0);
    this.delta = new THREE.Vector2(0, 0);
}
misc.merge(Swing.prototype, {
    min2: (minPixels * minPixels) / (minTime * minTime),
    maxDelta: new THREE.Vector2(380, 320),
    get time() {
        return this.endTime - this.startTime;
    },
    get time2() {
        return this.time * this.time;
    },
    get speed2() {
        return this.delta.lengthSq() / this.time2;
    },
    get speed() {
        return Math.sqrt(this.speed2);
    },
    get fast() {
        return this.speed2 > this.min2;
    },

    setStart: function(x, y, time) {
        this.start.set(x, y);
        this.startTime = time;
    },
    setEnd: function(x, y, time) {
        this.end.set(x, y);
        this.endTime = time;
        this.delta.copy(this.end).sub(this.start);
        this.checkDelta();
    },
    checkDelta: function() {
        let diff = new THREE.Vector2(
            Math.max(Math.abs(this.delta.x) - this.maxDelta.x, 0),
            Math.max(Math.abs(this.delta.y) - this.maxDelta.y, 0)
        );
        if (diff.lengthManhattan() > 0) {
            let diffRatio = Math.sqrt(diff.lengthSq() / this.delta.lengthSq());
            let diffTime = this.time * diffRatio;
            this.setStart(
                this.start.x + Math.sign(this.delta.x) * diff.x / 2,
                this.start.y + Math.sign(this.delta.y) * diff.y / 2,
                this.startTime + diffTime / 2
            );
            this.setEnd(
                this.end.x - Math.sign(this.delta.x) * diff.x / 2,
                this.end.y - Math.sign(this.delta.y) * diff.y / 2,
                this.endTime - diffTime / 2
            );
        }
    },

    getFramesForAngle: function(angle) {
        let absAngle = Math.abs(angle);
        if (absAngle < Math.PI/4) {
            if (angle <= 0) return this.frames.downwardRightLeft;
            else return this.frames.downwardLeftRight;
        } else if (absAngle < 3*Math.PI/4) {
            if (angle <= 0) return this.frames.sideRightLeft;
            else return this.frames.sideLeftRight;
        } else {
            if (angle <= 0) return this.frames.forwardRightLeft;
            else return this.frames.forwardLeftRight;
        }
    },
    createSwingAnimation: function(overlay) {
        if (this.ongoing) {
            if (this.ongoing.currentStep / this.ongoing.steps > 0.8) {
                misc.remove(overlay.renderables, this.ongoing);
            } else return this.ongoing;
        }

        let frames = this.getFramesForAngle(Math.atan2(this.delta.x, this.delta.y));
        this.ongoing = new SpriteAnimation(
            this.start, this.delta, Math.min(this.time * 4, 350), this.speed * 16,
            progress => frames[Math.min(Math.floor(progress * frames.length), frames.length - 1)]
        );
        overlay.renderables.push(this.ongoing);
        return this.ongoing;
    },

    step: function(overlay) {
        if (this.ongoing) {
            this.ongoing.step();
            if (this.ongoing.finished) {
                misc.remove(overlay.renderables, this.ongoing);
                this.ongoing = null;
            }
        }
    }
});

var getImg = (src, onload) => {
    let img = document.createElement('img');
    img.onload = event => onload(img);
    img.src = src;
};
var getImgs = (src, onloadSrc) => src.forEach((s, i) => getImg(s, onloadSrc(s, i)));

module.exports = {
    createSwing: onReady => {
        let axeFrames = {
            idle: [],
            downwardLeftRight: [],
            downwardRightLeft: [],
            sideLeftRight: [],
            sideRightLeft: [],
            forwardLeftRight: [],
            forwardRightLeft: []
        };
        let remaining = 4 * 4 + 1;
        let onDone = () => onReady(new Swing(axeFrames));

        getImg('/img/player/axe/idle.png', img => {
            axeFrames.idle.push(img);
            if (!--remaining) onDone();
        });
        getImgs([
            '/img/player/axe/downward-left-right-1.png',
            '/img/player/axe/downward-left-right-2.png',
            '/img/player/axe/downward-left-right-3.png',
            '/img/player/axe/downward-left-right-4.png',
        ], (src, i) => (img) => {
            axeFrames.downwardLeftRight[i] = img;
            axeFrames.forwardRightLeft[3 - i] = img;
            if (!--remaining) onDone();
        });
        getImgs([
            '/img/player/axe/downward-right-left-1.png',
            '/img/player/axe/downward-right-left-2.png',
            '/img/player/axe/downward-right-left-3.png',
            '/img/player/axe/downward-right-left-4.png',
        ], (src, i) => (img) => {
            axeFrames.downwardRightLeft[i] = img;
            axeFrames.forwardLeftRight[3 - i] = img;
            if (!--remaining) onDone();
        });
        getImgs([
            '/img/player/axe/side-left-right-1.png',
            '/img/player/axe/side-left-right-2.png',
            '/img/player/axe/side-left-right-3.png',
            '/img/player/axe/side-left-right-4.png',
        ], (src, i) => (img) => {
            axeFrames.sideLeftRight[i] = img;
            if (!--remaining) onDone();
        });
        getImgs([
            '/img/player/axe/side-right-left-1.png',
            '/img/player/axe/side-right-left-2.png',
            '/img/player/axe/side-right-left-3.png',
            '/img/player/axe/side-right-left-4.png',
        ], (src, i) => (img) => {
            axeFrames.sideRightLeft[i] = img;
            if (!--remaining) onDone();
        });
    }
};