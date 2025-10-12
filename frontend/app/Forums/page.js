'use client'
<<<<<<< Updated upstream
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
=======
/**
 * Forums Page Component
 * 
 * This component provides a Reddit-style forum interface for course discussions.
 * Users can view courses, read posts, create new posts, and upvote content.
 * 
 * Features:
 * - Course-based forum organization
 * - Post creation and upvoting
 * - Search and filtering
 * - Real-time data from backend API
 * - Fallback data when backend is unavailable
 * 
 * @author StudyShare Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Users, 
  TrendingUp,
  Plus,
  Search,
  Filter,
  BookOpen,
  ChevronRight,
  Reply,
  ThumbsUp,
  Eye
} from 'lucide-react';
>>>>>>> Stashed changes
import Navbar from '../components/navbar';
import { 
  useForumCourses, 
  useForumPosts, 
  useCreatePost, 
  useUpvotePost, 
  useForumSearch, 
  useNewPostForm 
} from '../hooks/useForums';
import { utils } from '../services/api';

/**
 * Main Forums component
 */
export default function Forums() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  // State management
  const [selectedForum, setSelectedForum] = useState(null);
  
  // Custom hooks for data management
  const { courses, loading: coursesLoading, error: coursesError, refetch: refetchCourses } = useForumCourses();
  const { posts, loading: postsLoading, error: postsError, refetch: refetchPosts } = useForumPosts(selectedForum?.course_code);
  const { createPost, loading: createLoading, error: createError, clearError: clearCreateError } = useCreatePost();
  const { toggleUpvote, loading: upvoteLoading, error: upvoteError, clearError: clearUpvoteError } = useUpvotePost();
  const { searchQuery, setSearchQuery, sortBy, setSortBy, filteredPosts } = useForumSearch(posts);
  const { 
    showForm, 
    title, 
    setTitle, 
    content, 
    setContent, 
    isFormValid, 
    openForm, 
    closeForm, 
    resetForm 
  } = useNewPostForm();

  // Redirect unauthenticated users
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/Auth');
    }
  }, [isLoaded, user, router]);

  // Set first course as selected when courses load
  useEffect(() => {
    if (courses.length > 0 && !selectedForum) {
      setSelectedForum(courses[0]);
    }
  }, [courses, selectedForum]);

  /**
   * Handle course selection
   * @param {Object} course - Selected course object
   */
  const handleCourseSelect = (course) => {
    setSelectedForum(course);
    clearCreateError();
    clearUpvoteError();
  };

  /**
   * Handle post creation
   */
  const handleCreatePost = async () => {
    if (!isFormValid || !selectedForum?.course_code || !user?.id) {
      return;
    }

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        course: selectedForum.course_code,
        user_id: user.id,
        user_name: utils.extractUsername(user.emailAddresses?.[0]?.emailAddress)
      };

      await createPost(postData, () => {
        resetForm();
        refetchPosts();
        refetchCourses(); // Update course post counts
      });
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  /**
   * Handle post upvoting
   * @param {number} postId - Post ID to upvote
   */
  const handleUpvote = async (postId) => {
    if (!user?.id) return;

    try {
      await toggleUpvote(postId, user.id, () => {
        refetchPosts();
      });
    } catch (error) {
      console.error('Failed to upvote post:', error);
    }
  };

  // Show loading state for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-800 text-xl font-medium">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Navbar />
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Course Forums
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Connect with your classmates, ask questions, and share knowledge in course-specific discussion forums.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Messages */}
        <AnimatePresence>
          {(coursesError || postsError || createError || upvoteError) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-5 h-5 text-yellow-600 mr-3">⚠️</div>
                  <p className="text-yellow-800 text-sm">
                    {coursesError || postsError || createError || upvoteError}
                  </p>
                </div>
                <button
                  onClick={() => {
                    clearCreateError();
                    clearUpvoteError();
                    refetchCourses();
                  }}
                  className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Course List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-800">Courses</h2>
              </div>

              {coursesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <motion.button
                      key={course.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCourseSelect(course)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                        selectedForum?.id === course.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/50 hover:bg-white/80 text-gray-700 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{course.course_code}</h3>
                          <p className={`text-xs mt-1 ${
                            selectedForum?.id === course.id ? 'text-indigo-100' : 'text-gray-500'
                          }`}>
                            {course.course_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs ${
                            selectedForum?.id === course.id ? 'text-indigo-100' : 'text-gray-500'
                          }`}>
                            {course.post_count} posts
                          </div>
                          <div className={`text-xs ${
                            selectedForum?.id === course.id ? 'text-indigo-100' : 'text-gray-400'
                          }`}>
                            {course.recent_activity}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Main Content - Posts */}
          <div className="lg:col-span-3">
            {selectedForum ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Forum Header */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedForum.course_code}</h2>
                      <p className="text-gray-600">{selectedForum.course_name}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openForm}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </motion.button>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="replies">Most Replies</option>
                    </select>
                  </div>
                </div>

                {/* New Post Form */}
                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Post</h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Post title..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <textarea
                          placeholder="What's on your mind?"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={closeForm}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreatePost}
                            disabled={!isFormValid || createLoading}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {createLoading ? 'Posting...' : 'Post'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Posts List */}
                <div className="space-y-4">
                  {postsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-200"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Upvote Section */}
                          <div className="flex flex-col items-center space-y-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUpvote(post.id)}
                              disabled={upvoteLoading}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                post.isUpvoted
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'
                              }`}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </motion.button>
                            <span className="text-sm font-medium text-gray-600">{post.upvotes}</span>
                          </div>

                          {/* Post Content */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                            
                            {/* Post Meta */}
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-4">
                                <span>by {post.author}</span>
                                <span>•</span>
                                <span>{post.timeAgo}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <button className="flex items-center space-x-1 hover:text-indigo-600 transition-colors">
                                  <Reply className="w-4 h-4" />
                                  <span>Reply</span>
                                </button>
                                <button className="flex items-center space-x-1 hover:text-indigo-600 transition-colors">
                                  <Eye className="w-4 h-4" />
                                  <span>View</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-12 shadow-xl border border-white/20 text-center">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h3>
                      <p className="text-gray-500 mb-6">Be the first to start a discussion in this course!</p>
                      <button
                        onClick={openForm}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
                      >
                        Create First Post
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-12 shadow-xl border border-white/20 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Course</h3>
                <p className="text-gray-500">Choose a course from the sidebar to view its forum posts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}