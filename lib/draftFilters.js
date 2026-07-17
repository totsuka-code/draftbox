import { countGraphemes, stripMarkdown } from "@/lib/textMetrics";

export function getDraftChars(draft) {
  const text = stripMarkdown(draft?.content || "");
  return countGraphemes(text.replace(/\r/g, ""));
}

export function filterAndSortDrafts({
  drafts,
  query,
  dateFrom,
  dateTo,
  minChars,
  maxChars,
  sortField,
  sortDir,
}) {
  let result = drafts.map((draft) => ({ ...draft, _chars: getDraftChars(draft) }));

  const needle = query.trim().toLowerCase();
  if (needle) {
    result = result.filter(
      (draft) =>
        (draft.title || "").toLowerCase().includes(needle) ||
        (draft.content || "").toLowerCase().includes(needle)
    );
  }

  if (dateFrom) {
    const from = new Date(dateFrom + "T00:00:00");
    result = result.filter((draft) => new Date(draft.updated_at) >= from);
  }

  if (dateTo) {
    const to = new Date(dateTo + "T23:59:59.999");
    result = result.filter((draft) => new Date(draft.updated_at) <= to);
  }

  const min = Number.isFinite(+minChars) && minChars !== "" ? +minChars : null;
  const max = Number.isFinite(+maxChars) && maxChars !== "" ? +maxChars : null;
  if (min !== null) result = result.filter((draft) => draft._chars >= min);
  if (max !== null) result = result.filter((draft) => draft._chars <= max);

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  const byUpdated = (a, b) => new Date(a.updated_at) - new Date(b.updated_at);
  const byTitle = (a, b) => collator.compare(a.title || "", b.title || "");
  const byChars = (a, b) => a._chars - b._chars;

  let compare = byUpdated;
  if (sortField === "title") compare = byTitle;
  if (sortField === "chars") compare = byChars;

  result.sort((a, b) => (sortDir === "asc" ? compare(a, b) : compare(b, a)));
  return result;
}
