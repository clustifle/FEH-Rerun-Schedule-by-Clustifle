# Owner and Managers

Run `manager-roles.sql` after `setup.sql` when creating a new backend. For the existing project, `manager-roles.sql` preserves the original Owner and extends hero/portrait editing to authorized Managers. `add-authorized-editor.sql` adds the requested initial Manager.

The Owner is pinned to the original verified account ID and email. Manager accounts are pinned to their confirmed account ID and email. Only the Owner can list, add, or remove Managers using the Managers panel. Users cannot edit the permissions table directly. Public visitors retain read-only access.

To add another Manager, first create and confirm their account in Supabase Authentication, then enter its email in the website's Managers panel. No emails or invitations are sent by the panel. Managers sign in using their own credentials and can reset their password through the existing sign-in popup.

Do not run the legacy `lock-owner.sql` after enabling Managers; it is an earlier owner-only configuration.
