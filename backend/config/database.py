"""
Database configuration and Supabase client initialization
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing required Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Supabase client initialized successfully")
