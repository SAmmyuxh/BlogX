import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added useLocation
import blogService from '../services/blogService';
import {
  PencilSquareIcon,
  TrashIcon,
  ArrowUpOnSquareIcon,
  ArchiveBoxArrowDownIcon,
  EyeIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon, // For drafts icon
  MegaphoneIcon,    // For published icon
  TagIcon,
} from '@heroicons/react/24/outline';
import { handleerror, handlesuccess, intermediate } from '../utils';

const Dashboard = () => {
  const [blogs, setBlogs] = useState({ drafts: [], published: [] });
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(''); // For general page errors
  const [actionResult, setActionResult] = useState({ type: '', message: '' });
  const location = useLocation(); // To get state from navigation

  useEffect(() => {
    // Check for messages passed via navigation state (e.g., after creating/editing a blog)
    if (location.state && location.state.actionResult) {
      setActionResult(location.state.actionResult);
      // Clear the message from location state to prevent it from reappearing on refresh
      window.history.replaceState({}, document.title);
      // Clear the action result message after 3 seconds
      setTimeout(() => setActionResult({ type: '', message: '' }), 3000);
    }
    fetchUserBlogs();
  }, [location.state]); // Re-run if location.state changes

  const fetchUserBlogs = async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await blogService.getUserBlogs();
      setBlogs(response || { drafts: [], published: [] }); // Ensure response is not null
    } catch (err) {
      console.error('Failed to load user blogs:', err);
      setPageError('Failed to load your blogs. Please try again later.');
      setBlogs({ drafts: [], published: [] }); // Reset blogs on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the blog "${title || 'this post'}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await blogService.deleteBlog(id);
      intermediate('Blog deleted successfully.');
      setActionResult({ type: 'success', message: 'Blog deleted successfully.' });
      fetchUserBlogs(); // Refresh
    } catch (err) {
      console.error('Delete error:', err);
      handleerror('Failed to delete blog.');
      setActionResult({ type: 'error', message: 'Failed to delete blog.' });
    }
    setTimeout(() => setActionResult({ type: '', message: '' }), 3000);
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    try {
      await blogService.updateBlogStatus(id, newStatus);
      handlesuccess(`Blog ${newStatus === 'published' ? 'published' : 'moved to drafts'} successfully.`);
      setActionResult({
        type: 'success',
        message: `Blog ${newStatus === 'published' ? 'published' : 'moved to drafts'} successfully.`,
      });
      fetchUserBlogs(); // Refresh
    } catch (err) {
      console.error('Status change error:', err);
      handleerror('Failed to update blog status.');
      setActionResult({ type: 'error', message: 'Failed to update blog status.' });
    }
    setTimeout(() => setActionResult({ type: '', message: '' }), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return <span className="text-gray-400 text-xs italic">No tags</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 3).map((tag, index) => ( // Show max 3 tags
          <span
            key={index}
            className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-xs text-gray-500 self-center">+{tags.length - 3} more</span>
        )}
      </div>
    );
  };
  
  const BlogSection = ({ title, blogsList, statusType, icon }) => {
    const IconComponent = icon;
    return (
      <section className="mb-12 bg-white shadow-lg rounded-xl overflow-hidden">
        <header className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center">
            {IconComponent && <IconComponent className="h-6 w-6 mr-3 text-indigo-500" />}
            {title} ({blogsList.length})
          </h2>
        </header>
        {blogsList.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" /> {/* Generic icon */}
            <p>You don't have any {statusType === 'draft' ? 'drafts' : 'published blogs'} yet.</p>
            {statusType === 'draft' && (
              <Link
                to="/new-blog"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Create Your First Draft
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{statusType === 'draft' ? 'Last Updated' : 'Published Date'}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogsList.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={statusType === 'draft' ? `/edit-blog/${blog._id}` : `/blog/${blog._id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                        title={blog.title || 'Untitled'}
                      >
                        {blog.title ? (blog.title.length > 50 ? blog.title.substring(0, 47) + '...' : blog.title) : <span className="italic text-gray-500">Untitled</span>}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renderTags(blog.tags)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(statusType === 'draft' ? blog.updated_at : blog.published_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link to={`/edit-blog/${blog._id}`} title="Edit" className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors">
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        {statusType === 'draft' ? (
                          <button onClick={() => handleStatusChange(blog._id, 'draft')} title="Publish" className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors">
                            <ArrowUpOnSquareIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <button onClick={() => handleStatusChange(blog._id, 'published')} title="Move to Drafts" className="text-yellow-600 hover:text-yellow-800 p-1 rounded-full hover:bg-yellow-100 transition-colors">
                            <ArchiveBoxArrowDownIcon className="h-5 w-5" />
                          </button>
                        )}
                        <Link to={`/blog/${blog._id}`} title="View" className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <button onClick={() => handleDelete(blog._id, blog.title)} title="Delete" className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };


  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center text-gray-500">
        <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
        <p className="text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
          <Link
            to="/new-blog"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <PlusCircleIcon className="h-6 w-6 mr-2" />
            Create New Blog
          </Link>
        </header>

        {pageError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{pageError}</p>
              </div>
            </div>
          </div>
        )}

        {actionResult.message && (
          <div
            className={`mb-6 p-4 rounded-md shadow-sm flex items-center text-sm
              ${actionResult.type === 'success' ? 'bg-green-50 border-l-4 border-green-400 text-green-700' : 'bg-red-50 border-l-4 border-red-400 text-red-700'}`}
            role="alert"
          >
            {actionResult.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            <span>{actionResult.message}</span>
          </div>
        )}
        
        <BlogSection title="Drafts" blogsList={blogs.drafts} statusType="draft" icon={DocumentTextIcon} />
        <BlogSection title="Published Blogs" blogsList={blogs.published} statusType="published" icon={MegaphoneIcon} />

      </div>
    </div>
  );
};

export default Dashboard;