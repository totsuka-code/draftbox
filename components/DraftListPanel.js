import { LIMITS } from "@/lib/policy";

export function DraftListPanel({
  t,
  user,
  drafts,
  draftsCount,
  currentId,
  filteredDrafts,
  createDraft,
  selectDraft,
  q,
  setQ,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  minChars,
  setMinChars,
  maxChars,
  setMaxChars,
  showFilters,
  setShowFilters,
  sortField,
  setSortField,
  sortDir,
  setSortDir,
}) {
  return (
    <aside className="panel draftPanel" aria-label="下書き一覧">
      <div className="panelHeader">
        <div>
          <h2>下書き</h2>
          <p>{user ? `${filteredDrafts.length} / ${drafts.length} 件を表示` : t("drafts.needLogin")}</p>
        </div>
        <button
          className="button primary"
          onClick={createDraft}
          disabled={!user || draftsCount >= LIMITS.MAX_DRAFTS_PER_USER}
        >
          {t("drafts.new")}
        </button>
      </div>

      {user && draftsCount >= LIMITS.MAX_DRAFTS_PER_USER && (
        <div className="notice">{t("drafts.limitHit")}</div>
      )}

      <div className="searchBar">
        <input
          className="input"
          type="search"
          placeholder={t("searchUi.placeholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={t("searchUi.search")}
        />
        <button
          type="button"
          className="button iconButton"
          onClick={() => setShowFilters((value) => !value)}
          aria-expanded={showFilters}
          aria-controls="filters-panel"
          title={t("searchUi.filters")}
        >
          絞り込み
        </button>
      </div>

      <div className="sortRow">
        <div className="seg" role="group" aria-label="Sort field">
          <button
            type="button"
            className={`seg-btn ${sortField === "updated" ? "active" : ""}`}
            onClick={() => setSortField("updated")}
            aria-pressed={sortField === "updated"}
          >
            更新
          </button>
          <button
            type="button"
            className={`seg-btn ${sortField === "title" ? "active" : ""}`}
            onClick={() => setSortField("title")}
            aria-pressed={sortField === "title"}
          >
            題名
          </button>
          <button
            type="button"
            className={`seg-btn ${sortField === "chars" ? "active" : ""}`}
            onClick={() => setSortField("chars")}
            aria-pressed={sortField === "chars"}
          >
            文字
          </button>
        </div>

        <button
          type="button"
          className="button ghost compactButton"
          onClick={() => setSortDir((dir) => (dir === "asc" ? "desc" : "asc"))}
          aria-label="昇順/降順"
        >
          {sortDir === "asc" ? "昇順" : "降順"}
        </button>
      </div>

      {showFilters && (
        <div id="filters-panel" className="filterPanel">
          <label>
            <span>{t("searchUi.from")}</span>
            <input className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>
          <label>
            <span>{t("searchUi.to")}</span>
            <input className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
          <label>
            <span>{t("searchUi.minChars")}</span>
            <input className="input" type="number" min="0" value={minChars} onChange={(e) => setMinChars(e.target.value)} />
          </label>
          <label>
            <span>{t("searchUi.maxChars")}</span>
            <input className="input" type="number" min="0" value={maxChars} onChange={(e) => setMaxChars(e.target.value)} />
          </label>
          <button
            type="button"
            className="button ghost"
            onClick={() => {
              setQ("");
              setDateFrom("");
              setDateTo("");
              setMinChars("");
              setMaxChars("");
            }}
          >
            {t("searchUi.clear")}
          </button>
        </div>
      )}

      <ul className="draftList">
        {user && filteredDrafts.map((draft) => (
          <li key={draft.id}>
            <button
              type="button"
              className={`draftItem ${draft.id === currentId ? "active" : ""}`}
              onClick={() => selectDraft(draft)}
            >
              <span className="draftTitle">{draft.title || t("title")}</span>
              <span className="draftMeta">{new Date(draft.updated_at).toLocaleString()}</span>
            </button>
          </li>
        ))}
        {user && filteredDrafts.length === 0 && <li className="emptyState">{t("drafts.empty")}</li>}
        {!user && <li className="emptyState">{t("drafts.needLogin")}</li>}
      </ul>
    </aside>
  );
}
