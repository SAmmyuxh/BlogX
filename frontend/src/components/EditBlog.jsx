import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import blogService from '../services/blogService';
import { handleerror, handlesuccess } from '../utils'; // Assuming these are for toast notifications
import {
  PencilSquareIcon,
  DocumentTextIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowUpOnSquareIcon,
  ArchiveBoxArrowDownIcon,
  ExclamationTriangleIcon,
  BackspaceIcon,
} from '@heroicons/react/24/outline';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialBlogState, setInitialBlogState] = useState(null); // To compare for changes
  const [blog, setBlog] = useState({
    title: '',
    content: '',
    status: 'draft',
    tags: '', // Kept as string for input, converted on submit
  });
  const [pageError, setPageError] = useState(null); // For page-level errors like loading
  const [formError, setFormError] = useState(null); // For form submission errors
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState(null); // To show specific loading text on buttons

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      setPageError(null);
      try {
        const data = await blogService.getBlogById(id);
        const blogData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
        };
        setBlog(blogData);
        setInitialBlogState(blogData); // Store initial state
      } catch (err) {
        console.error("Failed to load blog post for editing:", err);
        if (err.response && err.response.status === 404) {
            setPageError('Blog post not found. It may have been deleted.');
        } else if (err.response && err.response.status === 403) {
            setPageError('You are not authorized to edit this blog post.');
            // Optionally redirect after a delay
            // setTimeout(() => navigate('/dashboard'), 3000);
        }
        else {
            setPageError(err.message || 'Failed to load blog post data.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) { // Ensure ID is present before fetching
      fetchBlog();
    } else {
      setPageError("No blog ID provided for editing.");
      setIsLoading(false);
      // navigate('/dashboard'); // Or some other handling
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const processSubmit = async (e, newStatusOverride) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    const currentAction = newStatusOverride ? (newStatusOverride === 'published' ? 'publish' : 'draft') : 'save';
    setActionType(currentAction);

    const tagsArray = typeof blog.tags === 'string' 
      ? blog.tags.split(',').map(tag => tag.trim()).filter(Boolean) 
      : [];

    const payload = {
      title: blog.title,
      content: blog.content,
      status: newStatusOverride || blog.status,
      tags: tagsArray,
    };
    
    // Optional: Only send changed data (more complex to implement, requires deep comparison)
    // For simplicity, sending the whole payload is common.

    try {
      // The backend `updateBlog` should ideally handle status and content updates together.
      // If status update is a separate endpoint AND must happen first:
      /*
      if (newStatusOverride && newStatusOverride !== initialBlogState.status) {
        await blogService.updateBlogStatus(id, newStatusOverride);
      }
      await blogService.updateBlog(id, { title: payload.title, content: payload.content, tags: payload.tags });
      */

      // Assuming blogService.updateBlog handles all fields including status:
      await blogService.updateBlog(id, payload);
      let successMessage = 'Blog post updated successfully!';
      if (newStatusOverride) {
        successMessage = `Blog post successfully ${newStatusOverride === 'published' ? 'published' : 'moved to drafts'}.`;
      }
      handlesuccess(successMessage); // Toast notification

      navigate('/dashboard', {
        state: {
          actionResult: { type: 'success', message: successMessage }
        }
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update blog post.';
      handleerror(errorMessage); // Toast notification
      setFormError(errorMessage); // Display error on form
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-gray-500 bg-gray-50">
        <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
        <p className="text-lg">Loading editor...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-lg text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Error Loading Blog</h2>
          <p className="mt-2 text-sm text-gray-600">{pageError}</p>
          <div className="mt-6">
            <Link
              to="/dashboard"
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <BackspaceIcon className="h-5 w-5 mr-2 text-indigo-300 group-hover:text-indigo-100" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const getButtonText = (buttonType) => {
    if (isSubmitting && actionType === buttonType) {
        switch(buttonType) {
            case 'save': return 'Saving...';
            case 'publish': return 'Publishing...';
            case 'draft': return 'Moving to Drafts...';
            default: return 'Processing...';
        }
    }
    switch(buttonType) {
        case 'save': return 'Save Changes';
        case 'publish': return 'Publish Changes';
        case 'draft': return 'Save as Draft & Update';
        default: return 'Submit';
    }
  };


  return (
    <div className="bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg">
          <header className="px-6 py-5 sm:px-8 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
              <PencilSquareIcon className="h-7 w-7 mr-3 text-indigo-600" />
              Edit Blog Post
            </h1>
            <Link
              to={`/blog/${id}`} // Link to view the blog, or /dashboard
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <XCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
              Cancel
            </Link>
          </header>

          <form onSubmit={(e) => processSubmit(e, null)} className="p-6 sm:p-8 space-y-6">
            {formError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PencilSquareIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={blog.title}
                  onChange={handleChange}
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5"
                  placeholder="Enter blog title"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TagIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={blog.tags}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5"
                  placeholder="e.g., tech, programming, react (comma-separated)"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Separate tags with commas.</p>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 {/* Icon for textarea is a bit unusual, can be omitted or placed differently */}
                <textarea
                  id="content"
                  name="content"
                  value={blog.content}
                  onChange={handleChange}
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2.5 px-3 h-72 resize-y"
                  placeholder="Write your blog content here..."
                />
              </div>
            </div>
            
            <div className="pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="mr-3 text-sm font-medium text-gray-700">Current Status:</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                        </span>
                    </div>

                    <div className="flex items-center space-x-3">
                        {blog.status === 'published' ? (
                        <button
                            type="button"
                            onClick={(e) => processSubmit(e, 'draft')}
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors disabled:opacity-50"
                        >
                            <ArchiveBoxArrowDownIcon className={`h-5 w-5 mr-2 ${isSubmitting && actionType === 'draft' ? 'animate-spin' : ''}`} />
                            {getButtonText('draft')}
                        </button>
                        ) : (
                        <button
                            type="button"
                            onClick={(e) => processSubmit(e, 'published')}
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                        >
                            <ArrowUpOnSquareIcon className={`h-5 w-5 mr-2 ${isSubmitting && actionType === 'publish' ? 'animate-spin' : ''}`} />
                            {getButtonText('publish')}
                        </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                        >
                            <CheckCircleIcon className={`h-5 w-5 mr-2 ${isSubmitting && actionType === 'save' ? 'animate-spin' : ''}`} />
                            {getButtonText('save')}
                        </button>
                    </div>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;