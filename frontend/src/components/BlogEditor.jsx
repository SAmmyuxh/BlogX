
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import blogService from '../../services/blogService';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    tags: ''
  });

  // Fetch blog data if editing an existing blog
  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const blog = await blogService.getBlogById(id);
        setBlogData({
          title: blog.title || '',
          content: blog.content || '',
          tags: blog.tags ? blog.tags.join(', ') : ''
        });
      } catch (err) {
        setError('Failed to load blog data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleChange = (e) => {
    setBlogData({
      ...blogData,
      [e.target.name]: e.target.value
    });
  };

  const saveDraft = async () => {
    if (!blogData.title) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await blogService.saveDraft({
        id: id || undefined,
        ...blogData
      });
      
      if (!id) {
        // If it's a new blog, redirect to edit page with the new ID
        navigate(`/edit-blog/${result._id}`);
      }
      
      setSuccess('Draft saved successfully');
    } catch (err) {
      setError('Failed to save draft');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const publishBlog = async () => {
    if (!blogData.title) {
      setError('Title is required');
      return;
    }

    if (blogData.content.length < 50) {
      setError('Content is too short. Add more content to publish.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await blogService.publishBlog({
        id: id || undefined,
        ...blogData
      });
      
      setSuccess('Blog published successfully');
      // Navigate to the published blog after a short delay
      setTimeout(() => {
        navigate(`/blog/${result._id}`);
      }, 1500);
    } catch (err) {
      setError('Failed to publish blog');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Blog' : 'Create New Blog'}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={blogData.title}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter blog title"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={blogData.content}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Write your blog content here..."
          rows="15"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={blogData.tags}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="tech, programming, web development"
        />
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={saveDraft}
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Save Draft'}
        </button>
        
        <button
          onClick={publishBlog}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-indigo-400"
        >
          {loading ? 'Publishing...' : 'Publish Blog'}
        </button>
      </div>
    </div>
  );
};

export default BlogEditor;