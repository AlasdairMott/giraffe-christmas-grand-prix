import { Plane, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  formatTexture,
  getBuildingTextureUrls,
  isMesh,
  loader,
  processImportedGeometry,
} from "./utils";
import { rpc } from "@gi-nx/iframe-sdk";

export const SCALE = 15;

export const CityScene = () => {
  const [gltfData, setGltfData] = useState<THREE.Mesh[]>(); // State to hold GLB data
  const [bboxScene, setBboxScene] = useState<THREE.Box3>();

  const textures = {
    highrise: useTexture(getBuildingTextureUrls()).map((t) =>
      formatTexture(t, 1.0)
    ),
    road: formatTexture(useTexture(["./road.jpg"])[0], 1),
    snow: formatTexture(useTexture(["./snow.jpg"])[0], 100),
  };

  useEffect(() => {
    rpc.invoke("getGltf").then((raw) => {
      loader.parse(raw, "", (gltf) => {
        const meshes: THREE.Mesh[] = [];
        gltf.scene.traverse((child) => {
          if (isMesh(child)) {
            meshes.push(child);
          }
        });

        const group = new THREE.Group();
        group.add(...meshes);

        processImportedGeometry(group, textures);

        setGltfData(meshes);

        const sceneBox = new THREE.Box3().setFromObject(group);

        setBboxScene(sceneBox);
      });
    });
  }, []);

  return (
    <>
      {gltfData && (
        <>
          <group scale={SCALE} rotation={[-Math.PI / 2, 0, 0]}>
            {gltfData.map((mesh, index) => {
              if (mesh.userData.isRoad === true) {
                return (
                  <primitive
                    key={index}
                    object={mesh}
                    castShadow
                    receiveShadow
                  />
                );
              } else {
                return (
                  <RigidBody
                    key={index}
                    type="fixed"
                    colliders="trimesh"
                    // friction={1.0}
                  >
                    <primitive object={mesh} castShadow receiveShadow />
                  </RigidBody>
                );
              }
            })}
          </group>
        </>
      )}
      <RigidBody type="fixed" colliders="hull" friction={0.5} restitution={0.5}>
        <Plane
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow={false}
          receiveShadow={false}
          args={[1000, 1000]}
        >
          <meshStandardMaterial
            color="#ffffff"
            polygonOffset
            polygonOffsetFactor={10}
            map={textures.snow}
          />
        </Plane>
      </RigidBody>
      {/* <RigidBody>
        
      </RigidBody> */}
      {bboxScene && <Gifts numberOfGifts={200} bboxScene={bboxScene} />}
    </>
  );
};

type Gift = {
  color: string;
  location: THREE.Vector3;
  index: number;
  rotation: number;
};

const bellSound = new Audio("/bell.mp3");
// bellSound.volume = 1.0;

const Gifts = ({
  numberOfGifts,
  bboxScene,
}: {
  numberOfGifts: number;
  bboxScene: THREE.Box3;
}) => {
  const [giftLocations, setGiftLocations] = useState<Gift[]>([]);
  // const bellSoundRef = useRef<THREE.PositionalAudio>(null);

  useEffect(() => {
    const locations: Gift[] = [];

    const getRandomVector = () => {
      const x =
        (THREE.MathUtils.randFloat(bboxScene.min.x, bboxScene.max.x) * SCALE) /
        2;
      const z =
        (THREE.MathUtils.randFloat(bboxScene.min.z, bboxScene.max.z) * SCALE) /
        2;
      return new THREE.Vector3(x, 0.4, z);
    };

    for (let i = 0; i < numberOfGifts; i++) {
      locations.push({
        color: getRandomColor(),
        location: getRandomVector(),
        index: i,
        rotation: Math.random() * Math.PI * 2,
      });
    }
    setGiftLocations(locations);
  }, [bboxScene, numberOfGifts]);

  // for each location render a mesh and a collider
  return (
    <>
      {giftLocations.map((gift) => {
        return (
          <group key={gift.index} position={gift.location}>
            {/* <PositionalAudio ref={bellSoundRef} url="/bell.mp3" /> */}
            <CuboidCollider
              sensor
              onIntersectionEnter={() => {
                // console.log(`entered gift ${gift.index}`);
                // bellSoundRef.current?.play();

                // if bellSOund is already playing, stop it and play again
                bellSound.pause();
                bellSound.currentTime = 0;
                bellSound.play();

                setGiftLocations((giftLocations) =>
                  giftLocations.filter((g) => g.index !== gift.index)
                );
              }}
              args={[0.5, 0.5, 0.5]}
            />
            <Gift color={gift.color} size={0.4} rotation={gift.rotation} />
          </group>
        );
      })}
    </>
  );
};

const Gift = ({
  color,
  size,
  rotation,
}: {
  color: string;
  size: number;
  rotation: number;
}) => {
  const box = useRef<THREE.Mesh>(null);
  //@ts-expect-error state is never read
  useFrame((state, delta) => {
    if (box.current) {
      box.current.rotation.y += delta;
    }
  });

  const ribbonLength = size + 0.01;
  const ribbonWidth = size * 0.2;

  return (
    <mesh ref={box} rotation={[0, rotation, 0.5]}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />
      <mesh>
        <boxGeometry args={[ribbonLength, ribbonWidth, ribbonLength]} />
        <meshStandardMaterial color={"white"} />
      </mesh>
      <mesh>
        <boxGeometry args={[ribbonWidth, ribbonLength, ribbonLength]} />
        <meshStandardMaterial color={"white"} />
      </mesh>
    </mesh>
  );
};

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  return `rgb(${r},${g},${b})`;
};
