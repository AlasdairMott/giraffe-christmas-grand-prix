import {
  Environment,
  KeyboardControls,
  KeyboardControlsEntry,
  PositionalAudio,
  useKeyboardControls,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import "./App.css";
import { PhysicsScene } from "./PhysicsScene";
import Intro from "./Splash";
import { Controls } from "./enums";

export function WrappedApp() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.jump, keys: ["Space"] },
      { name: Controls.reset, keys: ["KeyR"] },
      { name: Controls.shift, keys: ["Shift"] },
      { name: Controls.o, keys: ["KeyO"] },
      { name: Controls.p, keys: ["KeyP"] },
      { name: Controls.h, keys: ["KeyH"] },
      { name: Controls.enter, keys: ["Enter", "NumpadEnter"] },
      { name: Controls.fullscreen, keys: ["KeyF"] },
    ],
    []
  );

  return (
    <KeyboardControls map={map}>
      <Intro>
        <App />
      </Intro>
    </KeyboardControls>
  );
}

function App({ ready }: { ready?: boolean }) {
  const [sub] = useKeyboardControls<Controls>();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    sub(
      (state) => state.help,
      (pressed) => {
        if (pressed) {
          setShowSplash(!showSplash);
        }
      }
    );
    sub(
      (state) => state.fullscreen,
      (pressed) => {
        if (pressed) {
          console.log("fullscreen");
          document.body.requestFullscreen();
        }
      }
    );
  }, [showSplash, sub]);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [10, 12, 12], fov: 25 }}
        style={{ width: "100vw", height: "100vh", background: "#def5ff" }}
      >
        {ready && (
          <PositionalAudio autoplay url="/music.mp3" distance={100} loop />
        )}
        <Suspense fallback={null}>
          <PhysicsScene />
        </Suspense>

        <Environment preset="forest" background={false} />
      </Canvas>
    </>
  );
}

export default WrappedApp;
