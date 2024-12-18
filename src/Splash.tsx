import splash from "/splash.svg";
import { Suspense, cloneElement, useEffect, useState } from "react";

function Ready({ setReady }: { setReady: (ready: boolean) => void }) {
  useEffect(() => () => void setReady(true), [setReady]);
  return null;
}

// https://codesandbox.io/p/sandbox/lulaby-city-gkfhr?file=%2Fsrc%2FApp.js%3A35%2C38-35%2C51
export default function Intro({ children }: { children: JSX.Element }) {
  const [clicked, setClicked] = useState(false);
  const [ready, setReady] = useState(false);
  return (
    <>
      <Suspense fallback={<Ready setReady={setReady} />}>
        {cloneElement(children, { ready: clicked && ready })}
      </Suspense>
      <div
        className={`fullscreen bg ${ready ? "ready" : "notready"} ${
          clicked && "clicked"
        }`}
      >
        {/* <img src={splash} alt="splash" /> */}
        {/* <div className="stack">
          
        </div> */}
        <div className="splash-container">
          <div className="splash-body">
            <img src={splash} alt="splash" />
            <a
              href="#"
              onClick={() => setClicked(true)}
              style={{ color: "white" }}
            >
              {!ready ? "loading" : "click to continue"}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
