import { useEffect } from "react";

const useUnsavedChangesWarning = (shouldWarn: boolean) => {
  console.log("shouldWarn", shouldWarn);
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shouldWarn) {
        event.preventDefault();
        // Some browsers require this to show the prompt
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldWarn]);
};

export default useUnsavedChangesWarning;
