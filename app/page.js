// app/page.js (draftbox)

"use client";
import { useMemo, useState, useCallback } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { useI18n } from "@/lib/i18n";
import { filterAndSortDrafts } from "@/lib/draftFilters";
import { getMarkdownEditorOptions } from "@/lib/editorOptions";
import { exportHtmlDraft, exportMarkdownDraft, exportTextDraft } from "@/lib/draftExport";
import { analyzeWriting, getGoalProgress } from "@/lib/writingInsights";
import { DraftListPanel } from "@/components/DraftListPanel";
import { EditorPanel } from "@/components/EditorPanel";
import { HeaderAuth } from "@/components/HeaderAuth";
import { StatsSummary } from "@/components/StatsSummary";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useDraftEditor } from "@/hooks/useDraftEditor";
import { useDraftShare } from "@/hooks/useDraftShare";
import { useLocalDraftSafety } from "@/hooks/useLocalDraftSafety";
import { useToast } from "@/hooks/useToast";

export default function Page() {
  const { lang, setLang, t } = useI18n();
  const user = useAuthSession();
  const { toast, showToast } = useToast();

  const [authMode, setAuthMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minChars, setMinChars] = useState("");
  const [maxChars, setMaxChars] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState("updated");
  const [sortDir, setSortDir] = useState("desc");
  const [goalType, setGoalType] = useState("chars");
  const [goalValue, setGoalValue] = useState("2000");

  const {
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
  } = useDraftEditor({ user, t, showToast });

  const {
    shareToken,
    shareExpiresAt,
    expiryMode,
    setExpiryMode,
    expiryCustom,
    setExpiryCustom,
    shareURL,
    resetShare,
    createShare,
    updateExpiry,
    revokeShare,
  } = useDraftShare({ user, currentId, showToast });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");

  const handleAuth = useCallback(async (event) => {
    event.preventDefault();
    if (!supabase) {
      showToast("Supabase の環境変数が未設定です。.env.local を設定してください。");
      return;
    }
    if (authMode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return showToast(`ログインに失敗しました: ${error.message}`);
      showToast("ログインしました。");
    } else {
      if (password.length < 8) return showToast("パスワードは8文字以上でご設定ください。");
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return showToast(`登録に失敗しました: ${error.message}`);
      showToast("登録を受け付けました。案内メールをご確認ください。");
    }
  }, [authMode, email, password, showToast]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    resetDrafts();
    resetShare();
    showToast("サインアウトしました。");
  }, [resetDrafts, resetShare, showToast]);

  const sendReset = useCallback(async (event) => {
    event.preventDefault();
    if (!supabase) {
      showToast("Supabase の環境変数が未設定です。.env.local を設定してください。");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${baseUrl}/auth/reset`,
    });
    showToast(error ? `再設定メールの送信に失敗しました: ${error.message}` : "再設定用メールを送信しました。");
  }, [resetEmail, baseUrl, showToast]);

  const filteredDrafts = useMemo(
    () =>
      filterAndSortDrafts({
        drafts,
        query: q,
        dateFrom,
        dateTo,
        minChars,
        maxChars,
        sortField,
        sortDir,
      }),
    [drafts, q, dateFrom, dateTo, minChars, maxChars, sortField, sortDir]
  );

  const mdeOptions = useMemo(() => getMarkdownEditorOptions(t), [t]);
  const insights = useMemo(() => analyzeWriting(content, lang), [content, lang]);
  const goalProgress = useMemo(
    () => getGoalProgress({ type: goalType, value: goalValue, insights }),
    [goalType, goalValue, insights]
  );

  const restoreLocalDraft = useCallback(({ title: nextTitle, content: nextContent }) => {
    handleTitle(nextTitle);
    handleContent(nextContent);
  }, [handleContent, handleTitle]);

  const localSafety = useLocalDraftSafety({
    title,
    content,
    onRestore: restoreLocalDraft,
    showToast,
    t,
  });

  const exportMD = useCallback(() => exportMarkdownDraft({ title, content }), [title, content]);
  const exportTXT = useCallback(() => exportTextDraft({ title, content }), [title, content]);
  const exportHTML = useCallback(() => exportHtmlDraft({ title, content, lang }), [content, title, lang]);

  const statusLabel =
    status === "saving" ? t("status.saving") :
    status === "saved" ? t("status.saved") :
    status === "error" ? t("status.error") : "　";

  return (
    <div className="container">
      <HeaderAuth
        t={t}
        lang={lang}
        setLang={setLang}
        user={user}
        signOut={signOut}
        authMode={authMode}
        setAuthMode={setAuthMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleAuth={handleAuth}
        authDisabled={!isSupabaseConfigured}
        showReset={showReset}
        setShowReset={setShowReset}
        resetEmail={resetEmail}
        setResetEmail={setResetEmail}
        sendReset={sendReset}
      />

      <StatsSummary
        t={t}
        charCount={charCount}
        draftsCount={draftsCount}
        content={content}
        stats={stats}
      />

      <div className="layout">
        <DraftListPanel
          t={t}
          user={user}
          drafts={drafts}
          draftsCount={draftsCount}
          currentId={currentId}
          filteredDrafts={filteredDrafts}
          createDraft={createDraft}
          selectDraft={selectDraft}
          q={q}
          setQ={setQ}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          minChars={minChars}
          setMinChars={setMinChars}
          maxChars={maxChars}
          setMaxChars={setMaxChars}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          sortField={sortField}
          setSortField={setSortField}
          sortDir={sortDir}
          setSortDir={setSortDir}
        />

        <EditorPanel
          t={t}
          user={user}
          currentId={currentId}
          title={title}
          content={content}
          handleTitle={handleTitle}
          handleContent={handleContent}
          shareToken={shareToken}
          shareURL={shareURL}
          shareExpiresAt={shareExpiresAt}
          expiryMode={expiryMode}
          setExpiryMode={setExpiryMode}
          expiryCustom={expiryCustom}
          setExpiryCustom={setExpiryCustom}
          updateExpiry={updateExpiry}
          createShare={createShare}
          revokeShare={revokeShare}
          showToast={showToast}
          exportMD={exportMD}
          exportHTML={exportHTML}
          exportTXT={exportTXT}
          mdeOptions={mdeOptions}
          status={status}
          statusLabel={statusLabel}
          saveNow={saveNow}
          deleteCurrentDraft={deleteCurrentDraft}
          insights={insights}
          goalType={goalType}
          setGoalType={setGoalType}
          goalValue={goalValue}
          setGoalValue={setGoalValue}
          goalProgress={goalProgress}
          localSafety={localSafety}
        />
      </div>

      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}
