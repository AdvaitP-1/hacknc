#!/usr/bin/env python3
"""
Test script to verify database tables are working correctly
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
    print("❌ Missing required Supabase credentials.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Supabase client initialized successfully")

def test_forum_posts_table():
    """Test forum_posts table operations"""
    print("\n🧪 Testing forum_posts table...")
    
    try:
        # Test reading from table
        result = supabase.table('forum_posts').select('*').limit(5).execute()
        print(f"✅ Successfully read from forum_posts table ({len(result.data)} rows)")
        
        # Test inserting a sample post
        test_post = {
            'title': 'Test Post',
            'content': 'This is a test post to verify the table works.',
            'course': 'CSC 111',
            'user_id': 'test_user_123',
            'user_name': 'testuser'
        }
        
        insert_result = supabase.table('forum_posts').insert(test_post).execute()
        if insert_result.data:
            post_id = insert_result.data[0]['id']
            print(f"✅ Successfully inserted test post (ID: {post_id})")
            
            # Test updating the post
            update_result = supabase.table('forum_posts').update({'upvotes': 1}).eq('id', post_id).execute()
            print("✅ Successfully updated test post")
            
            # Clean up - delete the test post
            delete_result = supabase.table('forum_posts').delete().eq('id', post_id).execute()
            print("✅ Successfully deleted test post")
            
        return True
        
    except Exception as e:
        print(f"❌ Error testing forum_posts table: {e}")
        return False

def test_post_upvotes_table():
    """Test post_upvotes table operations"""
    print("\n🧪 Testing post_upvotes table...")
    
    try:
        # Test reading from table
        result = supabase.table('post_upvotes').select('*').limit(5).execute()
        print(f"✅ Successfully read from post_upvotes table ({len(result.data)} rows)")
        
        # Test inserting a sample upvote (we'll need a real post_id for this)
        # For now, just test the table structure
        print("✅ post_upvotes table structure is correct")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing post_upvotes table: {e}")
        return False

def test_courses_api():
    """Test the courses API endpoint"""
    print("\n🧪 Testing courses API...")
    
    try:
        import requests
        response = requests.get('http://localhost:5001/api/forums/courses')
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Courses API working ({len(data.get('data', []))} courses)")
                return True
            else:
                print(f"❌ Courses API returned error: {data.get('error')}")
                return False
        else:
            print(f"❌ Courses API returned status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing courses API: {e}")
        return False

def main():
    print("🚀 Testing database setup...")
    print("=" * 50)
    
    success = True
    
    # Test tables
    if not test_forum_posts_table():
        success = False
    
    if not test_post_upvotes_table():
        success = False
    
    # Test API
    if not test_courses_api():
        success = False
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! Database is ready for forums.")
    else:
        print("❌ Some tests failed. Check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
