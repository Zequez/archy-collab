import React from "react";
import StyledButton from "./StyledButton";

type ActionBarProps = {
  onClose: () => void;
  onCommit: () => void;
  onSave: () => void;
  localIsDirty: boolean;
  localIsPreviewed: boolean;
  isCommitting: boolean;
};

const ActionBar = ({
  onSave,
  onCommit,
  onClose,
  localIsDirty,
  localIsPreviewed,
  isCommitting,
}: ActionBarProps) => {
  return (
    <div
      style={{
        background: "hsl(0,0%,95%)",
        borderTop: "solid 1px hsl(0,0%,80%)",
        textAlign: "right",
      }}
    >
      <StyledButton
        hue={50}
        enabled={localIsPreviewed}
        onActivate={() => onSave()}
      >
        Cmd+S = Preview
      </StyledButton>
      <StyledButton
        hue={122}
        enabled={localIsDirty && !isCommitting}
        onActivate={() => onCommit()}
      >
        Commit
      </StyledButton>
      <StyledButton
        hue={0}
        sat={20}
        onActivate={() => onClose()}
        enabled={true}
      >
        Close
      </StyledButton>
    </div>
  );
};

export default ActionBar;
