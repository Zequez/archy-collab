import React from "react";
import { useEffect, useState } from "react";
import { Store, Resource, Agent } from "@tomic/react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";

import StyledButton from "./StyledButton";

const NAMESPACE = "archy-collab";

const store = new Store({
  serverUrl: "https://atomicdata.dev",
});

// const subHost = removeBaseSharedHost(
//   rewriteIndependentHostWishSharedHost(document.location.host)
// );

const urls = {
  htmlDocument: "https://atomicdata.dev/property/html-document",
  error: "https://atomicdata.dev/classes/Error",
  isA: "https://atomicdata.dev/properties/isA",
  noclass: "https://atomicdata.dev/noclass",
  name: "https://atomicdata.dev/properties/name",
  parent: "https://atomicdata.dev/properties/parent",
  archyCollab: "https://atomicdata.dev/drive/jn6aczrpfg",
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
  const [lastBlobUrl, setLastBlobUrl] = useState<string>("");

  useEffect(() => {
    const agentSecret =
      localStorage.getItem("agentSecret") || prompt("Secret key?");
    if (agentSecret) {
      const newAgent = Agent.fromSecret(agentSecret);
      localStorage.setItem("agentSecret", agentSecret);
      store.setAgent(newAgent);
      setAgent(newAgent);
    }
  }, []);

  useEffect(() => {
    if (agent) {
      (async () => {
        let resource = await store.fetchResourceFromServer(resourceUrl);

        const resourceDoesNotExist = isError(resource);

        if (resourceDoesNotExist) {
          resource = await createNewResource(resourceUrl, {
            [urls.parent]: urls.archyCollab,
            [urls.htmlDocument]: "<h1>Initial website</h1>",
            [urls.isA]: [urls.noclass],
            [urls.name]: documentPath,
          });
        }

        setResource(resource);

        const serverHtml = resource.get(urls.htmlDocument) as string;

        store.addResources();

        setServerHtmlDocument(serverHtml);
        handleHtmlUpdate(serverHtml);
        setLoading(false);
      })();
    }
  }, [agent]);

  function handleHtmlUpdate(newHtml: string) {
    setLocalHtmlDocument(newHtml);
    if (lastBlobUrl) {
      URL.revokeObjectURL(lastBlobUrl);
    }
    const blob = new Blob([newHtml || ""], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    setLastBlobUrl(blobUrl);
  }

  async function handleCommit() {
    if (resource) {
      setCommitLoading(true);
      await resource.set(urls.htmlDocument, localHtmlDocument, store);
      console.log("Resource set!", resource);
      console.log("Save!", await resource.save(store));
      setCommitLoading(false);
    }
  }

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
      }}
    >
      {loading ? (
        "Loading..."
      ) : (
        <>
          <iframe
            sandbox="allow-scripts"
            style={{ width: "50%", height: "100%", border: "none" }}
            src={lastBlobUrl}
          ></iframe>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#eee",
              padding: "0 6px 6px 6px",
              borderWidth: "0 1px",
              borderStyle: "solid",
              borderColor: "#aaa",
            }}
          >
            <div style={{ flexGrow: 1 }}></div>
            <StyledButton
              hue={122}
              enabled={
                localHtmlDocument !== serverHtmlDocument && !commitLoading
              }
              onActivate={handleCommit}
              style={{ marginBottom: "8px" }}
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
          <div style={{ width: "50%", height: "100%", overflow: "auto" }}>
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
        </>
      )}
    </div>
  );
};

export default React.memo(Editor);
