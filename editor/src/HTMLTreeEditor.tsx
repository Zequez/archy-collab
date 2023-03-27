import { useState, useMemo } from "react";
import TextareaAutosize from "react-textarea-autosize";

type HTMLTreeEditorProps = {
  value: string;
  onChange: (val: string) => void;
};

function renameNode(node: Element, newNodeName: string): Element {
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
}

function isBlank(text: string | null): boolean {
  return !text || /^\s*$/.test(text);
}

const HTMLTreeEditor = ({ value, onChange }: HTMLTreeEditorProps) => {
  const [edits, setEdits] = useState(0);
  const [editingNode, setEditingNode] = useState<Element | null>(null);
  const doc = useMemo(
    () => new DOMParser().parseFromString(value, "text/html"),
    [value]
  );

  const rootNode = doc.documentElement;

  function serialize() {
    const serializer = new XMLSerializer();
    const documentString = serializer.serializeToString(doc);
    console.log(documentString);
  }

  function renameNodeAndRefresh(node: Element, newNodeName: string) {
    renameNode(node, newNodeName);
    setEdits(edits + 1);
    serialize();
  }

  function changeTextAndRefresh(node: Element, newText: string) {
    node.textContent = newText;
    setEdits(edits + 1);
    serialize();
  }

  const renderNode = (node: Element) => {
    const children = Array.from(node.childNodes).filter(
      (child) =>
        child.nodeType === Node.ELEMENT_NODE ||
        (child.nodeType === Node.TEXT_NODE &&
          (!isBlank(child.textContent) || child === editingNode))
    ) as Element[];

    return (
      <div className="pl-4">
        <div className="flex">
          {node.nodeType === Node.ELEMENT_NODE ? (
            <input
              type="text"
              className="font-mono font-bold flex-grow"
              value={node.tagName.toLowerCase()}
              onChange={(ev) => renameNodeAndRefresh(node, ev.target.value)}
            />
          ) : node.nodeType === Node.TEXT_NODE ? (
            <TextareaAutosize
              minRows={1}
              className="text-gray-600 flex-grow resize-none"
              value={node.textContent || ""}
              onChange={(ev) => changeTextAndRefresh(node, ev.target.value)}
            />
          ) : null}
        </div>
        {children.map((child) => renderNode(child))}
      </div>
    );
  };

  return <div>{renderNode(rootNode)}</div>;
};

export default HTMLTreeEditor;
