import { supabase } from "@/lib/supabaseClient";

export async function listDrafts() {
  return supabase
    .from("drafts")
    .select("id,title,content,updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .limit(1000);
}

export async function createDraft({ userId, title, content }) {
  return supabase
    .from("drafts")
    .insert({ user_id: userId, title, content })
    .select()
    .single();
}

export async function updateDraft(id, patch) {
  return supabase.from("drafts").update(patch).eq("id", id);
}

export async function deleteDraft(id) {
  return supabase.from("drafts").delete().eq("id", id);
}
