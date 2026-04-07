# Lord's International School Group - App Controller

## Current State

- App opens to a Login page (`src/frontend/src/pages/Login.tsx`) with two choices on the portal step: "Principal Login" and "Parent Login".
- Principal panel has an "App Builder" option (`PrincipalAppBuilderPage.tsx`) accessible via the sidebar under "Server & Data" section.
- `PrincipalLayout.tsx` includes `appBuilderNavItem` in the sidebar nav with id `app-builder`.
- `App.tsx` imports and routes `PrincipalAppBuilderPage`, `CustomPanelPage`, `DynamicCustomPanelPage`.
- The App Builder chat lets principals type commands to create custom sidebar panels with predefined templates.

## Requested Changes (Diff)

### Add
- New **App Controller** login option on the landing page (portal step) alongside "Principal Login" and "Parent Login" -- appears as a third card.
- New `AppControllerPage.tsx` -- a full master control centre accessible after entering the App Controller password (`Admin@Lords2026` by default, changeable inside).
- App Controller features:
  1. **Master Student Manager**: View and manage ALL principals' student data class-wise. Can add, edit, delete students for any principal. Generate/reset parent passwords for any class.
  2. **Class-wise Password Manager**: Generate unique passwords for all students across all principals. View/copy/share credentials by class.
  3. **Broadcast Messenger**: Send notices, diary entries, or announcements to any class or all classes across all principals simultaneously.
  4. **Panel Builder (chat)**: Type plain language to create new sidebar panels/options in Principal panel or Parent panel. Identical to current App Builder functionality but now in App Controller.
  5. **App Settings**: Change App Controller password. View ICP canister ID. 
  6. **Overview Dashboard**: Quick stats -- total students, total principals, recent messages sent.
- App Controller has its own logout button.
- Login page: portal step now shows 3 cards (Principal, Parent, App Controller). App Controller card uses an admin/settings icon.

### Modify
- `Login.tsx`: Add `app-controller` step. Portal step renders 3 cards. New step shows password entry for App Controller (default: `Admin@Lords2026`). On correct password, calls `onLogin('app-controller')`.
- `App.tsx`: Handle `role === 'app-controller'` -- render `AppControllerPage`. Add logout handler that clears session and returns to login.
- `PrincipalLayout.tsx`: Remove `appBuilderNavItem` from sidebar. Remove `app-builder` from nav arrays.
- `PrincipalAppBuilderPage.tsx`: Keep the file (exports `CustomPanelPage` and `DynamicCustomPanelPage` still used by App.tsx for custom panel rendering in principal panel), but it will no longer be navigable from the principal sidebar.

### Remove
- "App Builder" nav item from the Principal panel sidebar.
- The route `app-builder` from principal panel navigation (but keep the page components for custom panel rendering).

## Implementation Plan

1. **Modify `Login.tsx`**:
   - Add `'app-controller'` to the `Step` type.
   - Add a third card to the portal step: "App Controller" with a settings/shield-check icon, description "Master control centre".
   - Add a new step for app-controller password entry (similar to principal-select step but single password field).
   - On correct password (`Admin@Lords2026` by default, or whatever is stored in `lords_app_controller_password`), call `onLogin('app-controller')`.
   - Save session with `role: 'app-controller'`.

2. **Modify `App.tsx`**:
   - Add `'app-controller'` to the `Role` type.
   - When `role === 'app-controller'`, render `AppControllerPage` instead of `PrincipalLayout` or `ParentView`.
   - Restore session for `app-controller` role on load.
   - Handle logout for app-controller.

3. **Modify `PrincipalLayout.tsx`**:
   - Remove `appBuilderNavItem` array and its usage from sidebar nav sections.
   - Remove `Wand2` icon import if unused.

4. **Create `AppControllerPage.tsx`** with tabs/sections:
   - Sidebar or tab navigation with: Dashboard, Students, Passwords, Broadcast, Panel Builder, Settings.
   - **Dashboard tab**: Show stats (total students per principal, total principals active).
   - **Students tab**: Select a principal from dropdown, then see/manage that principal's students class-wise. Ability to add/edit/delete students. Changes write to `lords_students_${principalId}` localStorage and sync to ICP backend.
   - **Passwords tab**: Select principal + class, see all students with their passwords. "Generate All Passwords" button generates unique strong passwords for the selected principal. Download CSV. Copy/WhatsApp share per student.
   - **Broadcast tab**: Write a message, select category (Notice/Diary/Announcement), select target (All Schools / specific principal / specific class), send. Writes to `lords_notices_${principalId}` and broadcasts via StorageEvent.
   - **Panel Builder tab**: Chat interface (identical to removed App Builder) -- type commands to create/remove custom panels for any principal.
   - **Settings tab**: Change App Controller password (stored in `lords_app_controller_password`). Display ICP Canister ID.
   - Logout button at the top.
