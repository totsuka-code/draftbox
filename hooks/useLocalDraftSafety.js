import { useCallback, useEffect, useMemo, useState } from "react";

const AUTOSAVE_KEY = "draftbox.localAutosave";
const SNAPSHOTS_KEY = "draftbox.snapshots";
const MAX_SNAPSHOTS = 8;

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function summarize(content) {
  const text = (content || "").replace(/\s+/g, " ").trim();
  return text.length > 90 ? `${text.slice(0, 90)}...` : text;
}

export function useLocalDraftSafety({ title, content, onRestore, showToast, t }) {
  const [autosave, setAutosave] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    setAutosave(safeParse(localStorage.getItem(AUTOSAVE_KEY), null));
    setSnapshots(safeParse(localStorage.getItem(SNAPSHOTS_KEY), []));
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const payload = {
        title: title || t("title"),
        content: content || "",
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
      setAutosave(payload);
    }, 650);
    return () => window.clearTimeout(id);
  }, [title, content, t]);

  const restore = useCallback((draft) => {
    if (!draft) return;
    onRestore({ title: draft.title || t("title"), content: draft.content || "" });
    showToast(t("workbench.safety.restored"));
  }, [onRestore, showToast, t]);

  const createSnapshot = useCallback(() => {
    const snapshot = {
      id: `${Date.now()}`,
      title: title || t("title"),
      content: content || "",
      preview: summarize(content),
      createdAt: new Date().toISOString(),
    };
    const next = [snapshot, ...snapshots].slice(0, MAX_SNAPSHOTS);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(next));
    setSnapshots(next);
    showToast(t("workbench.safety.snapshotSaved"));
  }, [content, showToast, snapshots, t, title]);

  const deleteSnapshot = useCallback((id) => {
    const next = snapshots.filter((snapshot) => snapshot.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(next));
    setSnapshots(next);
  }, [snapshots]);

  const canRestoreAutosave = useMemo(() => {
    if (!autosave) return false;
    return autosave.title !== title || autosave.content !== content;
  }, [autosave, title, content]);

  return {
    autosave,
    snapshots,
    canRestoreAutosave,
    restoreAutosave: () => restore(autosave),
    restoreSnapshot: restore,
    createSnapshot,
    deleteSnapshot,
  };
}
