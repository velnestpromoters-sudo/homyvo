const Blog = require('../models/Blog');

const SEED_BLOGS = [
  {
    slug: 'rental-agreement-tamil-nadu',
    title: 'Rental Agreement Rules & Tenant Rights in Tamil Nadu',
    excerpt: 'Understand the 11-month rental agreement tradition, security deposit caps, rent control acts, and key legal rights for tenants in Chennai, Coimbatore, and across Tamil Nadu.',
    content: 'Renting a residential property in cities like Chennai, Coimbatore, or Madurai requires navigating both standard industry practices and state-level laws.',
    category: 'Tenant Rights',
    date: 'June 27, 2026',
    readTime: '5 min read',
    author: 'Sathya (Digital Marketing)',
    imageColor: 'from-[#801786] to-[#ec38b7]'
  },
  {
    slug: 'real-estate-seo-keywords-intent',
    title: 'Real Estate SEO: Keywords & Search Intent Demystified',
    excerpt: 'Learn how SEO blogs, target keywords, and user search intents (informational, navigational, commercial, transactional) drive organic search traffic and high-value visibility to property platforms.',
    content: 'To capture high-quality organic traffic, property platforms and agents must match search engine algorithms. This is accomplished through SEO Blogs, strategic Keywords, and Search Intent.',
    category: 'SEO & Marketing',
    date: 'June 26, 2026',
    readTime: '6 min read',
    author: 'Sudharsan (Full Stack Dev)',
    imageColor: 'from-[#2563eb] to-[#3b82f6]'
  },
  {
    slug: 'broker-free-rentals-coimbatore',
    title: 'Broker-Free Rentals in Coimbatore: PGs & Apartments Guide',
    excerpt: 'Discover the top localities in Coimbatore like Saravanampatti and Peelamedu, avoid heavy broker commissions, and find budget-friendly verified PGs and apartments on Homyvo.',
    content: 'Coimbatore is growing rapidly as an IT and education hub. However, traditional rental markets are plagued by broker commission charges. Here is how to navigate Coimbatore broker-free.',
    category: 'Renting Guides',
    date: 'June 25, 2026',
    readTime: '4 min read',
    author: 'Deepak (Project Manager)',
    imageColor: 'from-[#059669] to-[#10b981]'
  }
];

// Seed blogs if collection is empty
const seedBlogsIfEmpty = async () => {
  try {
    const count = await Blog.countDocuments();
    if (count === 0) {
      await Blog.insertMany(SEED_BLOGS);
      console.log('Successfully seeded default SEO blogs.');
    }
  } catch (err) {
    console.error('Failed to seed blogs:', err);
  }
};

exports.getBlogs = async (req, res) => {
  try {
    await seedBlogsIfEmpty();
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (err) {
    console.error('Get Blogs Error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching blogs' });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    await seedBlogsIfEmpty();
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }
    res.json({ success: true, data: blog });
  } catch (err) {
    console.error('Get Blog by Slug Error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching blog details' });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, author, readTime, imageColor } = req.body;
    
    if (!title || !slug || !excerpt || !content || !category || !author) {
      return res.status(400).json({ success: false, message: 'All mandatory fields are required' });
    }

    const slugExists = await Blog.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({ success: false, message: 'Slug must be unique. An article with this slug already exists.' });
    }

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const words = content.trim().split(/\s+/).length;
    const computedReadTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

    const newBlog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      readTime: readTime || computedReadTime,
      date: today,
      imageColor: imageColor || 'from-[#801786] to-[#ec38b7]'
    });

    res.status(201).json({ success: true, data: newBlog });
  } catch (err) {
    console.error('Create Blog Error:', err);
    res.status(500).json({ success: false, message: 'Server error creating blog post' });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, author, readTime, imageColor } = req.body;
    
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }

    if (slug && slug !== blog.slug) {
      const slugExists = await Blog.findOne({ slug });
      if (slugExists) {
        return res.status(400).json({ success: false, message: 'Slug must be unique.' });
      }
    }

    const updatedData = {
      title: title || blog.title,
      slug: slug || blog.slug,
      excerpt: excerpt || blog.excerpt,
      content: content || blog.content,
      category: category || blog.category,
      author: author || blog.author,
      readTime: readTime || blog.readTime,
      imageColor: imageColor || blog.imageColor
    };

    blog = await Blog.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    res.json({ success: true, data: blog });
  } catch (err) {
    console.error('Update Blog Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating blog post' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (err) {
    console.error('Delete Blog Error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting blog post' });
  }
};
