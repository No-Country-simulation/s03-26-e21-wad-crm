---
name: whatsapp-business-api
description: >
  WhatsApp Business Platform (Cloud API) - Complete reference for sending messages,
  receiving webhooks, managing templates, media, phone numbers, and account operations.
  Language-agnostic patterns for any project.
  Trigger: When working with WhatsApp Business API, Cloud API, WhatsApp messaging,
  WhatsApp webhooks, message templates, WhatsApp integration, Meta Graph API for WhatsApp.
license: MIT
metadata:
  author: gentle-ai
  version: "1.0"
  api_version: "v21.0"
  last_updated: "2026-03-31"
---

## When to Use

- Integrating WhatsApp Business Platform (Cloud API) into any project
- Sending messages (text, media, interactive, templates) via WhatsApp
- Receiving and processing inbound messages via webhooks
- Managing message templates (create, approve, categorize)
- Uploading/downloading media files
- Managing phone numbers and WABA (WhatsApp Business Account)
- Building chatbots, notification systems, CRM integrations
- Implementing conversation-based messaging workflows

## Architecture Overview

```
┌──────────────┐     POST /{version}/{phone_id}/messages     ┌─────────────────┐
│   Your App   │ ──────────────────────────────────────────► │  Meta Graph API │
│  (Any Lang)  │ ◄────────────────────────────────────────── │  graph.facebook │
└──────────────┘         JSON Response                       │     .com        │
       ▲                                                      └────────┬────────┘
       │                                                              │
       │  POST (events)                                               │
       │  GET  (verification)                                         │
       └──────────────────────────────────────────────────────────────┘
                     Webhook Push Notifications
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **WABA** | WhatsApp Business Account — the top-level container |
| **Phone Number ID** | Unique ID for each registered phone number |
| **24-Hour Window** | Free-form messages only within 24h of customer's last reply |
| **Template Messages** | Pre-approved messages for initiating conversations outside 24h window |
| **Conversation-Based Pricing** | Meta charges per 24h conversation window, not per message |
| **Messaging Tiers** | New numbers: 250/24h → scale to unlimited via verification + quality |

## Base URL & Authentication

### Base URL

```
https://graph.facebook.com/v21.0
```

Current stable version: **v21.0** (as of early 2026). Check Meta docs for latest.

### Authentication

```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

### Access Token Types

| Type | Lifespan | Use Case |
|------|----------|----------|
| **Temporary** | ~24 hours | Testing/development only |
| **System User Token** | Never expires | Production — generate via Business Manager |

### Required Permissions

- `whatsapp_business_messaging` — Send/receive messages
- `whatsapp_business_management` — Manage templates, phone numbers, account

### Permanent Token Setup (Production)

1. Go to **Meta Business Manager** → Business Settings
2. **Users → System Users → Add** (role: Admin)
3. Select user → **Assign Assets** → select your WhatsApp app → **Full Control**
4. **Generate Token** with permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
5. Copy token — shown only once
6. Store as environment variable: `WA_ACCESS_TOKEN`

## Environment Variables

```bash
# Required
WA_ACCESS_TOKEN=your_permanent_access_token
WA_PHONE_NUMBER_ID=your_phone_number_id
WA_VERIFY_TOKEN=your_webhook_verify_token   # Custom string you define
WA_APP_SECRET=your_app_secret               # For webhook signature verification

# Optional
WA_API_VERSION=v21.0
WA_BASE_URL=https://graph.facebook.com
WA_WABA_ID=your_waba_id                     # WhatsApp Business Account ID
```

## Core Endpoints Reference

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/{version}/{phone-number-id}/messages` | Send any message type |

### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/{version}/{phone-number-id}/media` | Upload media |
| GET | `/{version}/{media-id}` | Get media URL (returns `url` field) |
| GET | `{url}` (from GET response) | Download binary media |

