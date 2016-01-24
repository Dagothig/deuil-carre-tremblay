'use strict';

var misc = require('./client/misc'),
    controls = require('./client/controls'),
    Overlay = require('./client/overlay'),
    PlayerControlHandler = require('./client/player-control-handler'),
    Map = require('./client/map'),
    axe = require('./client/axe'),
    swing = null,
    materials = require('./client/materials');


/* Cannon */
var world = new CANNON.World();
world.quatNormalizeSkip = 0;
world.quatNormalizeFast = false;
var solver = new CANNON.GSSolver();
world.defaultContactMaterial.contactEquationStiffness = 1e9;
world.defaultContactMaterial.contactEquationRelaxation = 4;
solver.iterations = 7;
solver.tolerance = 0.1;
world.solver = new CANNON.SplitSolver(solver);
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();

var groundShape = new CANNON.Plane();
var groundBody = new CANNON.Body({
    mass: 0, // mass == 0 makes the body static,
    material: materials.physicsMaterial
});
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
groundBody.position.set(0,0,0);
world.addBody(groundBody);

var playerCylinder = new CANNON.Body({
    mass: 80,
    position: new CANNON.Vec3(0, 0.3, 0),
    shape: new CANNON.Sphere(0.25),
    fixedRotation: true,
    material: materials.physicsMaterial
});
world.addBody(playerCylinder);

/* Scene */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

var geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.7, 8);
var cylinder = new THREE.Mesh(geometry, materials.brick);
scene.add(cylinder);

var hemisphere = new THREE.HemisphereLight(0xaaddff, 0x88aa77, 0.7);
scene.add(hemisphere);

var sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set( 50, 50, 50 );
scene.add(sun);

var fog = new THREE.Fog(0x113322, 0, 20);
scene.fog = fog;
renderer.setClearColor(fog.color);

new Map('test-1', (bodies, meshes) => {
    bodies.forEach(body => world.add(body));
    meshes.forEach(mesh => scene.add(mesh));
});

/* Overlay */
var overlay = new Overlay();
overlay.attach(document.body);

/* Size */
window.onresize = event => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth/2, window.innerHeight/2, false);
    overlay.setSize(window.innerWidth, window.innerHeight);
};
window.onresize();

axe.createSwing(s => {
    swing = s;
    var playerControlHandler = new PlayerControlHandler(camera, playerCylinder, swing);

    /* Step */
    var lastStep, lastRender;
    setInterval(() => {
        var now = window.performance.now();
        console.log('interval', (now - lastStep));
        lastStep = now;
        playerControlHandler.step(world, overlay);
        swing.step(overlay);

        world.step(1/60);

        cylinder.position.copy(playerCylinder.position);
        cylinder.quaternion.copy(playerCylinder.quaternion);
    }, 1000/60);

    /* Render */
    function render() {
        var now = window.performance.now();
        //console.log('render', 1000/(now - lastStep));
        lastRender = now;
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        overlay.render();
    }
    render();
});