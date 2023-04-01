import { useState, useMemo } from "react";
import HTMLNode from "./HTMLNode";

type HTMLTreeEditorProps = {
  value: string;
  onChange: (val: string) => void;
};

const N = {
  renameNode: (node: Element, newNodeName: string): Element => {
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
  },
};

function isBlank(text: string | null): boolean {
  return !text || /^\s*$/.test(text);
}

function extractContentInCurlyBraces(text: string): [string, string] {
  const regex = /{([^}]*)}/;
  const match = regex.exec(text);
  if (!match) {
    return [text, ""];
  }
  const content = match[1];
  const withoutContent = text.replace(match[0], "{}");
  return [withoutContent, content];
}

const HTMLTreeEditor = ({ value, onChange }: HTMLTreeEditorProps) => {
  const [edits, setEdits] = useState(0);
  const [editingNode, setEditingNode] = useState<Element | null>(null);
  const doc = useMemo(
    () => new DOMParser().parseFromString(value, "text/html"),
    [value]
  );

  const rootNode = doc.documentElement;

  function refresh() {
    setEdits(edits + 1);
    onChange(serialize());
  }

  function serialize() {
    const serializer = new XMLSerializer();
    const documentString = serializer.serializeToString(doc);
    return documentString;
  }

  function renameNode(node: Element, newNodeName: string) {
    const newNode = N.renameNode(node, newNodeName);
    console.log("Renaming node!");
    if (editingNode === node) {
      console.log("Editing node is the one being renamed");
      setEditingNode(newNode);
    }
    refresh();
  }

  function changeText(node: Element, newText: string) {
    node.textContent = newText;
    refresh();
  }

  function changeAttribute(
    node: Element,
    attrName: string,
    newVal: string | boolean
  ) {
    if (newVal === false) {
      node.removeAttribute(attrName);
    } else if (newVal === true) {
      node.setAttribute(attrName, "");
    } else {
      node.setAttribute(attrName, newVal);
    }
    refresh();
  }

  function changeStyleDirectives(node: Element, styleDirective: string) {
    const [classes, styles] = extractContentInCurlyBraces(styleDirective);
    if (classes) {
      node.setAttribute("class", classes);
    } else {
      node.removeAttribute("class");
    }
    if (styles) {
      node.setAttribute("style", styles);
    } else {
      node.removeAttribute("style");
    }
    refresh();
  }

  return (
    <div className="bg-yellow-50 p-1">
      <HTMLNode
        node={rootNode}
        editingNode={editingNode}
        onFocus={(node) => setEditingNode(node)}
        onSetTagName={renameNode}
        onSetAttribute={changeAttribute}
        onSetStyleDirectives={changeStyleDirectives}
        onSetText={changeText}
      />
    </div>
  );
};

const renderableChildNodes = (node: Element, editingNode: Element | null) => {
  const childNodes = Array.from(node.childNodes).filter(
    (child) =>
      child.nodeType === Node.ELEMENT_NODE ||
      (child.nodeType === Node.TEXT_NODE &&
        (!isBlank(child.textContent) || child === editingNode))
  );
  return childNodes as Element[];
};

const nodeIsCollapsed = (node: Element) =>
  node.nodeType === Node.ELEMENT_NODE
    ? node.getAttribute("data-collapsed") !== null
    : false;

const generateNodeStyleDirective = (node: Element): string => {
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

const STYLELESS_NODES = ["meta", "title", "script", "link", "head"];
const ATTRIBUTES_NOT_TO_RENDER = ["class", "style", "data-collapsed"];

export default HTMLTreeEditor;
