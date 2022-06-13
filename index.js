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

  useFrame(() => {

    if(physicsIds[0] && sphere) {

      for (var i = 0; i < posArray.length; i++) {
        let localPos = new THREE.Vector3().fromArray(posArray[i]);
        localPos.applyQuaternion(physicsIds[0].quaternion);

        let difference = sphere.position.y - waterLevel;
        let floatingPower = 5;

        physics.addForce(physicsIds[0], new THREE.Vector3(0,0,-10).applyQuaternion(physicsIds[0].quaternion), true);

        if(difference < 0) {
          let force = floatingPower*Math.abs(difference);
          //console.log(force, difference);
          physics.addForceAtLocalPos(physicsIds[0], new THREE.Vector3(0,force,0), localPos, true);
        }
        
      }


      sphere.position.copy(physicsIds[0].position);
      sphere.quaternion.copy(physicsIds[0].quaternion);
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

    const radius = 0.8;
    const halfHeight = 0.08;
    const physicsMaterial = new THREE.Vector3(0.5, 0.5, 0.1); //static friction, dynamic friction, restitution

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