### Phone Numbers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/{version}/{waba-id}/phone_numbers` | List registered numbers |
| GET | `/{version}/{phone-number-id}` | Get phone number details |
| POST | `/{version}/{phone-number-id}/register` | Register a number |
| POST | `/{version}/{phone-number-id}/deregister` | Deregister a number |

### Templates (Business Management API)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/{version}/{waba-id}/message_templates` | List templates |
| POST | `/{version}/{waba-id}/message_templates` | Create template |
| GET | `/{version}/{template-id}` | Get template details |
| DELETE | `/{version}/{template-id}` | Delete template |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/{your-webhook-url}` | Verification (Meta sends this) |
| POST | `/{your-webhook-url}` | Event notifications |
| POST | `/{version}/{waba-id}/subscribed_apps` | Subscribe app to WABA |
| GET | `/{version}/{waba-id}/subscribed_apps` | Verify subscription |

## Sending Messages

### Common Request Structure

All messages share this base structure:

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "<E.164_PHONE_NUMBER>",
  "type": "<MESSAGE_TYPE>"
}
```

- **Phone format**: E.164 — country code without `+`, no spaces, no leading zeros
  - Correct: `14155551234`
  - Incorrect: `+1 (415) 555-1234`, `04155551234`
- **`messaging_product`**: Always `"whatsapp"`
- **`recipient_type`**: Always `"individual"` (for now)

### Text Message

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "Your order #12345 is on its way!"
  }
}
```

- `preview_url`: Set `true` to generate link previews
- `body`: Max 4096 characters

### Image Message

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg",
    "caption": "Here's your product photo"
  }
}
```

Or by media ID (pre-uploaded):

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "image",
  "image": {
    "id": "<MEDIA_ID>",
    "caption": "Here's your product photo"
  }
}
```

### Document Message

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "document",
  "document": {
    "link": "https://example.com/invoice.pdf",
    "caption": "Your invoice",
    "filename": "invoice_12345.pdf"
  }
}
```

### Video Message

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "video",
  "video": {
    "link": "https://example.com/video.mp4",
    "caption": "Product demo"
  }
}
```

### Audio Message

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "audio",
  "audio": {
    "link": "https://example.com/voice.ogg"
  }
}
```

### Sticker Message

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "sticker",
  "sticker": {
    "link": "https://example.com/sticker.webp"
  }
}
```

### Location Message

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "location",
  "location": {
    "longitude": -122.42533,
    "latitude": 37.758056,
    "name": "Meta Headquarters",
    "address": "1601 Willow Rd, Menlo Park, CA 94025"
  }
}
```

### Contacts Message

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "contacts",
  "contacts": [
    {
      "name": {
        "formatted_name": "John Doe",
        "first_name": "John",
        "last_name": "Doe"
      },
      "phones": [
        {
          "phone": "+14155551234",
          "type": "CELL"
        }
      ]
    }
  ]
}
```

### Interactive — Reply Buttons (max 3)

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "header": {
      "type": "text",
      "text": "Order Status"
    },
    "body": {
      "text": "Your order #12345 is out for delivery. What would you like to do?"
    },
    "footer": {
      "text": "Powered by YourBrand"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": { "id": "track_order", "title": "Track Shipment" }
        },
        {
          "type": "reply",
          "reply": { "id": "contact_support", "title": "Contact Support" }
        },
        {
          "type": "reply",
          "reply": { "id": "change_address", "title": "Change Address" }
        }
      ]
    }
  }
}
```

