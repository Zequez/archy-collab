import React from "react";
import { useEffect, useState } from "react";
import { Store, Resource, Agent } from "@tomic/react";
import {
  removeBaseSharedHost,
  rewriteIndependentHostWishSharedHost,
} from "@lib/host";
import CommitButton from "./CommitButton";

const NAMESPACE = "archy-collab";

const atomicAgent = Agent.fromSecret("");
const store = new Store({
  serverUrl: "https://atomicdata.dev",
  agent: atomicAgent,
});

const agent = removeBaseSharedHost(
  rewriteIndependentHostWishSharedHost(document.location.host)
);

const properties = {
  htmlDocument: "https://atomicdata.dev/property/html-document",
};

const Editor = (props: any) => {
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [commitLoading, setCommitLoading] = useState(false);
  const [serverHtmlDocument, setServerHtmlDocument] = useState("");
  const [localHtmlDocument, setLocalHtmlDocument] = useState("");
  const [lastBlobUrl, setLastBlobUrl] = useState<string>("");

  useEffect(() => {
    (async () => {
      const resource = await store.fetchResourceFromServer(
        `https://atomicdata.dev/${NAMESPACE}/${agent}`
      );

      setResource(resource);

      const serverHtml = resource.get(properties.htmlDocument) as string;

      store.addResources();

      setServerHtmlDocument(serverHtml);
      handleHtmlUpdate(serverHtml);
      setLoading(false);
    })();
  }, []);

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
      await resource.set(properties.htmlDocument, localHtmlDocument, store);
      console.log("Resource set!", resource);
      console.log("Save!", await resource.save(store));
      document.location.reload();
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
            <CommitButton
              enabled={
                localHtmlDocument !== serverHtmlDocument && !commitLoading
              }
              onActivate={handleCommit}
            />
          </div>
          <textarea
            style={{
              width: "50%",
              height: "100%",
              display: "block",
              padding: "12px",
              resize: "none",
              boxSizing: "border-box",
              border: "none",
              outline: "none",
            }}
            value={localHtmlDocument}
            onChange={(ev) => handleHtmlUpdate(ev.target.value)}
          ></textarea>
        </>
      )}
    </div>
  );
};

export default React.memo(Editor);
