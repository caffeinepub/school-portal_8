# Lord's International School Group

## Current State
The Principal panel has separate sidebar items in a "Tools" section:
- Error Fix (id: error-fix)
- Storage & Backup (id: storage)
- Data Backup (id: data-backup)
- Data Server (id: data-server)

A "Class Records" feature was planned but not implemented as a separate page.

## Requested Changes (Diff)

### Add
- New `PrincipalServerPage.tsx` that unifies all server tools into one page with 5 tabs:
  1. Data Server
  2. Data Backup
  3. Storage & Backup
  4. Error Fix
  5. Class Records (new: shows all data sent to parents, organized by class, auto-saved)
- New `PrincipalPage` type value: `"server"`
- New nav label: `server: "Server"`

### Modify
- `PrincipalLayout.tsx`: Replace the 4 individual toolsNavItems with a single `{ id: "server", label: "Server", icon: Server }` item. The "Tools" section heading is replaced by a "Server" single item (can stay under a renamed section or be standalone).
- `App.tsx`: Add `"server"` to PrincipalPage union type; add `{principalPage === "server" && <PrincipalServerPage ... />}` render case.

### Remove
- Individual sidebar entries for error-fix, storage, data-backup, data-server (replaced by single "Server" entry)
- Their individual page renders in App.tsx (replaced by unified server page)

## Implementation Plan
1. Create `src/frontend/src/pages/PrincipalServerPage.tsx` with 5 tabs, embedding existing page components.
2. Update `PrincipalLayout.tsx` to replace toolsNavItems with single Server item.
3. Update `App.tsx` type union and render cases.
