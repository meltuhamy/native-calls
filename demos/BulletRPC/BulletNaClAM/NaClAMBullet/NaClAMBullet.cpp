#include <string>
#include <map>
#include <sys/time.h>
#include "NaClAMBase/NaClAMBase.h"
#include "btBulletCollisionCommon.h"
#include "btBulletDynamicsCommon.h"

static uint64_t microseconds() {
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return tv.tv_sec * 1000000 + tv.tv_usec;

}
class BulletScene {
public:
  btCollisionShape* boxShape;
  btCollisionShape* groundShape;
  int pickedObjectIndex;
  btRigidBody* pickedBody;
  btPoint2PointConstraint* pickConstraint;
  float pickingDistance;
  btDynamicsWorld* dynamicsWorld;
  btCollisionConfiguration* collisionConfiguration;
  btCollisionDispatcher* dispatcher;
  btBroadphaseInterface* broadphase;
  btSequentialImpulseConstraintSolver* solver;

  std::map<std::string, btCollisionShape*> shapes;
  std::map<std::string, btCollisionObject*> objectNames;

  BulletScene() {
    dynamicsWorld = NULL;
    collisionConfiguration = NULL;
    dispatcher = NULL;
    broadphase = NULL;
    solver = NULL;
  }

  void Init() {
    boxShape = new btBoxShape(btVector3(0.50f, 0.50f, 0.50f));
    groundShape = new btStaticPlaneShape(btVector3(0.0, 1.0, 0.0), 0.0);
    pickConstraint = NULL;
    pickedBody = NULL;
  }

  void removePickingConstraint() {
    if (pickConstraint && dynamicsWorld)
    {
      dynamicsWorld->removeConstraint(pickConstraint);
      delete pickConstraint;
      pickedBody->forceActivationState(ACTIVE_TAG);
      pickedBody->setDeactivationTime( 0.f );
    }
    pickConstraint = NULL;
    pickedBody = NULL;
  }

  void addPickingConstraint(const btVector3& rayFrom, const btVector3& rayTo) {
    if (!dynamicsWorld) {
      return;
    }
    removePickingConstraint();
    if (pickedObjectIndex <= 0 || pickedObjectIndex >= dynamicsWorld->getNumCollisionObjects()) {
      return;
    }
    pickedBody = btRigidBody::upcast(dynamicsWorld->getCollisionObjectArray()[pickedObjectIndex]);
    btVector3 pickPos = rayTo;
    btVector3 localPivot = pickedBody->getCenterOfMassTransform().inverse() * pickPos;
    pickConstraint = new btPoint2PointConstraint(*pickedBody,localPivot);
    pickedBody->setActivationState(DISABLE_DEACTIVATION);
    dynamicsWorld->addConstraint(pickConstraint,true);
    pickingDistance = (rayFrom-rayTo).length();
    pickConstraint->m_setting.m_impulseClamp = 3.0f;
    pickConstraint->m_setting.m_tau = 0.001f;
  }

  void movePickingConstraint(const btVector3& rayFrom, const btVector3& rayTo) {
    if (pickConstraint)
    {
      //keep it at the same picking distance
      btVector3 oldPivotInB = pickConstraint->getPivotInB();
      btVector3 newPivotB;
      btVector3 dir = rayTo-rayFrom;
      dir.normalize();
      dir *= pickingDistance;
      newPivotB = rayFrom + dir;
      pickConstraint->setPivotB(newPivotB);
    }
  }

  void EmptyScene() {
    if (dynamicsWorld) {
      int i;
      for (i=dynamicsWorld->getNumCollisionObjects()-1; i>=0 ;i--) {
        btCollisionObject* obj = dynamicsWorld->getCollisionObjectArray()[i];
        btRigidBody* body = btRigidBody::upcast(obj);
        if (body && body->getMotionState()) {
          delete body->getMotionState();
        }
        dynamicsWorld->removeCollisionObject(obj);
        delete obj;
      }
      removePickingConstraint();
    }
    if (dynamicsWorld) {
      delete dynamicsWorld;
      dynamicsWorld = NULL;
    }
    if (solver) {
      delete solver;
      solver = NULL;
    }
    if (broadphase) {
      delete broadphase;
      broadphase = NULL;
    }
    if (dispatcher) {
      delete dispatcher;
      dispatcher = NULL;
    }
    if (collisionConfiguration) {
      delete collisionConfiguration;
      collisionConfiguration = NULL;
    }
    // Delete shapes
    std::map<std::string, btCollisionShape*>::iterator it = shapes.begin();
    while (it != shapes.end()) {
      delete (*it).second;
      it++;
    }
    shapes.clear();
    // Clear name table
    objectNames.clear();
  }

  void AddGroundPlane() {
    btTransform groundTransform;
    groundTransform.setIdentity();
    btScalar mass = 0.0f;
    bool isDynamic = (mass != 0.f);
    btVector3 localInertia(0,0,0);
    if (isDynamic)
      groundShape->calculateLocalInertia(mass,localInertia);
    btDefaultMotionState* myMotionState = new btDefaultMotionState(groundTransform);
    btRigidBody::btRigidBodyConstructionInfo rbInfo(mass,myMotionState,groundShape,localInertia);
    btRigidBody* body = new btRigidBody(rbInfo);
    //add the body to the dynamics world
    dynamicsWorld->addRigidBody(body);
  }

