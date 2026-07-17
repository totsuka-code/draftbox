import { useCallback, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState("");

  const showToast = useCallback((message) => {
    setToast(message);
    const id = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(id);
  }, []);

  return { toast, showToast };
}
