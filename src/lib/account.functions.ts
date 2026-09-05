import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: resumesError } = await supabaseAdmin
      .from("resumes")
      .delete()
      .eq("user_id", context.userId);
    if (resumesError) throw new Error(resumesError.message);

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", context.userId);
    if (profileError) throw new Error(profileError.message);

    const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (userError) throw new Error(userError.message);

    return { ok: true };
  });
