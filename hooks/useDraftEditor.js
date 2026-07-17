import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LIMITS, byteLength, validateDraft } from "@/lib/policy";
import { countGraphemes, getTextStats, stripMarkdown } from "@/lib/textMetrics";
import { debounce } from "@/lib/debounce";
import {
  createDraft as createDraftRecord,
  deleteDraft,
  listDrafts,
  updateDraft,
} from "@/lib/draftRepository";

export function useDraftEditor({ user, t, showToast }) {
  const [drafts, setDrafts] = useState([]);
  const [draftsCount, setDraftsCount] = useState(0);
  const [currentId, setCurrentId] = useState(null);
  const [title, setTitle] = useState(t("title"));
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle");

  const debouncedSaveRef = useRef((id, patch) => {});
  const lastSaveIdRef = useRef(0);

  const plain = useMemo(() => stripMarkdown(content), [content]);
  const charCount = useMemo(() => countGraphemes(plain), [plain]);
  const stats = useMemo(() => getTextStats(plain), [plain]);

  const selectDraft = useCallback((draft) => {
    setCurrentId(draft.id);
    setTitle(draft.title || t("title"));
    setContent(draft.content || "");
  }, [t]);

  const resetDrafts = useCallback(() => {
    setDrafts([]);
    setDraftsCount(0);
    setCurrentId(null);
    setTitle(t("title"));
    setContent("");
    setStatus("idle");
  }, [t]);

  const loadDrafts = useCallback(async () => {
    if (!user) return;
    const { data, count, error } = await listDrafts();
    if (error) return showToast(`下書きの読み込みに失敗しました: ${error.message}`);
    setDrafts(data || []);
    setDraftsCount(typeof count === "number" ? count : data?.length || 0);
    if (data?.length) selectDraft(data[0]);
    else resetDrafts();
  }, [user, showToast, selectDraft, resetDrafts]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  useEffect(() => {
    const doSave = async (id, patch) => {
      if (!user || !id) return;
      setStatus("saving");
      const thisSaveId = ++lastSaveIdRef.current;
      const { error } = await updateDraft(id, patch);
      if (thisSaveId !== lastSaveIdRef.current) return;
      if (error) {
        setStatus("error");
        showToast(`保存に失敗しました: ${error.message}`);
      } else {
        setStatus("saved");
        window.setTimeout(() => setStatus("idle"), 1200);
      }
    };
    const debounced = debounce(doSave, 700);
    debouncedSaveRef.current = debounced;
    return () => debounced.cancel();
  }, [user, showToast]);

  const ensureDraftAndMaybeSave = useCallback(async (patch = {}) => {
    if (!user) return null;
    if (currentId) {
      const id = currentId;
      setDrafts((prev) => prev.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)));
      debouncedSaveRef.current(id, patch);
      return id;
    }

    setStatus("saving");
    const initialTitle = patch.title ?? title ?? t("title");
    const initialContent = patch.content ?? content ?? "";
    const err = validateDraft({ title: initialTitle, content: initialContent, count: draftsCount });
    if (err) {
      setStatus("error");
      showToast(err);
      return null;
    }

    const { data, error } = await createDraftRecord({
      userId: user.id,
      title: initialTitle,
      content: initialContent,
    });
    if (error) {
      setStatus("error");
      showToast(`下書きの作成に失敗しました: ${error.message}`);
      return null;
    }

    setDrafts((prev) => [data, ...prev]);
    setDraftsCount((count) => count + 1);
    selectDraft(data);
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1200);
    return data.id;
  }, [user, currentId, title, content, draftsCount, t, showToast, selectDraft]);

  const handleTitle = useCallback((value) => {
    if (value.length > LIMITS.MAX_TITLE_CHARS) {
      setTitle(value.slice(0, LIMITS.MAX_TITLE_CHARS));
      setStatus("error");
      return showToast(`タイトルは${LIMITS.MAX_TITLE_CHARS}文字以内でご入力ください。`);
    }
    setTitle(value);
    if (!user) return;
    if (!currentId) ensureDraftAndMaybeSave({ title: value });
    else {
      setDrafts((prev) => prev.map((draft) => (draft.id === currentId ? { ...draft, title: value } : draft)));
      debouncedSaveRef.current(currentId, { title: value });
    }
  }, [user, currentId, ensureDraftAndMaybeSave, showToast]);

  const handleContent = useCallback((value) => {
    if (byteLength(value) > LIMITS.MAX_CONTENT_BYTES) {
      setStatus("error");
      return showToast(`本文が上限（${LIMITS.MAX_CONTENT_BYTES}B）を超えました。`);
    }
    setContent(value);
    if (!user) return;
    if (!currentId) ensureDraftAndMaybeSave({ content: value });
    else {
      setDrafts((prev) => prev.map((draft) => (draft.id === currentId ? { ...draft, content: value } : draft)));
      debouncedSaveRef.current(currentId, { content: value });
    }
  }, [user, currentId, ensureDraftAndMaybeSave, showToast]);

  const saveNow = useCallback(async () => {
    if (!user) return showToast("保存するにはサインインが必要です。");
    const err = validateDraft({ title, content, count: draftsCount });
    if (err) {
      setStatus("error");
      return showToast(err);
    }
    setStatus("saving");
    let id = currentId;
    if (!id) {
      id = await ensureDraftAndMaybeSave({});
      if (!id) return;
    }
    const { error } = await updateDraft(id, { title, content });
    if (error) {
      setStatus("error");
      showToast(`保存に失敗しました: ${error.message}`);
    } else {
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 1200);
    }
  }, [user, currentId, title, content, draftsCount, ensureDraftAndMaybeSave, showToast]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveNow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveNow]);

  const createDraft = useCallback(async () => {
    if (!user) return showToast("保存にはサインインが必要です。");
    const err = validateDraft({ title, content, count: draftsCount });
    if (err) return showToast(err);
    const { data, error } = await createDraftRecord({
      userId: user.id,
      title: t("title"),
      content: "",
    });
    if (error) return showToast(`下書きの作成に失敗しました: ${error.message}`);
    setDrafts((prev) => [data, ...prev]);
    setDraftsCount((count) => count + 1);
    selectDraft(data);
    showToast("新しい下書きを作成しました。");
  }, [user, title, content, draftsCount, t, showToast, selectDraft]);

  const deleteCurrentDraft = useCallback(async () => {
    if (!user || !currentId) return;
    if (!confirm(t("actions.confirmDelete"))) return;
    const { error } = await deleteDraft(currentId);
    if (error) return showToast(`削除に失敗しました: ${error.message}`);
    const next = drafts.find((draft) => draft.id !== currentId);
    setDrafts((prev) => prev.filter((draft) => draft.id !== currentId));
    setDraftsCount((count) => Math.max(0, count - 1));
    if (next) selectDraft(next);
    else {
      setCurrentId(null);
      setTitle(t("title"));
      setContent("");
    }
    showToast("削除しました。");
  }, [user, currentId, drafts, t, showToast, selectDraft]);

  return {
    drafts,
    draftsCount,
    currentId,
    title,
    content,
    status,
    charCount,
    stats,
    resetDrafts,
    selectDraft,
    createDraft,
    deleteCurrentDraft,
    handleTitle,
    handleContent,
    saveNow,
  };
}
