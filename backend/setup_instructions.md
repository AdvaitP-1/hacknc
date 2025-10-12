# Database Setup Instructions

## 🚀 Quick Setup (Recommended)

### Option 1: Use Supabase Dashboard (Easiest)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `ezhtahdquefgcfsiembe`
3. **Navigate to SQL Editor** (left sidebar)
4. **Copy and paste the SQL from `create_tables_sql.sql`**
5. **Click "Run"** to execute the SQL

### Option 2: Use Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref ezhtahdquefgcfsiembe

# Run the SQL file
supabase db reset --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.ezhtahdquefgcfsiembe.supabase.co:5432/postgres" --file create_tables_sql.sql
```

## 📋 What the SQL Creates

### Tables:
- **`forum_posts`**: Stores forum posts with title, content, course, user info, and upvotes
- **`post_upvotes`**: Tracks which users have upvoted which posts

### Indexes:
- Performance indexes on course, created_at, post_id, and user_id

### Security:
- Row Level Security (RLS) enabled
- Public read/write policies (adjust for production)

## ✅ Verification

After running the SQL, test the API:

```bash
# Test courses endpoint
curl http://localhost:5001/api/forums/courses

# Test posts endpoint (should return empty array)
curl "http://localhost:5001/api/forums/posts?course=CSC%20111"
```

## 🔧 Troubleshooting

If you get permission errors:
1. Check that RLS policies are correctly set
2. Verify your service role key has proper permissions
3. Make sure the tables exist in the `public` schema

## 📝 Next Steps

Once tables are created:
1. Test the forums page in your frontend
2. Try creating a post
3. Test upvoting functionality
4. Verify data persistence
