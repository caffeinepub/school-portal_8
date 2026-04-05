# Lord's International School Group — AI App Builder Upgrade

## Current State
The App Builder page (`PrincipalAppBuilderPage.tsx`) exists in the Principal panel under "Server & Data". It uses simple keyword matching to toggle 6 fixed pre-built panel templates (Transport, Fee Reminder, Notice Board, Events, Health, Library). It cannot create custom sections, has no real AI logic, and custom panels only show a "Coming Soon" placeholder.

## Requested Changes (Diff)

### Add
- **AI-powered chat engine** inside App Builder: parses natural language requests and dynamically creates real functional custom sections/panels
- **Dynamic panel schema**: each custom panel has a name, icon, description, and a set of custom fields defined by the principal (text, number, date, select, textarea)
- **Dynamic panel renderer**: renders a full functional page for each custom panel with data entry forms, save, list view, and delete — all stored in localStorage per principal
- **30+ built-in panel templates** the AI can suggest and create (Transport, Fees, Health, Library, Homework, Behavior, Staff, Events, Inventory, etc.)
- **"Create custom section"** flow: principal types anything like "add a transport tracker with bus number, route, driver name" and the AI creates a real panel with exactly those fields
- **Parent visibility toggle**: principal can choose whether a custom panel's data is visible to parents
- **Panel management**: list of all created panels with edit name/delete options
- **Undo last action** command in chat

### Modify
- `PrincipalAppBuilderPage.tsx`: full rewrite with AI chat engine, dynamic panel creation, and panel management UI
- `PrincipalLayout.tsx`: update custom panels section to render all dynamic panels (not just the 6 fixed ones) with their custom icons/names
- `App.tsx`: update custom panel routing to render `DynamicCustomPanelPage` for any `custom-*` route

### Remove
- Old 6-template keyword matching logic
- "Coming Soon" placeholder on custom panel pages
- Fixed `PANEL_TEMPLATES` and `CUSTOM_PANEL_ICONS/LABELS` maps (replaced by dynamic schema stored in localStorage)

## Implementation Plan
1. Define `CustomPanelDef` type: `{ id, name, icon, description, fields: FieldDef[], createdAt, visibleToParents }`
2. Define `FieldDef` type: `{ id, label, type: 'text'|'number'|'date'|'select'|'textarea', options?: string[] }`
3. Build AI chat engine with 30+ template suggestions + free-form field extraction from natural language
4. Build `DynamicCustomPanelPage` component: form + list view for any custom panel
5. Rewrite `PrincipalAppBuilderPage` with new chat UI + panel management grid
6. Update `PrincipalLayout` to load panels from `lords_dynamic_panels_{principalId}` key and render them with dynamic icons
7. Update `App.tsx` to import and route `DynamicCustomPanelPage`
