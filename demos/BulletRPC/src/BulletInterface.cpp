#include "BulletInterface.h"
#include "BulletTypes.h"

#include <string>
#include <map>
#include <sys/time.h>

#include <bullet/btBulletCollisionCommon.h>
#include <bullet/btBulletDynamicsCommon.h>

static unsigned long long microseconds() {
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
		Init();
	}

	void Init() {
		boxShape = new btBoxShape(btVector3(0.50f, 0.50f, 0.50f));
		groundShape = new btStaticPlaneShape(btVector3(0.0, 1.0, 0.0), 0.0);
		pickConstraint = NULL;
		pickedBody = NULL;
	}

	void removePickingConstraint() {
		if (pickConstraint && dynamicsWorld) {
			dynamicsWorld->removeConstraint(pickConstraint);
			delete pickConstraint;
			pickedBody->forceActivationState(ACTIVE_TAG);
			pickedBody->setDeactivationTime(0.f);
		}
		pickConstraint = NULL;
		pickedBody = NULL;
	}

	void addPickingConstraint(const btVector3& rayFrom,
			const btVector3& rayTo) {
		if (!dynamicsWorld) {
			return;
		}
		removePickingConstraint();
		if (pickedObjectIndex <= 0
				|| pickedObjectIndex
						>= dynamicsWorld->getNumCollisionObjects()) {
			return;
		}
		pickedBody = btRigidBody::upcast(
				dynamicsWorld->getCollisionObjectArray()[pickedObjectIndex]);
		btVector3 pickPos = rayTo;
		btVector3 localPivot = pickedBody->getCenterOfMassTransform().inverse()
				* pickPos;
		pickConstraint = new btPoint2PointConstraint(*pickedBody, localPivot);
		pickedBody->setActivationState(DISABLE_DEACTIVATION);
		dynamicsWorld->addConstraint(pickConstraint, true);
		pickingDistance = (rayFrom - rayTo).length();
		pickConstraint->m_setting.m_impulseClamp = 3.0f;
		pickConstraint->m_setting.m_tau = 0.001f;
	}

	void movePickingConstraint(const btVector3& rayFrom,
			const btVector3& rayTo) {
		if (pickConstraint) {
			//keep it at the same picking distance
			/*btVector3 oldPivotInB = */pickConstraint->getPivotInB();
			btVector3 newPivotB;
			btVector3 dir = rayTo - rayFrom;
			dir.normalize();
			dir *= pickingDistance;
			newPivotB = rayFrom + dir;
			pickConstraint->setPivotB(newPivotB);
		}
	}

	void EmptyScene() {
		if (dynamicsWorld) {
			int i;
			for (i = dynamicsWorld->getNumCollisionObjects() - 1; i >= 0; i--) {
				btCollisionObject* obj =
						dynamicsWorld->getCollisionObjectArray()[i];
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
		btVector3 localInertia(0, 0, 0);
		if (isDynamic)
			groundShape->calculateLocalInertia(mass, localInertia);
		btDefaultMotionState* myMotionState = new btDefaultMotionState(
				groundTransform);
		btRigidBody::btRigidBodyConstructionInfo rbInfo(mass, myMotionState,
				groundShape, localInertia);
		btRigidBody* body = new btRigidBody(rbInfo);
		//add the body to the dynamics world
		dynamicsWorld->addRigidBody(body);
	}

	void ResetScene() {
		EmptyScene();
		collisionConfiguration = new btDefaultCollisionConfiguration();
		dispatcher = new btCollisionDispatcher(collisionConfiguration);
		broadphase = new btDbvtBroadphase();
		solver = new btSequentialImpulseConstraintSolver();
		dynamicsWorld = new btDiscreteDynamicsWorld(dispatcher, broadphase,
				solver, collisionConfiguration);
		AddGroundPlane();
	}

	void AddBox(const btTransform& T, float mass) {
		bool isDynamic = (mass != 0.f);
		btVector3 localInertia(0, 0, 0);
		if (isDynamic)
			boxShape->calculateLocalInertia(mass, localInertia);
		btDefaultMotionState* myMotionState = new btDefaultMotionState(T);
		btRigidBody::btRigidBodyConstructionInfo rbInfo(mass, myMotionState,
				boxShape, localInertia);
		btRigidBody* body = new btRigidBody(rbInfo);
		dynamicsWorld->addRigidBody(body);
	}

	void AddShape(const Cube& cube){
		btVector3 halfExtents = btVector3(cube.wx, cube.wy, cube.wz);
		halfExtents *= btScalar(0.5);
		shapes[cube.name] = new btBoxShape(halfExtents);
	}

	void AddShape(const Convex& convex) {
		std::vector<XYZ> points = convex.points;
		int numPoints = points.size();
		if (numPoints > 0) {
			btVector3* convexHull = new btVector3[numPoints];
			for (int i = 0; i < numPoints; i++) {
				convexHull[i][0] = points[i].x;
				convexHull[i][1] = points[i].y;
				convexHull[i][2] = points[i].z;
			}
			shapes[convex.name] = new btConvexHullShape(&convexHull[0][0], numPoints);
		}
	}

	void AddShape(const Sphere& sphere){
		shapes[sphere.name] = new btSphereShape(sphere.radius);
	}

	void AddShape(const Cylinder& cylinder){
		btVector3 halfExtents = btVector3(cylinder.radius, cylinder.height * 0.5f, 0.0f);
		shapes[cylinder.name] = new btCylinderShape(halfExtents);
	}


	void AddBody(const Body& body) {
		btCollisionShape* shape = boxShape;
		if (shapes.count(body.shapeName) == 0) {
			// TODO: Error callbacks!
		} else {
			shape = shapes[body.shapeName];
		}

		std::vector<float> transform = body.transform;
		btTransform T;
		T.setIdentity();
		{
			float m[16];
			for (std::vector<float>::size_type i = 0; i < transform.size(); i++) {
				m[i] = transform[i];
			}
			T.setFromOpenGLMatrix(&m[0]);
		}

		bool isDynamic = (body.mass != 0.f);
		btVector3 localInertia(0, 0, 0);
		if (isDynamic)
			shape->calculateLocalInertia(body.mass, localInertia);
		btDefaultMotionState* myMotionState = new btDefaultMotionState(T);
		btRigidBody::btRigidBodyConstructionInfo rbInfo(body.mass, myMotionState,
				shape, localInertia);
		btRigidBody* rbody = new btRigidBody(rbInfo);
		rbody->setFriction(body.friction);
		dynamicsWorld->addRigidBody(rbody);
	}

	void Step() {
		if (dynamicsWorld){
			dynamicsWorld->stepSimulation(1.0 / 60.0);
		}
	}
};

static BulletScene bulletScene;

double LoadScene(Scene scene) {
	bulletScene.ResetScene();

	for(std::vector<Cube>::iterator it = scene.cubes.begin(); it != scene.cubes.end(); ++it) bulletScene.AddShape(*it);
	for(std::vector<Convex>::iterator it = scene.convices.begin(); it != scene.convices.end(); ++it) bulletScene.AddShape(*it);
	for(std::vector<Sphere>::iterator it = scene.spheres.begin(); it != scene.spheres.end(); ++it) bulletScene.AddShape(*it);
	for(std::vector<Cylinder>::iterator it = scene.cylinders.begin(); it != scene.cylinders.end(); ++it) bulletScene.AddShape(*it);
	for(std::vector<Body>::iterator it = scene.bodies.begin(); it != scene.bodies.end(); ++it) bulletScene.AddBody(*it);

	// Scene created.
	return (double) scene.bodies.size();
}

SceneUpdate StepScene(XYZ rayFrom, XYZ rayTo) {
	bulletScene.movePickingConstraint(btVector3(rayFrom.x, rayFrom.y, rayFrom.z), btVector3(rayTo.x, rayTo.y, rayTo.z));

	uint64_t start = microseconds();
	// Do work
	bulletScene.Step();
	uint64_t end = microseconds();
	uint64_t delta = end - start;
	SceneUpdate resultSceneUpdate;
	resultSceneUpdate.delta = delta;

	// Build transform frame
	if(bulletScene.dynamicsWorld){
		int numObjects = bulletScene.dynamicsWorld->getNumCollisionObjects();
		resultSceneUpdate.transform.reserve((numObjects - 1) * 16);
		// todo this is probably wrong
		for (int i = 1; i < numObjects; i++) {
			btCollisionObject* obj = bulletScene.dynamicsWorld->getCollisionObjectArray()[i];
			btRigidBody* body = btRigidBody::upcast(obj);

			if (body && body->getMotionState()) {
				btTransform xform;
				body->getMotionState()->getWorldTransform(xform);
				float bulletTransform[16];
				xform.getOpenGLMatrix(bulletTransform);
				// we just set 16 items, update return vector
				for(int j = 0; j < 16; j++){
					resultSceneUpdate.transform.push_back(bulletTransform[j]);
				}
			}
		}
	} else {
		// error
	}

	return resultSceneUpdate;

}

bool PickObject(double index, XYZ pos, XYZ cpos) {
	if (!bulletScene.dynamicsWorld) {
		return false;
	}
	index++;
	if (index < 0 || index >= bulletScene.dynamicsWorld->getNumCollisionObjects()) {
		bulletScene.pickedObjectIndex = -1;
		return false;
	}
	bulletScene.pickedObjectIndex = index;
	bulletScene.addPickingConstraint(btVector3(cpos.x, cpos.y, cpos.z), btVector3(pos.x, pos.y, pos.z));
	return true;
}

bool DropObject() {
	bulletScene.removePickingConstraint();
	return true;
}

