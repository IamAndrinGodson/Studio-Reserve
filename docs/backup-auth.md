# Backup And Sign-In

StudioReserve is designed to work offline first. Cloud backup is optional and should be added only after OAuth credentials and a secure storage backend exist.

## Production Path

1. Create a Google OAuth client in Google Cloud.
2. Create a Facebook app in Meta for Developers.
3. Add the public app identifiers to `.env`.
4. Add a backend such as Firebase, Supabase, or a private API.
5. Encrypt finance data before upload.
6. Store backup records per authenticated user.

## Why Credentials Are Not Included

Real Google and Facebook sign-in requires registered redirect URLs, app IDs, privacy policy links, and domain ownership. Placeholder credentials would fail in production and would be unsafe to ship.
