import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import blogService from '../services/blogService';
import { handleerror, handlesuccess } from '../utils'; // Assuming for toast notifications
import {
  PlusCircleIcon,
  DocumentTextIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon, // For publish
  ArchiveBoxIcon, // For save draft
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const NewBlog = () => {
  const navigate = useNavigate();
  const [blog, setBlog] = useState({
    _id: null, // To store ID if a draft is created by auto-save
    title: '',
    content: '',
    tags: '', // Handled as string in input, converted to array on submit/save
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState(null); // 'draft' or 'publish' for button states
  const [autoSaveStatus, setAutoSaveStatus] = useState({ message: '', type: '' }); // type: 'saving', 'success', 'error'
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedContentRef = useRef(JSON.stringify(blog)); // To compare for changes before auto-saving
  const lastSaveTimeRef = useRef(Date.now());

  // Function to prepare payload (handles tags)
  const preparePayload = (currentBlogState) => {
    const tagsArray = typeof currentBlogState.tags === 'string'
      ? currentBlogState.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const payload = {
      title: currentBlogState.title,
      content: currentBlogState.content,
      tags: tagsArray,
    };

    return payload;
  };

  const hasContentChanged = () => {
    // Only consider a change if there's actual content and it's different from last save
    const currentPayload = preparePayload(blog);
    const hasContent = blog.title.trim() || blog.content.trim();
    const isDifferent = JSON.stringify(currentPayload) !== lastSavedContentRef.current;
    
    return hasContent && isDifferent;
  };
  
  const saveContent = async () => {
    // Don't save if no content
    if (!blog.title.trim() && !blog.content.trim()) return;

    // Only save if content has changed since last save
    if (!hasContentChanged()) return;

    // Enforce minimum time between saves (2 seconds)
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 2000) return;

    setAutoSaveStatus({ message: 'Auto-saving draft...', type: 'saving' });
    
    try {
      const payload = preparePayload(blog);
      let savedDraft;

      // Use the appropriate method based on whether we have an ID
      if (blog._id) {
        // Update existing blog
        savedDraft = await blogService.updateBlog(blog._id, payload);
        setAutoSaveStatus({ message: 'Draft updated at ' + new Date().toLocaleTimeString(), type: 'success' });
      } else {
        // Create new blog
        savedDraft = await blogService.saveDraft(payload);
        setAutoSaveStatus({ message: 'Draft created at ' + new Date().toLocaleTimeString(), type: 'success' });
      }

      if (savedDraft && savedDraft._id) {
        setBlog(prev => ({ ...prev, _id: savedDraft._id }));
        lastSavedContentRef.current = JSON.stringify(preparePayload({...blog, _id: savedDraft._id }));
        lastSaveTimeRef.current = now;
      } else {
        // Fallback if ID wasn't returned
        lastSavedContentRef.current = JSON.stringify(payload);
        setAutoSaveStatus({ message: 'Draft auto-saved (local state) at ' + new Date().toLocaleTimeString(), type: 'success' });
        lastSaveTimeRef.current = now;
      }

      // Clear status after 3 seconds
      setTimeout(() => setAutoSaveStatus({ message: '', type: '' }), 3000);
    } catch (err) {
      console.error('Auto-save error:', err.message);
      setAutoSaveStatus({ message: 'Title and Content are required to Save.', type: 'error' });
      // Keep error message visible longer
      setTimeout(() => setAutoSaveStatus({ message: '', type: '' }), 5000);
    }
  };

  // Unified autosave logic
  useEffect(() => {
    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set a new timeout for 5 seconds
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveContent();
      
      // After saving, set up the periodic 30-second interval
      // (This will only run once after the initial 5-second timeout)
      const intervalId = setInterval(() => {
        saveContent();
      }, 30000);
      
      // Store the interval ID in the ref for cleanup
      autoSaveTimeoutRef.current = intervalId;
    }, 5000);
    
    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        if (typeof autoSaveTimeoutRef.current === 'number') {
          clearTimeout(autoSaveTimeoutRef.current);
        } else {
          clearInterval(autoSaveTimeoutRef.current);
        }
      }
    };
  }, [blog.title, blog.content, blog.tags]); // Reset timer when content changes

  // Final save on unmount if needed
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        if (typeof autoSaveTimeoutRef.current === 'number') {
          clearTimeout(autoSaveTimeoutRef.current);
        } else {
          clearInterval(autoSaveTimeoutRef.current);
        }
      }
      
      // Save on unmount if there are unsaved changes
      if (hasContentChanged()) {
        saveContent();
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e, submissionStatus) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setActionType(submissionStatus); // 'draft' or 'published'

    // Prevent multiple submissions
    if (!blog.title.trim()) {
        setFormError("Title is required.");
        handleerror("Title is required.");
        setIsSubmitting(false);
        setActionType(null);
        return;
    }
     if (!blog.content.trim()) {
        setFormError("Content cannot be empty.");
        handleerror("Content cannot be empty.");
        setIsSubmitting(false);
        setActionType(null);
        return;
    }

    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      if (typeof autoSaveTimeoutRef.current === 'number') {
        clearTimeout(autoSaveTimeoutRef.current);
      } else {
        clearInterval(autoSaveTimeoutRef.current);
      }
    }

    const payload = preparePayload(blog);

    try {
      let responseMessage = '';
      
      if (submissionStatus === 'draft') {
        if (blog._id) {
          // Update existing draft
          await blogService.updateBlog(blog._id, payload);
          responseMessage = 'Draft updated successfully!';
        } else {
          // Create new draft
          await blogService.saveDraft(payload);
          responseMessage = 'Draft saved successfully!';
        }
      } else { // 'published'
        if (blog._id) {
          // Update and publish existing blog
          await blogService.updateBlog(blog._id, { ...payload, status: 'published' });
          responseMessage = 'Blog updated and published successfully!';
        } else {
          // Create and publish new blog
          await blogService.publishBlog(payload);
          responseMessage = 'Blog published successfully!';
        }
      }
      
      handlesuccess(responseMessage);

      // Update the lastSavedContentRef to reflect the changes
      lastSavedContentRef.current = JSON.stringify(payload);
      
      navigate('/dashboard', {
        state: {
          actionResult: { type: 'success', message: responseMessage }
        }
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      handleerror(errorMessage);
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };
  
  const getButtonText = (buttonType) => {
    if (isSubmitting && actionType === buttonType) {
      return buttonType === 'draft' ? 'Saving Draft...' : 'Publishing...';
    }
    return buttonType === 'draft' 
      ? (blog._id ? 'Update Draft' : 'Save as Draft') 
      : (blog._id ? 'Update & Publish' : 'Publish');
  };

  return (
    <div className="bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg">
          <header className="px-6 py-5 sm:px-8 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
              <PlusCircleIcon className="h-7 w-7 mr-3 text-indigo-600" />
              {blog._id ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <XCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
              Cancel
            </Link>
          </header>

          <form onSubmit={(e) => handleSubmit(e, 'published')} className="p-6 sm:p-8 space-y-6"> {/* Default submit to publish */}
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

            {autoSaveStatus.message && (
              <div className={`p-3 rounded-md flex items-center text-sm shadow-sm
                ${autoSaveStatus.type === 'success' ? 'bg-green-50 border-green-300 text-green-700' : ''}
                ${autoSaveStatus.type === 'error' ? 'bg-red-50 border-red-300 text-red-700' : ''}
                ${autoSaveStatus.type === 'saving' ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
              `}>
                {autoSaveStatus.type === 'saving' && <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />}
                {autoSaveStatus.type === 'success' && <CheckCircleIcon className="h-5 w-5 mr-2" />}
                {autoSaveStatus.type === 'error' && <ExclamationTriangleIcon className="h-5 w-5 mr-2" />}
                <span>{autoSaveStatus.message}</span>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
              <div className="mt-1">
                <textarea
                  id="content"
                  name="content"
                  value={blog.content}
                  onChange={handleChange}
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2.5 px-3 h-72 shadow-sm resize-y"
                  placeholder="Write your blog content here..."
                />
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'draft')}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                >
                  <ArchiveBoxIcon className={`h-5 w-5 mr-2 ${isSubmitting && actionType === 'draft' ? 'animate-spin' : ''}`} />
                  {getButtonText('draft')}
                </button>
                <button
                  type="submit" // This will trigger form's onSubmit, which calls handleSubmit(e, 'published')
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                >
                  <CloudArrowUpIcon className={`h-5 w-5 mr-2 ${isSubmitting && actionType === 'published' ? 'animate-spin' : ''}`} />
                  {getButtonText('published')}
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <InformationCircleIcon className="h-4 w-4 inline mr-1" />
              Your content is automatically saved as a draft after 5 seconds of inactivity and every 30 seconds afterward.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBlog;