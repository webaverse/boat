import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useFrame, useLoaders, usePhysics, useCleanup, useActivate} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default () => {
  const app = useApp();
  const physics = usePhysics();
  let sphere = null;

  app.name = 'ball';
  let waterLevel = 6;
  let posArray = [
    [5,0,5],
    [-5,0,5],
    [5,0,-5],
    [-5,0,-5]
  ];

  useFrame(({ timeDiff }) => {

    if(physicsIds[0] && sphere) {

      for (var i = 0; i < posArray.length; i++) {
        let localPos = new THREE.Vector3().fromArray(posArray[i]);
        localPos.applyQuaternion(physicsIds[0].quaternion);

        let difference = sphere.position.y - waterLevel;
        let floatingPower = 5;

        //physics.addForce(physicsIds[0], new THREE.Vector3(0,0,-10).applyQuaternion(physicsIds[0].quaternion), true);

        for (var i = 0; i < posArray.length; i++) {

          const timeDiffCapped = Math.min(Math.max(timeDiff/1000, 0), 100);

          lastLength[i] = springLength;
          springLength = pointArray[i].distance - wheelRadius;
          springLength = THREE.MathUtils.clamp(springLength, minLength, maxLength);
          springVelocity = (lastLength[i] - springLength) / (timeDiff/2000);
          springForce = springStiffness * (restLength - springLength);
          damperForce = damperStiffness * springVelocity;

          let x = THREE.MathUtils.clamp(pointArray[i].distance, 0, maxLength) - 4;
          let k = 1000;
          let damping = 10;
          let vecPog = localPlayer.characterPhysics.velocity.clone();
          vecPog.normalize();
          let force = -k * x - damping * vecPog.y ;

          suspensionForce = new THREE.Vector3(0, Math.abs(springForce/damperForce), 0);

          let tempVec = new THREE.Vector3(0, force*timeDiffCapped, 0);

          physics.addForceAtLocalPos(physicsIds[0], tempVec, 
            new THREE.Vector3(originArray[i].position.x, originArray[i].position.y, originArray[i].position.z));

      }
    }

      app.position.copy(physicsIds[0].position);
      app.quaternion.copy(physicsIds[0].quaternion);
      app.updateMatrixWorld();

    }

  });

  let physicsIds = [];
  (async () => {
    const u = `${baseUrl}boat/boat.glb`;
    let o = await new Promise((accept, reject) => {
      const {gltfLoader} = useLoaders();
      gltfLoader.load(u, accept, function onprogress() {}, reject);
    });
    sphere = o.scene;
    app.add( sphere );

    app.updateMatrixWorld();
    
    const physicsId = physics.addBoxGeometry(
      new THREE.Vector3(0,0,0),
      new THREE.Quaternion(0,0,0,1),
      new THREE.Vector3(10,0.5,2),
      true
    );
    physicsIds.push(physicsId);
    physicsId.position.copy(app.position);
    physicsId.quaternion.copy(app.quaternion);
    physics.setTransform(physicsId, true);
  })();
  
  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });

  return app;
};
