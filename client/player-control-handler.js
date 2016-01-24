var misc = require('./misc'),
    controls = require('./controls');

controls.tag = window;
var tmpVec3 = new THREE.Vector3();

// Heavily based on
// https://github.com/schteppe/cannon.js/blob/master/examples/js/PointerLockControls.js
function PlayerControlHandler(camera, body, swing) {

    this.groundSpeed = 10;
    this.airborneSpeed = 1;
    this.camera = camera;
    this.camera.rotation.order = 'YXZ'
    this.body = body;
    this.swing = swing;

    // Utilised for controlling and calculating
    this.quat = new THREE.Quaternion();
    this.euler = new THREE.Euler();
    this.direction = new THREE.Vector3();
    this.camMin =  -Math.PI / 4;
    this.camMax = Math.PI / 4;
}
misc.merge(PlayerControlHandler.prototype, {
    getDirection: function(targetVec) {
        targetVec.set(0, 0, -1);
        this.quat.multiplyVector3(targetVec);
    },

    getCurrentSpeed: function(world) {
        var tmp = this.body.position.clone()
        var result = world.raycastAny(
            this.body.position,
            tmpVec3.copy(this.body.position).setY(this.body.position.y - 1), {
                skipBackfaces: true
        });
        return result ? this.groundSpeed : this.airborneSpeed;
    },

    step: function(world, overlay) { controls.step(state => {

        this.camera.rotation.y -= state.toCenterX / 10;
        this.camera.rotation.x -= state.toCenterY / 20;
        this.camera.rotation.x = Math.max(Math.min(this.camera.rotation.x, this.camMax), this.camMin);

        if (state.buttons.isPressed('main')) {
            this.swing.setStart(state.mouseX, state.mouseY, window.performance.now());
        }
        if (state.buttons.isReleased('main')) {
            this.swing.setEnd(state.mouseX, state.mouseY, window.performance.now());
            if (this.swing.fast) this.swing.createSwingAnimation(overlay);
        }

        this.direction.set(0, 0, 0);
        if (state.keys.isDown('up')) this.direction.z -= 1;
        if (state.keys.isDown('down')) this.direction.z += 1;
        if (state.keys.isDown('left')) this.direction.x -= 1;
        if (state.keys.isDown('right')) this.direction.x += 1;

        // Convert velocity to world coordinates
        /*this.quat.setFromEuler(this.camera.rotation);
        this.direction.applyQuaternion(this.quat);*/
        this.euler.order = "XYZ";
        this.euler.x = this.camera.rotation.x;
        this.euler.y = this.camera.rotation.y;
        this.quat.setFromEuler(this.euler);
        this.direction.applyQuaternion(this.quat);
        this.direction.setLength(this.getCurrentSpeed(world));

        // Add to the object
        this.body.velocity.x = this.direction.x;
        this.body.velocity.z = this.direction.z;
        this.camera.position
            .copy(this.body.position)
            .setY(this.camera.position.y + 0.65);
    })}
});

module.exports = PlayerControlHandler;