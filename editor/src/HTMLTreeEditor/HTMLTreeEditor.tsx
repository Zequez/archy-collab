import { useState, useMemo, useEffect } from "react";
import { renameNode, isBlank, extractContentInCurlyBraces } from "./helpers";
import { serializeHtml } from "./htmlSerializer";
import HTMLNode from "./HTMLNode";

const RAW_TEXT_CHILD_TAGS = ["script", "style"];

type HTMLTreeEditorProps = {
  value: string;
  onChange: (val: string) => void;
};

const HTMLTreeEditor = ({ value, onChange }: HTMLTreeEditorProps) => {
  const [edits, setEdits] = useState(0);
  const [editingNode, setEditingNode] = useState<Element | null>(null);
  const doc = useMemo(
    () => new DOMParser().parseFromString(value, "text/html"),
    []
  );

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
    // onChange(serialize());
  }

  function serialize() {
    const serializer = new XMLSerializer();
    const documentString = serializer.serializeToString(doc);
    return documentString;
  }

  function changeNodeName(node: Element, newNodeName: string) {
    const newNode = renameNode(node, newNodeName);
    if (editingNode === node) {
      setEditingNode(newNode);
    }
    refresh();
  }

  function changeText(node: Element, newText: string) {
    // console.log(node, newText, node.parentElement, node.parentElement?.tagName);
    node.textContent = newText;
    // if (
    //   node.parentElement &&
    //   RAW_TEXT_CHILD_TAGS.includes(node.parentElement.tagName.toLowerCase())
    // ) {
    //   node.parentElement.innerHTML = newText;
    // } else {
    //   node.textContent = newText;
    // }
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
        onSetTagName={changeNodeName}
        onSetAttribute={changeAttribute}
        onSetStyleDirectives={changeStyleDirectives}
        onSetText={changeText}
      />
    </div>
  );
};

export default HTMLTreeEditor;
