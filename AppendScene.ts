import * as THREE from "three";
import {GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"


/** ルートシーンを取得する */
export function findRootScene (target: THREE.Object3D<THREE.Event> | undefined) {
  if (target === undefined) {
    return undefined;
  }
  let current: THREE.Object3D<THREE.Event> = target;
  while (current.parent !== undefined && current.parent !== null) {
    current = current.parent as THREE.Object3D<THREE.Event>;
  }
  return current;
};

/** シーンを作成する */
export function attachModelsToScene (scene: THREE.Scene) {
    let mixer: THREE.AnimationMixer;

    // GLTFを読み込む
    const loader = new GLTFLoader();
    // 3Dモデルはhttps://threejs.org/examples/#webgl_animation_skinning_additive_blendingのモデルを使います
    loader.loadAsync("Xbot.glb").then((mesh) => {
      scene.add(mesh.scene);
      
      mixer = new THREE.AnimationMixer( mesh.scene );
        
      mesh.animations.forEach( ( clip ) => {
        if (clip.name === 'run') {
          mixer.clipAction( clip ).play();
        }
      } );
    });
    
    // アニメーションを実行する
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame( animate );
      
      var delta = clock.getDelta();
      
      if ( mixer ) mixer.update( delta );
    }
    animate();
}