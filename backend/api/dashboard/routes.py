"""
Dashboard API routes for user profiles, stats, and activity
"""
from flask import Blueprint, request, jsonify
from config.database import supabase

# Create blueprint for dashboard routes
dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/user-profile', methods=['GET'])
def get_user_profile():
    """Get user profile information"""
    try:
        # Get user ID from query parameter (will be replaced with Clerk auth)
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Fetch from Supabase
        response = supabase.table('users').select('*').eq('clerk_user_id', user_id).execute()
        
        if response.data:
            user_data = response.data[0]
            return jsonify({
                'success': True,
                'data': {
                    'name': user_data.get('name', ''),
                    'email': user_data.get('email', ''),
                    'university': user_data.get('university'),
                    'major': user_data.get('major'),
                    'location': user_data.get('location'),
                    'created_at': user_data.get('created_at', ''),
                    'profile_complete': True  # Always true since we don't require completion
                }
            })
        else:
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@dashboard_bp.route('/stats', methods=['GET'])
def get_user_stats():
    """Get user statistics (notes shared, forum posts, upvotes received)"""
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Fetch stats from Supabase
        notes_response = supabase.table('notes').select('id').eq('user_id', user_id).execute()
        posts_response = supabase.table('forum_posts').select('id').eq('user_id', user_id).execute()
        upvotes_response = supabase.table('upvotes').select('id').eq('target_user_id', user_id).execute()
        
        return jsonify({
            'success': True,
            'data': {
                'notes_shared': len(notes_response.data) if notes_response.data else 0,
                'forum_posts': len(posts_response.data) if posts_response.data else 0,
                'upvotes_received': len(upvotes_response.data) if upvotes_response.data else 0,
                'total_contributions': (len(notes_response.data) if notes_response.data else 0) + 
                                     (len(posts_response.data) if posts_response.data else 0)
            }
        })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@dashboard_bp.route('/recent-activity', methods=['GET'])
def get_recent_activity():
    """Get user's recent activity (recent notes, forum posts)"""
    try:
        user_id = request.args.get('user_id')
        limit = request.args.get('limit', 5)
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Fetch recent notes
        notes_response = supabase.table('notes').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(int(limit)).execute()
        
        # Fetch recent forum posts
        posts_response = supabase.table('forum_posts').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(int(limit)).execute()
        
        # Combine and sort by date
        activities = []
        
        if notes_response.data:
            for note in notes_response.data:
                activities.append({
                    'type': 'note',
                    'title': note.get('title', ''),
                    'course': note.get('course', ''),
                    'created_at': note.get('created_at', ''),
                    'upvotes': note.get('upvotes', 0)
                })
        
        if posts_response.data:
            for post in posts_response.data:
                activities.append({
                    'type': 'forum_post',
                    'title': post.get('title', ''),
                    'course': post.get('course', ''),
                    'created_at': post.get('created_at', ''),
                    'upvotes': post.get('upvotes', 0)
                })
        
        # Sort by date and limit
        activities.sort(key=lambda x: x['created_at'], reverse=True)
        activities = activities[:int(limit)]
        
        return jsonify({
            'success': True,
            'data': activities
        })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@dashboard_bp.route('/create-profile', methods=['POST'])
def create_user_profile():
    """Create a new user profile in the database"""
    try:
        user_data = request.json.get('user_data', {})
        
        if not user_data.get('clerk_user_id'):
            return jsonify({'error': 'Clerk user ID is required'}), 400
        
        # Insert new user into Supabase
        response = supabase.table('users').insert(user_data).execute()
        
        if response.data:
            return jsonify({
                'success': True,
                'message': 'Profile created successfully',
                'data': response.data[0]
            })
        else:
            return jsonify({'error': 'Failed to create profile'}), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@dashboard_bp.route('/update-profile', methods=['POST'])
def update_user_profile():
    """Update user profile information"""
    try:
        user_id = request.json.get('user_id')
        profile_data = request.json.get('profile_data', {})
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Update in Supabase
        response = supabase.table('users').update(profile_data).eq('clerk_user_id', user_id).execute()
        
        if response.data:
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully',
                'data': response.data[0]
            })
        else:
            return jsonify({'error': 'Failed to update profile'}), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
