import React, { useState, useEffect } from 'react';
import BlogList from '../components/BlogList';
import blogService from "../services/blogService";


const Home = () => {
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState('');
  const [selectedTag, setSelectedTag] = useState(''); // Use '' for all/no filter

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagsLoading(true);
        setTagsError('');
        const data = await blogService.getAllTags(); // Assumes data is string[]
        setTags(data || []); // Ensure tags is always an array
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        setTagsError('Could not load topics. Please try again later.');
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

 

  return (
    <div className="bg-gray-100 min-h-screen"> {/* Changed to bg-gray-100 for a bit more contrast */}
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-16 sm:py-20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Welcome to BlogSphere
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-50 opacity-90">
            Discover captivating stories, expert insights, and fresh perspectives from our vibrant community.
          </p>
           <div className="mt-10">
            <a
              href="#explore-blogs" // Smooth scroll to blogs section
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 sm:text-lg"
            >
              Explore Articles
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12" id="explore-blogs">  
        {/* Blog List Section */}
        {/* The BlogList component should ideally handle its own title
            (e.g., "Latest Blogs" or "Blogs tagged with 'X'") based on the selectedTag prop */}
        <BlogList selectedTag={selectedTag} />
      </div>
    </div>
  );
};

export default Home;