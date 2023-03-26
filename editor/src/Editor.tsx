import React from "react";
import { useEffect, useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { parse } from "node-html-parser";
import ActionBar from "./ActionBar";
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

  return (
    <div
      style={{
        display: "flex",
        position: "fixed",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        background: "white",
        zIndex: 9999,
      }}
    >
      {loading ? (
        "Loading..."
      ) : (
        <>
          {isResizing ? (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            ></div>
          ) : null}
          <iframe
            sandbox="allow-scripts allow-popups allow-same-origin"
            allow="microphone"
            style={{
              width: `${iframeWidth}%`,
              height: "100%",
              border: "none",
              flexShrink: 0,
            }}
            src={previewBlobUrl}
          ></iframe>
          <div
            style={{
              display: "flex",
              background: "hsl(0,0%,95%)",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "inset 1px 0 0 rgba(0,0,0,0.25), inset -1px 0 0 rgba(0,0,0,0.25)",
              width: "10px",
              cursor: "ew-resize",
              flexShrink: 0,
            }}
            onMouseDown={handleResizerStart}
          >
            <div style={{ width: "6px", color: "rgba(0,0,0,0.25)" }}>
              <GripLinesVertical />
            </div>
          </div>
          <div
            style={{
              height: "100%",
              overflow: "auto",
              color: "black",
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            <div style={{ overflow: "auto", flexGrow: 1 }}>
              <CodeMirror
                extensions={[htmlLang()]}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  boxSizing: "border-box",
                  border: "none",
                  outline: "none",
                }}
                value={editorHtmlDocument}
                onChange={(val) => handleEditorHtmlUpdate(val)}
              />
            </div>
            <ActionBar
              onSave={handleSave}
              onCommit={handleCommit}
              onClose={onClose}
              localIsPreviewed={editorHtmlDocument !== previewHtmlDocument}
              localIsDirty={editorHtmlDocument !== serverHtmlDocument}
              isCommitting={commitLoading}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(Editor);
