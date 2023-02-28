import React from "react";
import { useEffect, useState, useCallback } from "react";
import { Store, Resource, Agent } from "@tomic/react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";

import StyledButton from "./StyledButton";

const NAMESPACE = "archy-collab";
const ANONYMOUS_PUBLIC_KEY =
  "eyJjbGllbnQiOnt9LCJzdWJqZWN0IjoiaHR0cHM6Ly9hdG9taWNkYXRhLmRldi9hZ2VudHMvQ0Nla2xVNUo0Y3h5anR2dmJTYU1sOEhtY2JCY2lRbElJTEpXcVRGQUxmST0iLCJwcml2YXRlS2V5Ijoid2xqa29LRlRRK1A4RUZPNHNibXlhOXVSVFd4NE44WkluMmxaSHlhOStJTT0iLCJwdWJsaWNLZXkiOiJDQ2VrbFU1SjRjeHlqdHZ2YlNhTWw4SG1jYkJjaVFsSUlMSldxVEZBTGZJPSJ9";

const store = new Store({
  serverUrl: "https://atomicdata.dev",
});

// const subHost = removeBaseSharedHost(
//   rewriteIndependentHostWishSharedHost(document.location.host)
// );

const initialWebsite = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Website title</title>
  </head>
  <body>
    <h1>Fresh website</h1>
  </body>
</html>
`;

const urls = {
  htmlDocument: "https://atomicdata.dev/property/html-document",
  error: "https://atomicdata.dev/classes/Error",
  isA: "https://atomicdata.dev/properties/isA",
  noclass: "https://atomicdata.dev/noclass",
  name: "https://atomicdata.dev/properties/name",
  parent: "https://atomicdata.dev/properties/parent",
  archyCollab: "https://atomicdata.dev/drive/jn6aczrpfg",
  invitationFolder: "https://atomicdata.dev/Folder/xdi4s7bzo9",
  invitations: "https://atomicdata.dev/invite/4n1xa3ygbx9",
};

function isError(resource: Resource): boolean {
  return (resource.get(urls.isA) as string[]).includes(urls.error);
}

async function createNewResource(
  subjectUrl: string,
  propVals: { [x: string]: string | string[] }
) {
  const resource = new Resource(subjectUrl, true);
  await Promise.all([
    ...Object.entries(propVals).map(([key, val]) =>
      resource.set(key, val, store)
    ),
  ]);
  await resource.save(store);
  return resource;
}

type EditorProps = {
  onClose: () => void;
  documentPath: string;
};

const Editor = ({ onClose, documentPath }: EditorProps) => {
  const resourceUrl = `https://atomicdata.dev/${NAMESPACE}/${documentPath}`;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [commitLoading, setCommitLoading] = useState(false);
  const [serverHtmlDocument, setServerHtmlDocument] = useState("");
  const [localHtmlDocument, setLocalHtmlDocument] = useState("");
  const [previewHtmlDocument, setPreviewHtmlDocument] = useState("");
  const [lastBlobUrl, setLastBlobUrl] = useState<string>("");
  const [iframeWidth, setIframeWidth] = useState<number>(50);

  useEffect(() => {
    const agentSecret =
      localStorage.getItem("agentSecret") ||
      prompt(
        "Secret key? If none is supplied a public anonymous key will be used; anyone will also be able to edit this page."
      ) ||
      ANONYMOUS_PUBLIC_KEY;
    if (agentSecret) {
      const newAgent = Agent.fromSecret(agentSecret);
      localStorage.setItem("agentSecret", agentSecret);
      store.setAgent(newAgent);
      setAgent(newAgent);
    } else {
      onClose();
    }
  }, []);

  useEffect(() => {
    if (agent) {
      (async () => {
        let resource = await store.fetchResourceFromServer(resourceUrl);

        const resourceDoesNotExist = isError(resource);

        if (resourceDoesNotExist) {
          resource = await createNewResource(resourceUrl, {
            [urls.parent]: urls.invitationFolder,
            [urls.htmlDocument]: initialWebsite,
            [urls.isA]: [urls.noclass],
            [urls.name]: documentPath,
          });
        }

        setResource(resource);

        const serverHtml = resource.get(urls.htmlDocument) as string;

        store.addResources();

        setServerHtmlDocument(serverHtml);
        const locallyStoredHtml = window.localStorage.getItem(documentPath);
        setLocalHtmlDocument(locallyStoredHtml || serverHtml);
        setPreviewHtmlDocument(locallyStoredHtml || serverHtml);
        setBlobFromHtml(locallyStoredHtml || serverHtml);
        setLoading(false);
      })();
    }
  }, [agent]);

  useEffect(() => {
    function handleKeyDown(ev: KeyboardEvent) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
        ev.preventDefault();
        handleSave();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave]);

  function handleHtmlUpdate(newHtml: string) {
    setLocalHtmlDocument(newHtml);
    setLocalStorageHtml(newHtml);
  }

  async function handleCommit() {
    if (resource) {
      setCommitLoading(true);
      await resource.set(urls.htmlDocument, localHtmlDocument, store);
      console.log("Save!", await resource.save(store));
      setCommitLoading(false);
    }
  }

  function handleSave() {
    setPreviewHtmlDocument(localHtmlDocument);
    setBlobFromHtml(localHtmlDocument);
  }

  function setBlobFromHtml(newHtml: string) {
    if (lastBlobUrl) {
      URL.revokeObjectURL(lastBlobUrl);
    }
    const blob = new Blob([newHtml || ""], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    setLastBlobUrl(blobUrl);
  }

  function setLocalStorageHtml(newHtml: string) {
    window.localStorage.setItem(documentPath, newHtml);
  }

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
      const percentage = Math.round((xPosition / parentWidth) * 100);
      setIframeWidth(percentage);
    }
  }

  useEffect(() => {
    window.document.addEventListener("mousemove", handleResizerDrag);
    window.document.addEventListener("mouseup", handleResizerEnd);
    return () => {
      window.document.removeEventListener("mousemove", handleResizerDrag);
      window.document.removeEventListener("mouseup", handleResizerEnd);
    };
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
            sandbox="allow-scripts allow-popups"
            style={{ width: `${iframeWidth}%`, height: "100%", border: "none" }}
            src={lastBlobUrl}
          ></iframe>
          <div
            style={{
              display: "flex",
              background: "#eee",
              width: "5px",
              cursor: "ew-resize",
            }}
            onMouseDown={handleResizerStart}
          ></div>
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
                value={localHtmlDocument}
                onChange={(val) => handleHtmlUpdate(val)}
              />
            </div>
            <div style={{ background: "#666", textAlign: "right" }}>
              <StyledButton
                hue={50}
                enabled={localHtmlDocument !== previewHtmlDocument}
                onActivate={() => handleSave()}
              >
                Cmd+S = Preview
              </StyledButton>
              <StyledButton
                hue={122}
                enabled={
                  localHtmlDocument !== serverHtmlDocument && !commitLoading
                }
                onActivate={handleCommit}
              >
                Commit
              </StyledButton>
              <StyledButton
                hue={0}
                sat={20}
                onActivate={() => onClose()}
                enabled={true}
              >
                Close
              </StyledButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(Editor);
