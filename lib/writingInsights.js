import { countGraphemes, stripMarkdown } from "@/lib/textMetrics";

const JA_READING_CHARS_PER_MINUTE = 500;
const JA_SPEAKING_CHARS_PER_MINUTE = 300;
const EN_READING_WORDS_PER_MINUTE = 220;

const STOP_WORDS = new Set([
  "this", "that", "with", "from", "your", "have", "about", "into", "the", "and", "for",
  "する", "した", "です", "ます", "こと", "これ", "それ", "ため", "よう", "から", "まで",
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function splitSentences(text) {
  return (text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[。！？!?\\.])\s*/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function splitParagraphs(text) {
  return (text || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function extractOutline(markdown) {
  return (markdown || "")
    .split(/\r?\n/)
    .map((line) => line.match(/^(#{1,6})\s+(.+)$/))
    .filter(Boolean)
    .map((match) => ({
      level: match[1].length,
      text: match[2].replace(/[#*_`~]/g, "").trim(),
    }))
    .filter((item) => item.text);
}

function extractKeywords(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
    const counts = new Map();
    for (const part of segmenter.segment(text || "")) {
      const word = part.segment.toLowerCase().trim();
      if (!part.isWordLike || word.length < 2 || STOP_WORDS.has(word)) continue;
      if (/^[0-9]+$/.test(word)) continue;
      counts.set(word, (counts.get(word) || 0) + 1);
    }
    if (counts.size) {
      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 8)
        .map(([word, count]) => ({ word, count }));
    }
  }

  const matches = (text || "")
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9-]{2,}|[\p{Script=Han}\p{Script=Katakana}\p{Script=Hiragana}]{2,}/gu) || [];
  const counts = new Map();
  for (const word of matches) {
    if (STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));
}

export function analyzeWriting(markdown, lang = "ja") {
  const plain = stripMarkdown(markdown || "");
  const chars = countGraphemes(plain);
  const words = (plain.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?/g) || []).length;
  const sentences = splitSentences(plain);
  const paragraphs = splitParagraphs(plain);
  const outline = extractOutline(markdown);
  const avgSentenceChars = sentences.length ? Math.round(chars / sentences.length) : 0;
  const longestSentence = sentences.reduce((best, sentence) => {
    const length = countGraphemes(sentence);
    return length > best.length ? { text: sentence, length } : best;
  }, { text: "", length: 0 });
  const readingMinutes = lang === "en"
    ? Math.max(1, Math.ceil((words || chars / 5) / EN_READING_WORDS_PER_MINUTE))
    : Math.max(1, Math.ceil(chars / JA_READING_CHARS_PER_MINUTE));
  const speakingMinutes = Math.max(1, Math.ceil(chars / JA_SPEAKING_CHARS_PER_MINUTE));
  const genkoPages = Math.ceil(chars / 400);
  const keywords = extractKeywords(plain);

  const checks = [
    {
      id: "outline",
      ok: outline.length > 0 || chars < 400,
      label: lang === "en" ? "Structure" : "構成",
      message: outline.length > 0
        ? (lang === "en" ? "Headings make the structure scannable." : "見出しがあり、構成を追いやすいです。")
        : (lang === "en" ? "Add headings for a longer draft." : "長めの文章なら見出しを足すと読みやすくなります。"),
    },
    {
      id: "sentence",
      ok: avgSentenceChars <= 70 || chars < 300,
      label: lang === "en" ? "Sentence length" : "文の長さ",
      message: avgSentenceChars <= 70
        ? (lang === "en" ? "Average sentence length is easy to scan." : "平均文長は読みやすい範囲です。")
        : (lang === "en" ? "A few sentences may be too dense." : "少し文が長めです。区切ると読みやすくなります。"),
    },
    {
      id: "paragraph",
      ok: paragraphs.length >= 2 || chars < 500,
      label: lang === "en" ? "Paragraphs" : "段落",
      message: paragraphs.length >= 2
        ? (lang === "en" ? "Paragraph breaks are present." : "段落分けされています。")
        : (lang === "en" ? "Break long text into paragraphs." : "長文なら段落を分けると読みやすくなります。"),
    },
  ];

  return {
    chars,
    words,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    avgSentenceChars,
    longestSentence,
    readingMinutes,
    speakingMinutes,
    genkoPages,
    outline,
    keywords,
    checks,
    score: Math.round(clamp((checks.filter((check) => check.ok).length / checks.length) * 100, 0, 100)),
  };
}

export function getGoalProgress({ type, value, insights }) {
  const target = Math.max(1, Number(value) || 1);
  const current =
    type === "genko" ? insights.genkoPages :
    type === "reading" ? insights.readingMinutes :
    insights.chars;
  return {
    current,
    target,
    percent: clamp(Math.round((current / target) * 100), 0, 100),
  };
}