### Interactive — List Message (max 10 options)

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "header": {
      "type": "text",
      "text": "Help & Support"
    },
    "body": {
      "text": "How can we help you? Select a topic:"
    },
    "action": {
      "button": "Select Topic",
      "sections": [
        {
          "title": "Orders",
          "rows": [
            { "id": "order_status", "title": "Order Status", "description": "Where is my package?" },
            { "id": "order_cancel", "title": "Cancellation", "description": "Cancel my order" },
            { "id": "order_return", "title": "Returns", "description": "Return an item" }
          ]
        },
        {
          "title": "Products",
          "rows": [
            { "id": "product_info", "title": "Product Advice", "description": "Help choosing" },
            { "id": "product_stock", "title": "Availability", "description": "Is item X in stock?" }
          ]
        }
      ]
    }
  }
}
```

### Template Message (outside 24h window)

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "template",
  "template": {
    "name": "order_shipped",
    "language": { "code": "en" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John" },
          { "type": "text", "text": "12345" },
          { "type": "text", "text": "FedEx Express" }
        ]
      }
    ]
  }
}
```

### Template with Header (media)

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "template",
  "template": {
    "name": "shipping_update",
    "language": { "code": "en" },
    "components": [
      {
        "type": "header",
        "parameters": [
          { "type": "image", "image": { "link": "https://example.com/package.jpg" } }
        ]
      },
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John" },
          { "type": "text", "text": "12345" }
        ]
      }
    ]
  }
}
```

### Template with Buttons

```json
{
  "messaging_product": "whatsapp",
  "to": "14155551234",
  "type": "template",
  "template": {
    "name": "appointment_reminder",
    "language": { "code": "en" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John" },
          { "type": "date_time", "date_time": { "fallback_value": "Tomorrow at 3pm" } }
        ]
      },
      {
        "type": "button",
        "sub_type": "quick_reply",
        "index": 0,
        "parameters": [
          { "type": "payload", "payload": "confirm_yes" }
        ]
      },
      {
        "type": "button",
        "sub_type": "quick_reply",
        "index": 1,
        "parameters": [
          { "type": "payload", "payload": "reschedule" }
        ]
      }
    ]
  }
}
```

## Template Categories

| Category | Purpose | Cost | Review Time |
|----------|---------|------|-------------|
| **Marketing** | Promotions, offers, product launches | Highest | 24-48h |
| **Utility** | Order confirmations, shipping updates, receipts | Lower | 24-48h |
| **Authentication** | OTP, login codes, account verification | Fixed/lowest | 24-48h |
| **Service** | Support ticket updates, ongoing task help | Low | 24-48h |

### Creating a Template via API

```json
POST /{version}/{waba-id}/message_templates
{
  "name": "order_shipped",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "body",
      "text": "Hi {{1}}, your order {{2}} has been shipped via {{3}}. Track it here: {{4}}"
    },
    {
      "type": "footer",
      "text": "Reply STOP to opt out"
    },
    {
      "type": "buttons",
      "buttons": [
        {
          "type": "QUICK_REPLY",
          "text": "Track Order"
        },
        {
          "type": "QUICK_REPLY",
          "text": "Contact Support"
        }
      ]
    }
  ]
}
```

### Template Rules

- Once approved, templates **cannot be edited** — create a new one
- Each template must have **one clear purpose** — no hybrid templates
- Utility templates must be **neutral** — no promotional content
- Authentication templates must be **short and clear** — no branding/slogans
- Variable format: `{{1}}`, `{{2}}`, etc.
- Max 1024 characters for body text

## Message Status Response

Successful send returns:

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "14155551234",
      "wa_id": "14155551234"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgMNDE1NTU1MTIzNBUCABIY..."
    }
  ]
}
```

## Webhooks

### Verification (GET)

When you register a webhook URL, Meta sends:

```
GET /your-webhook-url?
  hub.mode=subscribe&
  hub.verify_token=YOUR_VERIFY_TOKEN&
  hub.challenge=RANDOM_CHALLENGE_STRING
```

Your endpoint must:
1. Verify `hub.mode == "subscribe"`
2. Verify `hub.verify_token` matches your secret
3. Respond with `hub.challenge` value as plain text body + HTTP 200

### Event Notifications (POST)

