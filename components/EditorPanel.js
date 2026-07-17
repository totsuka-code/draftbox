"use client";

import dynamic from "next/dynamic";
import { humanTimeLeft } from "@/lib/time";
import { WritingWorkbench } from "@/components/WritingWorkbench";
import { RichMarkdownStudio } from "@/components/RichMarkdownStudio";

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
  insights,
  goalType,
  setGoalType,
  goalValue,
  setGoalValue,
  goalProgress,
  localSafety,
}) {
  return (
    <section className="panel editorPanel" aria-label="エディタ">
      <div className="editorHeader">
        <div className="titleStack">
          <input
            className="titleInput"
            value={title}
            onChange={(e) => handleTitle(e.target.value)}
            placeholder={t("title")}
            aria-label={t("title")}
          />
          {!user && (
            <span className="kicker">
              未サインインのため保存は無効です。エクスポートは利用できます。
            </span>
          )}
        </div>
        <div className="saveCluster">
          <span className={`statusChip ${status}`}>{statusLabel}</span>
          <button className="button primary" onClick={saveNow} disabled={!user}>{t("actions.saveNow")}</button>
        </div>
      </div>

      <div className="shareBox">
        <div className="shareState">
          <strong>{shareToken ? "共有リンク発行済み" : "共有リンク未発行"}</strong>
          <span>
            {shareToken && shareExpiresAt
              ? `${new Date(shareExpiresAt).toLocaleString()}（${t("share.expiresIn", { time: humanTimeLeft(shareExpiresAt) })}）`
              : shareToken
                ? t("share.none")
                : "必要になったら閲覧専用リンクを発行できます。"}
          </span>
        </div>

        <div className="shareControls">
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
              <button className="button danger" onClick={revokeShare}>{t("share.revoke")}</button>
            </>
          ) : null}
        </div>

        <div className="expiryControls">
          <label>
            <span>{t("share.expiry")}</span>
            <select
              className="input compact"
              value={expiryMode}
              onChange={(e) => setExpiryMode(e.target.value)}
              aria-label={t("share.expiry")}
            >
              <option value="none">{t("share.options.none")}</option>
              <option value="24h">{t("share.options.h24")}</option>
              <option value="7d">{t("share.options.d7")}</option>
              <option value="custom">{t("share.options.custom")}</option>
            </select>
          </label>
          {expiryMode === "custom" && (
            <input
              className="input compact"
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
        </div>
      </div>

      <RichMarkdownStudio
        t={t}
        content={content}
        handleContent={handleContent}
        insights={insights}
        status={status}
        statusLabel={statusLabel}
        showToast={showToast}
      >
        <SimpleMDE value={content} onChange={handleContent} options={mdeOptions} />
      </RichMarkdownStudio>

      <WritingWorkbench
        t={t}
        insights={insights}
        goalType={goalType}
        setGoalType={setGoalType}
        goalValue={goalValue}
        setGoalValue={setGoalValue}
        goalProgress={goalProgress}
        {...localSafety}
      />

      <div className="editorFooter">
        <div className="exportGroup">
          <span className="kicker">エクスポート</span>
          <button className="button" onClick={exportMD}>{t("export.md")}</button>
          <button className="button" onClick={exportHTML}>{t("export.html")}</button>
          <button className="button" onClick={exportTXT}>{t("export.txt")}</button>
        </div>
        {user && currentId ? (
          <button className="button danger" onClick={deleteCurrentDraft}>{t("actions.deleteThisDraft")}</button>
        ) : null}
      </div>
    </section>
  );
}
