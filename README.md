# KéjaLink — Project Documentation

> Verified house listings platform for Kenya. Every listing is physically verified by a moderator before going live.

---

## Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | Next.js 15 (App Router), TailwindCSS, shadcn/ui |
| Auth         | Clerk v7                                        |
| Database     | Supabase (PostgreSQL)                           |
| Image Storage| Cloudinary                                      |
| State        | TanStack Query v5                               |
| Notifications| Sonner                                          |
| Deployment   | Vercel (planned)                                |

---

## Project Structure

```
app/
├── (auth)/                         # Auth pages
│   ├── sign-in/[[...sign-in]]/
│   ├── sign-up/[[...sign-up]]/
│   └── layout.tsx
├── (landing)/                      # Public landing
│   ├── landing-page-client.tsx
│   └── page.tsx
├── onboarding-details/             # Phone capture post-signup
├── become-a-landlord/              # Landlord application
├── unit/[unitId]/                  # Unit detail page
├── banned/                         # Banned user page
├── dashboard/
│   ├── landlord/                   # Landlord dashboard
│   │   ├── page.tsx
│   │   └── properties/
│   │       ├── page.tsx
│   │       ├── new/
│   │       └── [propertyId]/
│   ├── moderator/                  # Moderator dashboard
│   │   ├── page.tsx
│   │   ├── queue/
│   │   ├── properties/
│   │   │   └── [propertyId]/
│   │   │       └── images/
│   │   ├── images/
│   │   └── activity/
│   └── admin/                      # Admin dashboard
│       ├── page.tsx
│       ├── moderators/
│       ├── landlords/
│       ├── users/
│       ├── properties/
│       ├── metrics/
│       └── activity/
└── api/
    ├── webhooks/clerk/             # Clerk → Supabase sync
    ├── listings/                   # Public listings
    ├── onboarding/                 # Phone number capture
    ├── landlord/
    │   └── properties/
    │       └── [propertyId]/
    │           ├── submit/
    │           └── units/
    │               └── [unitTypeId]/
    │                   └── availability/
    ├── moderator/
    │   ├── queue/
    │   ├── claim/
    │   ├── approve/
    │   ├── reject/
    │   ├── activity/
    │   └── properties/
    │       └── [propertyId]/
    │           ├── approve/
    │           ├── reject/
    │           ├── score/
    │           └── images/
    │               └── [imageId]/
    │                   └── cover/
    └── admin/
        ├── moderators/
        ├── landlords/
        ├── users/
        ├── properties/
        ├── metrics/
        └── activity/
```

---

## Database Schema

### `profiles`
| Column             | Type      | Notes                              |
|--------------------|-----------|------------------------------------|
| id                 | text PK   | Clerk user ID                      |
| email              | text      | Unique                             |
| username           | text      | Unique                             |
| full_name          | text      |                                    |
| first_name         | text      |                                    |
| last_name          | text      |                                    |
| avatar_url         | text      |                                    |
| phone_number       | text      | 2547XXXXXXXX format, unique        |
| role               | enum      | user/landlord/moderator/admin/superadmin |
| onboarding_status  | enum      | pending/complete                   |
| is_active          | boolean   | Soft delete                        |
| is_banned          | boolean   | Ban flag                           |
| heard_from         | text      | Acquisition source                 |

### `landlord_profiles`
| Column               | Type    | Notes                          |
|----------------------|---------|--------------------------------|
| id                   | uuid PK |                                |
| user_id              | text FK | → profiles.id                  |
| full_name            | text    |                                |
| phone_number         | text    |                                |
| whatsapp_number      | text    |                                |
| county               | text    |                                |
| location             | text    |                                |
| number_of_properties | int     |                                |
| number_of_units      | int     |                                |
| notes                | text    |                                |
| status               | enum    | pending/approved/rejected/suspended |
| reviewed_by          | text FK | → profiles.id                  |
| reviewed_at          | timestamptz |                            |
| rejection_reason     | text    |                                |

