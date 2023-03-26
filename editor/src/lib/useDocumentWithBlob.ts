import { useState } from "react";

const useDocumentWithBlob = (): [string, string, (newHtml: string) => void] => {
  const [lastBlobUrl, setLastBlobUrl] = useState<string>("");
  const [previewHtmlDocument, setPreviewHtmlDocument] = useState("");

  function setPreviewHtml(newHtml: string) {
    setPreviewHtmlDocument(newHtml);
    setBlobFromHtml(newHtml);
  }

  function setBlobFromHtml(newHtml: string) {
    if (lastBlobUrl) {
      URL.revokeObjectURL(lastBlobUrl);
    }
    const blob = new Blob([newHtml || ""], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    setLastBlobUrl(blobUrl);
  }

  return [lastBlobUrl, previewHtmlDocument, setPreviewHtml];
};

export default useDocumentWithBlob;
