#!/usr/bin/env python3
"""
Database setup script for forums functionality
Creates the necessary tables in Supabase
"""
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing required Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Supabase client initialized successfully")

def create_forum_posts_table():
    """Create the forum_posts table"""
    sql = """
    CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        course VARCHAR(50) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        upvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    try:
        result = supabase.rpc('exec_sql', {'sql': sql}).execute()
        print("✅ Created forum_posts table")
        return True
    except Exception as e:
        print(f"❌ Error creating forum_posts table: {e}")
        return False

def create_post_upvotes_table():
    """Create the post_upvotes table"""
    sql = """
    CREATE TABLE IF NOT EXISTS post_upvotes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(post_id, user_id)
    );
    """
    
    try:
        result = supabase.rpc('exec_sql', {'sql': sql}).execute()
        print("✅ Created post_upvotes table")
        return True
    except Exception as e:
        print(f"❌ Error creating post_upvotes table: {e}")
        return False

def create_indexes():
    """Create indexes for better performance"""
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_forum_posts_course ON forum_posts(course);",
        "CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_post_upvotes_post_id ON post_upvotes(post_id);",
        "CREATE INDEX IF NOT EXISTS idx_post_upvotes_user_id ON post_upvotes(user_id);"
    ]
    
    for index_sql in indexes:
        try:
            supabase.rpc('exec_sql', {'sql': index_sql}).execute()
            print(f"✅ Created index: {index_sql.split()[5]}")
        except Exception as e:
            print(f"❌ Error creating index: {e}")

def test_tables():
    """Test that tables were created successfully"""
    try:
        # Test forum_posts table
        result = supabase.table('forum_posts').select('*').limit(1).execute()
        print("✅ forum_posts table is accessible")
        
        # Test post_upvotes table
        result = supabase.table('post_upvotes').select('*').limit(1).execute()
        print("✅ post_upvotes table is accessible")
        
        return True
    except Exception as e:
        print(f"❌ Error testing tables: {e}")
        return False

def main():
    print("🚀 Setting up database tables for forums...")
    print("=" * 50)
    
    success = True
    
    # Create tables
    if not create_forum_posts_table():
        success = False
    
    if not create_post_upvotes_table():
        success = False
    
    # Create indexes
    print("\n📊 Creating indexes...")
    create_indexes()
    
    # Test tables
    print("\n🧪 Testing tables...")
    if not test_tables():
        success = False
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Database setup completed successfully!")
        print("✅ All tables created and accessible")
    else:
        print("❌ Database setup completed with errors")
        sys.exit(1)

if __name__ == "__main__":
    main()
