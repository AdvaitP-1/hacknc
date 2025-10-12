'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import Navbar from '../components/navbar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function ForumsPage() {
  const { isSignedIn, userId } = useAuth();
  const [search, setSearch] = useState('');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Health check first
      const healthResponse = await fetch(`${API_BASE_URL}/api/health/`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (!healthResponse.ok) {
        throw new Error('Backend server is not responding');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/forums/courses`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message);
      // Fallback course data
      setCourses([
        { course_code: 'CSC 111', course_name: 'Introduction to Computing', university: 'North Carolina State University', post_count: 0 },
        { course_code: 'COMP 110', course_name: 'Introduction to Programming', university: 'University of North Carolina at Chapel Hill', post_count: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts for a specific course
  const fetchPosts = async (courseCode) => {
    try {
      setPostsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/forums/posts?course=${encodeURIComponent(courseCode)}&limit=20&offset=0`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Load courses on component mount
  useEffect(() => {
    if (isSignedIn) {
      fetchCourses();
    }
  }, [isSignedIn]);

  // Filter courses based on search and university filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = search === '' || 
      course.course_code.toLowerCase().includes(search.toLowerCase()) ||
      course.course_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesUniversity = universityFilter === 'all' || 
      course.university === universityFilter;
    
    return matchesSearch && matchesUniversity;
  });

  // Get unique universities for filter
  const universities = ['all', ...new Set(courses.map(course => course.university))];

  if (!isSignedIn) {
    return (
      <div>
        <Navbar />
        <div className="pt-32 min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <div className="p-8 border rounded bg-white shadow-md">
            <h2 className="text-2xl font-bold text-black mb-4 text-center">You have to be logged in to view forums.</h2>
            <p className="text-black text-center">Please log in to access and participate in the forums.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="pt-32 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Forums</h1>
            <p className="text-gray-600">Join discussions for your courses across NC universities</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Backend Connection Issue</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
                <button
                  onClick={fetchCourses}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by course code or name (e.g., CSC 111, Introduction to Computing)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-64">
              <select
                value={universityFilter}
                onChange={e => setUniversityFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Universities</option>
                {universities.slice(1).map(university => (
                  <option key={university} value={university}>
                    {university.replace('University of North Carolina at ', 'UNC ').replace('North Carolina State University', 'NC State')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading courses...</p>
            </div>
          )}

          {/* Course Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={`${course.course_code}-${course.university}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                  onClick={() => {
                    setSelectedCourse(course);
                    fetchPosts(course.course_code);
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{course.course_code}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {course.post_count} posts
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{course.course_name}</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {course.university.replace('University of North Carolina at ', 'UNC ').replace('North Carolina State University', 'NC State')}
                    </p>
                    {course.recent_activity && (
                      <p className="text-xs text-gray-500">
                        Last activity: {new Date(course.recent_activity).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No courses found matching your search.</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search terms or university filter.</p>
            </div>
          )}

          {/* Course Forum Modal/View */}
          {selectedCourse && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.course_code}</h2>
                      <p className="text-gray-600">{selectedCourse.course_name}</p>
                      <p className="text-sm text-gray-500">{selectedCourse.university}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {postsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading posts...</p>
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{post.title}</h3>
                            <span className="text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{post.content}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>by {post.user_name}</span>
                            <div className="flex items-center space-x-4">
                              <span>👍 {post.upvotes || 0}</span>
                              <span>💬 0 replies</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No posts yet for this course.</p>
                      <p className="text-gray-500 text-sm mt-2">Be the first to start a discussion!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}