import React from "react";
import { parse } from "node-html-parser";

type HTMLTreeEditorProps = {
  value: string;
  onChange: (val: string) => void;
};

const HTMLTreeEditor = ({ value, onChange }: HTMLTreeEditorProps) => {
  console.log(parse(value));
  return <div>{value}</div>;
};

export default HTMLTreeEditor;
