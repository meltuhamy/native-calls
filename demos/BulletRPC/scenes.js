function randomCubeScene(numObjects) {
  var worldDescription = {};
  worldDescription.shapes = [];
  worldDescription.shapes.push({
    name: 'box',
    type: 'cube',
    wx: 1,
    wy: 1,
    wz: 1
  });
  worldDescription.bodies = [];
  for ( var i = 0; i < numObjects; i ++ ) {
    var body = {};
    body.shape = 'box';
    body.position = {};
    body.position.x = Math.random() * 10 - 25;
    body.position.y = Math.random() * 50 + 1;
    body.position.z = Math.random() * 40 - 20;
    body.rotation = {};
    body.rotation.x = ( Math.random() * 360 ) * Math.PI / 180;
    body.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
    body.rotation.z = ( Math.random() * 360 ) * Math.PI / 180;
    body.mass = 1.0;
    body.friction = 0.8;
    worldDescription.bodies.push(body);
  }
  return worldDescription;
}

function randomCylinderScene(numObjects) {
  var worldDescription = {};
  worldDescription.shapes = [];
  worldDescription.shapes.push({
    name: 'box',
    type: 'cylinder',
    height: 1.0,
    radius: 0.5
  });
  worldDescription.bodies = [];
  for ( var i = 0; i < numObjects; i ++ ) {
    var body = {};
    body.shape = 'box';
    body.position = {};
    body.position.x = Math.random() * 10 - 25;
    body.position.y = Math.random() * 50 + 1;
    body.position.z = Math.random() * 40 - 20;
    body.rotation = {};
    body.rotation.x = ( Math.random() * 360 ) * Math.PI / 180;
    body.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
    body.rotation.z = ( Math.random() * 360 ) * Math.PI / 180;
    body.mass = 1.0;
    body.friction = 0.2;
    worldDescription.bodies.push(body);
  }
  return worldDescription;
}

function jengaScene(height) {
  var worldDescription = {};
  worldDescription.shapes = [];
  worldDescription.shapes.push({
    name: 'boxX',
    type: 'cube',
    wx: 5,
    wy: 1,
    wz: 1
  });
  worldDescription.shapes.push({
    name: 'boxZ',
    type: 'cube',
    wx: 1,
    wy: 1,
    wz: 5
  });
  worldDescription.bodies = [];
  var baseHeight = 0.55;
  for (var i = 0; i < height; i++) {
    var y = i * 1.0 + baseHeight;
    if (i % 2 == 0) {
      for (var j = 0; j < 5; j++) {
        var z = j * 1.0;
        var x = 2.5;

        var body = {};
        body.shape = 'boxX';
        body.position = {};
        body.position.x = x;
        body.position.y = y;
        body.position.z = z;
        body.rotation = {};
        body.rotation.x = 0.0;
        body.rotation.y = 0.0;
        body.rotation.z = 0.0;
        body.mass = 1.0;
        body.friction = 0.5;
        worldDescription.bodies.push(body);
      }
    } else {
      for (var j = 0; j < 5; j++) {
        var z = 2.5;
        var x = j * 1.0;

        var body = {};
        body.shape = 'boxZ';
        body.position = {};
        body.position.x = x;
        body.position.y = y;
        body.position.z = z;
        body.rotation = {};
        body.rotation.x = 0.0;
        body.rotation.y = 0.0;
        body.rotation.z = 0.0;
        body.mass = 1.0;
        body.friction = 0.5;
        worldDescription.bodies.push(body);
      }
    }
  }
  return worldDescription;
}

function randomShapeScene(numObjects) {
  var worldDescription = {};
  worldDescription.shapes = [];
  worldDescription.shapes.push({
    name: 'stick',
    type: 'cube',
    wx: 1,
    wy: 1,
    wz: 5
  });
  worldDescription.shapes.push({
    name: 'tube',
    type: 'cylinder',
    radius: 1.0,
    height: 2.0
  });
  worldDescription.shapes.push({
    name: 'sphere',
    type: 'sphere',
    radius: 3.0
  });
  worldDescription.shapes.push({
    name: 'tri',
    type: 'convex',
    points: [
      [0.0, 0.0, 0.0],
      [0.0, 1.0, 0.0],
      [0.0, 0.0, 1.0],
      [0.0, 0.0, 1.0],
      [2.0, 5.0, 1.0],
      [1.0, 1.0, 1.0]
    ]
  });

  var numShapes = 4;
  worldDescription.bodies = [];
  for (var i = 0; i < numObjects; i++) {
    var body = {};
    if (i % numShapes == 0) {
      body.shape = 'stick';
    } else if (i % numShapes == 1) {
      body.shape = 'tube';
    } else if (i % numShapes == 2) {
      body.shape = 'sphere';
    } else if (i % numShapes == 3) {
      body.shape = 'tri';
    }
    body.position = {};
    body.position.x = Math.random() * 10 - 25;
    body.position.y = Math.random() * 50 + 1;
    body.position.z = Math.random() * 40 - 20;
    body.rotation = {};
    body.rotation.x = ( Math.random() * 360 ) * Math.PI / 180;
    body.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
    body.rotation.z = ( Math.random() * 360 ) * Math.PI / 180;
    body.mass = 1.0;
    body.friction = 0.4;
    worldDescription.bodies.push(body);
  }
  return worldDescription;
}


function loadJenga5() {
  loadWorld(jengaScene(5));
}

function loadJenga10() {
  loadWorld(jengaScene(10));
}

function loadJenga20() {
  loadWorld(jengaScene(20));
}

function loadRandomShapes() {
  loadWorld(randomShapeScene(100));
}

function load400RandomCubes() {
  loadWorld(randomCubeScene(400));
}

function load400RandomCylinders() {
  loadWorld(randomCylinderScene(400));
}

function loadTextScene(evt) {
  var txt = evt.target.result;
  if (txt == undefined) {
    alert('Could not load file.');
    return;
  }
  var sceneDescription;

  try {
    sceneDescription = JSON.parse(txt);
  } catch(e) {
    alert(e);
    return;
  }

  loadWorld(sceneDescription);
}