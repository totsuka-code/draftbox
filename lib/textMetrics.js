/**
 * Count user-visible characters. Intl.Segmenter handles emoji and combining marks.
 * @param {string} text
 * @returns {number}
 */
export function countGraphemes(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const seg = new Intl.Segmenter("ja", { granularity: "grapheme" });
    let count = 0;
    for (const _ of seg.segment(text || "")) count++;
    return count;
  }
  return Array.from(text || "").length;
}

/**
 * Convert Markdown to approximate plain text for counting and TXT export.
 * @param {string} md
 * @returns {string}
 */
export function stripMarkdown(md) {
  let text = md ?? "";
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`[^`]*`/g, "");
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, "$1");
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, "$1");
  text = text.replace(/[*_~`>#-]{1,}/g, " ");
  return text;
}

export function bytesSJIS(text) {
  let size = 0;
  for (const ch of text || "") {
    const cp = ch.codePointAt(0);
    if (cp <= 0x7f) size += 1;
    else if (cp >= 0xff61 && cp <= 0xff9f) size += 1;
    else size += 2;
  }
  return size;
}

export function bytesEUCJP(text) {
  let size = 0;
  for (const ch of text || "") {
    const cp = ch.codePointAt(0);
    size += cp <= 0x7f ? 1 : 2;
  }
  return size;
}

export function bytesJIS(text) {
  let size = 0;
  for (const ch of text || "") {
    const cp = ch.codePointAt(0);
    size += cp <= 0x7f ? 1 : 2;
  }
  return size;
}

export function lineCount(text) {
  if (!text) return 0;
  return text.replace(/\r/g, "").split("\n").length;
}

export function getTextStats(plain) {
  const noNewlines = plain.replace(/\r?\n/g, "");
  const compact = noNewlines.replace(/[ \t\u3000]/g, "");
  const chars = countGraphemes(plain);
  const compactChars = countGraphemes(compact);

  return {
    chars,
    charsNoNL: countGraphemes(noNewlines),
    charsNoNLSpace: compactChars,
    bytesUTF8: new TextEncoder().encode(plain).length,
    bytesUTF16: plain.length * 2,
    bytesSJIS: bytesSJIS(plain),
    bytesEUCJP: bytesEUCJP(plain),
    bytesJIS: bytesJIS(plain),
    lines: lineCount(plain),
    genkoyoshi: Math.ceil(compactChars / 400),
  };
}
