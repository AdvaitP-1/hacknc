/**
 * Custom React hooks for forums functionality
 * 
 * This module provides reusable hooks for managing forum state,
 * API calls, and user interactions in a clean and organized way.
 * 
 * @author StudyShare Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { forumsService, healthService, utils } from '../services/api';

/**
 * Hook for managing forum courses data
 * @returns {Object} - Courses state and actions
 */
export const useForumCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First check if backend is healthy
      try {
        await healthService.checkHealth();
      } catch (healthError) {
        console.warn('Backend health check failed, using fallback data:', healthError);
        setError('Backend server is not responding. Some features may be limited.');
        
        // Use fallback course data
        const fallbackCourses = [
          { 
            id: 'CSC 111', 
            course_code: 'CSC 111', 
            course_name: 'Introduction to Computing', 
            post_count: 0, 
            recent_activity: 'No activity' 
          },
          { 
            id: 'CSC 112', 
            course_code: 'CSC 112', 
            course_name: 'Fundamentals of Programming', 
            post_count: 0, 
            recent_activity: 'No activity' 
          },
          { 
            id: 'MATH 231', 
            course_code: 'MATH 231', 
            course_name: 'Calculus I', 
            post_count: 0, 
            recent_activity: 'No activity' 
          }
        ];
        
        setCourses(fallbackCourses);
        setLoading(false);
        return;
      }

      // Fetch real course data
      const response = await forumsService.getCourses();
      const coursesData = response.data.map(course => ({
        id: course.course_code,
        course_code: course.course_code,
        course_name: course.course_name,
        post_count: course.post_count,
        recent_activity: course.recent_activity ? utils.formatTimeAgo(course.recent_activity) : 'No activity'
      }));

      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses
  };
};

/**
 * Hook for managing forum posts data
 * @param {string} courseCode - Course code to fetch posts for
 * @returns {Object} - Posts state and actions
 */
export const useForumPosts = (courseCode) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (code) => {
    if (!code) return;

    try {
      setLoading(true);
      setError(null);

      const response = await forumsService.getPosts(code);
      const postsData = response.data.map(post => ({
        id: post.id,
        title: post.title || 'Untitled',
        content: post.content || '',
        author: post.user_name || 'Anonymous',
        course: post.course || code,
        upvotes: post.upvotes || 0,
        replies: 0, // TODO: Add replies functionality
        timeAgo: utils.formatTimeAgo(post.created_at),
        isUpvoted: false, // TODO: Check user's upvote status
        created_at: post.created_at
      }));

      setPosts(postsData);
    } catch (error) {
      console.error(`Error fetching posts for course ${code}:`, error);
      setError('Failed to load posts. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (courseCode) {
      fetchPosts(courseCode);
    }
  }, [courseCode, fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: () => fetchPosts(courseCode)
  };
};

/**
 * Hook for managing post creation
 * @returns {Object} - Post creation state and actions
 */
export const useCreatePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPost = useCallback(async (postData, onSuccess) => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      const missingFields = utils.validateRequiredFields(postData, [
        'title', 'content', 'course', 'user_id', 'user_name'
      ]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await forumsService.createPost(postData);
      
      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPost,
    loading,
    error,
    clearError: () => setError(null)
  };
};

/**
 * Hook for managing post upvoting
 * @returns {Object} - Upvote state and actions
 */
export const useUpvotePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleUpvote = useCallback(async (postId, userId, onSuccess) => {
    try {
      setLoading(true);
      setError(null);

      const response = await forumsService.toggleUpvote(postId, userId);
      
      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (error) {
      console.error(`Error toggling upvote for post ${postId}:`, error);
      setError(error.message || 'Failed to update upvote. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    toggleUpvote,
    loading,
    error,
    clearError: () => setError(null)
  };
};

/**
 * Hook for managing forum search and filtering
 * @param {Array} posts - Array of posts to filter
 * @returns {Object} - Search state and filtered posts
 */
export const useForumSearch = (posts = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const filteredPosts = posts
    .filter(post => {
      if (!post || !post.title || !post.content) return false;
      const query = searchQuery.toLowerCase();
      return post.title.toLowerCase().includes(query) ||
             post.content.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'popular':
          return (b.upvotes || 0) - (a.upvotes || 0);
        case 'replies':
          return (b.replies || 0) - (a.replies || 0);
        default:
          return 0;
      }
    });

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredPosts
  };
};

/**
 * Hook for managing new post form state
 * @returns {Object} - Form state and actions
 */
export const useNewPostForm = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const resetForm = useCallback(() => {
    setTitle('');
    setContent('');
    setShowForm(false);
  }, []);

  const openForm = useCallback(() => {
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
  }, []);

  const isFormValid = title.trim() && content.trim();

  return {
    showForm,
    title,
    setTitle,
    content,
    setContent,
    isFormValid,
    openForm,
    closeForm,
    resetForm
  };
};
