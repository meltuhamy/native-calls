var container, stats;
var camera, controls, scene, projector, renderer;
var plane;
var lastSceneDescription;
var skipSceneUpdates = 0;
var hold = false;
var holdObjectIndex = -1;

var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
var INTERSECTED, SELECTED;

var sceneDescription = [];

var shapes = {};
var objects = [];

function clearWorld() {
  for (var i = 0; i < objects.length; i++) {
    scene.remove(objects[i]);
  }
  objects = [];
  shapes = {};
  // Make sure we drop the object.
  hold = false;
  SELECTED = undefined;
  bullet.BulletInterface.DropObject();
}

function loadShape(shape, rpcScene) {
  if (shapes[shape.name] != undefined) {
    return shapes[shape.name];
  }

  if (shape.type == "cube") {
    rpcScene.cubes.push(shape);
    shapes[shape.name] = new THREE.BoxGeometry(shape['wx'], shape['wy'], shape['wz']);
    return shapes[shape.name];
  }

  if (shape.type == "convex") {
    var vertices = [];
    var rpcConvex = {name: shape.name, points: []};
    for (var i = 0; i < shape['points'].length; i++) {
      rpcConvex.points.push({x:shape['points'][i][0], y:shape['points'][i][1], z:shape['points'][i][2]});
      vertices.push(new THREE.Vector3(shape['points'][i][0], shape['points'][i][1], shape['points'][i][2]));
    }
    rpcScene.convices.push(rpcConvex);
    shapes[shape.name] = new THREE.ConvexGeometry(vertices);
    return shapes[shape.name];
  }

  if (shape.type == "cylinder") {
    rpcScene.cylinders.push(shape);
    shapes[shape.name] = new THREE.CylinderGeometry(shape['radius'], shape['radius'], shape['height'])
    return shapes[shape.name];
  }

  if (shape.type == "sphere") {
    rpcScene.spheres.push(shape);
    shapes[shape.name] = new THREE.SphereGeometry(shape['radius']);
    return shapes[shape.name];
  }

  return undefined;
}

