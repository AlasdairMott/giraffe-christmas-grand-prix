import { useKeyboardControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useEffect, useState } from "react";
import { Controls } from "./enums";
import { CityScene } from "./CityScene";
import { CarController } from "./CarController";

export const PhysicsScene = () => {
  const [sub] = useKeyboardControls<Controls>();
  const [isDebug, setIsDebug] = useState(false);

  useEffect(() => {
    sub(
      (state) => state.debug,
      (pressed) => {
        if (pressed) {
          setIsDebug(!isDebug);
        }
      }
    );
  }, [isDebug, sub]);

  return (
    <Physics timeStep="vary" debug={isDebug}>
      <CityScene />
      <CarController />
    </Physics>
  );
};
