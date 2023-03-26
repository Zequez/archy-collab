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
    <div className="flex fixed inset-0 bg-white z-[9999]">
      {loading ? (
        "Loading..."
      ) : (
        <>
          {isResizing ? <div className="fixed inset-0"></div> : null}
          <iframe
            sandbox="allow-scripts allow-popups allow-same-origin"
            allow="microphone"
            className="h-full border-none flex-shrink-0"
            style={{ width: `${iframeWidth}%` }}
            src={previewBlobUrl}
          ></iframe>
          <div
            className="flex bg-gray-100 items-center justify-center w-3 cursor-ew-resize flex-shrink-0"
            style={{
              boxShadow:
                "inset 1px 0 0  hsl(0,0%,80%), inset -1px 0 0  hsl(0,0%,80%)",
            }}
            onMouseDown={handleResizerStart}
          >
            <div className="w-2 text-gray-400">
              <GripLinesVertical />
            </div>
          </div>
          <div className="h-full overflow-auto text-black flex flex-col flex-grow">
            <div style={{ overflow: "auto", flexGrow: 1 }}>
              {editorMode === "RAW_CODE" ? (
                <CodeMirror
                  extensions={[htmlLang()]}
                  className="block w-full h-full border-box border-none outline-none"
                  value={editorHtmlDocument}
                  onChange={(val) => handleEditorHtmlUpdate(val)}
                />
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
        "h-full bg-gradient-to-b from-green-300 to-green-400/80 text-white/80 px-2 mr-[1px] font-bold filter saturate-50",
        {
          "shadow-inner border-b-4 border-solid border-green-600 saturate-100":
            currentMode === mode,
        }
      )}
      style={{ textShadow: "0 1px 0 hsla(0,0%,0%,0.2)" }}
      onClick={() => onClick(mode)}
    >
      {text}
    </button>
  );
};

export default React.memo(Editor);
