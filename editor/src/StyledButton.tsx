import React from "react";
import { hsla } from "./lib/utils";

type CommitButtonProps = {
  onActivate: React.MouseEventHandler<HTMLButtonElement>;
  enabled?: boolean;
  style?: React.CSSProperties;
  hue: number;
  sat?: number;
  children: any;
};

const CommitButton: React.FC<CommitButtonProps> = ({
  onActivate,
  enabled,
  style,
  hue,
  sat,
  children,
}) => (
  <button
    style={{
      backgroundColor: enabled
        ? hsla(hue, sat || 39, 45, 1)
        : hsla(hue, sat || 0, 45, 1),
      border: "none",
      color: "white",
      padding: "15px 32px",
      textAlign: "center",
      textDecoration: "none",
      display: "inline-block",
      fontSize: "16px",
      cursor: enabled ? "pointer" : "default",
      borderRadius: "5px",
      boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.3)",
      fontWeight: "bold",
      opacity: enabled ? 1 : 0.6,
      ...style,
    }}
    onClick={onActivate}
    disabled={!enabled}
  >
    {children}
  </button>
);

export default CommitButton;
