function extractScriptContents(doc: Document): string[] {
  const scripts = doc.getElementsByTagName("script");
  const contents: string[] = [];
  for (let i = 0; i < scripts.length; i++) {
    contents.push(scripts[i].textContent || "");
  }
  return contents;
}

function serializeDocument(doc: Document): string {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

function replaceScriptContent(serialized: string, contents: string[]): string {
  let scriptIndex = 0;
  const scriptRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi;
  return serialized.replace(scriptRegex, (_1, openTag, _2, closeTag) => {
    const content = contents[scriptIndex];
    scriptIndex += 1;
    return `${openTag}${content}${closeTag}`;
  });
}

export function serializeHtml(doc: Document): string {
  const contents = extractScriptContents(doc);
  const serialized = serializeDocument(doc);
  const replaced = replaceScriptContent(serialized, contents);
  return replaced;
}
