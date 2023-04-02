import React from "react";
import { useEffect, useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import HTMLTreeEditor from "./HTMLTreeEditor";
import { html as htmlLang } from "@codemirror/lang-html";
import ActionBar from "./ActionBar";
import cx from "classnames";
// import { generateStyles } from "./lib/utils";
import { useDocumentFromServer } from "./lib/api";
import { useAgent } from "./lib/agent";
import useDocumentWithBlob from "./lib/useDocumentWithBlob";
import { useCtrlS } from "./lib/globalKeyBindings";
import { GripLinesVertical } from "./lib/icons";

type EditorProps = {
  onClose: () => void;
  documentPath: string;
};

const Editor = ({ onClose, documentPath }: EditorProps) => {
  const [agent] = useAgent(() => onClose());
  const [serverDocument, serverCommit, commitLoading] = useDocumentFromServer(
    agent,
    documentPath
  );
  const serverHtmlDocument = serverDocument?.htmlDocument;
  const loading = !serverDocument;

  const [previewBlobUrl, previewHtmlDocument, setPreviewHtmlDocument] =
    useDocumentWithBlob();
  const [editorHtmlDocument, setEditorHtmlDocument] = useState("");

  useEffect(() => {
    if (serverDocument) {
      const locallyStoredHtml = window.localStorage.getItem(documentPath);
      setEditorHtmlDocument(locallyStoredHtml || serverDocument.htmlDocument);
      setPreviewHtmlDocument(locallyStoredHtml || serverDocument.htmlDocument);
    }
  }, [serverDocument]);

  async function handleCommit() {
    if (serverDocument) {
      serverCommit({ htmlDocument: editorHtmlDocument });
    }
  }

  const handleSave = useCallback(() => {
    setPreviewHtmlDocument(editorHtmlDocument);
  }, [editorHtmlDocument]);

  useCtrlS(handleSave);

  function handleEditorHtmlUpdate(newHtml: string) {
    setEditorHtmlDocument(newHtml);
    setLocalStorageHtml(newHtml);
  }

  function setLocalStorageHtml(newHtml: string) {
    window.localStorage.setItem(documentPath, newHtml);
  }

  // Resizing logic

  const [iframeWidth, setIframeWidth] = useState<number>(50);
  const [isResizing, setIsResizing] = useState(false);

  function handleResizerStart() {
    setIsResizing(true);
  }

  function handleResizerEnd() {
    setIsResizing(false);
  }

  function handleResizerDrag(ev: MouseEvent) {
    if (isResizing) {
      const parentWidth = window.document.body.clientWidth ?? 0;
      const xPosition = ev.clientX;
      const percentage = Math.round((xPosition / parentWidth) * 1000) / 10;
      setIframeWidth(percentage);
    }
  }

  useEffect(() => {
    if (isResizing) {
      window.document.addEventListener("mousemove", handleResizerDrag);
      window.document.addEventListener("mouseup", handleResizerEnd);
      return () => {
        window.document.removeEventListener("mousemove", handleResizerDrag);
        window.document.removeEventListener("mouseup", handleResizerEnd);
      };
    }
  }, [isResizing]);

  // Editor Mode

  const [editorMode, setEditorMode] = useState<EditorMode>("RAW_CODE");

  return (
    <div className="flex fixed inset-0 bg-yellow-50 z-[9999]">
      {loading ? (
        "Loading..."
      ) : (
        <>
          <div
            className="p-2 w-full h-full flex-shrink-0"
            style={{ width: `${iframeWidth}%` }}
          >
            <iframe
              sandbox="allow-scripts allow-popups allow-same-origin"
              allow="microphone"
              className={cx("h-full w-full border-none  rounded-md shadow-md", {
                "pointer-events-none": isResizing,
              })}
              src={previewBlobUrl}
            ></iframe>
          </div>
          <div
            className="flex items-center justify-center -ml-2 w-2 py-2 cursor-col-resize flex-shrink-0 group"
            onMouseDown={handleResizerStart}
          >
            <div
              className={cx(
                "w-[4px] group-hover:opacity-100 h-full transition-opacity rounded-md bg-black/30",
                { "opacity-100": isResizing },
                { "opacity-0": !isResizing }
              )}
            ></div>
          </div>
          <div className="h-full text-black flex flex-col flex-grow relative pb-12 overflow-hidden">
            <div className="flex-grow flex w-full h-full pt-2">
              {editorMode === "RAW_CODE" ? (
                <div className="flex-grow rounded-md shadow-md w-full h-full overflow-auto mr-2">
                  <CodeMirror
                    extensions={[htmlLang()]}
                    className="h-full w-full block border-box border-none outline-none"
                    value={editorHtmlDocument}
                    onChange={(val) => handleEditorHtmlUpdate(val)}
                  />
                </div>
              ) : (
                <HTMLTreeEditor
                  value={editorHtmlDocument}
                  onChange={handleEditorHtmlUpdate}
                />
              )}
            </div>
            <ActionBar
              onSave={handleSave}
              onCommit={handleCommit}
              onClose={onClose}
              localIsPreviewed={editorHtmlDocument !== previewHtmlDocument}
              localIsDirty={editorHtmlDocument !== serverHtmlDocument}
              isCommitting={commitLoading}
              left={
                <>
                  <EditorModeButton
                    text="CODE"
                    mode="RAW_CODE"
                    currentMode={editorMode}
                    onClick={setEditorMode}
                  />
                  <EditorModeButton
                    text="BLOCKS"
                    mode="HTML_TREE"
                    currentMode={editorMode}
                    onClick={setEditorMode}
                  />
                </>
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

type EditorMode = "RAW_CODE" | "HTML_TREE";

const EditorModeButton = ({
  text,
  currentMode,
  mode,
  onClick,
}: {
  text: string;
  currentMode: EditorMode;
  mode: EditorMode;
  onClick: (mode: EditorMode) => void;
}) => {
  return (
    <button
      className={cx(
        "h-full bg-gradient-to-b from-green-500 to-green-600/80 border-0 text-white/80 px-2 mr-[1px] font-bold filter saturate-50 text-shadow-dark-1",
        {
          "shadow-inner border-b-4 border-solid border-green-600 saturate-100":
            currentMode === mode,
        }
      )}
      onClick={() => onClick(mode)}
    >
      {text}
    </button>
  );
};

export default React.memo(Editor);
