var loader = new THREE.TextureLoader();

var physicsMaterial = new CANNON.Material("slipperyMaterial");
physicsMaterial.friction = 0;
physicsMaterial.restitution = 0;

module.exports = {
    repeated: function (material, n, m) {
        var cloned = material.clone();
        cloned.map = cloned.map.clone();
        cloned.map.repeat = new THREE.Vector2(n, m);
        cloned.map.needsUpdate = true;
        return cloned;
    },
    brick: new THREE.MeshLambertMaterial({
        map: loader.load("/img/textures/test-brick.png", texture => {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        })
    }),
    grass: new THREE.MeshLambertMaterial({
        map: loader.load("/img/textures/test-grass.png", texture => {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        })
    }),

    physicsMaterial: physicsMaterial
};