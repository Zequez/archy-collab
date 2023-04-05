import React, { useState, useEffect, useRef, useMemo } from "react";
import cx from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import { CaretUp } from "../lib/icons";
import {
  renderableChildNodes,
  nodeIsCollapsed,
  generateNodeStyleDirective,
  nodeAttributes,
  ATTRIBUTES_NOT_TO_RENDER,
} from "./helpers";
import Attributes from "./Attributes";

const STYLELESS_NODES = ["meta", "title", "script", "link", "head"];

type HTMLNodeProps = {
  node: Element;
  editingNode: Element | null;
  onFocus: (node: Element) => void;
  onRenameAttribute: (node: Element, name: string, newName: string) => void;
  onSetAttributes: (node: Element, attributes: Map<string, string>) => void;
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
  onSetAttributes,
  onRenameAttribute,
  onSetAttribute,
  onSetTagName,
  onSetStyleDirectives,
  onSetText,
  depth,
}: HTMLNodeProps) => {
  const children = renderableChildNodes(node, editingNode);
  const isEditing = node === editingNode;

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
                onChangeAttributes={(newAttributesList) =>
                  onSetAttributes(node, newAttributesList)
                }
                disallowedNames={ATTRIBUTES_NOT_TO_RENDER}
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

export default HTMLNode;
