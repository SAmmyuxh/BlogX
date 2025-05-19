import Blog from "../Models/Blog.js";

// Save or update draft
// In your backend controller (e.g., blogController.js)


export const saveDraft = async (req, res) => {
  try {
    const { _id, title, content, tags } = req.body; // Expect _id from frontend for updates

    // Basic validation still crucial
    if (!title || !title.trim() || !content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Title and content are required and cannot be empty." });
    }

    let tagArray = [];
    if (typeof tags === "string") {
      tagArray = tags.split(",").map((tag) => tag.trim()).filter(Boolean); // Filter empty tags
    } else if (Array.isArray(tags)) {
      tagArray = tags.map((tag) => tag.trim()).filter(Boolean); // Filter empty tags
    }

    let blog;

    if (_id) {
      // If _id is provided, attempt to update an existing draft
      blog = await Blog.findOneAndUpdate(
        { _id: _id, user: req.user._id, status: "draft" }, // Ensure user owns this draft
        {
          title,
          content,
          tags: tagArray,
          status: "draft", // Keep it as draft
          // user: req.user._id, // user field typically set on creation, not changed on update
        },
        { new: true, runValidators: true } // new: true returns the updated doc, runValidators ensures schema validation
      );

      if (!blog) {
        // If no blog was found to update (e.g., wrong _id or user doesn't own it)
        // For auto-save, you might decide to create a new one or return an error.
        // Let's opt to return an error to prevent accidental new draft creation if _id was stale/wrong.
        return res.status(404).json({ message: "Draft not found or you don't have permission to edit it." });
        // Alternatively, to create a new one if not found (upsert-like, but be careful with this logic):
        // blog = new Blog({ title, content, tags: tagArray, status: "draft", user: req.user._id });
        // await blog.save();
      }
    } else {
      // No _id provided, so create a new blog draft
      blog = new Blog({
        title,
        content,
        tags: tagArray,
        status: "draft",
        user: req.user._id,
      });
      await blog.save();
    }

    res.status(200).json(blog); // Send back the created or updated blog document
  } catch (error) {
    console.error("Save draft error:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    // Handle potential duplicate key errors if you have unique indexes (e.g., on title for the same user)
    if (error.code === 11000) { // MongoDB duplicate key error code
        return res.status(409).json({ message: "A blog with this title already exists. Please choose a different title." });
    }
    res.status(500).json({ message: "Server error while saving draft." });
  }
};

// Publish blog
export const publishBlog = async (req, res) => {
  try {
    const { id, title, content, tags } = req.body;

    let blog;
    let tagArray = [];
    if (typeof tags === "string") {
      tagArray = tags.split(",").map((tag) => tag.trim());
    } else if (Array.isArray(tags)) {
      tagArray = tags.map((tag) => tag.trim());
    }
    if (id) {
      // Update existing blog and publish
      blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      blog.title = title;
      blog.content = content;
      blog.tags = tagArray;
      blog.status = "published";
      blog.published_at = Date.now();
      blog.updated_at = Date.now();

      await blog.save();
    } else {
      // Create new blog as published
      blog = new Blog({
        title,
        content,
        tags: tagArray,
        status: "published",
        published_at: Date.now(),
        // Add user ID if authentication is implemented
        user: req.user._id,
      });

      await blog.save();
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("Publish blog error:", error);
    res.status(500).json({ message: "Server error while publishing blog" });
  }
};
// Update blog
export const updateBlog = async (req, res) => { 
  try {
    const { title, content, tags } = req.body;
    const blog = await Blog.findById(req.params.id);
    console
      .log("Blog ID:", req.params.id)
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the blog belongs to the logged-in user
    if (blog.user.toString() !== req.user._id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this blog" });
    }
      let tagArray = [];
    if (typeof tags === "string") {
      tagArray = tags.split(",").map((tag) => tag.trim());
    } else if (Array.isArray(tags)) {
      tagArray = tags.map((tag) => tag.trim());
    }
    blog.title = title;
    blog.content = content;
    blog.tags = tagArray;
    blog.updated_at = Date.now();

    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: "Server error while updating blog" });
  }
}
//get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ updated_at: -1 })
      .populate("user", "name email"); // Populate user details if needed

    // Separate drafts and published blogs
    const drafts = blogs.filter((blog) => blog.status === "draft");
    const published = blogs.filter((blog) => blog.status === "published");

    res.status(200).json({ drafts, published });
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({ message: "Server error while fetching blogs" });
  }
};

// Get blog by ID (Public but with conditions)
export const getBlogById = async (req, res) => {
  try {
    console.log(req.params.id);
    const blog = await Blog.findById(req.params.id).populate("user", "name"); // Populate user name only
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // If blog is a draft, only allow the author to view it
    if (blog.status === "draft") {
      // Check if request has a user (is authenticated)
      if (!req.user || blog.user._id.toString() !== req.user._id) {
        return res
          .status(401)
          .json({ message: "Not authorized to view this draft" });
      }
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("Get blog error:", error);
    res.status(500).json({ message: "Server error while fetching blog" });
  }
};
// Get drafts (Protected)
export const getDrafts = async (req, res) => {
  try {
    // Get drafts only for the logged-in user
    const drafts = await Blog.find({
      status: "draft",
      user: req.user.id,
    }).sort({ updated_at: -1 });

    res.status(200).json(drafts);
  } catch (error) {
    console.error("Get drafts error:", error);
    res.status(500).json({ message: "Server error while fetching drafts" });
  }
};

// Get published blogs (Public)
export const getPublishedBlogs = async (req, res) => {
  try {
    const published = await Blog.find({ status: "published" })
      .sort({ published_at: -1 })
      .populate("user", "name");

    res.status(200).json(published);
  } catch (error) {
    console.error("Get published blogs error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching published blogs" });
  }
};

// Get all blogs for logged-in user (Protected)
export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user._id }).sort({
      updated_at: -1,
    });
    // Separate drafts and published blogs
    const drafts = blogs.filter((blog) => blog.status === "draft");
    const published = blogs.filter((blog) => blog.status === "published");

    res.status(200).json({ drafts, published });
  } catch (error) {
    console.error("Get user blogs error:", error);
    res.status(500).json({ message: "Server error while fetching user blogs" });
  }
};

// Update blog status (Protected)
export const updateBlogStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the blog belongs to the logged-in user
    if (blog.user.toString() !== req.user._id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this blog" });
    }

    blog.status = status;

    // If publishing, set published_at date
    if (status === "published" && !blog.published_at) {
      blog.published_at = Date.now();
    }

    blog.updated_at = Date.now();
    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    console.error("Update blog status error:", error);
    res
      .status(500)
      .json({ message: "Server error while updating blog status" });
  }
};

// Delete blog (Protected)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the blog belongs to the logged-in user
    if (blog.user.toString() !== req.user._id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this blog" });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Server error while deleting blog" });
  }
};

// Get blogs by tag (Public)
export const getBlogsByTag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const blogs = await Blog.find({
      tags: tag,
      status: "published",
    })
      .sort({ published_at: -1 })
      .populate("user", "name");

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Get blogs by tag error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching blogs by tag" });
  }
};

// Get all unique tags (Public)
export const getAllTags = async (req, res) => {
  try {
    // MongoDB aggregation to get unique tags
    const tagResults = await Blog.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags" } },
      { $sort: { _id: 1 } },
    ]);

    const tags = tagResults.map((tag) => tag._id);

    res.status(200).json(tags);
  } catch (error) {
    console.error("Get all tags error:", error);
    res.status(500).json({ message: "Server error while fetching tags" });
  }
};
