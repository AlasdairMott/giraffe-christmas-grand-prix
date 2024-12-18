/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    car_mesh: THREE.Mesh;
    car_mesh_1: THREE.Mesh;
    wheel_mesh: THREE.Mesh;
    wheel_mesh_1: THREE.Mesh;
    sled: THREE.Mesh;
    giraffe: THREE.Mesh;
  };
  materials: {
    Material: THREE.MeshStandardMaterial;
    ["Material.001"]: THREE.MeshStandardMaterial;
    ["Material.002"]: THREE.MeshStandardMaterial;
    Sleigh: THREE.MeshStandardMaterial;
    Giraffe_mat: THREE.MeshStandardMaterial;
  };
};

type ActionName = "KeyAction";
type GLTFActions = Record<ActionName, THREE.AnimationAction>;

export function Sled(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF("/sled.glb") as GLTFResult;

  // @ts-expect-error this isn't typed yet
  const { actions } = useAnimations<GLTFActions>(animations, group);

  useEffect(() => {
    //@ts-expect-error this isn't typed yet
    actions['KeyAction'].play()
  }, [actions])

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="car" position={[0, 0.125, 0]}>
          <mesh
            name="car_mesh"
            geometry={nodes.car_mesh.geometry}
            material={materials.Material}
          />
          <mesh
            name="car_mesh_1"
            geometry={nodes.car_mesh_1.geometry}
            material={materials.Material}
          />
        </group>
        <group name="Wheels" position={[0, 0.125, 0]}>
          <mesh
            name="wheel_mesh"
            geometry={nodes.wheel_mesh.geometry}
            material={materials["Material.001"]}
          />
          <mesh
            name="wheel_mesh_1"
            geometry={nodes.wheel_mesh_1.geometry}
            material={materials["Material.002"]}
          />
        </group>
        <mesh
          name="sled"
          geometry={nodes.sled.geometry}
          material={materials.Sleigh}
          position={[0, 0.125, 0]}
        />
        <mesh
          name="giraffe"
          geometry={nodes.giraffe.geometry}
          material={materials.Giraffe_mat}
          morphTargetDictionary={nodes.giraffe.morphTargetDictionary}
          morphTargetInfluences={nodes.giraffe.morphTargetInfluences}
          position={[0, 0.125, 0]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/sled.glb");