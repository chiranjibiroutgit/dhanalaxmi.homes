# Dhanalaxmi Group — Developer Panel & Management System

## Overview

Three-tier management system built on top of the public React marketplace:

| Panel | URL | Access | Purpose |
|-------|-----|--------|---------|
| Public Marketplace | `/` | Public | Browse properties, search, inquiries |
| Dev Panel | `/devs.panel` | Founder + Developer | System-wide data, inquiries, analytics, access management |
| Admin Panel | `/admin.panel` | 50 Property Owners | Own listings, leads, site visits |
| Dev Edit Panel | `/dev.edit.panel` | Founder + Developer | Visual canvas editor, Cancel/Save, GitHub commit |

## Authentication

- **Google Login only** — no password storage in frontend
- **Authorized emails:**
  - Founder (Super Admin): `lingarajroutwork@gmail.com`
  - Developer: `chiranjibi987@gmail.com`
  - Property Owners: 50 invited emails (added via Dev Panel)
- **Role-based access:** `super_admin`, `developer`, `property_owner`

## Access Management

Located in `/devs.panel` → **Property Owner Access** section:

- Invite up to 50 property owners by email
- Each owner gets Google Login access to `/admin.panel` only
- Owner data is isolated by `owner_id` — Owner A cannot see Owner B's properties
- Founder/Developer can suspend or remove owner access

## Dev Edit Panel — Visual Canvas

- Click any element on the live preview to edit text, colors, images
- **Top-right controls:** `Save` (draft to Firestore) / `Commit & Push` (GitHub)
- **Review-first deployment:** No direct deploy. Changes must be reviewed and approved before GitHub commit
- GitHub Actions triggers Firebase Hosting redeploy after push

## Security

- Firebase Auth ID token verified on backend for all panel requests
- GitHub PAT stored in Firebase Secrets (never in frontend)
- Canvas edits are schema-validated before saving
- Audit log tracks who changed what, from which panel

## WhatsApp Alerts

Number: `+91 8917622925`

Alerts sent for:
- New property inquiries
- Site visit bookings
- Canvas edit saves
- Owner invitations

## Development Roadmap

1. **Phase 1:** Auth + role guards (done)
2. **Phase 2:** Admin Panel property CRUD
3. **Phase 3:** Dev Panel global management + analytics
4. **Phase 4:** Dev Edit Canvas + GitHub integration
5. **Phase 5:** WhatsApp alerts + founder dashboard

## Files

```
src/
├── context/AuthContext.jsx      # Google Login + role management
├── components/
│   ├── PanelGuard.jsx           # Role-based route protection
├── components/LoginPanel.jsx    # Google Login simulation UI
├── components/PanelSidebar.jsx  # Panel navigation
├── components/AccessManagement.jsx  # Owner invite/manage
├── components/DevPanel.jsx      # System management hub
├── components/AdminPanel.jsx    # Property owner portal
└── components/DevEditPanel.jsx  # Visual canvas editor
```