### `properties`
| Column            | Type      | Notes                             |
|-------------------|-----------|-----------------------------------|
| id                | uuid PK   |                                   |
| landlord_id       | text FK   | → profiles.id                     |
| name              | text      |                                   |
| description       | text      |                                   |
| county            | text      |                                   |
| location          | text      |                                   |
| address           | text      |                                   |
| status            | enum      | draft/pending_review/approved/rejected/suspended |
| submitted_at      | timestamptz |                                 |
| approved_by       | text FK   | → profiles.id                     |
| approved_at       | timestamptz |                                 |
| rejection_reason  | text      |                                   |
| suspended_reason  | text      |                                   |
| moderator_notes   | text      |                                   |
| score_security    | int       | 1–10                              |
| score_water       | int       | 1–10                              |
| score_electricity | int       | 1–10                              |
| score_road_access | int       | 1–10                              |
| score_amenities   | int       | 1–10                              |
| score_cleanliness | int       | 1–10                              |
| score_lighting    | int       | 1–10                              |
| score_sanitation  | int       | 1–10                              |
| score_value       | int       | 1–10                              |
| score_landlord    | int       | 1–10                              |
| total_score       | int       | Generated column (sum of scores)  |
| scored_by         | text FK   | → profiles.id                     |
| scored_at         | timestamptz |                                 |

### `unit_types`
| Column          | Type    | Notes                              |
|-----------------|---------|------------------------------------|
| id              | uuid PK |                                    |
| property_id     | uuid FK | → properties.id                    |
| type            | enum    | single_room/double_room/bedsitter/studio/1br/2br/3br/4br_plus/commercial |
| price           | int     | KES per month                      |
| description     | text    |                                    |
| amenities       | text[]  |                                    |
| total_count     | int     | Total units of this type           |
| available_count | int     | Currently vacant                   |
| status          | enum    | draft/active/suspended             |
| unlock_count    | int     | Analytics counter                  |

### `unit_images`
| Column              | Type    | Notes                         |
|---------------------|---------|-------------------------------|
| id                  | uuid PK |                               |
| unit_type_id        | uuid FK | → unit_types.id               |
| cloudinary_image_id | text    | Cloudinary public_id          |
| image_url           | text    | Cloudinary secure_url         |
| uploaded_by         | text FK | → profiles.id (moderator)     |
| is_cover            | boolean |                               |

### `contact_unlocks`
| Column      | Type    | Notes               |
|-------------|---------|---------------------|
| id          | uuid PK |                     |
| unit_type_id| uuid FK | → unit_types.id     |
| user_id     | text FK | → profiles.id       |
| unlocked_at | timestamptz |                 |

### `activity_logs`
| Column      | Type    | Notes                              |
|-------------|---------|------------------------------------|
| id          | uuid PK |                                    |
| actor_id    | text FK | → profiles.id                      |
| action      | text    | e.g. approved_property             |
| target_type | text    | e.g. properties                    |
| target_id   | text    |                                    |
| metadata    | jsonb   | Action-specific data               |
| created_at  | timestamptz |                                |

### `public_listings` (VIEW)
Dynamically returns unit types where:
- `properties.status = 'approved'`
- `unit_types.status = 'active'`
- `unit_types.available_count > 0`
- At least one image exists
- Ordered by `total_score DESC`

---

## Roles & Permissions

| Role        | Can Do                                                          |
|-------------|-----------------------------------------------------------------|
| user        | Browse listings, unlock contacts, apply to be landlord          |
| landlord    | CRUD properties/units, manage availability, submit for review   |
| moderator   | Review landlord apps, review properties, upload images, score   |
| admin       | Manage moderators/landlords/users, view metrics, activity logs  |
| superadmin  | Everything admin + manage admins, system config                 |

---

## Roles in Clerk `publicMetadata`

```json
{
  "role": "user",
  "is_banned": false,
  "is_active": true,
  "onboarding_status": "complete"
}
```

> ⚠️ Middleware reads role from `sessionClaims.publicMetadata` — always update Clerk metadata when changing roles, not just Supabase.

