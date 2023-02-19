import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { Store } from "@tomic/react";
import {
  removeBaseSharedHost,
  rewriteIndependentHostWishSharedHost,
} from "@lib/host";

const NAMESPACE = "archy-collab";

const store = new Store({
  serverUrl: "https://atomicdata.dev",
});

const agent = removeBaseSharedHost(
  rewriteIndependentHostWishSharedHost(document.location.host)
);

const Editor = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [serverHtmlDocument, setServerHtmlDocument] = useState("");
  const [localHtmlDocument, setLocalHtmlDocument] = useState("");
  const [lastBlobUrl, setLastBlobUrl] = useState<string>("");

  useEffect(() => {
    (async () => {
      const resource = await store.fetchResourceFromServer(
        `https://atomicdata.dev/${NAMESPACE}/${agent}`
      );

      const serverHtml = resource.get(
        "https://atomicdata.dev/property/html-document"
      ) as string;
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

  console.log("Editor rendered!", props);
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
          <textarea
            style={{ width: "50%", height: "100%", display: "block" }}
            value={localHtmlDocument}
            onChange={(ev) => handleHtmlUpdate(ev.target.value)}
          ></textarea>
        </>
      )}
    </div>
  );
};

const rootElement = document.createElement("div");
const root = createRoot(rootElement);
function loadOrShowEditor() {
  if (!rootElement.isConnected) {
    document.body.append(rootElement);
    root.render(<Editor />);
  } else {
    rootElement.remove();
  }
}

const CLICKS_TO_OPEN = 5;
const MAX_TIME_BETWEEN_CLICKS = 1000;
let timeout: NodeJS.Timeout;
let clickCount = 0;

function handleClick() {
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

document.addEventListener("click", handleClick);
document.addEventListener("touchstart", handleClick);

export default Editor;
