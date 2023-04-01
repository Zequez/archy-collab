import { useState, useMemo } from "react";
import TextareaAutosize from "react-textarea-autosize";
import cx from "classnames";
import { CaretUp } from "./lib/icons";

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

type HTMLNodeProps = {
  node: Element;
  editingNode: Element | null;
  onFocus: (node: Element) => void;
  onSetAttribute: (node: Element, attr: string, val: string | boolean) => void;
  onSetTagName: (node: Element, newName: string) => void;
  onSetStyleDirectives: (node: Element, styleDirective: string) => void;
  onSetText: (node: Element, text: string) => void;
};

const HTMLNode = ({
  node,
  editingNode,
  onFocus,
  onSetAttribute,
  onSetTagName,
  onSetStyleDirectives,
  onSetText,
}: HTMLNodeProps) => {
  const children = renderableChildNodes(node, editingNode);
  const isEditing = node === editingNode;

  const renderToggle = (node: Element, children: Element[]) => {
    const isCollapsed = nodeIsCollapsed(node);
    return children.length ? (
      <button
        className={cx(
          "*flex-vh *b1 w-4 h-4 px-0.5 -ml-4 border-yellow/10 rounded-sm mr-0.25 text-white cursor-pointer",
          { "bg-yellow-700/50": !isCollapsed, "bg-black": isCollapsed }
        )}
        onClick={() => onSetAttribute(node, "data-collapsed", !isCollapsed)}
      >
        {isCollapsed ? children.length : <CaretUp />}
      </button>
    ) : null;
  };

  const renderStyleDirective = (node: Element) => {
    const noClass = STYLELESS_NODES.includes(node.tagName.toLowerCase());
    return !noClass ? (
      <TextareaAutosize
        className="bg-cyan-400/25 min-h-full resize-none rounded-md *b1 border-black/10 ml-0.5 px-2 py-2 m-0 flex-grow first:mt-0 mt-0.5 text-xs"
        style={{ lineHeight: "14px" }}
        placeholder="Style directives"
        minRows={1}
        value={generateNodeStyleDirective(node)}
        onChange={(ev) => onSetStyleDirectives(node, ev.target.value)}
      />
    ) : null;
  };

  const renderAttributes = (node: Element) => {
    const attributes = Array.from(node.attributes).filter(
      ({ name }) => !ATTRIBUTES_NOT_TO_RENDER.includes(name)
    );
    return attributes.length > 0 ? (
      <div className="flex flex-wrap ml-0.5">
        {attributes.map(({ name, value }) => (
          <div
            className="text-xs text-center whitespace-nowrap font-mono mx-0.25"
            key={name}
          >
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
    ) : null;
  };

  return (
    <div className="pl-4 border-l border-l-yellow-400/10 border-solid">
      <div
        className="flex relative group"
        // tabIndex={0}
        onFocus={() => onFocus(node)}
      >
        {isEditing ? (
          <div className="rounded-md bg-yellow-400/10 absolute inset-0 pointer-events-none"></div>
        ) : null}
        {node.nodeType === Node.ELEMENT_NODE ? (
          <div className="*flex-v flex-grow my-0.25">
            {renderToggle(node, children)}
            <input
              className="block h-full w-20 flex-shrink flex items-center font-mono font-bold px-2 py-1 bg-white/50 border border-solid border-black/10 rounded-md focus:outline outline-solid-green-500 shadow-sm"
              // contentEditable={true}
              // suppressContentEditableWarning={true}
              value={node.tagName.toLowerCase()}
              onChange={(ev) => onSetTagName(node, ev.target.value)}
              // onInput={(ev) =>
              //   renameNodeAndRefresh(node, ev.currentTarget.innerText)
              // }
            />
            <div className="flex-grow flex flex-col">
              {renderAttributes(node)}
              {renderStyleDirective(node)}
            </div>
          </div>
        ) : node.nodeType === Node.TEXT_NODE ? (
          <TextareaAutosize
            minRows={1}
            className="text-gray-600 font-sans bg-white px-2 py-1 flex-grow resize-none border border-solid border-black/10 focus:outline outline-solid-green-500 rounded-sm"
            value={node.textContent || ""}
            onChange={(ev) => onSetText(node, ev.target.value)}
          />
        ) : null}
      </div>

      {nodeIsCollapsed(node)
        ? null
        : children.map((child, i) => (
            <HTMLNode
              key={i}
              node={child}
              editingNode={editingNode}
              onFocus={onFocus}
              onSetTagName={onSetTagName}
              onSetAttribute={onSetAttribute}
              onSetStyleDirectives={onSetStyleDirectives}
              onSetText={onSetText}
            />
          ))}
    </div>
  );
};

export default HTMLTreeEditor;
