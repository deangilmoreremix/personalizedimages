# CORS Configuration Guide

This guide explains how to configure `ALLOWED_ORIGINS` for your Supabase Edge Functions to enable secure cross-origin requests.

## What is ALLOWED_ORIGINS?

`ALLOWED_ORIGINS` is a security setting that controls which domains can make requests to your Supabase Edge Functions. It prevents unauthorized websites from accessing your API endpoints.

## Quick Setup

### Option 1: Using the Setup Script (Recommended)

```bash
./setup-allowed-origins.sh
```

The script will guide you through:
1. Entering your production domain (optional)
2. Automatically configuring both local and production domains
3. Setting the secret in Supabase

### Option 2: Manual Setup

Set the secret directly using the Supabase CLI:

```bash
# For local development only
supabase secrets set ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000" --project-ref gyncvxxmvealrfnpnzhw

# For production + local development
supabase secrets set ALLOWED_ORIGINS="https://yourapp.com,https://www.yourapp.com,http://localhost:5173,http://localhost:3000" --project-ref gyncvxxmvealrfnpnzhw
```

## Configuration Examples

### Local Development Only
```
http://localhost:5173,http://localhost:3000
```

### Production with Single Domain
```
https://myapp.com,https://www.myapp.com,http://localhost:5173
```

### Multiple Environments
```
https://myapp.com,https://www.myapp.com,https://staging.myapp.com,http://localhost:5173,http://localhost:3000
```

## Prerequisites

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Verify your project is linked**:
   ```bash
   supabase link --project-ref gyncvxxmvealrfnpnzhw
   ```

## Verify Configuration

After setting up, verify the secret was saved:

```bash
supabase secrets list --project-ref gyncvxxmvealrfnpnzhw
```

You should see `ALLOWED_ORIGINS` in the list.

## How It Works

Your edge functions use this configuration in `/supabase/functions/_shared/cors.ts`:

```typescript
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:3000'];
```

When a request comes in, the function checks if the origin is in the allowed list before processing it.

## Troubleshooting

### CORS Errors Still Occurring

1. **Verify the secret is set**:
   ```bash
   supabase secrets list --project-ref gyncvxxmvealrfnpnzhw
   ```

2. **Check your domain format**:
   - Must include protocol (http:// or https://)
   - No trailing slashes
   - Exact match required (case-sensitive)

3. **Redeploy edge functions** after changing secrets:
   ```bash
   supabase functions deploy --project-ref gyncvxxmvealrfnpnzhw
   ```

### Testing CORS Locally

When running edge functions locally, make sure your `.env.local` file includes:

```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Security Best Practices

1. **Never use wildcards (`*`)** in production - always specify exact domains
2. **Include both www and non-www versions** of your domain if both are accessible
3. **Remove unused domains** to minimize attack surface
4. **Use HTTPS in production** - only use HTTP for localhost
5. **Update after domain changes** - if you change your domain, update this immediately

## Adding New Domains

To add a new domain:

1. Run the setup script again: `./setup-allowed-origins.sh`
2. Or manually update: `supabase secrets set ALLOWED_ORIGINS="existing,new-domain" --project-ref gyncvxxmvealrfnpnzhw`
3. Redeploy functions if needed

## Current Configuration

**Project Reference**: `gyncvxxmvealrfnpnzhw`
**Default Local Ports**: 5173 (Vite), 3000 (backup)

---

For more information, see `/supabase/functions/README.md`
