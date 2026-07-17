"use client";

const SNIPPETS = [
  { key: "h2", label: "H2", text: "## 見出し\n\n" },
  { key: "quote", label: "引用", text: "> 引用文をここに入力\n\n" },
  { key: "check", label: "ToDo", text: "- [ ] タスク\n- [ ] タスク\n\n" },
  { key: "table", label: "表", text: "| 項目 | 内容 |\n| --- | --- |\n|  |  |\n\n" },
  { key: "note", label: "注記", text: "**Note:** \n\n" },
];

export function RichMarkdownStudio({
  t,
  content,
  handleContent,
  insights,
  status,
  statusLabel,
  showToast,
  children,
}) {
  const appendSnippet = (snippet) => {
    const separator = content && !content.endsWith("\n") ? "\n\n" : "";
    handleContent(`${content || ""}${separator}${snippet.text}`);
    showToast(t("studio.snippetAdded", { name: snippet.label }));
  };

  return (
    <section className="richEditorShell" aria-label={t("studio.title")}>
      <div className="composerHeader">
        <div className="composerTitleGroup">
          <span className="composerEyebrow">{t("studio.eyebrow")}</span>
          <h2>{t("studio.title")}</h2>
        </div>
        <div className="composerStatus">
          <span className={`statusChip ${status}`}>{statusLabel}</span>
          <span>{insights.chars.toLocaleString()} {t("workbench.units.chars")}</span>
          <span>{insights.readingMinutes}{t("workbench.units.minutes")}</span>
        </div>
      </div>

      <div className="studioCommandBar">
        <div className="snippetGroup" aria-label={t("studio.snippets")}>
          {SNIPPETS.map((snippet) => (
            <button
              className="snippetButton"
              key={snippet.key}
              type="button"
              onClick={() => appendSnippet(snippet)}
            >
              {snippet.label}
            </button>
          ))}
        </div>
      </div>

      <div className="editorCanvas">
        {children}
      </div>
    </section>
  );
}
