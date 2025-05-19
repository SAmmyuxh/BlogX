import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import blogService from '../services/blogService';
import {
  CalendarDaysIcon,
  UserCircleIcon,
  TagIcon,
  PencilSquareIcon,
  ArrowUpOnSquareIcon,
  ArchiveBoxArrowDownIcon, // Or DocumentMinusIcon
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const BlogView = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await blogService.getBlogById(id);
        setBlog(data);
      } catch (err) {
        console.error('Fetch blog error:', err);
        if (err.response && err.response.status === 403) { // More robust check for auth error
             setError('You are not authorized to view this draft. Redirecting...');
             setTimeout(() => navigate('/'), 2000);
        } else if (err.response && err.response.status === 404) {
            setError('Blog post not found.');
        }
        else {
          setError('Failed to load the blog post. Please try again later.');
        }
        setBlog(null); // Ensure no stale data is shown
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, navigate]);

  const handleUpdateStatus = async (newStatus) => {
    if (!blog) return;
    try {
      setLoading(true); // Indicate loading for the action
      await blogService.updateBlogStatus(blog._id, newStatus);
      // Option 1: Navigate and let page re-fetch
      // navigate(newStatus === 'published' ? `/blog/${blog._id}` : '/dashboard');
      // Option 2: Update local state for faster feedback (if backend guarantees success)
      setBlog(prevBlog => ({ ...prevBlog, status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : prevBlog.published_at }));
      if (newStatus === 'draft') {
        // Optionally show a success message before navigating or stay on page if it's a preview
        // For now, let's navigate to dashboard for drafts
        navigate('/dashboard');
      }
    } catch (err) {
      setError(`Failed to update status to ${newStatus}.`);
      console.error(`Failed to update status:`, err);
    } finally {
      setLoading(false);
    }
  };


  if (loading && !blog) { // Full page loader only if no blog data yet
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-gray-500 bg-gray-50">
        <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg">Loading blog post...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-lg text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
                {error || 'Blog Post Not Found'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error ? "We encountered an issue." : "We couldn't find the blog post you were looking for."}
            </p>
            <div>
              <Link
                to="/"
                className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-6"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2 text-indigo-300 group-hover:text-indigo-100" />
                Go back to All Blogs
              </Link>
            </div>
        </div>
      </div>
    );
  }

  const isAuthor = isAuthenticated() && user && blog.user._id === user.id;
  const displayDate = blog.published_at || blog.created_at;
  const formattedDate = displayDate ? new Date(displayDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Date not available';

  return (
    <div className="bg-gray-50 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Optional: Blog Post Image */}
          {/* {blog.imageUrl && <img src={blog.imageUrl} alt={blog.title} className="w-full h-64 object-cover" />} */}

          <article className="p-6 sm:p-8 lg:p-10">
            {blog.status === 'draft' && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-md flex items-center shadow-sm">
                <InformationCircleIcon className="h-6 w-6 mr-3 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold">This is a Draft Preview</p>
                  <p className="text-sm">This post is not yet visible to the public.</p>
                </div>
              </div>
            )}

            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                {blog.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                  <span>By {blog.user?.name || 'Anonymous Author'}</span>
                </div>
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                  <span>
                    {blog.status === 'published' ? 'Published on ' : 'Created on '}
                    {formattedDate}
                  </span>
                </div>
              </div>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex items-center flex-wrap gap-2">
                  <TagIcon className="h-5 w-5 text-gray-400 mr-1" />
                  {blog.tags.map((tag, index) => (
                    <Link
                      key={index}
                      to={`/tags/${tag}`} // Assuming you have a route for /tags/:tagName
                      className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {/* Blog content */}
            {/* Ensure @tailwindcss/typography plugin is installed and configured */}
            <div className="prose prose-lg lg:prose-xl max-w-none text-gray-700 leading-relaxed">
              {blog.content.split('\n').map((paragraph, index) => (
                // Render non-empty paragraphs; render <br /> for intentionally empty lines if needed,
                // or filter them out if empty lines are just for source formatting.
                // This simple split assumes plain text where newlines are paragraph breaks.
                // For Markdown/HTML, use a dedicated renderer.
                paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
              ))}
            </div>
          </article>

          {isAuthor && (
            <div className="mt-6 sm:mt-8 px-6 sm:px-8 lg:px-10 py-6 bg-gray-50 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Author Actions</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Link
                  to={`/edit-blog/${blog._id}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
                >
                  <PencilSquareIcon className="h-5 w-5 mr-2" />
                  Edit Blog
                </Link>
                {blog.status === 'draft' ? (
                  <button
                    onClick={() => handleUpdateStatus('published')}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 w-full sm:w-auto"
                  >
                    <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
                    {loading ? 'Publishing...' : 'Publish'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus('draft')}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors disabled:opacity-50 w-full sm:w-auto"
                  >
                    <ArchiveBoxArrowDownIcon className="h-5 w-5 mr-2" />
                    {loading ? 'Moving...' : 'Move to Drafts'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
         <div className="mt-8 text-center">
            <Link
              to="/blogs" // Or "/" if your blog list is at the root
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to All Blogs
            </Link>
          </div>
      </div>
    </div>
  );
};

export default BlogView