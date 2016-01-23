var misc = require('./misc');

var keys = {
    left: [37, 65],
    up: [38, 87],
    right: [39, 68],
    down: [40, 83]
};
var reverseKeys = {};
Object.keys(keys).forEach(key =>
    keys[key].forEach(keyCode =>
        reverseKeys[keyCode] = key));

var buttons = {
    main: [0],
    off: [2]
};
var reverseButtons = {};
Object.keys(buttons).forEach(btn =>
    buttons[btn].forEach(btnCode =>
        reverseButtons[btnCode] = btn));

var controls = {
    keys: keys,
    reverseKeys: reverseKeys,
    keyFor: function(keyCode) {
        return this.reverseKeys[keyCode];
    },

    buttons: buttons,
    reverseButtons: reverseButtons,
    buttonFor: function(buttonCode) {
        return this.reverseButtons[buttonCode];
    },

    get tag() {
        return this._tag;
    },
    set tag(tag) {
        if (this._tag) {
            this._tag.onmousemove = null;
            this._tag.onmousedown = null;
            this._tag.onmouseup = null;
            this._tag.onkeydown = null;
            this._tag.onkeyup = null;
        }
        this._tag = tag;
        if (!tag) return;
        tag.onmousemove = event => {
            this.state.mouseX = event.x;
            this.state.mouseY = event.y;
        };
        tag.onmousedown = event => {
            var btn = this.buttonFor(event.button);
            misc.add(this.state.buttons.pressed, btn);
            misc.add(this.state.buttons.down, btn);
        };
        tag.onmouseup = event => {
            var btn = this.buttonFor(event.button);
            misc.add(this.state.buttons.released, btn);
            misc.remove(this.state.buttons.down, btn);
        };
        tag.onkeydown = event => {
            var key = this.keyFor(event.keyCode);
            misc.add(this.state.keys.pressed, key);
            misc.add(this.state.keys.down, key);
        };
        tag.onkeyup = event => {
            var key = this.keyFor(event.keyCode);
            misc.add(this.state.keys.released, key);
            misc.remove(this.state.keys.down, key);
        };
    },

    screenProportion: function(value, size, cutoff) {
        var calculated =
            (value - size / 2) / size;
        if (Math.abs(calculated) < cutoff) calculated = 0;
        else {
            calculated += Math.sign(calculated) * -cutoff;
            calculated *= 1 / (0.5 - cutoff);
        }
        return calculated;
    },

    step: function(func) {
        this.state.toCenterX = this.screenProportion(this.state.mouseX, this.tag.innerWidth, 0.05);
        this.state.toCenterY = this.screenProportion(this.state.mouseY, this.tag.innerHeight, 0.05);

        func(this.state);

        this.state.keys.pressed.length = 0;
        this.state.keys.released.length = 0;
        this.state.buttons.pressed.length = 0;
        this.state.buttons.released.length = 0;
    },

    state: {
        keys: {
            pressed: [],
            released: [],
            down: [],

            isPressed: function(key) {
                return this.pressed.indexOf(key) !== -1;
            },
            isReleased: function(key) {
                return this.released.indexOf(key) !== -1;
            },
            isDown: function(key) {
                return this.down.indexOf(key) !== -1;
            }
        },
        buttons: {
            pressed: [],
            released: [],
            down: [],

            isPressed: function(btn) {
                return this.pressed.indexOf(btn) !== -1;
            },
            isReleased: function(btn) {
                return this.released.indexOf(btn) !== -1;
            },
            isDown: function(btn) {
                return this.down.indexOf(btn) !== -1;
            }
        },
        mouseX: 0,
        mouseY: 0,
        toCenterX: 0,
        toCenterY: 0
    }
};

module.exports = controls;