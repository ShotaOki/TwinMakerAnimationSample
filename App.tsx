import "./App.css";
import { initialize } from "@iot-app-kit/source-iottwinmaker";
import { SceneViewer } from "@iot-app-kit/scene-composer";
import { useStore } from "@iot-app-kit/scene-composer/dist/src/store";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { attachModelsToScene, findRootScene } from "./AppendScene";

function App() {
  // TwinMakerのシーンを読み込む
  const sceneLoader = initialize("XXXXXXXXXXXXXXXXXX", {
    awsCredentials: {
      accessKeyId: "XXXXXXXXXXXXXXX",
      secretAccessKey: "XXXXXXXXXXXXXXXXXXXXXX",
    },
    awsRegion: "us-east-1",
  }).s3SceneLoader("XXXXXXXXXXXXXXXXXXX");

  // 初期化フラグ
  const [initializedFlag, setInitializedFlag] = useState(false);
  // 任意のコンポーザーID
  const composerId = "abcdef-eeggff";
  // TwinMaker（クラウド側）の画面構成情報を参照する(※nodeMap＝S3にあるJsonデータのこと)
  const nodeMap = useStore(composerId)((state) => state.document.nodeMap);
  // Jsonのタグ情報に紐づいた3Dオブジェクトを参照する
  const getObject3DBySceneNodeRef = useStore(composerId)(
    (state) => state.getObject3DBySceneNodeRef
  );
  // nodeMapの更新まではフックできるが、r3fの初期化はフックできない
  // そのため、nodeMap更新からタイマーで500msごとに更新完了を監視する
  useEffect(() => {
    const timer = setInterval(() => {
      // 初期化済みなら処理をしない
      if (initializedFlag) {
        return;
      }
      // documentから3Dシーンを取得する
      for (let ref of Object.keys(nodeMap)) {
        // オブジェクトを参照する
        const object3D = getObject3DBySceneNodeRef(ref);
        const rootScene = findRootScene(object3D) as THREE.Scene;
        if (rootScene !== null && rootScene !== undefined) {
          // 初期化済みフラグを立てる
          setInitializedFlag(true);
          // シーンに3Dモデルをアタッチする
          attachModelsToScene(rootScene);
          return;
        }
      }
    }, 500);
    // useEffectのデストラクタ
    return () => {
      clearInterval(timer);
    };
  }, [nodeMap, getObject3DBySceneNodeRef, initializedFlag]);

  return (
    <div className="App">
      <SceneViewer
        sceneComposerId={composerId}
        sceneLoader={sceneLoader}
        activeCamera="Camera1"
      />
    </div>
  );
}

export default App;
