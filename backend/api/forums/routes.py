"""
Forums API routes for course forums, posts, and interactions

This module defines the REST API endpoints for forum functionality,
including course management, post creation/retrieval, and upvoting.

Author: StudyShare Team
Version: 1.0.0
"""

import logging
from flask import Blueprint, request, jsonify
from api.forums.services import CourseDataService, ForumPostService, UpvoteService

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint for forums routes
forums_bp = Blueprint('forums', __name__, url_prefix='/forums')

@forums_bp.route('/courses', methods=['GET'])
def get_courses():
    """
    Get all available courses for forums with post counts and recent activity.
    
    Returns:
        JSON response with list of courses and their metadata
        
    Example Response:
        {
            "success": true,
            "data": [
                {
                    "course_code": "CSC 111",
                    "course_name": "Introduction to Computing",
                    "post_count": 5,
                    "recent_activity": "2024-01-15T10:30:00Z"
                }
            ]
        }
    """
    try:
        logger.info("Fetching courses for forums")
        
        # Load course data from JSON file
        courses = CourseDataService.load_course_data()
        
        # Enrich courses with post counts and recent activity
        courses_with_metadata = []
        for course in courses:
            course_code = course['course_code']
            
            # Get post count and recent activity
            post_count = ForumPostService.get_post_count_for_course(course_code)
            recent_activity = ForumPostService.get_recent_activity_for_course(course_code)
            
            courses_with_metadata.append({
                'course_code': course_code,
                'course_name': course['course_name'],
                'post_count': post_count,
                'recent_activity': recent_activity
            })
        
        logger.info(f"Successfully fetched {len(courses_with_metadata)} courses")
        
        return jsonify({
            'success': True,
            'data': courses_with_metadata
        })
        
    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch courses',
            'message': str(e)
        }), 500

@forums_bp.route('/posts', methods=['GET'])
def get_posts():
    """
    Get posts for a specific course with pagination.
    
    Query Parameters:
        course (str): Course code (required)
        limit (int): Maximum number of posts to return (default: 20)
        offset (int): Number of posts to skip (default: 0)
    
    Returns:
        JSON response with list of posts
        
    Example Response:
        {
            "success": true,
            "data": [
                {
                    "id": 1,
                    "title": "Question about assignment",
                    "content": "I need help with...",
                    "course": "CSC 111",
                    "user_id": "user123",
                    "user_name": "student1",
                    "upvotes": 5,
                    "created_at": "2024-01-15T10:30:00Z"
                }
            ]
        }
    """
    try:
        # Get and validate query parameters
        course = request.args.get('course')
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        if not course:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter',
                'message': 'Course parameter is required'
            }), 400
        
        if limit < 1 or limit > 100:
            return jsonify({
                'success': False,
                'error': 'Invalid parameter',
                'message': 'Limit must be between 1 and 100'
            }), 400
        
        logger.info(f"Fetching posts for course: {course} (limit: {limit}, offset: {offset})")
        
        # Fetch posts using service layer
        posts = ForumPostService.get_posts_for_course(course, limit, offset)
        
        logger.info(f"Successfully fetched {len(posts)} posts for course {course}")
        
        return jsonify({
            'success': True,
            'data': posts
        })
        
    except ValueError as e:
        logger.warning(f"Invalid parameter in get_posts: {e}")
        return jsonify({
            'success': False,
            'error': 'Invalid parameter',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error fetching posts: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch posts',
            'message': str(e)
        }), 500

@forums_bp.route('/posts', methods=['POST'])
def create_post():
    """
    Create a new forum post.
    
    Request Body:
        {
            "title": "Post title",
            "content": "Post content",
            "course": "CSC 111",
            "user_id": "user123",
            "user_name": "student1"
        }
    
    Returns:
        JSON response with created post data
        
    Example Response:
        {
            "success": true,
            "data": {
                "id": 1,
                "title": "Post title",
                "content": "Post content",
                "course": "CSC 111",
                "user_id": "user123",
                "user_name": "student1",
                "upvotes": 0,
                "created_at": "2024-01-15T10:30:00Z"
            }
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Invalid request',
                'message': 'Request body is required'
            }), 400
        
        logger.info(f"Creating new post for course: {data.get('course', 'unknown')}")
        
        # Create post using service layer
        created_post = ForumPostService.create_post(data)
        
        logger.info(f"Successfully created post with ID: {created_post['id']}")
        
        return jsonify({
            'success': True,
            'data': created_post
        }), 201
        
    except ValueError as e:
        logger.warning(f"Validation error in create_post: {e}")
        return jsonify({
            'success': False,
            'error': 'Validation error',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error creating post: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to create post',
            'message': str(e)
        }), 500

@forums_bp.route('/posts/<int:post_id>/upvote', methods=['POST'])
def upvote_post(post_id):
    """
    Toggle upvote status for a post (add if not exists, remove if exists).
    
    Path Parameters:
        post_id (int): The ID of the post to upvote
    
    Request Body:
        {
            "user_id": "user123"
        }
    
    Returns:
        JSON response with upvote action and status
        
    Example Response:
        {
            "success": true,
            "action": "added",
            "upvoted": true
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Invalid request',
                'message': 'Request body is required'
            }), 400
        
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'Missing required field',
                'message': 'User ID is required'
            }), 400
        
        logger.info(f"Toggling upvote for post {post_id} by user {user_id}")
        
        # Toggle upvote using service layer
        action, is_upvoted = UpvoteService.toggle_upvote(post_id, user_id)
        
        logger.info(f"Successfully {action} upvote for post {post_id}")
        
        return jsonify({
            'success': True,
            'action': action,
            'upvoted': is_upvoted
        })
        
    except ValueError as e:
        logger.warning(f"Validation error in upvote_post: {e}")
        return jsonify({
            'success': False,
            'error': 'Validation error',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error toggling upvote for post {post_id}: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to toggle upvote',
            'message': str(e)
        }), 500

@forums_bp.route('/posts/<int:post_id>/upvote-status', methods=['GET'])
def get_upvote_status(post_id):
    """
    Check if a user has upvoted a specific post.
    
    Path Parameters:
        post_id (int): The ID of the post
    
    Query Parameters:
        user_id (str): The ID of the user (required)
    
    Returns:
        JSON response with upvote status
        
    Example Response:
        {
            "success": true,
            "upvoted": true
        }
    """
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter',
                'message': 'User ID is required'
            }), 400
        
        logger.info(f"Checking upvote status for post {post_id} by user {user_id}")
        
        # Check upvote status using service layer
        is_upvoted = UpvoteService.get_upvote_status(post_id, user_id)
        
        return jsonify({
            'success': True,
            'upvoted': is_upvoted
        })
        
    except Exception as e:
        logger.error(f"Error checking upvote status for post {post_id}: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to check upvote status',
            'message': str(e)
        }), 500
