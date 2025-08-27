import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def init_db():
    """Initialize database tables if they don't exist"""
    # Create users table
    try:
        supabase.table("users").select("*").limit(1).execute()
    except Exception:
        # Table doesn't exist, create it
        supabase.rpc("create_users_table").execute()

    # Create tasks table
    try:
        supabase.table("tasks").select("*").limit(1).execute()
    except Exception:
        # Table doesn't exist, create it
        supabase.rpc("create_tasks_table").execute()

def get_supabase():
    return supabase