  void ResetScene() {
    EmptyScene();
    collisionConfiguration = new btDefaultCollisionConfiguration();
    dispatcher = new      btCollisionDispatcher(collisionConfiguration);
    broadphase = new btDbvtBroadphase();
    solver = new btSequentialImpulseConstraintSolver();
    dynamicsWorld = new btDiscreteDynamicsWorld(dispatcher,
                                                broadphase,
                                                solver,collisionConfiguration);
    AddGroundPlane();
  }

  void AddBox(const btTransform& T, float mass) {
    bool isDynamic = (mass != 0.f);
    btVector3 localInertia(0,0,0);
    if (isDynamic)
      boxShape->calculateLocalInertia(mass,localInertia);
      btDefaultMotionState* myMotionState = new btDefaultMotionState(T);
      btRigidBody::btRigidBodyConstructionInfo rbInfo(mass,myMotionState,boxShape,localInertia);
      btRigidBody* body = new btRigidBody(rbInfo);
      dynamicsWorld->addRigidBody(body);
  }

  void AddShape(const Json::Value& shape) {
    Json::Value name = shape["name"];
    Json::Value type = shape["type"];

    std::string shapeType = type.asString();

    btCollisionShape* bulletShape = NULL;

    if (shapeType.compare("cube") == 0) {
      Json::Value wx = shape["wx"];
      Json::Value wy = shape["wy"];
      Json::Value wz = shape["wz"];
      btVector3 halfExtents = btVector3(wx.asFloat(), wy.asFloat(), wz.asFloat());
      halfExtents *= btScalar(0.5);
      bulletShape = new btBoxShape(halfExtents);
    } else if (shapeType.compare("convex") == 0) {
      Json::Value points = shape["points"];
      int numPoints = points.size();
      if (numPoints > 0) {
        btVector3* convexHull = new btVector3[numPoints];
        for (int i = 0; i < numPoints; i++) {
          convexHull[i][0] = points[i][0].asFloat();
          convexHull[i][1] = points[i][1].asFloat();
          convexHull[i][2] = points[i][2].asFloat();
        }
        bulletShape = new btConvexHullShape(&convexHull[0][0], numPoints);
      }
    } else if (shapeType.compare("sphere") == 0) {
      Json::Value radius = shape["radius"];
      bulletShape = new btSphereShape(radius.asFloat());
    } else if (shapeType.compare("cylinder") == 0) {
      Json::Value radius = shape["radius"];
      Json::Value height = shape["height"];
      btVector3 halfExtents = btVector3(radius.asFloat(), height.asFloat()*0.5f, 0.0f);
      bulletShape = new btCylinderShape(halfExtents);
    } else {
      NaClAMPrintf("Could not load shape type %s\n", shapeType.c_str());
      return;
    }

    if (bulletShape == NULL) {
      NaClAMPrintf("Could not build shape %s\n", name.asString().c_str());
      return;
    }

    shapes[name.asString()] = bulletShape;

    NaClAMPrintf("Added shape %s of %s\n", name.asString().c_str(), type.asString().c_str());
  }

  void AddBody(const Json::Value& bodyDesc) {
    std::string shapeName = bodyDesc["shape"].asString();
    float mass = bodyDesc["mass"].asFloat();
    float friction = bodyDesc["friction"].asFloat();
    Json::Value transform = bodyDesc["transform"];
    btCollisionShape* shape = boxShape;
    if (shapes.count(shapeName) == 0) {
      NaClAMPrintf("Could not find shape %s defaulting to unit cube.", shapeName.c_str());
    } else {
      shape = shapes[shapeName];
    }

    btTransform T;
    T.setIdentity();
    {
      float m[16];
      for (int i = 0; i < transform.size(); i++) {
        m[i] = transform[i].asFloat();
      }
      T.setFromOpenGLMatrix(&m[0]);
    }
    

    bool isDynamic = (mass != 0.f);
    btVector3 localInertia(0,0,0);
    if (isDynamic)
      shape->calculateLocalInertia(mass,localInertia);
    btDefaultMotionState* myMotionState = new btDefaultMotionState(T);
    btRigidBody::btRigidBodyConstructionInfo rbInfo(mass,myMotionState,shape,localInertia);
    btRigidBody* body = new btRigidBody(rbInfo);
    body->setFriction(friction);
    dynamicsWorld->addRigidBody(body);
  }

  void Step() {
    if (dynamicsWorld)
      dynamicsWorld->stepSimulation(1.0/60.0);
  }
};

static BulletScene scene;

/**
 * This function is called at module initialization time.
 * moduleInterfaces and moduleInstance are already initialized.
 */
void NaClAMModuleInit() {
  NaClAMPrintf("Bullet AM Running.");
  scene.Init();
}

