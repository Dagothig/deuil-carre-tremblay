'use strict';

var misc = require('./misc'),
    materials = require('./materials');

var getImg = (src, onload) => {
    let img = document.createElement('img');
    img.onload = event => onload(img);
    img.src = src;
};

function Map(name, onLoaded) {
    this.name = name;
    this.onLoaded = onLoaded;
    getImg(this.pathingName, img => {
        this.pathingImg = img;
        this.checkToFinishLoading();
    });
    getImg(this.floorName, img => {
        this.floorImg = img;
        this.checkToFinishLoading();
    });
    getImg(this.wallsName, img => {
        this.wallsImg = img;
        this.checkToFinishLoading();
    });
    getImg(this.roofName, img => {
        this.roofImg = img;
        this.checkToFinishLoading();
    });
}
Map.meshSymbols = {
    grass: [0, 255, 0, 255],
    brick: [255, 0, 0, 255]
};
Map.pathingSymbols = {
    passable: [255, 255, 255, 255],
    unpassable: [0, 0, 0, 255]
};
misc.merge(Map.prototype, {
    get pathingName() {
        return '/maps/' + this.name + '-pathing.png';
    },
    get floorName() {
        return '/maps/' + this.name + '-floor.png';
    },
    get wallsName() {
        return '/maps/' + this.name + '-walls.png';
    },
    get roofName() {
        return '/maps/' + this.name + '-roof.png';
    },
    checkToFinishLoading: function() {
        if (!this.pathingImg
            || !this.floorImg
            || !this.wallsImg
            || !this.roofImg
        ) return;

        let canvas  = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        this.pathing = this.getSymbols(Map.pathingSymbols, canvas, ctx, this.pathingImg);
        this.floor = this.getSymbols(Map.meshSymbols, canvas, ctx, this.floorImg);
        this.walls = this.getSymbols(Map.meshSymbols, canvas, ctx, this.wallsImg);
        this.roof = this.getSymbols(Map.meshSymbols, canvas, ctx, this.roofImg);

        var bodies = [];
        constructPathing(bodies, this.pathing);

        var meshes = []
        constructMeshes(meshes, this.floor, constructFloorMesh);
        constructMeshes(meshes, this.walls, constructWallsMesh);
        constructMeshes(meshes, this.roof, constructRoofMesh);
        this.onLoaded(bodies, meshes);
    },
    colorsAreEqual: function(a, b) {
        return a[0] === b[0]
            && a[1] === b[1]
            && a[2] === b[2]
            && a[3] === b[3];
    },
    getSymbols: function(symbolsRef, canvas, ctx, img) {
        var w = img.width, h = img.height;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        var imgData = ctx.getImageData(0, 0, w, h)
        var data = imgData.data;
        var symbols = [];
        for (let x = 0; x < w; x++) {
            symbols[x] = [];
            for (let y = 0; y < h; y++) {
                let i = 4 * (w * y + x);
                let rgb = [data[i], data[i + 1], data[i + 2], data[i + 3]];
                let symbol = Object.keys(symbolsRef)
                    .find(s => this.colorsAreEqual(symbolsRef[s], rgb));
                symbols[x][y] = symbol;
            }
        }
        return symbols;
    }
});


var wallGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
var repeatedMaterials = {};
var constructWallsMesh = (type, tx, ty) => {
    var material;
    if (repeatedMaterials[type]) material = repeatedMaterials[type];
    else material = repeatedMaterials[type] = materials.repeated(materials[type], 1, 4);
    var mesh = new THREE.Mesh(wallGeometry, material);
    mesh.position.set(tx * 0.5, 1, ty * 0.5);
    return mesh;
}

var floorGeometry = new THREE.PlaneGeometry(0.5, 0.5);
floorGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
var constructFloorMesh = (type, tx, ty) => {
    var mesh = new THREE.Mesh(floorGeometry, materials[type]);
    mesh.position.set(tx * 0.5, 0, ty * 0.5);
    return mesh;
}

var roofGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
var constructRoofMesh = (type, tx, ty) => {
    var mesh = new THREE.Mesh(roofGeometry, materials[type]);
    mesh.position.set(tx * 0.5, 2.25, ty * 0.5);
    return mesh;
};

var constructMeshes = (arr, grid, constructFunc) => {
    var w = grid.length;
    for (let x = 0; x < w; x++) {
        var h = grid[x].length;
        for (let y = 0; y < h; y++) {
            var symbol = grid[x][y];
            if (!symbol) continue;
            arr.push(constructFunc(symbol, x, y));
        }
    }
};

var pathingShape = new CANNON.Box(new CANNON.Vec3(0.25, 1, 0.25));
var constructPathingForTile = (type, tx, ty) => {
    if (type ===  'unpassable') {
        let body = new CANNON.Body({
            mass: 0,
            material: materials.physicsMaterial
        });
        body.addShape(pathingShape);
        body.position.set(tx * 0.5, 0.5, ty * 0.5);
        return body;
    }
};
var constructPathing = (arr, grid) => {
    var w = grid.length;
    for (let x = 0; x < w; x++) {
        var h = grid[x].length;
        for (let y = 0; y < h; y++) {
            var symbol = grid[x][y];
            if (!symbol || symbol === 'passable') continue;
            arr.push(constructPathingForTile(symbol, x, y));
        }
    }
};

module.exports = Map;