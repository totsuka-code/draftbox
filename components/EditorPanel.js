"use client";

import dynamic from "next/dynamic";
import { humanTimeLeft } from "@/lib/time";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export function EditorPanel({
  t,
  user,
  currentId,
  title,
  content,
  handleTitle,
  handleContent,
  shareToken,
  shareURL,
  shareExpiresAt,
  expiryMode,
  setExpiryMode,
  expiryCustom,
  setExpiryCustom,
  updateExpiry,
  createShare,
  revokeShare,
  showToast,
  exportMD,
  exportHTML,
  exportTXT,
  mdeOptions,
  status,
  statusLabel,
  saveNow,
  deleteCurrentDraft,
}) {
  return (
    <section className="card section" aria-label="エディタ">
      <div className="titleRow" style={{ marginBottom: 8 }}>
        <input
          className="input"
          style={{ width: "100%", fontSize: 18, fontWeight: 600 }}
          value={title}
          onChange={(e) => handleTitle(e.target.value)}
          placeholder={t("title")}
          aria-label={t("title")}
        />
        {!user && (
          <span className="kicker clamp-1" style={{ marginTop: 4 }}>
            ※未サインイン：このタイトルはエクスポート時のファイル名にのみ利用されます（保存不可）
          </span>
        )}
      </div>

      <div className="toolbar" style={{ gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        {shareToken ? (
          <>
            <a className="button" href={shareURL} target="_blank" rel="noreferrer">{t("share.open")}</a>
            <button className="button" onClick={async () => {
              try {
                await navigator.clipboard?.writeText(shareURL);
                showToast(t("share.copy"));
              } catch {
                showToast("コピーに失敗しました。共有リンクを手動で選択してください。");
              }
            }}>
              {t("share.copy")}
            </button>
            <span className="kicker">
              {t("share.expiry")}：
              {shareExpiresAt
                ? `${new Date(shareExpiresAt).toLocaleString()}（${t("share.expiresIn", { time: humanTimeLeft(shareExpiresAt) })}）`
                : t("share.none")}
            </span>
            <button className="button danger" onClick={revokeShare}>{t("share.revoke")}</button>
          </>
        ) : (
          <span className="kicker">{t("share.notIssued")}</span>
        )}

        <div className="divider" />
        <label className="kicker" htmlFor="expiry">{t("share.expiry")}</label>
        <select
          id="expiry"
          className="input"
          value={expiryMode}
          onChange={(e) => setExpiryMode(e.target.value)}
          aria-label={t("share.expiry")}
        >
          <option value="none">{t("share.options.none")}</option>
          <option value="24h">{t("share.options.h24")}</option>
          <option value="7d">{t("share.options.d7")}</option>
          <option value="custom">{t("share.options.custom")}</option>
        </select>
        {expiryMode === "custom" && (
          <input
            className="input"
            type="datetime-local"
            value={expiryCustom}
            onChange={(e) => setExpiryCustom(e.target.value)}
            aria-label={t("share.options.custom")}
          />
        )}
        {shareToken ? (
          <button className="button" onClick={updateExpiry} disabled={!user || !currentId}>{t("share.update")}</button>
        ) : (
          <button className="button" onClick={createShare} disabled={!user || !currentId}>{t("share.issue")}</button>
        )}

        <div className="divider" />
        <button className="button" onClick={exportMD}>{t("export.md")}</button>
        <button className="button" onClick={exportHTML}>{t("export.html")}</button>
        <button className="button" onClick={exportTXT}>{t("export.txt")}</button>
      </div>

      <SimpleMDE value={content} onChange={handleContent} options={mdeOptions} />

      <div className="toolbar" style={{ marginTop: 8, justifyContent: "flex-end", gap: 10 }}>
        <span className={`statusChip ${status}`}>{statusLabel}</span>
        <button className="button" onClick={saveNow} disabled={!user}>{t("actions.saveNow")}</button>
        {user && currentId ? (
          <button className="button danger" onClick={deleteCurrentDraft}>{t("actions.deleteThisDraft")}</button>
        ) : null}
      </div>
    </section>
  );
}
