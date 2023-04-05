import React, { useState, useEffect, useRef, useMemo } from "react";
import cx from "classnames";
import { nodeAttributes } from "./helpers";

type AttrVal = { name: string; value: string };
const Attributes = ({
  node,
  onChangeAttributes,
  disallowedNames,
}: {
  node: Element;
  disallowedNames: string[];
  onChangeAttributes: (attributes: Map<string, string>) => void;
}) => {
  const initialAttributes = useMemo(
    () =>
      nodeAttributes(node).map(({ name, value }) => ({
        name: name.toLowerCase(),
        value,
      })),
    [node]
  );
  const [attributes, setAttributes] = useState<AttrVal[]>(initialAttributes);
  const [errorsState, setErrorsState] = useState<Set<number>>(new Set());
  const [isEditingNew, setIsEditingNew] = useState(false);
  const lastAttributeEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newErrors = new Set<number>();
    const attributesNames = attributes.map(({ name }) => name);
    attributes.forEach(({ name, value }, i) => {
      // Disallow attributes with no name
      if (!name) {
        newErrors.add(i);
        // Disallow attributes with the same name
      } else if (attributesNames.filter((n) => n === name).length > 1) {
        newErrors.add(i);
        // We don't modify these attributes through this component
      } else if (disallowedNames.includes(name)) {
        newErrors.add(i);
      } else if (!/^[a-z\-]+$/i.test(name)) {
        newErrors.add(i);
      }
    });
    setErrorsState(newErrors);
    if (newErrors.size === 0) {
      const attrMap = new Map<string, string>();
      attributes.forEach(({ name, value }) => attrMap.set(name, value));
      onChangeAttributes(attrMap);
    }
  }, [attributes]);

  const handleRename = (index: number, newName: string) => {
    const newAttributes = attributes.concat([]);
    if (newAttributes[index]) {
      newAttributes[index].name = newName;
      setAttributes(newAttributes);
    }
  };

  const handleAddNew = () => {
    const newAttributes = attributes.concat([]);
    newAttributes.push({ name: "", value: "" });
    setAttributes(newAttributes);
    setIsEditingNew(true);
  };

  useEffect(() => {
    if (lastAttributeEl.current && isEditingNew) {
      lastAttributeEl.current.focus();
    }
  }, [isEditingNew]);

  const handleChangeValue = (index: number, newValue: string) => {
    const newAttributes = attributes.concat([]);
    if (newAttributes[index]) {
      newAttributes[index].value = newValue;
      setAttributes(newAttributes);
    }
  };

  function handleBlur() {
    setAttributes(attributes.filter(({ name, value }) => name || value));
    setIsEditingNew(false);
  }

  const lastAttribute = attributes[attributes.length - 1];
  return (
    <div
      className={cx("flex flex-wrap ml-0.5", {
        "contents!": !attributes.length,
      })}
      onBlur={handleBlur}
    >
      {attributes.map(({ name, value }, i) => (
        <Attribute
          name={name}
          value={value}
          onRename={(newName) => handleRename(i, newName)}
          onChangeValue={(newValue) => handleChangeValue(i, newValue)}
          hasError={errorsState.has(i)}
          key={i}
          ref={i === attributes.length - 1 ? lastAttributeEl : null}
        />
      ))}
      {!lastAttribute || lastAttribute.name !== "" ? (
        <AddAttributeButton onClick={handleAddNew} />
      ) : null}
    </div>
  );
};

type AttributeType = {
  hasError: boolean;
  onRename: (newName: string) => void;
  onChangeValue: (newValue: string) => void;
  name: string;
  value: string;
};

const Attribute = React.forwardRef<HTMLDivElement, AttributeType>(
  ({ hasError, onRename, onChangeValue, name, value }, ref) => {
    return (
      <div
        className={cx(
          "text-xs text-center whitespace-nowrap font-mono mx-0.25",
          {
            "outline-solid outline-2 outline-red-500/80 rounded-md": hasError,
          }
        )}
      >
        <ContentEditable
          value={name}
          onChange={(newName) => onRename(newName)}
          className="bg-red-500/25 px-1 rounded-t-md min-w-4"
          ref={ref}
        />
        <ContentEditable
          value={value}
          onChange={(newValue) => onChangeValue(newValue)}
          className="bg-red-500/10 px-1 rounded-b-md min-w-4"
        />
      </div>
    );
  }
);

type ContentEditableProps = {
  value: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  className: string;
};

const ContentEditable = React.forwardRef<HTMLDivElement, ContentEditableProps>(
  ({ value, onChange, ...props }, forwardedRef) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const combinedRef = useCombinedRefs(forwardedRef, elementRef);

    useEffect(() => {
      if (elementRef.current && elementRef.current.innerText !== value) {
        elementRef.current.innerText = value;
      }
    }, [value]);

    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
      if (elementRef.current) {
        onChange((event.target as HTMLDivElement).innerText);
      }
    };

    const handleFocus = () => {
      if (elementRef.current) {
        const range = document.createRange();
        range.selectNodeContents(elementRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    };

    return (
      <div
        {...props}
        contentEditable
        ref={combinedRef}
        onInput={handleInput}
        onFocus={handleFocus}
      />
    );
  }
);

function useCombinedRefs(...refs: any[]) {
  const targetRef = React.useRef(null);

  React.useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef as unknown as React.LegacyRef<HTMLDivElement>;
}

const AddAttributeButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex-vh bg-red-500/50 rounded-md w-4 ml-0.5 h-full pb-1 font-bold text-black/60 text-shadow-light-1 b1 border-red-600/20 hover:bg-red-500/60"
  >
    +
  </button>
);

export default Attributes;
