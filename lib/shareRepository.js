import { supabase } from "@/lib/supabaseClient";

export async function getDraftShare(draftId) {
  return supabase
    .from("draft_shares")
    .select("token, expires_at")
    .eq("draft_id", draftId)
    .maybeSingle();
}

export async function saveDraftShare({ draftId, userId, expiresAt }) {
  return supabase
    .from("draft_shares")
    .upsert(
      { draft_id: draftId, user_id: userId, expires_at: expiresAt },
      { onConflict: "draft_id", ignoreDuplicates: false }
    )
    .select("token, expires_at")
    .single();
}

export async function updateDraftShareExpiry(draftId, expiresAt) {
  return supabase.from("draft_shares").update({ expires_at: expiresAt }).eq("draft_id", draftId);
}

export async function deleteDraftShare(draftId) {
  return supabase.from("draft_shares").delete().eq("draft_id", draftId);
}
