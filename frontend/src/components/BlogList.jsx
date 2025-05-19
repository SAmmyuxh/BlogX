import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import blogService from '../services/blogService';
import { TagIcon, CalendarDaysIcon, UserCircleIcon, MagnifyingGlassIcon, XCircleIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../Context/AuthContext';

const BlogList = ({ initialSelectedTag = '' }) => {
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(initialSelectedTag);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogsAndTags();
  }, []);

  useEffect(() => {
    if (selectedTag) {
      fetchBlogsByTag(selectedTag);
    } else if (!loading) { // Avoid refetching all blogs if it was an initial load
      fetchBlogs();
    }
  }, [selectedTag]);

  const fetchBlogsAndTags = async () => {
    setLoading(true);
    try {
      const [blogsData, tagsData] = await Promise.all([
        blogService.getPublishedBlogs(),
        blogService.getAllTags(),
      ]);
      
      // Ensure blogs is always an array
      setBlogs(Array.isArray(blogsData) ? blogsData : []);
      
      // Ensure tags is always an array
      setTags(Array.isArray(tagsData) ? tagsData : []);
      
      setError('');
    } catch (err) {
      setError('Failed to load initial blog data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogService.getPublishedBlogs();
      
      // Ensure blogs is always an array
      setBlogs(Array.isArray(data) ? data : []);
      
      setError('');
    } catch (err) {
      setError('Failed to load blogs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogsByTag = async (tag) => {
    try {
      setLoading(true);
      const data = await blogService.getBlogsByTag(tag);
      
      // Ensure blogs is always an array
      setBlogs(Array.isArray(data) ? data : []);
      
      setError('');
    } catch (err) {
      setError(`Failed to load blogs for tag: "${tag}"`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
  };

  // Handle blog click with authentication check
  const handleBlogClick = (e, blogId) => {
    if (!isAuthenticated()) {
      e.preventDefault(); // Prevent default link navigation
      setShowLoginModal(true);
    } else {
      navigate(`/blog/${blogId}`);
    }
  };

  // Login dialog that appears when an unauthenticated user tries to access a blog
  const LoginModal = () => {
    if (!showLoginModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          <button 
            onClick={() => setShowLoginModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
          
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-indigo-100 mb-4">
              <LockClosedIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Authentication Required</h3>
            <p className="mt-2 text-gray-600">Please log in to read the full article.</p>
          </div>
          
          <div className="space-y-4">
            <Link 
              to="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Log In
            </Link>
            
            <Link 
              to="/signup"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </Link>
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && blogs.length === 0 && tags.length === 0) { // Show full page loader only on initial load
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-gray-500">
        <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg">Loading awesome blogs...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {selectedTag ? (
              <>
                Blogs tagged with <span className="text-indigo-600">"{selectedTag}"</span>
              </>
            ) : (
              'Discover Our Latest Insights'
            )}
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Explore articles on various topics, written by our talented team.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md shadow-md" role="alert">
            <div className="flex">
              <div className="py-1">
                <XCircleIcon className="h-6 w-6 text-red-500 mr-3" />
              </div>
              <div>
                <p className="font-bold">Oops! Something went wrong.</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="mb-10 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <TagIcon className="h-6 w-6 mr-2 text-indigo-500" />
              Filter by Topic
            </h2>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105
                    ${
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300 ring-offset-1'
                        : 'bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 border border-gray-300 hover:border-indigo-300'
                    }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag('')}
                  className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-200 ease-in-out shadow-md"
                >
                  <XCircleIcon className="h-5 w-5 mr-1.5" />
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        )}

        {loading && <div className="text-center py-10 text-indigo-600 font-semibold">Updating blog list...</div>}

        {!loading && blogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-lg">
            <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {selectedTag
                ? `No Blogs Found for "${selectedTag}"`
                : 'No Blogs Published Yet'}
            </h3>
            <p className="text-gray-500">
              {selectedTag
                ? 'Try clearing the filter or check back later for new content.'
                : 'Please check back soon for exciting articles!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
              >
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      <a 
                        href="#" 
                        onClick={(e) => handleBlogClick(e, blog._id)}
                        className="hover:text-indigo-600 transition-colors duration-200"
                      >
                        {blog.title}
                      </a>
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                        <span>{blog.user?.name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                        <span>{new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {blog.content && typeof blog.content === 'string' 
                        ? (blog.content.substring(0, 200) + (blog.content.length > 200 ? '...' : ''))
                        : 'No content preview available'}
                    </p>
                  </div>
                  
                  {/* Fixed tags section - proper type checking */}
                  {blog.tags && Array.isArray(blog.tags) && blog.tags.length > 0 && (
                    <div className="mb-5">
                      {blog.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium mr-2 px-2.5 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{blog.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-auto">
                    <a 
                      href="#"
                      onClick={(e) => handleBlogClick(e, blog._id)}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold group transition-colors duration-200"
                    >
                      Read more
                      <ArrowRightIcon className="h-5 w-5 ml-1.5 transform transition-transform duration-200 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Login Modal */}
      <LoginModal />
    </div>
  );
};

export default BlogList;