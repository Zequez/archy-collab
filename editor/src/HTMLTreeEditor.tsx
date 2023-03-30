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

  function changeAttributeAndRefresh(
    node: Element,
    attrName: string,
    newVal: string
  ) {
    node.setAttribute(attrName, newVal);
    setEdits(edits + 1);
    serialize();
  }

  const renderAttributes = (node: Element) => {
    const attributes = Array.from(node.attributes).filter(
      ({ name }) => name !== "class"
    );
    return (
      <div>
        {attributes.map(({ name, value }) => (
          <div className="text-xs text-center whitespace-nowrap font-mono">
            <div
              contentEditable="true"
              suppressContentEditableWarning={true}
              className="bg-red-500/25 px-1 rounded-t-md"
            >
              {name}
            </div>
            <div
              contentEditable={true}
              suppressContentEditableWarning={true}
              className="bg-red-500/10 px-1 rounded-b-md"
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    );
    // for (let i = 0; i < attributes.length; ++i) {
    //   const { name, value } = attributes.item(i) as Attr ;
    //   if (name !== 'class') {

    //   }
    // }
  };

  const STYLELESS_NODES = ["meta", "title", "script", "link", "head"];

  const renderClass = (node: Element) => {
    const noClass = STYLELESS_NODES.includes(node.tagName.toLowerCase());
    return !noClass ? (
      <TextareaAutosize
        className="bg-cyan-400/25 min-h-full resize-none rounded-md border border-solid border-black/10 ml-0.5 px-2 py-1 m-0 flex-grow"
        style={{ lineHeight: "26px" }}
        placeholder="Style directives"
        minRows={1}
        value={node.getAttribute("class") || ""}
        onChange={(ev) =>
          changeAttributeAndRefresh(node, "class", ev.target.value)
        }
      />
    ) : null;
  };

  const renderNode = (node: Element) => {
    const children = Array.from(node.childNodes).filter(
      (child) =>
        child.nodeType === Node.ELEMENT_NODE ||
        (child.nodeType === Node.TEXT_NODE &&
          (!isBlank(child.textContent) || child === editingNode))
    ) as Element[];

    return (
      <div className="pl-4 border-l border-l-yellow-400/10 border-solid">
        <div className="flex">
          {node.nodeType === Node.ELEMENT_NODE ? (
            <div className="flex flex-grow my-0.25">
              <input
                className="block w-20 flex-shrink flex items-center font-mono font-bold px-2 py-1 bg-white/50 border border-solid border-black/10 rounded-md focus:outline outline-solid-green-500 shadow-sm"
                // contentEditable={true}
                // suppressContentEditableWarning={true}
                value={node.tagName.toLowerCase()}
                onChange={(ev) => renameNodeAndRefresh(node, ev.target.value)}
                // onInput={(ev) =>
                //   renameNodeAndRefresh(node, ev.currentTarget.innerText)
                // }
              />
              {renderAttributes(node)}
              {renderClass(node)}
            </div>
          ) : node.nodeType === Node.TEXT_NODE ? (
            <TextareaAutosize
              minRows={1}
              className="text-gray-600 font-sans bg-white px-2 py-1 flex-grow resize-none border border-solid border-black/10 focus:outline outline-solid-green-500 rounded-sm"
              value={node.textContent || ""}
              onChange={(ev) => changeTextAndRefresh(node, ev.target.value)}
            />
          ) : null}
        </div>
        {children.map((child) => renderNode(child))}
      </div>
    );
  };

  return <div className="bg-yellow-50 p-1">{renderNode(rootNode)}</div>;
};

export default HTMLTreeEditor;
