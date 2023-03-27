import React from "react";
import "virtual:windi.css";
import { createRoot } from "react-dom/client";
import Editor from "./Editor";

const rootElement = document.createElement("div");
const root = createRoot(rootElement);
let LatestEditor = Editor;
function loadOrShowEditor() {
  if (!rootElement.isConnected) {
    document.body.append(rootElement);
    renderEditor();
    scrollbarHider(true);
  } else {
    rootElement.remove();
    scrollbarHider(false);
  }
}

function resetEditor() {
  renderEditor();
}

function renderEditor() {
  const astroPath =
    document.querySelector("[astropath]")?.getAttribute("astropath") || "";
  root.render(
    <LatestEditor
      onClose={() => {
        rootElement.remove();
        scrollbarHider(false);
      }}
      documentPath={astroPath}
    />
  );
}

let prevOverflow: string = "";
function scrollbarHider(hidden: boolean) {
  if (hidden) {
    prevOverflow = prevOverflow || document.body.style.overflow;
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = prevOverflow;
    prevOverflow = "";
  }
}

const CLICKS_TO_OPEN = 5;
const MAX_TIME_BETWEEN_CLICKS = 1500;
let timeout: number;
let clickCount = 0;

function handleClick() {
  if (rootElement.isConnected) return;
  if (clickCount >= CLICKS_TO_OPEN) {
    return;
  }
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    clickCount = 0;
  }, MAX_TIME_BETWEEN_CLICKS);
  clickCount += 1;
  if (clickCount === CLICKS_TO_OPEN) {
    console.log("SUCCESS!");
    loadOrShowEditor();
  } else {
    console.log(
      `${CLICKS_TO_OPEN - clickCount} Clicks away from opening the editor`
    );
  }
}

// document.addEventListener("keydown", (ev) => {
//   if (ev.shiftKey) {
//     handleClick();
//   }
// });
document.addEventListener("click", handleClick);
document.addEventListener("touchstart", handleClick);

(window as any).openEditor = () => {
  loadOrShowEditor();
};

// if (import.meta.hot) {
//   console.log("HMR!");
//   // import.meta.hot.accept();
//   import.meta.hot.accept("./Editor", (newEditor) => {
//     console.log("New Editor!", newEditor);
//     if (newEditor) {
//       LatestEditor = newEditor.default;
//       resetEditor();
//     }
//   });
// }