function loadBody(body, rpcScene) {
  var rpcBody = {
    shapeName: body.shape,
    mass: body.mass,
    friction: body.friction,
    transform: []
  };

  var shape = shapes[body.shape];
  if (shape == undefined) {
    return shape;
  }

  var object = new THREE.Mesh( shape, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

  object.material.ambient = object.material.color;

  object.position.x = body.position.x;
  object.position.y = body.position.y;
  object.position.z = body.position.z;

  object.rotation.x = body.rotation.x;
  object.rotation.y = body.rotation.y;
  object.rotation.z = body.rotation.z;

  object.updateMatrixWorld(true);
  var T = [object.matrixWorld.elements[0],
    object.matrixWorld.elements[1],
    object.matrixWorld.elements[2],
    object.matrixWorld.elements[3],
    object.matrixWorld.elements[4],
    object.matrixWorld.elements[5],
    object.matrixWorld.elements[6],
    object.matrixWorld.elements[7],
    object.matrixWorld.elements[8],
    object.matrixWorld.elements[9],
    object.matrixWorld.elements[10],
    object.matrixWorld.elements[11],
    object.matrixWorld.elements[12],
    object.matrixWorld.elements[13],
    object.matrixWorld.elements[14],
    object.matrixWorld.elements[15]];
  body.transform = T;
  rpcBody.transform = T;

  object.castShadow = false;
  object.receiveShadow = false;
  object.matrixAutoUpdate = false;
  object.objectTableIndex = objects.length;
  scene.add(object);
  objects.push(object);

  rpcScene.bodies.push(rpcBody);
  return object;
}

function loadWorld(worldDescription, callback) {
  clearWorld();
  var i;

  var rpcScene = {
    cubes: [],
    convices: [],
    spheres: [],
    cylinders: [],
    bodies: []
  };

  var shapes = worldDescription['shapes'];
  var bodies = worldDescription['bodies'];
  for (i = 0; i < shapes.length; i++) {
    if (loadShape(shapes[i], rpcScene) == undefined) {
      console.log('Could not load shape ' + shapes[i].name);
    }
  }

  for (i = 0; i < bodies.length; i++) {
    if (loadBody(bodies[i], rpcScene) == undefined) {
      console.log('Could not make body.');
    }
  }

  var r = verifyWorldDescription(worldDescription);
  if (r == false) {
    alert('Invalid scene description. See console.');
    return;
  }
  skipSceneUpdates = 4;
  bullet.BulletInterface.LoadScene(rpcScene, function(result){
    console.log("Scene loaded "+ result);
    if(callback)callback();
  });

  lastSceneDescription = worldDescription;
}

function reloadScene() {
  if (lastSceneDescription)
    loadWorld(lastSceneDescription);
}

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.y = 20.0;
  camera.position.z = 40;



  scene = new THREE.Scene();

  scene.add( new THREE.AmbientLight( 0x404040 ) );

  var light = new THREE.SpotLight( 0xffffff, 1.5 );
  light.position.set( 0, 500, 2000 );
  light.castShadow = true;

  light.shadowCameraNear = 200;
  light.shadowCameraFar = camera.far;
  light.shadowCameraFov = 50;

  light.shadowBias = -0.00022;
  light.shadowDarkness = 0.5;

  light.shadowMapWidth = 2048;
  light.shadowMapHeight = 2048;

  scene.add( light );

  plane = new THREE.Mesh( new THREE.PlaneGeometry( 200, 200, 100, 100), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
  plane.rotation.x = Math.PI * 0.5;
  plane.visible = true;
  scene.add( plane );
  projector = new THREE.Projector();

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.sortObjects = false;
  renderer.setSize( window.innerWidth, window.innerHeight );

  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;

  container.appendChild( renderer.domElement );

  /*
   controls = new THREE.TrackballControls( camera );
   controls.rotateSpeed = 1.0;
   controls.zoomSpeed = 5.0;
   controls.panSpeed = 0.8;
   controls.noZoom = false;
   controls.noPan = false;
   controls.staticMoving = true;
   controls.dynamicDampingFactor = 0.3;
   controls.handleResize();
   */
  controls = new THREE.OrbitControls (camera, container);


  var infoBar = document.createElement ('div');
  infoBar.style.position = 'absolute';
  infoBar.style.top = '10px';
  infoBar.style.width = '100%';
  infoBar.style.textAlign = 'center';
  container.appendChild( infoBar );

  var info = document.createElement('div');
  info.innerHTML = '<a href="https://github.com/johnmccutchan/NaClAMBase" target="_blank">NaClAMBase</a> NaClAM - Bullet<p>Hold "h" to pick up an object</p>';
  infoBar.appendChild(info);

  var info = document.createElement('div');
  var innerInfoBar = document.createElement('div');
  info.innerHTML = '<a href="http://www.johnmccutchan.com/2012/10/bullet-native-client-acceleration-module.html">What am I looking at?</a>';
  innerInfoBar.appendChild(info);
  infoBar.appendChild(innerInfoBar);

  var info = document.createElement('div');
  info.setAttribute("id", "simulationTime");
  info.innerHTML = '<p>Simulation time: 0 microseconds</p>';
  infoBar.appendChild(info);

  info = document.createElement ( 'div' );
  infoBar.appendChild(info);

  demoButton = document.createElement ('button');
  demoButton.innerHTML = 'Jenga 5';
  demoButton.addEventListener('click', loadJenga5, false);
  info.appendChild(demoButton);

  demoButton = document.createElement ('button');
  demoButton.innerHTML = 'Jenga 10';
  demoButton.addEventListener('click', loadJenga10, false);
  info.appendChild(demoButton);

  demoButton = document.createElement ('button');
  demoButton.innerHTML = 'Jenga 20';
  demoButton.addEventListener('click', loadJenga20, false);
  info.appendChild(demoButton);

  demoButton = document.createElement ('button');
  demoButton.innerHTML = 'Random Shapes';
  demoButton.addEventListener('click', loadRandomShapes, false);
  info.appendChild(demoButton);

  demoButton = document.createElement ('button');
  demoButton.innerHTML = '400 Random Cubes';
  demoButton.addEventListener('click', load400RandomCubes, false);
  info.appendChild(demoButton);

  demoButton = document.createElement ('button');
  demoButton.innerHTML = '400 Random Cylinders';
  demoButton.addEventListener('click', load400RandomCylinders, false);
  info.appendChild(demoButton);

  demoButton = document.createElement('input');
  demoButton.innerHTML = 'Upload Scene';
  demoButton.setAttribute("type", "file");
  demoButton.setAttribute("id", "UploadButton");
  var uploadButton = demoButton;
  demoButton.addEventListener('change', function(evt) {
    var files = evt.target.files;
    if (evt.target.files.length <= 0) {
      return;
    }
    var f = files[0];
    var reader = new FileReader();
    reader.addEventListener('load', loadTextScene);
    reader.readAsText(f, "UTF-8");
    uploadButton.setAttribute("value", "");
  });
  info.appendChild(demoButton);

  demoButton = document.createElement ('button');
  demoButton.innerHTML = 'Reload Scene';
  demoButton.addEventListener('click', reloadScene, false);
  info.appendChild(demoButton);

  renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false );
  window.addEventListener('resize', onWindowResize, false );
  window.addEventListener('keydown', onDocumentKeyDown, false);
  window.addEventListener('keyup', onDocumentKeyUp, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  //controls.handleResize();
}

function onDocumentKeyDown(event) {
  if (event.keyCode == 72) {
    if (SELECTED != undefined) {
      return;
    }
    hold = true;
    var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
    projector.unprojectVector( vector, camera );
    var intersects = (new THREE.Raycaster(camera.position, vector.sub( camera.position ).normalize())).intersectObjects(objects, true);
    if (intersects.length > 0) {
      if (intersects[0].object != plane) {
        SELECTED = intersects[0].object;
        bullet.BulletInterface.PickObject(SELECTED.objectTableIndex, camera.position, intersects[0].point, function(){
          console.log("Picked object");
        });
      }
    }
  }
}

function onDocumentKeyUp(event) {
  if (event.keyCode == 72) {
    hold = false;
    SELECTED = undefined;
    bullet.BulletInterface.DropObject();
  }
}

function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
  projector.unprojectVector( vector, camera );
  offset.x = vector.x;
  offset.y = vector.y;
  offset.z = vector.z;
}

//
function animate() {
  window.requestAnimationFrame(function(){
    setTimeout(function() {
      requestAnimationFrame(animate);
      bullet.BulletInterface.StepScene(camera.position, offset, function(transformBuffer){
        if (skipSceneUpdates > 0) {
          skipSceneUpdates--;
          return;
        }
        var numTransforms = transformBuffer.length / 16;
        for (var i = 0; i < numTransforms; i++) {
          if(objects[i]){
            for (var j = 0; j < 16; j++) {
              if(objects[i].matrixWorld){
                objects[i].matrixWorld.elements[j] = transformBuffer[i*16+j];
              }
            }
          }
        }
      });
      render();

    }, 1000 / fps);
  });

}

function render() {
  controls.update();
  renderer.render( scene, camera );
}