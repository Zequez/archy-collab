export const RAW_TEXT_CHILD_TAGS = ["script", "style"];

export const renameNode = (node: Element, newNodeName: string): Element => {
  const newNode = node.ownerDocument!.createElement(newNodeName);
  const attributes = node.getAttributeNames();
  for (const attrName of attributes) {
    newNode.setAttribute(attrName, node.getAttribute(attrName)!);
  }
  while (node.firstChild) {
    newNode.appendChild(node.firstChild);
  }
  node.parentNode!.replaceChild(newNode, node);
  return newNode;
};

export function isBlank(text: string | null): boolean {
  return !text || /^\s*$/.test(text);
}

export function extractContentInCurlyBraces(text: string): [string, string] {
  const regex = /{([^}]*)}/;
  const match = regex.exec(text);
  if (!match) {
    return [text, ""];
  }
  const content = match[1];
  const withoutContent = text.replace(match[0], "{}");
  return [withoutContent, content];
}

export const renderableChildNodes = (
  node: Element,
  editingNode: Element | null
) => {
  const childNodes = Array.from(node.childNodes).filter(
    (child) =>
      child.nodeType === Node.ELEMENT_NODE ||
      (child.nodeType === Node.TEXT_NODE &&
        (!isBlank(child.textContent) || child === editingNode))
  );
  return childNodes as Element[];
};

export const nodeIsCollapsed = (node: Element) =>
  node.nodeType === Node.ELEMENT_NODE
    ? node.getAttribute("data-collapsed") !== null
    : false;

export const generateNodeStyleDirective = (node: Element): string => {
  const classes = node.getAttribute("class");
  const styles = node.getAttribute("style");
  if (classes) {
    if (styles && classes.match("{}")) {
      return classes.replace("{}", `{${styles}}`);
    } else {
      return classes;
    }
  } else if (styles) {
    return `{${styles}}`;
  } else {
    return "";
  }
};

export const getUnescapedText = (node: Element) => {
  const useRaw =
    node.parentElement &&
    RAW_TEXT_CHILD_TAGS.includes(node.parentElement.nodeName.toLowerCase());
  const text = useRaw ? node.parentElement.innerHTML : node.textContent || "";
  return text;
};

export const ATTRIBUTES_NOT_TO_RENDER = ["class", "style", "data-collapsed"];

export const nodeAttributes = (node: Element) =>
  Array.from(node.attributes).filter(
    ({ name }) => !ATTRIBUTES_NOT_TO_RENDER.includes(name)
  );
