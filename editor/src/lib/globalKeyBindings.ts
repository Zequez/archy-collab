import { useEffect } from "react";

export function useCtrlS(handleSave: () => void) {
  useEffect(() => {
    function handleKeyDown(ev: KeyboardEvent) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
        ev.preventDefault();
        handleSave();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave]);
}