Standard top-level structure:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "<WABA_ID>",
      "changes": [
        {
          "value": { ... },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Webhook Fields (Subscription Types)

| Field | Events |
|-------|--------|
| `messages` | Inbound messages + outbound status updates |
| `account_update` | Policy violations, account restrictions |
| `message_template_status_update` | Template APPROVED/REJECTED/PENDING/etc. |
| `phone_number_quality_update` | Quality rating changes (GREEN/YELLOW/RED) |
| `phone_number_name_update` | Display name approved/rejected |
| `business_capability_update` | Messaging tier changes |
| `security` | Security alerts |
| `flows` | WhatsApp Flows endpoint availability |

### Inbound Message Webhook

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WABA_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "14155552345",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": { "name": "Jane Doe" },
                "wa_id": "14155551234"
              }
            ],
            "messages": [
              {
                "from": "14155551234",
                "id": "wamid.HBgMNDE1NTU1MTIzNBUCABIY...",
                "timestamp": "1699000000",
                "type": "text",
                "text": { "body": "Hello, I need help with my order" }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Inbound Message Types

| `type` | Content Field | Description |
|--------|---------------|-------------|
| `text` | `text.body` | Plain text message |
| `image` | `image` | Image with `id`, `mime_type`, `caption`, `sha256` |
| `document` | `document` | Document with `id`, `filename`, `mime_type`, `caption` |
| `video` | `video` | Video with `id`, `mime_type`, `caption` |
| `audio` | `audio` | Audio with `id`, `mime_type`, `voice` (bool) |
| `sticker` | `sticker` | Sticker with `id`, `mime_type`, `animated` (bool) |
| `location` | `location` | `latitude`, `longitude`, `name`, `address` |
| `contacts` | `contacts` | Array of contact objects |
| `interactive` | `interactive` | Button/list reply — `type`, `button_reply` or `list_reply` |
| `reaction` | `reaction` | `message_id`, `emoji` |
| `order` | `order` | Product inquiry from catalog |
| `system` | `system` | Phone number changes, etc. |

### Interactive Button Reply Webhook

```json
{
  "messages": [
    {
      "from": "14155551234",
      "id": "wamid.HBgMNDE1NTU1MTIzNBUCABIY...",
      "timestamp": "1699000000",
      "type": "interactive",
      "interactive": {
        "type": "button_reply",
        "button_reply": {
          "id": "track_order",
          "title": "Track Shipment"
        }
      }
    }
  ]
}
```

### List Reply Webhook

```json
{
  "messages": [
    {
      "from": "14155551234",
      "id": "wamid.HBgMNDE1NTU1MTIzNBUCABIY...",
      "timestamp": "1699000000",
      "type": "interactive",
      "interactive": {
        "type": "list_reply",
        "list_reply": {
          "id": "order_status",
          "title": "Order Status",
          "description": "Where is my package?"
        }
      }
    }
  ]
}
```

### Message Status Webhook

```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "14155552345",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "statuses": [
              {
                "id": "wamid.HBgMNDE1NTU1MTIzNBUCABIY...",
                "status": "delivered",
                "timestamp": "1699000000",
                "recipient_id": "14155551234",
                "conversation": {
                  "id": "CONVERSATION_ID",
                  "origin": { "type": "utility" }
                },
                "pricing": {
                  "billable": true,
                  "pricing_model": "CBP",
                  "category": "utility"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `sent` | Message left Meta's servers |
| `delivered` | Message reached recipient's device |
| `read` | Recipient opened the message |
| `failed` | Message failed to send (check `errors` array) |
| `deleted` | Recipient deleted the message |

### Webhook Security — Signature Verification

Every POST includes `X-Hub-Signature-256` header:

```
X-Hub-Signature-256: sha256=<HMAC_SHA256_HASH>
```

Verification steps:
1. Get the **raw request body** (before any JSON parsing middleware)
2. Compute HMAC-SHA256 using your **App Secret** as the key
3. Compare with the header value (strip `sha256=` prefix)
4. Use **timing-safe comparison** to prevent timing attacks

## Media Operations

### Upload Media

```
POST /{version}/{phone-number-id}/media
Authorization: Bearer {TOKEN}
Content-Type: multipart/form-data

file: <binary_file>
type: <MIME_TYPE>
messaging_product: whatsapp
```

Response:
```json
{
  "id": "<MEDIA_ID>"
}
```

### Get Media URL

```
GET /{version}/{media-id}
Authorization: Bearer {TOKEN}
```

Response:
```json
{
  "messaging_product": "whatsapp",
  "url": "https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=...",
  "mime_type": "image/jpeg",
  "sha256": "...",
  "file_size": 12345,
  "id": "<MEDIA_ID>"
}
```

### Download Media

Use the `url` from the GET response:
```
GET {url}
Authorization: Bearer {TOKEN}
```

Returns binary file content.

### Media Limits

| Type | Max Size | Supported Formats |
|------|----------|-------------------|
| Image | 16 MB | JPEG, PNG |
| Video | 64 MB | MP4, 3GPP |
| Audio | 16 MB | OGG, MP3, AAC |
| Document | 100 MB | Any (PDF, DOC, XLS, PPT, etc.) |
| Sticker | 500 KB | WebP (static or animated) |

## Phone Numbers

### List Phone Numbers

```
GET /{version}/{waba-id}/phone_numbers
Authorization: Bearer {TOKEN}
```

Response:
```json
{
  "data": [
    {
      "id": "PHONE_NUMBER_ID",
      "display_phone_number": "+14155552345",
      "quality_rating": "GREEN",
      "verified_name": "Your Business",
      "code_verification_status": "VERIFIED",
      "platform_type": "CLOUD_API"
    }
  ]
}
```

### Register a Phone Number

```
POST /{version}/{phone-number-id}/register
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "pin": "123456"
}
```

The PIN is the SMS/voice verification code sent to the phone number.

## Pricing & 24-Hour Window

### The 24-Hour Rule

- When a customer messages you, a **24-hour session** opens
- Within this window: send **any message type** (free-form text, media, buttons)
- After 24h: only **template messages** allowed
- Each new customer message **resets** the 24h window

### Conversation Categories (Pricing)

| Category | Description | Relative Cost |
|----------|-------------|---------------|
| **Marketing** | Promotions, offers, brand awareness | Highest |
| **Utility** | Order confirmations, shipping, receipts | Lower |
| **Authentication** | OTP, login codes | Fixed/lowest |
| **Service** | User-initiated, support responses | Low |

### Free Tier

- First **1,000 service conversations** per month are free
- Utility templates sent **within an open 24h window** are free

### Cost Optimization

- Respond within the 24h window whenever possible
- Use utility templates for transactional messages
- Avoid marketing category unless truly promotional
- Monitor quality rating — low rating = higher costs + lower limits

## Messaging Limits

| Tier | Messages/24h | Requirement |
|------|-------------|-------------|
| **Tier 1** | 1,000 | Phone number verified |
| **Tier 2** | 10,000 | Business verified + good quality rating |
| **Tier 3** | 100,000 | Stable high quality over weeks |
| **Unlimited** | ∞ | Consistently high quality, no spam |

- New numbers start at **250 messages/24h** (testing tier)
- Rate limit: **80 messages/second** per phone number (upgradable to 1,000 MPS)
- Per-user pair rate limit: **1 message every 6 seconds**

## Error Handling

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `131030` | Invalid recipient number | Check E.164 format |
| `131031` | No active 24h window | Use a template message |
| `131047` | Re-engagement required | Customer must reply first (opt-in) |
| `131053` | Media URL not reachable | Make URL publicly accessible |
| `130429` | Rate limit reached | Throttle to max 80 msg/sec |
| `131026` | Message undeliverable | Number not on WhatsApp or blocked |
| `131006` | Service unavailable | Retry with backoff |
| `131008` | Message failed | Check message format |
| `368` | Temporary suspension | Wait 24h, improve quality |
| `100` | Invalid parameter | Check endpoint/path params |
| `190` | Invalid/expired token | Refresh token |

### Error Response Format

```json
{
  "error": {
    "message": "Unsupported post request.",
    "type": "OAuthException",
    "code": 100,
    "error_subcode": 131030,
    "fbtrace_id": "ABC123"
  }
}
```

## Best Practices

### 1. Acknowledge Webhooks Immediately

Return HTTP 200 **immediately**, then process asynchronously. Meta's timeout is 5-10 seconds.

```
Webhook Handler → Validate Signature → Enqueue → Return 200
                                           ↓
                                    Background Worker
                                    (DB, API calls, etc.)
```

### 2. Implement Idempotent Processing

Use message IDs as deduplication keys. Store processed IDs with TTL (Redis recommended).

### 3. Handle Out-of-Order Events

WhatsApp does NOT guarantee ordering. Use `timestamp` fields, not arrival order. Design state machines to be monotonic: `sent → delivered → read`, never backward.

### 4. Verify Webhook Signatures in Production

Always validate `X-Hub-Signature-256`. Use timing-safe comparison.

### 5. Subscribe App to WABA

Common gotcha: the webhook URL is configured but the app isn't subscribed to the WABA.

```
POST /{version}/{waba-id}/subscribed_apps
```

Verify with:
```
GET /{version}/{waba-id}/subscribed_apps
```

### 6. Monitor Quality & Template Status

Subscribe to `phone_number_quality_update` and `message_template_status_update` webhooks to catch issues before they impact messaging.

### 7. Plan for Capacity

- Each outbound message can generate up to 3 webhook callbacks (sent, delivered, read)
- Server should handle: **3x outgoing traffic + 1x incoming traffic**
- Retry bursts: when your endpoint recovers, expect a spike

### 8. Use Permanent Tokens in Production

Never use the 24h temporary token in production. Set up System User tokens.

### 9. Store Raw Webhook Payloads

Log every raw webhook payload to durable storage before processing. Meta has no replay API.

### 10. AI Policy Compliance (2026)

- **Allowed**: Task-specific bots (support, sales, booking)
- **Prohibited**: General-purpose AI assistants, "ask me anything" bots, bots impersonating humans
- Always disclose bot identity when appropriate

## Webhook Setup Checklist

1. [ ] Create endpoint that handles GET (verification) and POST (events)
2. [ ] Define a `WA_VERIFY_TOKEN` (custom secret string)
3. [ ] Register webhook URL in Meta App Dashboard → WhatsApp → Configuration
4. [ ] Subscribe to desired fields: `messages`, `account_update`, etc.
5. [ ] Subscribe app to WABA: `POST /{waba-id}/subscribed_apps`
6. [ ] Implement signature verification using `WA_APP_SECRET`
7. [ ] Implement idempotent processing with message ID deduplication
8. [ ] Set up async processing (message queue)
9. [ ] Add monitoring/alerting for webhook failures
10. [ ] Test with Meta's "Test" button in dashboard

## Common Gotchas

| Gotcha | Solution |
|--------|----------|
| Token expires after 24h | Use System User permanent token |
| Webhooks not arriving | Check WABA subscription via API |
| Template rejected | Check category match, remove promotional content from utility |
| Messages fail with 131031 | Outside 24h window — use template |
| Media download fails | URL expires — download immediately after getting URL |
| Duplicate webhook events | Implement idempotent processing with message ID |
| Events out of order | Use timestamps, not arrival order |
| Phone number already in use | Cannot use number active on WhatsApp/WhatsApp Business app |
| Rate limit 130429 | Throttle to 80 msg/sec, implement queue |
