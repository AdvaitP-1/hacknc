"""
Forums service layer for business logic and data operations

This module contains the business logic for forum operations,
separating concerns from the API routes and providing reusable
service functions.

Author: StudyShare Team
Version: 1.0.0
"""

import json
import os
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timezone
from config.database import supabase

logger = logging.getLogger(__name__)

class CourseDataService:
    """Service for managing course data operations"""
    
    @staticmethod
    def load_course_data() -> List[Dict[str, str]]:
        """
        Load course data from the JSON file.
        
        Returns:
            List[Dict[str, str]]: List of course dictionaries with course_code and course_name
            
        Raises:
            Exception: If file cannot be read or parsed
        """
        try:
            # Get the path to the course data file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            course_data_path = os.path.join(
                current_dir, '../../../webscrape/college_data/all_stem_majors.json'
            )
            
            logger.info(f"Loading course data from: {course_data_path}")
            
            with open(course_data_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            # Extract unique courses from all majors
            courses = set()
            majors_data = data.get('majors', [])
            
            for major in majors_data:
                # Add core courses
                for course in major.get('core_courses', []):
                    course_code = course.get('course_code', '').strip()
                    course_name = course.get('course_name', '').strip()
                    if course_code and course_name:
                        courses.add((course_code, course_name))
                
                # Add math/science requirements
                for course in major.get('math_science_requirements', []):
                    course_code = course.get('course_code', '').strip()
                    course_name = course.get('course_name', '').strip()
                    if course_code and course_name:
                        courses.add((course_code, course_name))
            
            course_list = [
                {'course_code': code, 'course_name': name} 
                for code, name in courses
            ]
            
            logger.info(f"Loaded {len(course_list)} unique courses")
            return course_list
            
        except FileNotFoundError:
            logger.error(f"Course data file not found: {course_data_path}")
            raise Exception("Course data file not found")
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in course data file: {e}")
            raise Exception("Invalid course data file format")
        except Exception as e:
            logger.error(f"Error loading course data: {e}")
            raise Exception(f"Failed to load course data: {e}")

class ForumPostService:
    """Service for managing forum post operations"""
    
    @staticmethod
    def get_posts_for_course(
        course_code: str, 
        limit: int = 20, 
        offset: int = 0
    ) -> List[Dict]:
        """
        Get posts for a specific course with pagination.
        
        Args:
            course_code (str): The course code to get posts for
            limit (int): Maximum number of posts to return
            offset (int): Number of posts to skip
            
        Returns:
            List[Dict]: List of post dictionaries
            
        Raises:
            Exception: If database query fails
        """
        try:
            logger.info(f"Fetching posts for course: {course_code}")
            
            response = supabase.table('forum_posts')\
                .select('*')\
                .eq('course', course_code)\
                .order('created_at', desc=True)\
                .range(offset, offset + limit - 1)\
                .execute()
            
            posts = response.data if response.data else []
            logger.info(f"Retrieved {len(posts)} posts for course {course_code}")
            
            return posts
            
        except Exception as e:
            logger.error(f"Error fetching posts for course {course_code}: {e}")
            raise Exception(f"Failed to fetch posts: {e}")
    
    @staticmethod
    def create_post(post_data: Dict) -> Dict:
        """
        Create a new forum post.
        
        Args:
            post_data (Dict): Post data containing title, content, course, user_id, user_name
            
        Returns:
            Dict: The created post data
            
        Raises:
            Exception: If post creation fails
        """
        try:
            # Validate required fields
            required_fields = ['title', 'content', 'course', 'user_id', 'user_name']
            for field in required_fields:
                if field not in post_data or not post_data[field]:
                    raise ValueError(f"Missing or empty required field: {field}")
            
            # Prepare post data
            new_post = {
                'title': post_data['title'].strip(),
                'content': post_data['content'].strip(),
                'course': post_data['course'].strip(),
                'user_id': post_data['user_id'],
                'user_name': post_data['user_name'].strip(),
                'upvotes': 0,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            
            logger.info(f"Creating new post for course: {new_post['course']}")
            
            response = supabase.table('forum_posts').insert(new_post).execute()
            
            if not response.data:
                raise Exception("No data returned from post creation")
            
            created_post = response.data[0]
            logger.info(f"Successfully created post with ID: {created_post['id']}")
            
            return created_post
            
        except ValueError as e:
            logger.warning(f"Validation error in post creation: {e}")
            raise
        except Exception as e:
            logger.error(f"Error creating post: {e}")
            raise Exception(f"Failed to create post: {e}")
    
    @staticmethod
    def get_post_count_for_course(course_code: str) -> int:
        """
        Get the number of posts for a specific course.
        
        Args:
            course_code (str): The course code
            
        Returns:
            int: Number of posts for the course
        """
        try:
            response = supabase.table('forum_posts')\
                .select('id', count='exact')\
                .eq('course', course_code)\
                .execute()
            
            return response.count if response.count is not None else 0
            
        except Exception as e:
            logger.error(f"Error getting post count for course {course_code}: {e}")
            return 0
    
    @staticmethod
    def get_recent_activity_for_course(course_code: str) -> Optional[str]:
        """
        Get the timestamp of the most recent post for a course.
        
        Args:
            course_code (str): The course code
            
        Returns:
            Optional[str]: ISO timestamp of most recent post, or None if no posts
        """
        try:
            response = supabase.table('forum_posts')\
                .select('created_at')\
                .eq('course', course_code)\
                .order('created_at', desc=True)\
                .limit(1)\
                .execute()
            
            if response.data:
                return response.data[0]['created_at']
            return None
            
        except Exception as e:
            logger.error(f"Error getting recent activity for course {course_code}: {e}")
            return None

class UpvoteService:
    """Service for managing post upvote operations"""
    
    @staticmethod
    def toggle_upvote(post_id: int, user_id: str) -> Tuple[str, bool]:
        """
        Toggle upvote status for a post (add if not exists, remove if exists).
        
        Args:
            post_id (int): The ID of the post
            user_id (str): The ID of the user
            
        Returns:
            Tuple[str, bool]: (action, is_upvoted) where action is 'added' or 'removed'
            
        Raises:
            Exception: If upvote operation fails
        """
        try:
            logger.info(f"Toggling upvote for post {post_id} by user {user_id}")
            
            # Check if user has already upvoted this post
            existing_upvote = supabase.table('post_upvotes')\
                .select('*')\
                .eq('post_id', post_id)\
                .eq('user_id', user_id)\
                .execute()
            
            if existing_upvote.data:
                # Remove upvote
                supabase.table('post_upvotes')\
                    .delete()\
                    .eq('post_id', post_id)\
                    .eq('user_id', user_id)\
                    .execute()
                
                # Decrease post upvote count
                UpvoteService._update_post_upvote_count(post_id, -1)
                
                logger.info(f"Removed upvote for post {post_id}")
                return 'removed', False
            else:
                # Add upvote
                upvote_data = {
                    'post_id': post_id,
                    'user_id': user_id,
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                supabase.table('post_upvotes').insert(upvote_data).execute()
                
                # Increase post upvote count
                UpvoteService._update_post_upvote_count(post_id, 1)
                
                logger.info(f"Added upvote for post {post_id}")
                return 'added', True
                
        except Exception as e:
            logger.error(f"Error toggling upvote for post {post_id}: {e}")
            raise Exception(f"Failed to toggle upvote: {e}")
    
    @staticmethod
    def _update_post_upvote_count(post_id: int, change: int) -> None:
        """
        Update the upvote count for a post.
        
        Args:
            post_id (int): The ID of the post
            change (int): The change in upvote count (positive or negative)
        """
        try:
            # Get current upvote count
            post_response = supabase.table('forum_posts')\
                .select('upvotes')\
                .eq('id', post_id)\
                .execute()
            
            if post_response.data:
                current_upvotes = post_response.data[0]['upvotes']
                new_upvotes = max(0, current_upvotes + change)  # Ensure non-negative
                
                supabase.table('forum_posts')\
                    .update({'upvotes': new_upvotes})\
                    .eq('id', post_id)\
                    .execute()
                
                logger.info(f"Updated upvote count for post {post_id}: {current_upvotes} -> {new_upvotes}")
                
        except Exception as e:
            logger.error(f"Error updating upvote count for post {post_id}: {e}")
    
    @staticmethod
    def get_upvote_status(post_id: int, user_id: str) -> bool:
        """
        Check if a user has upvoted a specific post.
        
        Args:
            post_id (int): The ID of the post
            user_id (str): The ID of the user
            
        Returns:
            bool: True if user has upvoted the post, False otherwise
        """
        try:
            response = supabase.table('post_upvotes')\
                .select('*')\
                .eq('post_id', post_id)\
                .eq('user_id', user_id)\
                .execute()
            
            return len(response.data) > 0 if response.data else False
            
        except Exception as e:
            logger.error(f"Error checking upvote status for post {post_id}: {e}")
            return False