---

## Key Flows

### New User Signup
```
Sign up (/sign-up) 
  → Clerk creates user 
  → Webhook fires → profile created in Supabase with role: user
  → Redirect to /onboarding-details 
  → Phone number captured → saved to Supabase + Clerk metadata
  → Redirect to /
```

### Landlord Application
```
User visits /become-a-landlord 
  → Fills form → submitted to landlord_profiles (status: pending)
  → Moderator reviews in /dashboard/moderator/queue
  → Approve → role updated to landlord in Supabase + Clerk
  → Landlord can now access /dashboard/landlord
```

### Property Listing Flow
```
Landlord creates property (status: draft)
  → Adds unit types
  → Submits for review (status: pending_review)
  → Moderator reviews in /dashboard/moderator/properties
  → Approve → property status: approved
  → Moderator uploads images per unit type
  → Moderator scores property (10 metrics → total out of 100)
  → Landlord activates unit types (status: active)
  → Landlord sets available_count > 0
  → Unit appears in public_listings view → shows on homepage
```

### Contact Unlock Flow
```
User visits /unit/[unitId] (must be signed in)
  → Clicks "Unlock Contact"
  → Contact details revealed (free for MVP)
  → Unlock logged to contact_unlocks table
```

---

## Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding-details

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=kejalink_units
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Clerk Session Token Template

Add this in Clerk Dashboard → Sessions → Customize session token:

```json
{
  "publicMetadata": "{{user.public_metadata}}"
}
```

---

## Scoring System

Moderators score approved properties across 10 metrics (1–10 each):

| # | Metric                  |
|---|-------------------------|
| 1 | Security                |
| 2 | Water availability      |
| 3 | Electricity reliability |
| 4 | Road access             |
| 5 | Proximity to amenities  |
| 6 | Cleanliness             |
| 7 | Lighting & ventilation  |
| 8 | Bathroom & sanitation   |
| 9 | Value for money         |
|10 | Landlord responsiveness |

`total_score` is a **generated column** — auto-calculated by Supabase whenever any score field changes. Homepage listings are ranked highest score first.

---

## Remaining / Roadmap

- [ ] Mpesa integration (paid contact unlocks)
- [ ] Cloudinary fully wired (currently stubbed)
- [ ] Email notifications (approval/rejection alerts)
- [ ] Google Maps integration
- [ ] Superadmin dashboard
- [ ] Supabase Realtime (live availability updates)
- [ ] Production deployment (Vercel + custom domain)
- [ ] PWA / mobile app

---

## Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Webhook tunnel (Cloudflare Tunnel — recommended)
cloudflared tunnel --url http://localhost:3000

