import React, { useState, useEffect, useRef } from "react";
import cx from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import { CaretUp } from "../lib/icons";
import {
  renderableChildNodes,
  nodeIsCollapsed,
  generateNodeStyleDirective,
  nodeAttributes,
} from "./helpers";

const STYLELESS_NODES = ["meta", "title", "script", "link", "head"];

type HTMLNodeProps = {
  node: Element;
  editingNode: Element | null;
  onFocus: (node: Element) => void;
  onRenameAttribute: (node: Element, name: string, newName: string) => void;
  onSetAttribute: (node: Element, attr: string, val: string | boolean) => void;
  onSetTagName: (node: Element, newName: string) => void;
  onSetStyleDirectives: (node: Element, styleDirective: string) => void;
  onSetText: (node: Element, text: string) => void;
  depth: number;
};

const HTMLNode = ({
  node,
  editingNode,
  onFocus,
  onRenameAttribute,
  onSetAttribute,
  onSetTagName,
  onSetStyleDirectives,
  onSetText,
  depth,
}: HTMLNodeProps) => {
  const children = renderableChildNodes(node, editingNode);
  const isEditing = node === editingNode;

  const [editingAttribute, setEditingAttribute] = useState<
    null | [string, string]
  >(null);
  // const [newAttrName, setNewAttrName] = useState<null | string>(null);
  // const [newAttrValue, setNewAttrValue] = useState<null | string>(null);

  const addNewAttribute = (node: Element) => {
    // setNewAttrName("");
    // setNewAttrValue("");
    setEditingAttribute(["", ""]);
    console.log("NEW ATTRIBUTE!", node);
  };

  const onToggle = (node: Element, collapsed: boolean) => {
    onSetAttribute(node, "data-collapsed", collapsed);
  };

  return (
    <div
      className="relative border-0 border-l border-l-yellow-400/10 border-solid hover:bg-yellow-400/10"
      style={{ paddingLeft: `${depth + 1}rem` }}
    >
      {isEditing ? (
        <div className="rounded-md bg-yellow-400/10 absolute inset-0 pointer-events-none"></div>
      ) : null}
      <div
        className="flex group"
        // tabIndex={0}
        onFocus={() => onFocus(node)}
      >
        {node.nodeType === Node.ELEMENT_NODE ? (
          <div className="flex-v flex-grow my-0.25">
            <Toggle
              node={node}
              childNodes={children}
              onToggle={(collapsed) => onToggle(node, collapsed)}
            />
            <ElementName node={node} onChange={(v) => onSetTagName(node, v)} />
            <div
              className={cx("flex-grow flex flex-col", {
                "contents!": !nodeAttributes(node).length,
              })}
            >
              <Attributes
                node={node}
                onAdd={() => addNewAttribute(node)}
                onRename={(oldName, newName) =>
                  onRenameAttribute(node, oldName, newName)
                }
                onChange={(name, value) => onSetAttribute(node, name, value)}
              />
              <StyleDirectives node={node} onChange={onSetStyleDirectives} />
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
    </div>
  );
};

const ElementName = ({
  node,
  onChange,
}: {
  node: Element;
  onChange: (val: string) => void;
}) => {
  return (
    <input
      className="block h-full w-20 flex-shrink flex items-center font-mono font-bold px-2 py-1 bg-white/50 border border-solid border-black/10 rounded-md focus:outline outline-solid-green-500 shadow-sm"
      // contentEditable={true}
      // suppressContentEditableWarning={true}
      value={node.tagName.toLowerCase()}
      onChange={(ev) => onChange(ev.target.value)}
      // onInput={(ev) =>
      //   renameNodeAndRefresh(node, ev.currentTarget.innerText)
      // }
    />
  );
};

const Toggle = ({
  node,
  childNodes,
  onToggle,
}: {
  node: Element;
  childNodes: Element[];
  onToggle: (collapsed: boolean) => void;
}) => {
  const isCollapsed = nodeIsCollapsed(node);
  return childNodes.length ? (
    <button
      className={cx(
        "flex-vh b1 w-4 h-4 px-0.5 -ml-4 border-yellow/10 rounded-sm mr-0.25 text-white cursor-pointer",
        { "bg-yellow-700/50": !isCollapsed, "bg-black": isCollapsed }
      )}
      onClick={() => onToggle(!isCollapsed)}
    >
      {isCollapsed ? childNodes.length : <CaretUp />}
    </button>
  ) : null;
};

const StyleDirectives = ({
  node,
  onChange,
}: {
  node: Element;
  onChange: (node: Element, val: string) => void;
}) => {
  const noStyles = STYLELESS_NODES.includes(node.tagName.toLowerCase());
  return !noStyles ? (
    <TextareaAutosize
      className="bg-cyan-400/25 min-h-full resize-none rounded-md b1 border-black/10 ml-0.5 px-2 py-2 m-0 flex-grow first:mt-0 mt-0.5 text-xs font-mono"
      style={{ lineHeight: "14px" }}
      placeholder="Style directives"
      minRows={1}
      value={generateNodeStyleDirective(node)}
      onChange={(ev) => onChange(node, ev.target.value)}
    />
  ) : null;
};

const Attributes = ({
  node,
  onAdd,
  onRename,
  onChange,
}: {
  node: Element;
  onAdd: () => void;
  onRename: (oldName: string, newName: string) => void;
  onChange: (attr: string, value: string) => void;
}) => {
  const [errorStatus, setErrorStatus] = useState<Map<Element, string>>(
    new Map<Element, string>()
  );
  const attributes = nodeAttributes(node);

  const safeRename = (node: Element, name: string, newName: string) => {
    console.log("Renaming safely", node, `${name} => ${newName}`);
    if (name === newName) {
      errorStatus.delete(node);
    } else if (newName && node.getAttribute(newName) === null) {
      errorStatus.delete(node);
      onRename(name, newName);
    } else {
      console.log("ERROR");
      errorStatus.set(node, name);
    }
    setErrorStatus(new Map(errorStatus));
  };

  let lastAttrIndex = 0;
  return (
    <div
      className={cx("flex flex-wrap ml-0.5", {
        "contents!": !attributes.length,
      })}
    >
      {attributes.map(({ name, value }, i) => {
        const errorAttr = errorStatus.get(node);
        lastAttrIndex = i;
        return (
          <div
            className={cx(
              "text-xs text-center whitespace-nowrap font-mono mx-0.25",
              {
                "outline-solid outline-2 outline-red-500/80 rounded-md":
                  errorAttr === name,
              }
            )}
            key={i}
          >
            <ContentEditable
              value={name}
              onChange={(newName) => safeRename(node, name, newName)}
              className="bg-red-500/25 px-1 rounded-t-md"
            />
            <ContentEditable
              value={value}
              onChange={(newValue) => onChange(name, newValue)}
              className="bg-red-500/10 px-1 rounded-b-md"
            />
          </div>
        );
      })}
      <AddAttributeButton onClick={onAdd} />
    </div>
  );
};

type ContentEditableProps = {
  value: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  className: string;
};

const ContentEditable = ({
  value,
  onChange,
  ...props
}: ContentEditableProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.innerText = value;
    }
  }, []);

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    if (elementRef.current) {
      onChange((event.target as HTMLDivElement).innerText);
    }
  };

  return (
    <div {...props} contentEditable ref={elementRef} onInput={handleInput} />
  );
};

const AddAttributeButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex-vh bg-red-500/50 rounded-md w-4 ml-0.5 h-full pb-1 font-bold text-black/60 text-shadow-light-1 b1 border-red-600/20 hover:bg-red-500/60"
  >
    +
  </button>
);

export default HTMLNode;
