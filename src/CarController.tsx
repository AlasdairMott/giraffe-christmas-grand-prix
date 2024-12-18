import {
  OrbitControls,
  PerspectiveCamera,
  Shadow,
  useGLTF,
  useKeyboardControls
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  MeshCollider,
  RapierRigidBody,
  RigidBody,
  quat,
  vec3,
} from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Controls } from "./enums";
import { Sled } from "./Sled";

export function CarController() {
  const [sub, get] = useKeyboardControls<Controls>();
  const rigidBody = useRef<RapierRigidBody>(null);
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const orbit = useRef<OrbitControlsImpl>(null);
  const [isOrbit, setIsOrbit] = useState(false);
  const shadow = useRef<THREE.Group>(null);

  useEffect(() => {
    sub(
      (state) => state.reset,
      (pressed) => {
        if (pressed) {
          // reset the car
          if (!rigidBody.current) {
            return;
          }

          rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
          rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          rigidBody.current.setTranslation({ x: 0, y: 0, z: 0 }, true);
          rigidBody.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
          rigidBody.current.resetForces(true);
          rigidBody.current.resetTorques(true);
        }
      }
    );

    sub(
      (state) => state.jump,
      (pressed) => {
        if (pressed) {
          // jump
          if (!rigidBody.current) {
            return;
          }

          rigidBody.current.applyImpulse({ x: 0, y: 1.1, z: 0 }, true);
        }
      }
    );

    sub(
      (state) => state.right,
      (pressed) => {
        if (pressed) {
          // pass into car the prop handle turn right
        }
      }
    );

    sub(
      (state) => state.orbit,
      (pressed) => {
        if (pressed) {
          setIsOrbit(!isOrbit);
        }
      }
    );
  }, [isOrbit, sub]);

  useFrame(() => {
    if (!rigidBody.current) {
      return;
    }

    const forwardAmount = get().forward ? 0.1 * (get().shift ? 3 : 1) : 0;
    const backAmount = get().back ? 0.1 : 0;
    const leftAmount = get().left ? 0.01 : 0;
    const rightAmount = get().right ? 0.01 : 0;
    const position = vec3(rigidBody.current.translation());
    const quaternion = quat(rigidBody.current.rotation());

    if (camera.current) {
      // the camera should be placed behind the car
      const backward = new THREE.Vector3(0, 2, -5);
      backward.applyQuaternion(quaternion);
      const cameraTargetPosition = backward.add(position);

      camera.current.position.lerp(cameraTargetPosition, 0.075);
      camera.current.lookAt(
        vec3(rigidBody.current?.translation()) ?? [0, 0, 0]
      );
    } else if (orbit.current) {
      orbit.current.target.lerp(position, 0.075);
    }

    rigidBody.current.setRotation(quaternion, true);

    // world space impulse direction
    const forward = new THREE.Vector3(0, -0.01, forwardAmount - backAmount);
    forward.applyQuaternion(quaternion);

    rigidBody.current.applyImpulseAtPoint(
      forward,
      position.clone().add(new THREE.Vector3(0, 0.11, 0)),
      true
    );

    // turning
    rigidBody.current.applyTorqueImpulse(
      {
        x: 0,
        y: (leftAmount - rightAmount) * 0.75,
        z: 0,
      },
      true
    );

    // shadow y position
    if (shadow.current) {
      shadow.current.position.set(position.x, 0.01, position.z);
    }
  });

  return (
    <>
      {isOrbit ? (
        <OrbitControls ref={orbit} />
      ) : (
        <>
          <PerspectiveCamera position={[0, 30, 0]} makeDefault ref={camera} />
        </>
      )}

      <RigidBody
        colliders={false}
        restitution={0.2}
        ref={rigidBody}
        includeInvisible
        density={2.0}
        position={[0, 3, 0]}
        angularDamping={0.9}
      >
        <Sled scale={0.2} />
        <MeshCollider type="hull">
          <CarCollision scale={0.2} visible={false} />
        </MeshCollider>
      </RigidBody>
      <group ref={shadow} scale={1.3}>
        <Shadow
          color="black"
          colorStop={0}
          opacity={0.3}
          fog={false} // Reacts to fog (default=false)
        />
      </group>
    </>
  );
}

function CarCollision(props: JSX.IntrinsicElements["group"]) {
  const { nodes } = useGLTF("/carCollision.glb");
  return (
    <group {...props} dispose={null}>
      <primitive object={nodes.Convex_Hull} />
    </group>
  );
}

useGLTF.preload("/carCollision.glb");
