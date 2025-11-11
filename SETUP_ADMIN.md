# Quick Admin Setup Guide

## Step 1: Create an Admin User

You need to first create an admin account and then add the admin role. Here's how:

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to Authentication > Users**
3. **Click "Add User" or sign up through your app**
4. **Copy the User ID** (UUID format like: `550e8400-e29b-41d4-a716-446655440000`)

5. **Go to SQL Editor**
6. **Run this command** (replace `YOUR_USER_ID` with the actual UUID):

```sql
INSERT INTO admin_roles (user_id, role, permissions)
VALUES ('YOUR_USER_ID', 'admin', '{}');
```

### Option B: Quick Test Admin

For quick testing, run this command in Supabase SQL Editor to make the first user an admin:

```sql
-- This makes the first user in your system an admin
INSERT INTO admin_roles (user_id, role, permissions)
SELECT id, 'admin', '{}'
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;
```

## Step 2: Log In

1. Log in to your application with the admin user credentials
2. Refresh the page after logging in
3. Look in the header - you should now see the "View Mode" / "Edit Mode" button

## Step 3: Verify Admin Access

To check if you're an admin, open browser console and run:

```javascript
// This will show your current admin status
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  const { data } = await supabase
    .from('admin_roles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  console.log('Admin Role:', data);
}
```

## Troubleshooting

### Still Don't See Edit Mode Button?

1. **Check if you're logged in**: Look for sign in/out options in your app
2. **Clear browser cache**: Hard refresh with Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. **Check admin role in database**:
   ```sql
   SELECT * FROM admin_roles;
   ```
4. **Check browser console for errors**: Press F12 and look for red errors

### Need to Add Authentication?

If your app doesn't have auth yet, you'll need to:

1. Set up Supabase Auth in your project
2. Add login/signup forms
3. Then add the admin role to your user

Let me know if you need help setting up authentication!

## Testing Without Auth (Development Only)

For quick testing during development, you can temporarily modify `AdminContext.tsx` to bypass auth:

**WARNING: Remove this before production!**

```typescript
// In AdminContext.tsx, temporarily set these:
const [isAdmin, setIsAdmin] = useState(true);  // Change to true
const [isEditMode, setIsEditMode] = useState(false);
```

This will show the edit button without requiring authentication, but **DO NOT deploy this to production**.
