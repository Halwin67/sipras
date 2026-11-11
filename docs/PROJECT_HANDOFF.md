# SIPRAS Online — Team Handoff

## Product objective

SIPRAS Online is a school facility and asset management workspace. It combines inventory monitoring, facility issue reporting, Lost and Found, and borrowing workflows for assets and rooms.

## Roles

| Permission | Warga Sekolah | Admin Sarpras |
|---|---:|---:|
| View school inventory | Yes | Yes |
| Submit facility report | Yes | Yes |
| View own reports | Yes | Yes, all school reports |
| Change report status | No | Yes |
| Submit Lost and Found entry | Yes | Yes |
| Verify Lost and Found status | No | Yes |
| Request asset/room borrowing | Yes | Yes |
| Approve/reject loan request | No | Yes |
| View room availability | Yes | Yes |
| Create/update inventory | No | Yes |
| Create/update rooms | No | Yes |
| View school settings | No | Yes |

The app currently supports these role codes: `warga_sekolah`, `admin`.

## Modules and key routes

| Route | Module | Main table |
|---|---|---|
| `/dashboard` | Overview and monitoring | assets, reports, loan_requests |
| `/inventaris` | Asset inventory and QR code | assets |
| `/laporan` | Damage/facility reporting | reports |
| `/lost-found` | Lost and Found | lost_found_items |
| `/peminjaman` | Borrowing requests | loan_requests |
| `/ruangan` | School rooms | rooms |
| `/pengaturan` | Workspace and service status | profiles, schools |

## State values

### Asset condition
`baik`, `rusak_ringan`, `rusak_berat`, `tidak_berfungsi`, `dalam_perbaikan`, `hilang`.

### Asset availability
`tersedia`, `dipinjam`, `dipesan`, `tidak_tersedia`.

Condition describes the physical state. Availability describes whether it can currently be used or borrowed. Keep these as separate concepts.

### Report status
`menunggu_verifikasi`, `terverifikasi`, `dalam_penanganan`, `selesai`, `ditolak`.

### Lost and Found status
`menunggu_verifikasi`, `dipublikasikan`, `diklaim`, `dikembalikan`, `ditutup`.

### Loan status
`menunggu`, `disetujui`, `ditolak`, `dipinjam`, `dikembalikan`.

## Suggested team ownership

- **Frontend:** page layout, responsive behavior, forms, accessibility, loading/error/empty states.
- **Backend / Supabase:** schema changes, RLS review, storage policy, account provisioning, backups.
- **Product / QA:** confirm school workflows, acceptance criteria, user testing, and release notes.

## MVP acceptance checklist

- [ ] A Warga Sekolah account cannot open Admin-only write actions.
- [ ] An Admin Sarpras account can add an asset and update its condition.
- [ ] Every record created in Supabase has the authenticated user's `school_id` and `created_by` where applicable.
- [ ] School A users cannot read School B records when tested with separate accounts.
- [ ] A Warga Sekolah user can submit a facility report and see its current status.
- [ ] Admin can update a report status and the reporter can see the updated status.
- [ ] Users can submit Lost and Found entries; Admin can change their publication/return status.
- [ ] Users can submit a borrowing request; Admin can approve or reject it.
- [ ] Date validation prevents a return date earlier than the borrowing date.
- [ ] Upload policies prevent a user from accessing another school's private media.
- [ ] All flows work at desktop and mobile widths.

## Next engineering increments

1. Add a dedicated `claims` workflow for Lost and Found, including safe ownership verification.
2. Add date/time slot conflict checks for room and equipment reservations.
3. Add signed-URL retrieval and private attachment preview/download.
4. Add server-side validation and audit-log creation for every admin state change.
5. Add notifications (in-app first; email/WhatsApp only after credentials and consent are configured).
6. Add a platform-level SaaS operator role and tenant onboarding flow, separately from the two school-facing roles.
7. Add automated tests for role access, RLS, and tenant isolation.
