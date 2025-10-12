"""
Database configuration and Supabase client initialization

This module handles the connection to Supabase database and provides
a centralized database client for the entire application.

Author: StudyShare Team
Version: 1.0.0
"""

import os
import logging
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class DatabaseConfig:
    """
    Database configuration class for managing Supabase connection.
    
    This class provides a centralized way to manage database configuration
    and connection initialization with proper error handling.
    """
    
    def __init__(self):
        """Initialize database configuration"""
        self.url: Optional[str] = os.getenv("SUPABASE_URL")
        self.service_key: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.client: Optional[Client] = None
        
        self._validate_credentials()
        self._initialize_client()
    
    def _validate_credentials(self) -> None:
        """
        Validate that required Supabase credentials are present.
        
        Raises:
            ValueError: If required credentials are missing
        """
        if not self.url:
            raise ValueError(
                "Missing SUPABASE_URL environment variable. "
                "Please set it in your .env file."
            )
        
        if not self.service_key:
            raise ValueError(
                "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. "
                "Please set it in your .env file."
            )
        
        logger.info("Database credentials validated successfully")
    
    def _initialize_client(self) -> None:
        """
        Initialize the Supabase client with validated credentials.
        
        Raises:
            Exception: If client initialization fails
        """
        try:
            self.client = create_client(self.url, self.service_key)
            logger.info("✅ Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise Exception(f"Database connection failed: {e}")
    
    def get_client(self) -> Client:
        """
        Get the initialized Supabase client.
        
        Returns:
            Client: The Supabase client instance
            
        Raises:
            Exception: If client is not initialized
        """
        if not self.client:
            raise Exception("Database client not initialized")
        return self.client

# Global database configuration instance
db_config = DatabaseConfig()

# Export the client for use in other modules
supabase: Client = db_config.get_client()
