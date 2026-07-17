import { useCallback, useEffect, useState } from "react";
import { computeExpiresISO, toDatetimeLocalString } from "@/lib/time";
import {
  deleteDraftShare,
  getDraftShare,
  saveDraftShare,
  updateDraftShareExpiry,
} from "@/lib/shareRepository";

export function useDraftShare({ user, currentId, showToast }) {
  const [shareToken, setShareToken] = useState(null);
  const [shareExpiresAt, setShareExpiresAt] = useState(null);
  const [expiryMode, setExpiryMode] = useState("none");
  const [expiryCustom, setExpiryCustom] = useState("");

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");

  const resetShare = useCallback(() => {
    setShareToken(null);
    setShareExpiresAt(null);
    setExpiryMode("none");
    setExpiryCustom("");
  }, []);

  const fetchShare = useCallback(async (draftId) => {
    if (!user || !draftId) {
      resetShare();
      return;
    }
    setShareToken(null);
    setShareExpiresAt(null);
    const { data, error } = await getDraftShare(draftId);
    if (error) {
      resetShare();
      return;
    }
    setShareToken(data?.token || null);
    setShareExpiresAt(data?.expires_at || null);
    if (!data?.expires_at) {
      setExpiryMode("none");
      setExpiryCustom("");
    } else {
      setExpiryMode("custom");
      setExpiryCustom(toDatetimeLocalString(data.expires_at));
    }
  }, [user, resetShare]);

  useEffect(() => {
    fetchShare(currentId);
  }, [currentId, fetchShare]);

  const createShare = useCallback(async () => {
    if (!user || !currentId) return showToast("共有対象の下書きがありません。");
    const expiresAt = computeExpiresISO(expiryMode, expiryCustom);
    const { data, error } = await saveDraftShare({
      draftId: currentId,
      userId: user.id,
      expiresAt,
    });
    if (error) return showToast(`共有リンクの作成に失敗しました: ${error.message}`);
    setShareToken(data.token);
    setShareExpiresAt(data.expires_at || null);
    showToast("共有リンクを発行しました。");
  }, [user, currentId, expiryMode, expiryCustom, showToast]);

  const updateExpiry = useCallback(async () => {
    if (!user || !currentId || !shareToken) return;
    const expiresAt = computeExpiresISO(expiryMode, expiryCustom);
    const { error } = await updateDraftShareExpiry(currentId, expiresAt);
    if (error) return showToast(`有効期限の更新に失敗しました: ${error.message}`);
    setShareExpiresAt(expiresAt || null);
    showToast(expiresAt ? "有効期限を更新しました。" : "有効期限を解除しました。");
  }, [user, currentId, shareToken, expiryMode, expiryCustom, showToast]);

  const revokeShare = useCallback(async () => {
    if (!user || !currentId) return;
    const { error } = await deleteDraftShare(currentId);
    if (error) return showToast(`共有リンクの無効化に失敗しました: ${error.message}`);
    resetShare();
    showToast("共有リンクを無効化しました。");
  }, [user, currentId, showToast, resetShare]);

  return {
    shareToken,
    shareExpiresAt,
    expiryMode,
    setExpiryMode,
    expiryCustom,
    setExpiryCustom,
    shareURL: shareToken ? `${baseUrl}/s/${shareToken}` : "",
    resetShare,
    createShare,
    updateExpiry,
    revokeShare,
  };
}
