import api from '../utils/axiosConfig';

const blogService = {
  // Draft operations
  saveDraft: async (blogData) => {
    try {
      const response = await api.post('/blogs/save-draft', blogData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
  updateBlog: async (id, blogData) => {
    try {
      const response = await api.patch(`/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },
  getDrafts: async () => {
    try {
      const response = await api.get('/blogs/drafts');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Published blog operations
  publishBlog: async (blogData) => {
    try {
      const response = await api.post('/blogs/publish', blogData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  getPublishedBlogs: async () => {
    try {
      const response = await api.get('/blogs/published');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // User blogs operations
  getUserBlogs: async () => {
    try {
      const response = await api.get('/blogs/my-blogs');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Single blog operations
  getBlogById: async (id) => {
    try {
      const response = await api.get(`/blogs/id/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  updateBlogStatus: async (id, status) => {
    try {
      const response = await api.patch(`/blogs/status/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  deleteBlog: async (id) => {
    try {
      const response = await api.delete(`/blogs/${id}`);
      console.log('Delete response:', response);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  // Tag operations
  getBlogsByTag: async (tag) => {
    try {
      const response = await api.get(`/blogs/tags/${tag}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  getAllTags: async () => {
    try {
      const response = await api.get('/blogs/tags');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  }
};

export default blogService;