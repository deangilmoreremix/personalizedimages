# Admin Content Management System - User Guide

## Overview

A complete admin content management system has been implemented for your landing page, allowing authorized administrators to easily upload and manage images across different sections without touching any code.

## Features

- **In-Place Editing**: Edit mode that shows edit controls directly on landing page images
- **Image Upload Modal**: Drag-and-drop interface for uploading new images
- **Admin Dashboard**: Centralized view of all landing page images
- **Role-Based Access**: Secure admin authentication with role management
- **Revision History**: Automatic logging of all image changes
- **Real-Time Updates**: Changes appear immediately after upload

## Getting Started

### Step 1: Set Up Admin Account

First, you need to add an admin user to the database. Run this SQL command in your Supabase SQL Editor:

```sql
-- Replace 'YOUR_USER_ID' with your actual Supabase user ID
INSERT INTO admin_roles (user_id, role, permissions)
VALUES ('YOUR_USER_ID', 'admin', '{}');
```

To find your user ID:
1. Log in to your application
2. Open browser console
3. Run: `supabase.auth.getUser().then(d => console.log(d.data.user.id))`

### Step 2: Access Admin Features

Once you have admin privileges:

1. **Navigate to Admin Dashboard**: Visit `/admin` in your application
2. **Toggle Edit Mode**: Click the "Edit Mode" button in the header (visible only to admins)

### Step 3: Edit Landing Page Images

#### Method 1: Edit Mode (Recommended)

1. Click "Edit Mode" button in header
2. Navigate to any landing page section (Home, Features, etc.)
3. Hover over any image to see the "Edit Image" button
4. Click to open upload modal
5. Upload new image, add alt text, and save

#### Method 2: Admin Dashboard

1. Visit `/admin`
2. View all landing page images in one place
3. Click "Change Image" on any image card
4. Upload new image and save

## Image Management

### Upload Requirements

- **Max File Size**: 10MB
- **Supported Formats**: PNG, JPG, JPEG, WebP, GIF
- **Alt Text**: Required for accessibility
- **Title**: Optional caption/description

### Image Sections

The system manages images across these sections:

- **Hero Section** (`hero`): Main landing page image
- **Templates Showcase** (`templates`): 6 template preview images (3 video, 3 image)
- **Feature Showcase** (`features`): 4 feature card images

### Best Practices

1. **Image Dimensions**: Use images with consistent aspect ratios for each section
2. **Alt Text**: Write descriptive alt text for accessibility and SEO
3. **File Size**: Optimize images before upload (recommended under 1MB)
4. **Naming**: Use descriptive filenames for better organization

## Database Schema

### Tables Created

1. **`admin_roles`**: Stores admin user permissions
   - `user_id`: Reference to auth.users
   - `role`: admin, editor, or viewer
   - `permissions`: Custom permissions JSON

2. **`landing_page_images`**: Stores image data
   - `section`: Component section (hero, templates, features)
   - `slot`: Specific image slot (main_image, video_1, etc.)
   - `image_url`: Public URL to image
   - `alt_text`: Accessibility description
   - `is_active`: Whether image is currently live
   - `uploaded_by`: User who uploaded the image

3. **`content_revisions`**: Audit log of all changes
   - `landing_page_image_id`: Reference to image
   - `previous_image_url`: Old image URL
   - `new_image_url`: New image URL
   - `changed_by`: User who made the change

### Storage

All uploaded images are stored in Supabase Storage bucket: `landing-page-images`

## Security

### Row Level Security (RLS)

All tables have RLS enabled with these policies:

- **Public users**: Can only view active images
- **Admin users**: Can create, read, update images
- **Only admins**: Can manage admin roles

### Automatic Features

- **Revision Logging**: All changes are automatically logged
- **User Tracking**: System tracks who uploaded/changed each image
- **Timestamps**: Created and updated timestamps on all records

## Component Architecture

### Key Files

```
src/
├── services/
│   ├── adminService.ts              # Admin role management
│   └── landingPageContentService.ts # Image CRUD operations
├── contexts/
│   └── AdminContext.tsx             # Admin state management
├── components/
│   └── admin/
│       ├── EditableImage.tsx        # Wrapper for editable images
│       └── ImageUploadModal.tsx     # Upload interface
└── pages/
    └── AdminDashboard.tsx           # Admin control panel
```

### Integration Points

The system integrates with:
- `Hero.tsx`: Main hero image
- `TemplatesShowcase.tsx`: Template preview images
- `FeatureShowcase.tsx`: Feature card images
- `ModernHeader.tsx`: Edit mode toggle

## Admin Roles

### Available Roles

1. **Admin**: Full access to all features
2. **Editor**: Can edit images but not manage admin users
3. **Viewer**: Read-only access (future use)

### Managing Admins

To add more admin users:

```sql
INSERT INTO admin_roles (user_id, role, permissions)
VALUES ('USER_ID_HERE', 'admin', '{}');
```

To remove admin access:

```sql
DELETE FROM admin_roles WHERE user_id = 'USER_ID_HERE';
```

## Troubleshooting

### Images Not Loading

1. Check if storage bucket exists: Visit Supabase Storage
2. Verify bucket is public: Check bucket settings
3. Check RLS policies: Ensure they're not blocking access

### Can't Access Admin Features

1. Verify admin role: Check `admin_roles` table
2. Log out and log back in
3. Check browser console for errors

### Upload Fails

1. Check file size (must be under 10MB)
2. Verify file format (PNG, JPG, JPEG, WebP, GIF only)
3. Ensure alt text is provided
4. Check Supabase storage quota

## Future Enhancements

Potential improvements for the system:

- Image cropping tool
- Bulk upload functionality
- A/B testing for images
- Scheduled image changes
- Image analytics and tracking
- Mobile-responsive edit mode
- Image library with search
- Undo/redo functionality

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs
3. Verify database schema is up to date
4. Check storage bucket permissions

---

**Built with**: React, TypeScript, Supabase, Tailwind CSS, Framer Motion
