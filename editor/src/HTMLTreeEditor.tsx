import React from "react";

type HTMLTreeEditorProps = {
  value: string;
  onChange: (val: string) => void;
};

const HTMLTreeEditor = ({ value, onChange }: HTMLTreeEditorProps) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, "text/html");
  const rootNode = doc.documentElement;

  const renderNode = (node: Element) => {
    const children = Array.from(node.childNodes).filter(
      (child) => child.nodeType === Node.ELEMENT_NODE
    ) as Element[];

    return (
      <div className="pl-4">
        {node.tagName.toLowerCase()}
        {children.map((child) => renderNode(child))}
      </div>
    );
  };

  return <div>{renderNode(rootNode)}</div>;
};

export default HTMLTreeEditor;
