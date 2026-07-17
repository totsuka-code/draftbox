import { LIMITS, byteLength } from "@/lib/policy";
import { Stat } from "@/components/Stat";

export function StatsSummary({ t, charCount, draftsCount, content, stats }) {
  return (
    <>
      <div className="counterBar" style={{ marginBottom: 12 }}>
        <span className="badge" aria-label={t("counter")}>
          <span>{t("counter")}</span> <strong>{charCount}</strong>
        </span>
        <div className="settings">
          <span className="kicker">下書き {draftsCount} / {LIMITS.MAX_DRAFTS_PER_USER}</span>
          <span className="kicker">本文 {byteLength(content)} / {LIMITS.MAX_CONTENT_BYTES} B</span>
        </div>
      </div>

      <section className="card section" style={{ marginBottom: 12 }}>
        <h3 style={{ marginBottom: 8 }}>{t("stats.title")}</h3>
        <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          <Stat label={t("stats.chars")} value={stats.chars} unit="文字" />
          <Stat label={t("stats.charsNoNL")} value={stats.charsNoNL} unit="文字" />
          <Stat label={t("stats.charsNoNLSpace")} value={stats.charsNoNLSpace} unit="文字" />
          <Stat label={t("stats.bytesUtf8")} value={stats.bytesUTF8} unit="バイト" />
          <Stat label={t("stats.bytesUtf16")} value={stats.bytesUTF16} unit="バイト" />
          <Stat label={t("stats.bytesSjis")} value={stats.bytesSJIS} unit="バイト" />
          <Stat label={t("stats.bytesEucjp")} value={stats.bytesEUCJP} unit="バイト" />
          <Stat label={t("stats.bytesJis")} value={stats.bytesJIS} unit="バイト" />
          <Stat label={t("stats.lines")} value={stats.lines} unit="行" />
          <Stat label={t("stats.genkoyoshi")} value={stats.genkoyoshi} unit="枚" />
        </div>
        <p className="kicker" style={{ marginTop: 6 }}>
          ※ Shift-JIS / EUC-JP / JIS のバイト数は簡易推定です。
        </p>
      </section>
    </>
  );
}
