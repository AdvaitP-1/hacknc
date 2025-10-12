/**
 * API Service Layer for StudyShare Frontend
 * 
 * This module provides a centralized way to handle all API communications
 * with the backend, including error handling, request/response formatting,
 * and retry logic.
 * 
 * @author StudyShare Team
 * @version 1.0.0
 */

/**
 * Configuration for API requests
 */
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

/**
 * Custom error class for API-related errors
 */
class APIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }
}

/**
 * Utility function to create a timeout promise
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} - Promise that rejects after timeout
 */
const createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
};

/**
 * Utility function to delay execution
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} - Promise that resolves after delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced fetch function with timeout and retry logic
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {number} attempt - Current attempt number
 * @returns {Promise} - Fetch response
 */
const fetchWithRetry = async (url, options = {}, attempt = 1) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new APIError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response
      );
    }
    
    return response;
  } catch (error) {
    if (attempt < API_CONFIG.RETRY_ATTEMPTS && 
        (error.name === 'AbortError' || error.status >= 500)) {
      console.warn(`Request failed (attempt ${attempt}), retrying...`, error.message);
      await delay(API_CONFIG.RETRY_DELAY * attempt);
      return fetchWithRetry(url, options, attempt + 1);
    }
    throw error;
  }
};

/**
 * Parse JSON response with error handling
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>} - Parsed JSON data
 */
const parseJSON = async (response) => {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new APIError('Invalid JSON response', response.status, response);
  }
};

/**
 * Health check service
 */
export const healthService = {
  /**
   * Check if the backend server is healthy
   * @returns {Promise<Object>} - Health status
   */
  async checkHealth() {
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}/api/health/`);
      return await parseJSON(response);
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

/**
 * Forums API service
 */
export const forumsService = {
  /**
   * Get all available courses for forums
   * @returns {Promise<Object>} - Courses data
   */
  async getCourses() {
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}/api/forums/courses`);
      const data = await parseJSON(response);
      
      if (!data.success) {
        throw new APIError(data.error || 'Failed to fetch courses', 500, data);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      throw error;
    }
  },

  /**
   * Get posts for a specific course
   * @param {string} courseCode - Course code
   * @param {number} limit - Maximum number of posts
   * @param {number} offset - Number of posts to skip
   * @returns {Promise<Object>} - Posts data
   */
  async getPosts(courseCode, limit = 20, offset = 0) {
    try {
      const params = new URLSearchParams({
        course: courseCode,
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/api/forums/posts?${params}`
      );
      const data = await parseJSON(response);
      
      if (!data.success) {
        throw new APIError(data.error || 'Failed to fetch posts', 500, data);
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch posts for course ${courseCode}:`, error);
      throw error;
    }
  },

  /**
   * Create a new forum post
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} - Created post data
   */
  async createPost(postData) {
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}/api/forums/posts`, {
        method: 'POST',
        body: JSON.stringify(postData),
      });
      const data = await parseJSON(response);
      
      if (!data.success) {
        throw new APIError(data.error || 'Failed to create post', 500, data);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  },

  /**
   * Toggle upvote for a post
   * @param {number} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Upvote result
   */
  async toggleUpvote(postId, userId) {
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}/api/forums/posts/${postId}/upvote`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await parseJSON(response);
      
      if (!data.success) {
        throw new APIError(data.error || 'Failed to toggle upvote', 500, data);
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to toggle upvote for post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Check if a user has upvoted a post
   * @param {number} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Upvote status
   */
  async getUpvoteStatus(postId, userId) {
    try {
      const params = new URLSearchParams({ user_id: userId });
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/api/forums/posts/${postId}/upvote-status?${params}`
      );
      const data = await parseJSON(response);
      
      if (!data.success) {
        throw new APIError(data.error || 'Failed to get upvote status', 500, data);
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to get upvote status for post ${postId}:`, error);
      throw error;
    }
  }
};

/**
 * Dashboard API service
 */
export const dashboardService = {
  /**
   * Get user profile data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile data
   */
  async getUserProfile(userId) {
    try {
      const params = new URLSearchParams({ user_id: userId });
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/api/dashboard/user-profile?${params}`
      );
      const data = await parseJSON(response);
      
      if (!data.success) {
        throw new APIError(data.error || 'Failed to fetch user profile', 500, data);
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch user profile for ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User statistics
   */
  async getUserStats(userId) {
    try {
      const params = new URLSearchParams({ user_id: userId });
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/api/dashboard/stats?${params}`
      );
      const data = await parseJSON(response);
      
      if (!data.success) {
        throw new APIError(data.error || 'Failed to fetch user stats', 500, data);
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch user stats for ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get recent activity
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of activities
   * @returns {Promise<Object>} - Recent activity data
   */
  async getRecentActivity(userId, limit = 5) {
    try {
      const params = new URLSearchParams({ 
        user_id: userId, 
        limit: limit.toString() 
      });
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}/api/dashboard/recent-activity?${params}`
      );
      const data = await parseJSON(response);
      
      if (!data.success) {
        throw new APIError(data.error || 'Failed to fetch recent activity', 500, data);
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch recent activity for ${userId}:`, error);
      throw error;
    }
  }
};

/**
 * Utility functions for common operations
 */
export const utils = {
  /**
   * Format time ago string
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted time ago string
   */
  formatTimeAgo(dateString) {
    if (!dateString) return 'No activity';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  },

  /**
   * Extract username from email
   * @param {string} email - Email address
   * @returns {string} - Username (part before @)
   */
  extractUsername(email) {
    if (!email) return 'Anonymous';
    return email.split('@')[0];
  },

  /**
   * Validate required fields in an object
   * @param {Object} obj - Object to validate
   * @param {string[]} requiredFields - Array of required field names
   * @returns {string[]} - Array of missing field names
   */
  validateRequiredFields(obj, requiredFields) {
    return requiredFields.filter(field => !obj[field] || obj[field].toString().trim() === '');
  }
};

export { APIError };
