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
    <aside className="card section" aria-label="下書き一覧">
      <div className="toolbar" style={{ marginBottom: 8 }}>
        <button
          className="button primary"
          onClick={createDraft}
          disabled={!user || draftsCount >= LIMITS.MAX_DRAFTS_PER_USER}
        >
          {t("drafts.new")}
        </button>
        {!user && <span className="kicker">{t("drafts.needLogin")}</span>}
        {user && draftsCount >= LIMITS.MAX_DRAFTS_PER_USER && (
          <span className="kicker">{t("drafts.limitHit")}</span>
        )}
      </div>

      <div className="toolbar" style={{ gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <input
          className="input"
          type="search"
          placeholder={t("searchUi.placeholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 160 }}
          aria-label={t("searchUi.search")}
        />

        <div className="seg" role="group" aria-label="Sort field">
          <button
            type="button"
            className={`seg-btn ${sortField === "updated" ? "active" : ""}`}
            onClick={() => setSortField("updated")}
            aria-pressed={sortField === "updated"}
            title="更新日"
          >
            ⏱
          </button>
          <button
            type="button"
            className={`seg-btn ${sortField === "title" ? "active" : ""}`}
            onClick={() => setSortField("title")}
            aria-pressed={sortField === "title"}
            title="タイトル"
          >
            A↔Z
          </button>
          <button
            type="button"
            className={`seg-btn ${sortField === "chars" ? "active" : ""}`}
            onClick={() => setSortField("chars")}
            aria-pressed={sortField === "chars"}
            title="文字数"
          >
            #
          </button>
        </div>

        <button
          type="button"
          className="button ghost"
          onClick={() => setSortDir((dir) => (dir === "asc" ? "desc" : "asc"))}
          aria-label="昇順/降順"
          title="昇順/降順"
        >
          {sortDir === "asc" ? "▲" : "▼"}
        </button>

        <button
          type="button"
          className="button"
          onClick={() => setShowFilters((value) => !value)}
          aria-expanded={showFilters}
          aria-controls="filters-panel"
        >
          {t("searchUi.filters")}
        </button>
      </div>

      {showFilters && (
        <div id="filters-panel" className="card soft" style={{ padding: 8, marginBottom: 8 }}>
          <div className="toolbar" style={{ gap: 8, flexWrap: "wrap" }}>
            <div className="field-inline">
              <label className="kicker" htmlFor="from">{t("searchUi.from")}</label>
              <input id="from" className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="field-inline">
              <label className="kicker" htmlFor="to">{t("searchUi.to")}</label>
              <input id="to" className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="field-inline">
              <label className="kicker" htmlFor="minc">{t("searchUi.minChars")}</label>
              <input
                id="minc"
                className="input input-narrow"
                type="number"
                min="0"
                value={minChars}
                onChange={(e) => setMinChars(e.target.value)}
              />
            </div>

            <div className="field-inline">
              <label className="kicker" htmlFor="maxc">{t("searchUi.maxChars")}</label>
              <input
                id="maxc"
                className="input input-narrow"
                type="number"
                min="0"
                value={maxChars}
                onChange={(e) => setMaxChars(e.target.value)}
              />
            </div>

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
              style={{ marginLeft: "auto" }}
            >
              {t("searchUi.clear")}
            </button>
          </div>

          <div className="kicker" style={{ marginTop: 6 }}>
            {t("searchUi.showing", { shown: filteredDrafts.length, total: drafts.length })}
          </div>
        </div>
      )}

      <ul className="list">
        {user && filteredDrafts.map((draft) => (
          <li
            key={draft.id}
            className={`item ${draft.id === currentId ? "active" : ""}`}
            onClick={() => selectDraft(draft)}
          >
            <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {draft.title || t("title")}
            </div>
            <div className="metaChip" aria-label="更新日時">
              {new Date(draft.updated_at).toLocaleString()}
            </div>
          </li>
        ))}
        {user && filteredDrafts.length === 0 && <li className="kicker">{t("drafts.empty")}</li>}
        {!user && <li className="kicker">{t("drafts.needLogin")}</li>}
      </ul>
    </aside>
  );
}
