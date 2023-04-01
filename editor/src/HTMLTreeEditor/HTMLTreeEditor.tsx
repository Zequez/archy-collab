import { useState, useMemo, useEffect } from "react";
import {
  renameNode,
  renderableChildNodes,
  isBlank,
  extractContentInCurlyBraces,
  nodeIsCollapsed,
} from "./helpers";
import { serializeHtml } from "./htmlSerializer";
import HTMLNode from "./HTMLNode";

const RAW_TEXT_CHILD_TAGS = ["script", "style"];

type HTMLTreeEditorProps = {
  value: string;
  onChange: (val: string) => void;
};

let _key = 0;
const addKeyToNode = (node: Element) => {
  (node as any)._key = _key++;
};

function generateDocument(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  function assignKeys(node: Element) {
    addKeyToNode(node);
    if (node.childNodes.length) {
      Array.from(node.childNodes).forEach((child) =>
        assignKeys(child as Element)
      );
    }
  }
  assignKeys(doc.documentElement);
  return doc;
}

const HTMLTreeEditor = ({ value, onChange }: HTMLTreeEditorProps) => {
  const [edits, setEdits] = useState(0);
  const [editingNode, setEditingNode] = useState<Element | null>(null);
  const doc = useMemo(() => generateDocument(value), []);

  useEffect(() => {
    function handleKeyDown(ev: KeyboardEvent) {
      // console.log(ev.key, ev.target);
      if (ev.key === "ArrowDown") {
      } else if (ev.key === "ArrowUp") {
      }
      // if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
      // ev.preventDefault();
      // }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const rootNode = doc.documentElement;

  function refresh() {
    setEdits(edits + 1);
    onChange(serializeHtml(doc));
  }

  function changeNodeName(node: Element, newNodeName: string) {
    const newNode = renameNode(node, newNodeName);
    addKeyToNode(newNode);
    if (editingNode === node) {
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

  function collectNodesWithDepth(
    node: Element,
    depth: number = 0,
    acc: JSX.Element[] = []
  ): JSX.Element[] {
    const children = renderableChildNodes(node, editingNode);
    acc.push(
      <HTMLNode
        key={(node as any)._key}
        node={node}
        editingNode={editingNode}
        onFocus={(node) => setEditingNode(node)}
        onSetTagName={changeNodeName}
        onSetAttribute={changeAttribute}
        onSetStyleDirectives={changeStyleDirectives}
        onSetText={changeText}
        depth={depth}
      />
    );
    if (!nodeIsCollapsed(node)) {
      children.forEach((child) => collectNodesWithDepth(child, depth + 1, acc));
    }
    return acc;
  }

  const nodes = collectNodesWithDepth(rootNode);

  return <div className="bg-yellow-50 p-1 pl-4">{nodes}</div>;
};

export default HTMLTreeEditor;
