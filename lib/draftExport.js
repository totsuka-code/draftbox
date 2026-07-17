import { marked } from "marked";
import DOMPurify from "dompurify";
import { stripMarkdown } from "@/lib/textMetrics";

function safeFilename(str) {
  const base = (str || "untitled").trim();
  const sanitized = base.replace(/[\\/:*?"<>|]/g, "_");
  return sanitized.slice(0, 100);
}

function download(filename, mime, text) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

export function exportMarkdownDraft({ title, content }) {
  download(`${safeFilename(title)}.md`, "text/markdown;charset=utf-8", content);
}

export function exportTextDraft({ title, content }) {
  download(`${safeFilename(title)}.txt`, "text/plain;charset=utf-8", stripMarkdown(content));
}

export function exportHtmlDraft({ title, content, lang }) {
  const htmlBody = DOMPurify.sanitize(marked.parse(content || ""));
  const name = safeFilename(title);
  const html = `<!doctype html><html lang="${lang}"><meta charset="utf-8"><title>${name}</title><body>${htmlBody}</body></html>`;
  download(`${name}.html`, "text/html;charset=utf-8", html);
}
