import React from "react";

type CommitButtonProps = {
  onActivate: React.MouseEventHandler<HTMLButtonElement>;
  enabled: boolean;
  style?: React.CSSProperties;
};

const CommitButton: React.FC<CommitButtonProps> = ({
  onActivate,
  enabled,
  style,
}) => (
  <button
    style={{
      backgroundColor: enabled ? "#4CAF50" : "#808080",
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
    Commit
  </button>
);

export default CommitButton;
