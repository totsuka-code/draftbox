import { LIMITS, byteLength } from "@/lib/policy";
import { Stat } from "@/components/Stat";

export function StatsSummary({ t, charCount, draftsCount, content, stats }) {
  return (
    <section className="statsPanel" aria-label={t("stats.title")}>
      <div className="summaryStrip">
        <span className="metricHero">
          <span className="metricLabel">{t("counter")}</span>
          <strong>{charCount}</strong>
        </span>
        <span className="summaryMeta">下書き {draftsCount} / {LIMITS.MAX_DRAFTS_PER_USER}</span>
        <span className="summaryMeta">本文 {byteLength(content)} / {LIMITS.MAX_CONTENT_BYTES} B</span>
        <span className="summaryPromise">書く、数える、復元する。下書きを失わない執筆机。</span>
      </div>

      <div className="statsGrid">
        <Stat label={t("stats.chars")} value={stats.chars} unit="文字" />
        <Stat label={t("stats.charsNoNL")} value={stats.charsNoNL} unit="文字" />
        <Stat label={t("stats.charsNoNLSpace")} value={stats.charsNoNLSpace} unit="文字" />
        <Stat label={t("stats.bytesUtf8")} value={stats.bytesUTF8} unit="B" />
        <Stat label={t("stats.bytesUtf16")} value={stats.bytesUTF16} unit="B" />
        <Stat label={t("stats.lines")} value={stats.lines} unit="行" />
        <Stat label={t("stats.genkoyoshi")} value={stats.genkoyoshi} unit="枚" />
      </div>
    </section>
  );
}
