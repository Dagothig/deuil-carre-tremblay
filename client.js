var THREE = require('./client/three.min'),
    misc = require('./client/misc'),
    controls = require('./client/controls');

controls.tag = window;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.onresize = event => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var ambient = new THREE.AmbientLight(0x333333);
scene.add(ambient);

var sun = new THREE.DirectionalLight(0xffffff, 0.3);
scene.add(sun);

camera.position.z = 5;

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();

var camCap = Math.PI / 8;
var handleControls = state => {
    camera.rotation.y -= state.toCenterX / 10;
    camera.rotation.x -= state.toCenterY / 10;
    camera.rotation.x = Math.max(Math.min(camera.rotation.x, camCap), -camCap);

    if (state.buttons.isPressed('main')) {
        console.log('main');
    }
};
setInterval(() => {
    controls.step(handleControls);

    cube.rotation.x += 0.05;
    cube.rotation.y += 0.05;
}, 1000/60);