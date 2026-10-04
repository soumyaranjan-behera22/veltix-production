// ─────────────────────────────────────────────────────────────
//  Veltix Desk settings (desk-setup/README.md, step 3)
// ─────────────────────────────────────────────────────────────
//  supabaseUrl      Supabase → Project Settings → API → Project URL
//  supabaseAnonKey  Supabase → Project Settings → API Keys → publishable key
//                   (the FULL line, starts with sb_publishable_ — or the long
//                   "anon public" key starting with eyJ on older projects)
//  adminEmails      the email(s) allowed into the desk
//
//  The publishable/anon key is safe on a website: your deals are protected by
//  Row Level Security. Never put the secret / service_role key here.

window.VELTIX_CONFIG = {
  supabaseUrl: "https://kqvxespisjtbsqcidjvz.supabase.co",
  supabaseAnonKey: "sb_publishable_SO_6_Xc64DVwtQyUVA2SJg_PHrxxr10",
  logo: "/veltix-admin-logo.png",
  adminEmails: ["veltixagency@gmail.com", "pinkibehera671@gmail.com", "sipu@os.in"]
};
