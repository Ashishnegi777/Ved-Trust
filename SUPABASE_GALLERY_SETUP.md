# Supabase gallery setup

1. Create a Supabase project and create the owner account in **Authentication > Users**.
2. Open the SQL Editor and run [supabase/gallery.sql](supabase/gallery.sql).
3. Copy `.env.example` to `.env.local`, then add the project URL and the browser-safe anon/publishable key from **Project Settings > API**.
4. Add the owner user UUID to `public.gallery_admins` using the final SQL comment in `supabase/gallery.sql`.
5. Start the site and visit `/admin/gallery`. Sign in with the owner account to upload, edit, reorder, publish, or remove gallery images.

Never put the Supabase service-role key in `.env.local` or browser code. The app uses only the anon/publishable key and Row Level Security policies.