# Or ngrok
ngrok http 3000
```

---

*Built by AlexMwita · KéjaLink © 2026*


[
  {
    "table_name": "activity_logs",
    "columns": [
      {
        "column_name": "id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": "gen_random_uuid()"
      },
      {
        "column_name": "actor_id",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "action",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "target_type",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "target_id",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "metadata",
        "data_type": "jsonb",
        "is_nullable": "YES",
        "column_default": "'{}'::jsonb"
      },
      {
        "column_name": "created_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      }
    ]
  },
  {
    "table_name": "contact_unlocks",
    "columns": [
      {
        "column_name": "id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": "gen_random_uuid()"
      },
      {
        "column_name": "unit_type_id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "user_id",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "unlocked_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      }
    ]
  },
  {
    "table_name": "landlord_profiles",
    "columns": [
      {
        "column_name": "id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": "gen_random_uuid()"
      },
      {
        "column_name": "user_id",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "full_name",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "phone_number",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "county",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "location",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "number_of_properties",
        "data_type": "integer",
        "is_nullable": "NO",
        "column_default": "1"
      },
      {
        "column_name": "number_of_units",
        "data_type": "integer",
        "is_nullable": "NO",
        "column_default": "1"
      },
      {
        "column_name": "status",
        "data_type": "USER-DEFINED",
        "is_nullable": "NO",
        "column_default": "'pending'::landlord_status"
      },
      {
        "column_name": "reviewed_by",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "reviewed_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "rejection_reason",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "created_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      },
      {
        "column_name": "updated_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      },
      {
        "column_name": "whatsapp_number",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "notes",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "assigned_moderator_id",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "claimed_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "YES",
        "column_default": null
      }
    ]
  },
  {
    "table_name": "profiles",
    "columns": [
      {
        "column_name": "id",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "email",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "username",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "full_name",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "first_name",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "last_name",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "avatar_url",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "phone_number",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "role",
        "data_type": "USER-DEFINED",
        "is_nullable": "NO",
        "column_default": "'user'::user_role"
      },
      {
        "column_name": "onboarding_status",
        "data_type": "USER-DEFINED",
        "is_nullable": "NO",
        "column_default": "'pending'::onboarding_status"
      },
      {
        "column_name": "is_active",
        "data_type": "boolean",
        "is_nullable": "NO",
        "column_default": "true"
      },
      {
        "column_name": "created_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      },
      {
        "column_name": "updated_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      },
      {
        "column_name": "is_banned",
        "data_type": "boolean",
        "is_nullable": "NO",
        "column_default": "false"
      },
      {
        "column_name": "heard_from",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      }
    ]
  },
  {
    "table_name": "properties",
    "columns": [
      {
        "column_name": "id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": "gen_random_uuid()"
      },
      {
        "column_name": "landlord_id",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "name",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "description",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "county",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "location",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "address",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "status",
        "data_type": "USER-DEFINED",
        "is_nullable": "NO",
        "column_default": "'draft'::property_status"
      },
      {
        "column_name": "submitted_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "approved_by",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "approved_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "rejection_reason",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "suspended_reason",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "score_security",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "score_water",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "score_electricity",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "score_road_access",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "score_amenities",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "score_cleanliness",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "score_lighting",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "score_sanitation",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "score_value",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "score_landlord",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "total_score",
        "data_type": "integer",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "scored_by",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "scored_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "created_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      },
      {
        "column_name": "updated_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      },
      {
        "column_name": "moderator_notes",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      }
    ]
  },
  {
    "table_name": "unit_images",
    "columns": [
      {
        "column_name": "id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": "gen_random_uuid()"
      },
      {
        "column_name": "unit_type_id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "cloudinary_image_id",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "image_url",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "uploaded_by",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "is_cover",
        "data_type": "boolean",
        "is_nullable": "NO",
        "column_default": "false"
      },
      {
        "column_name": "created_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      }
    ]
  },
  {
    "table_name": "unit_types",
    "columns": [
      {
        "column_name": "id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": "gen_random_uuid()"
      },
      {
        "column_name": "property_id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "type",
        "data_type": "USER-DEFINED",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "price",
        "data_type": "integer",
        "is_nullable": "NO",
        "column_default": null
      },
      {
        "column_name": "description",
        "data_type": "text",
        "is_nullable": "YES",
        "column_default": null
      },
      {
        "column_name": "amenities",
        "data_type": "ARRAY",
        "is_nullable": "YES",
        "column_default": "'{}'::text[]"
      },
      {
        "column_name": "total_count",
        "data_type": "integer",
        "is_nullable": "NO",
        "column_default": "1"
      },
      {
        "column_name": "available_count",
        "data_type": "integer",
        "is_nullable": "NO",
        "column_default": "0"
      },
      {
        "column_name": "status",
        "data_type": "USER-DEFINED",
        "is_nullable": "NO",
        "column_default": "'draft'::unit_status"
      },
      {
        "column_name": "created_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      },
      {
        "column_name": "updated_at",
        "data_type": "timestamp with time zone",
        "is_nullable": "NO",
        "column_default": "now()"
      },
      {
        "column_name": "unlock_count",
        "data_type": "integer",
        "is_nullable": "NO",
        "column_default": "0"
      }
    ]
  }
]