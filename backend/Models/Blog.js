import mongoose from 'mongoose';
const { Schema } = mongoose;

const BlogSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
 tags: {
  type: [String],
  default: []
},
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // If you implement authentication, you can uncomment this:
    required: [true, 'User ID is required']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  published_at: {
    type: Date,
    default: null
  },
  read_time: {
    type: Number, // Estimated reading time in minutes
    default: 0
  },
  view_count: {
    type: Number,
    default: 0
  },
  comment_count: {
    type: Number,
    default: 0
  }
});

BlogSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  
  // If status is changing to published, set published_at
  if (this.isModified('status') && this.status === 'published') {
    this.published_at = Date.now();
  }
  
  // Generate slug from title if not already set
  
  
  // Calculate estimated read time
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.read_time = Math.ceil(wordCount / 200); // Assuming 200 words per minute
  }
  
  next();
});
// Virtual for formatted date
BlogSchema.virtual('formattedDate').get(function() {
  return this.created_at.toLocaleDateString();
});

// Method to check if blog is a draft
BlogSchema.methods.isDraft = function() {
  return this.status === 'draft';
};

// Method to publish a draft
BlogSchema.methods.publish = function() {
  this.status = 'published';
  this.published_at = Date.now();
  return this.save();
};

// Indexes for better query performance
BlogSchema.index({ status: 1, created_at: -1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ user: 1, status: 1 });

const Blog = mongoose.model('Blog', BlogSchema);

export default Blog;