

## Clear Account History for Ryan & Filippa (4 accounts)

### Accounts to clear
| Email | User ID |
|---|---|
| ryancekander@gmail.com | ce1bd356-5e41-4327-ab15-959b60630c23 |
| cekander.ryan@gmail.com | 74648ab8-6727-47a1-950d-a10d0bf41808 |
| filippa.cekander@gmail.com | 4e4e3b52-474b-4453-a767-86b826b632bf |
| filippa.cekander@bonkistudio.com | ca36b0ea-0a2f-460c-9a2a-067d308737b7 |

### Couple spaces to delete
- `83876564-8ba1-487c-9b84-b6ee95b931be` (cekander.ryan)
- `20f53346-c897-46bd-ae83-2d3e8b073e71` (ryancekander + filippa gmail — shared)
- `04061f3a-eb56-4f6b-b27e-af3316e283e8` (filippa gmail)
- `2f7568ba-f4c2-4e26-8fac-9f4ec1eff626` (ryancekander — note: was previously cleared for emma/sofia, but ryan is also a member)
- `588414e7-c696-4813-8440-0efbef7a47c1` (filippa bonkistudio)

### Implementation
Single SQL migration following the exact same pattern as the previous account reset. Deletes rows across ~24 tables in FK-dependency order, preserving `auth.users` entries so the accounts can log in fresh.

### File
- New migration: `supabase/migrations/<timestamp>.sql`

