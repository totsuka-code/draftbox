export function WritingWorkbench({
  t,
  insights,
  goalType,
  setGoalType,
  goalValue,
  setGoalValue,
  goalProgress,
  autosave,
  canRestoreAutosave,
  restoreAutosave,
  snapshots,
  createSnapshot,
  restoreSnapshot,
  deleteSnapshot,
}) {
  return (
    <section className="workbench" aria-label={t("workbench.title")}>
      <div className="workbenchHeader">
        <div>
          <h2>{t("workbench.title")}</h2>
          <p>{t("workbench.subtitle")}</p>
        </div>
        <div className="qualityBadge">
          <span>{t("workbench.quality")}</span>
          <strong>{insights.score}</strong>
        </div>
      </div>

      <div className="goalPanel">
        <div className="goalControls">
          <label>
            <span>{t("workbench.goal.type")}</span>
            <select className="input compact" value={goalType} onChange={(event) => setGoalType(event.target.value)}>
              <option value="chars">{t("workbench.goal.chars")}</option>
              <option value="genko">{t("workbench.goal.genko")}</option>
              <option value="reading">{t("workbench.goal.reading")}</option>
            </select>
          </label>
          <label>
            <span>{t("workbench.goal.target")}</span>
            <input
              className="input compact"
              type="number"
              min="1"
              value={goalValue}
              onChange={(event) => setGoalValue(event.target.value)}
            />
          </label>
        </div>
        <div className="progressTrack" aria-label={t("workbench.goal.progress")}>
          <span style={{ width: `${goalProgress.percent}%` }} />
        </div>
        <div className="goalMeta">
          <strong>{goalProgress.percent}%</strong>
          <span>{goalProgress.current} / {goalProgress.target}</span>
        </div>
      </div>

      <div className="insightGrid">
        <Metric label={t("workbench.metrics.reading")} value={`${insights.readingMinutes}${t("workbench.units.minutes")}`} />
        <Metric label={t("workbench.metrics.speaking")} value={`${insights.speakingMinutes}${t("workbench.units.minutes")}`} />
        <Metric label={t("workbench.metrics.paragraphs")} value={insights.paragraphs} />
        <Metric label={t("workbench.metrics.sentences")} value={insights.sentences} />
        <Metric label={t("workbench.metrics.avgSentence")} value={`${insights.avgSentenceChars}${t("workbench.units.chars")}`} />
        <Metric label={t("workbench.metrics.genko")} value={`${insights.genkoPages}${t("workbench.units.pages")}`} />
      </div>

      <div className="workbenchColumns">
        <div className="reviewPanel">
          <h3>{t("workbench.review")}</h3>
          <ul className="checkList">
            {insights.checks.map((check) => (
              <li key={check.id} className={check.ok ? "ok" : "warn"}>
                <strong>{check.label}</strong>
                <span>{check.message}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="outlinePanel">
          <h3>{t("workbench.outline")}</h3>
          {insights.outline.length ? (
            <ol className="outlineList">
              {insights.outline.slice(0, 8).map((item, index) => (
                <li key={`${item.text}-${index}`} style={{ paddingLeft: `${(item.level - 1) * 10}px` }}>
                  {item.text}
                </li>
              ))}
            </ol>
          ) : (
            <p className="emptyHint">{t("workbench.emptyOutline")}</p>
          )}
        </div>
      </div>

      <div className="keywordRow">
        <span className="kicker">{t("workbench.keywords")}</span>
        {insights.keywords.length ? insights.keywords.map((keyword) => (
          <span className="keywordChip" key={keyword.word}>{keyword.word}<small>{keyword.count}</small></span>
        )) : <span className="emptyHint">{t("workbench.emptyKeywords")}</span>}
      </div>

      <div className="safetyPanel">
        <div>
          <h3>{t("workbench.safety.title")}</h3>
          <p>
            {autosave
              ? t("workbench.safety.autosaved", { time: new Date(autosave.updatedAt).toLocaleString() })
              : t("workbench.safety.noAutosave")}
          </p>
        </div>
        <div className="safetyActions">
          <button className="button" type="button" onClick={createSnapshot}>{t("workbench.safety.snapshot")}</button>
          <button className="button ghost" type="button" onClick={restoreAutosave} disabled={!canRestoreAutosave}>
            {t("workbench.safety.restoreAutosave")}
          </button>
        </div>
      </div>

      {snapshots.length ? (
        <div className="snapshotList">
          {snapshots.map((snapshot) => (
            <article className="snapshotItem" key={snapshot.id}>
              <div>
                <strong>{snapshot.title}</strong>
                <span>{new Date(snapshot.createdAt).toLocaleString()}</span>
                {snapshot.preview && <p>{snapshot.preview}</p>}
              </div>
              <div className="snapshotActions">
                <button className="button compactButton" type="button" onClick={() => restoreSnapshot(snapshot)}>
                  {t("workbench.safety.restore")}
                </button>
                <button className="button ghost compactButton" type="button" onClick={() => deleteSnapshot(snapshot.id)}>
                  {t("workbench.safety.delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="insightMetric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
