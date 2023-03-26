import React from "react";
import StyledButton from "./StyledButton";

type ActionBarProps = {
  onClose: () => void;
  onCommit: () => void;
  onSave: () => void;
  localIsDirty: boolean;
  localIsPreviewed: boolean;
  isCommitting: boolean;
  left: JSX.Element;
};

const ActionBar = ({
  onSave,
  onCommit,
  onClose,
  localIsDirty,
  localIsPreviewed,
  isCommitting,
  left,
}: ActionBarProps) => {
  return (
    <div className="bg-gray-100 border-t-gray-300 flex">
      <div className="flex justify-start flex-grow items-stretch">{left}</div>
      <div className="flex justify-end items-stretch">
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
    </div>
  );
};

export default ActionBar;
