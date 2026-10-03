# Database migrations

Add timestamped SQL migrations here. The deployment workflow applies these to
the selected Supabase project before deploying the web application. There is
no cloud schema yet; the first feature that adds tables must include its RLS
policies and pgTAP tests in the same change.