/**
 * This function is called at 60hz.
 * @param microseconds A monotonically increasing clock
 */
void NaClAMModuleHeartBeat(uint64_t microseconds) {

}

void handleLoadScene(const NaClAMMessage& message) {
  scene.ResetScene();
  const Json::Value& root = message.headerRoot;
  const Json::Value& sceneDesc = root["args"];
  const Json::Value& shapes = sceneDesc["shapes"];
  const Json::Value& bodies = sceneDesc["bodies"];
  int numShapes = shapes.size();

  for (int i = 0; i < numShapes; i++) {
    scene.AddShape(shapes[i]);
  }

  int numBodies = bodies.size();
  for (int i = 0; i < numBodies; i++) {
    scene.AddBody(bodies[i]);
  }
  
  // Scene created.
  {
    Json::Value root = NaClAMMakeReplyObject("sceneloaded", message.requestId);
    root["sceneobjectcount"] = Json::Value(numBodies);
    NaClAMSendMessage(root, NULL, 0);
  }
}

void handleStepScene(const NaClAMMessage& message) {
  if (scene.dynamicsWorld == NULL ||
      scene.dynamicsWorld->getNumCollisionObjects() == 1) {
    // No scene, just send a reply
    Json::Value root = NaClAMMakeReplyObject("noscene", message.requestId);
    NaClAMSendMessage(root, NULL, 0);
    return;
  }
  {
    Json::Value rayTo = message.headerRoot["args"]["rayTo"];
    float x = rayTo[0].asFloat();
    float y = rayTo[1].asFloat();
    float z = rayTo[2].asFloat();
    Json::Value rayFrom = message.headerRoot["args"]["rayFrom"];
    float cx = rayFrom[0].asFloat();
    float cy = rayFrom[1].asFloat();
    float cz = rayFrom[2].asFloat();
    scene.movePickingConstraint(btVector3(cx, cy, cz), btVector3(x,y,z));
  }

  uint64_t start = microseconds();
  // Do work
  scene.Step();
  uint64_t end = microseconds();
  uint64_t delta = end-start;
  {
    // Build headers
    Json::Value root = NaClAMMakeReplyObject("sceneupdate", message.requestId);
    root["simtime"] = Json::Value(delta);
    // Build transform frame
    int numObjects = scene.dynamicsWorld->getNumCollisionObjects();
    uint32_t TransformSize = (numObjects-1)*4*4*sizeof(float);
    PP_Var Transform = moduleInterfaces.varArrayBuffer->Create(TransformSize);
    float* m = (float*)moduleInterfaces.varArrayBuffer->Map(Transform);
    for (int i = 1; i < numObjects; i++) {
      btCollisionObject* obj = scene.dynamicsWorld->getCollisionObjectArray()[i];
      btRigidBody* body = btRigidBody::upcast(obj);
      if (body && body->getMotionState()) {
        btTransform xform;
        body->getMotionState()->getWorldTransform(xform);
        xform.getOpenGLMatrix(&m[0]);
      }
      m += 16;
    }
    moduleInterfaces.varArrayBuffer->Unmap(Transform);

    // Send message
    NaClAMSendMessage(root, &Transform, 1);
    moduleInterfaces.var->Release(Transform);
  }
}

void handlePickObject(const NaClAMMessage& message) {
  if (!scene.dynamicsWorld) {
    return;
  }
  const Json::Value& root = message.headerRoot;
  const Json::Value& args = root["args"];
  const Json::Value& objectTableIndex = args["index"];
  const Json::Value& pos = args["pos"];
  const Json::Value& cpos = args["cpos"];
  float x = pos[0].asFloat();
  float y = pos[1].asFloat();
  float z = pos[2].asFloat();
  float cx = cpos[0].asFloat();
  float cy = cpos[1].asFloat();
  float cz = cpos[2].asFloat();
  int index = objectTableIndex.asInt();
  index++;
  if (index < 0 || index >= scene.dynamicsWorld->getNumCollisionObjects()) {
    scene.pickedObjectIndex = -1;
    return;
  }
  scene.pickedObjectIndex = index;
  scene.addPickingConstraint(btVector3(cx, cy, cz), btVector3(x,y,z));
  NaClAMPrintf("Picked %d\n", scene.pickedObjectIndex);
}

void handleDropObject(const NaClAMMessage& message) {
  scene.removePickingConstraint();
  NaClAMPrintf("Dropped %d\n", scene.pickedObjectIndex);
}

/**
 * This function is called for each message received from JS
 * @param message A complete message sent from JS
 */
void NaClAMModuleHandleMessage(const NaClAMMessage& message) {
  if (message.cmdString.compare("loadscene") == 0) {
    handleLoadScene(message);
  } else if (message.cmdString.compare("stepscene") == 0) {
    handleStepScene(message);
  } else if (message.cmdString.compare("pickobject") == 0) {
    handlePickObject(message);
  } else if (message.cmdString.compare("dropobject") == 0) {
    handleDropObject(message);
  }
}