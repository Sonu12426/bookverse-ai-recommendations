const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(session({
  secret: process.env.SESSION_SECRET || 'book-rec-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

console.log('🚀 Starting Futuristic Book Recommendation Server...');

// Generate large book database (10,000+ books)
const generateBookDatabase = () => {
  const genres = [
    'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Historical Fiction',
    'Literary Fiction', 'Horror', 'Adventure', 'Biography', 'Self-Help', 'Psychology',
    'Philosophy', 'Business', 'Technology', 'Health', 'Travel', 'Cooking', 'Art',
    'Music', 'Sports', 'Politics', 'Religion', 'Education', 'Parenting', 'Relationships'
  ];

  const authors = [
    'Alex Chen', 'Maya Rodriguez', 'James Wilson', 'Sarah Kim', 'David Thompson',
    'Lisa Zhang', 'Michael Brown', 'Emma Johnson', 'Robert Davis', 'Jennifer Lee',
    'Christopher Garcia', 'Amanda Martinez', 'Daniel Anderson', 'Jessica Taylor',
    'Matthew Thomas', 'Ashley Jackson', 'Andrew White', 'Stephanie Harris',
    'Joshua Martin', 'Nicole Thompson', 'Ryan Clark', 'Samantha Lewis',
    'Brandon Walker', 'Rachel Hall', 'Justin Allen', 'Megan Young',
    'Kevin King', 'Lauren Wright', 'Tyler Lopez', 'Brittany Hill'
  ];

  const titlePrefixes = [
    'The Last', 'Beyond the', 'Secrets of', 'The Hidden', 'Journey to',
    'Chronicles of', 'The Art of', 'Mastering', 'The Future of', 'Tales from',
    'The Science of', 'Understanding', 'The Power of', 'Exploring', 'The Mystery of',
    'Adventures in', 'The Complete Guide to', 'Discovering', 'The Truth About',
    'Unlocking', 'The Magic of', 'Inside', 'The World of', 'Breaking',
    'Creating', 'Building', 'Transforming', 'Revolutionizing', 'The Evolution of'
  ];

  const titleSuffixes = [
    'Tomorrow', 'Dreams', 'Reality', 'Innovation', 'Success', 'Wisdom',
    'Discovery', 'Adventure', 'Mystery', 'Love', 'Power', 'Freedom',
    'Knowledge', 'Truth', 'Hope', 'Change', 'Growth', 'Excellence',
    'Mastery', 'Breakthrough', 'Revolution', 'Transformation', 'Evolution',
    'Enlightenment', 'Inspiration', 'Creativity', 'Leadership', 'Vision'
  ];

  const books = [];
  
  for (let i = 1; i <= 12000; i++) {
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    const prefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
    const suffix = titleSuffixes[Math.floor(Math.random() * titleSuffixes.length)];
    
    const book = {
      _id: i.toString(),
      title: `${prefix} ${suffix}`,
      author: author,
      genre: [genre, genres[Math.floor(Math.random() * genres.length)]].filter((g, index, arr) => arr.indexOf(g) === index),
      description: generateDescription(genre, prefix, suffix),
      publishedYear: 1950 + Math.floor(Math.random() * 74), // 1950-2024
      isbn: `978-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
      ratingsCount: Math.floor(Math.random() * 5000) + 100,
      coverImage: `https://picsum.photos/320/400?random=${i}`,
      pages: Math.floor(Math.random() * 800) + 100,
      language: 'English',
      publisher: generatePublisher()
    };
    
    books.push(book);
  }
  
  return books;
};

const generateDescription = (genre, prefix, suffix) => {
  const descriptions = {
    'Science Fiction': `A mind-bending exploration of ${suffix.toLowerCase()} in a futuristic world where technology and humanity collide. ${prefix} ${suffix.toLowerCase()} challenges our understanding of reality and pushes the boundaries of what's possible.`,
    'Fantasy': `An epic tale of magic and adventure where ${suffix.toLowerCase()} holds the key to saving the realm. ${prefix} ${suffix.toLowerCase()} weaves together mythology, heroism, and wonder in an unforgettable journey.`,
    'Mystery': `A gripping investigation into ${suffix.toLowerCase()} that will keep you guessing until the final page. ${prefix} ${suffix.toLowerCase()} combines clever plotting with compelling characters in this unputdownable thriller.`,
    'Romance': `A heartwarming story of love and ${suffix.toLowerCase()} that will make you believe in happily ever after. ${prefix} ${suffix.toLowerCase()} explores the depths of human connection and the power of true love.`,
    'Self-Help': `Transform your life through the principles of ${suffix.toLowerCase()}. ${prefix} ${suffix.toLowerCase()} provides practical strategies and insights to help you achieve your goals and unlock your potential.`
  };
  
  return descriptions[genre] || `An engaging exploration of ${suffix.toLowerCase()} that offers fresh perspectives and compelling insights. ${prefix} ${suffix.toLowerCase()} is a thought-provoking read that will stay with you long after the final page.`;
};

const generatePublisher = () => {
  const publishers = [
    'Quantum Books', 'Future Press', 'Stellar Publishing', 'Nova Literature',
    'Cosmic Reads', 'Digital Dreams', 'Infinity Press', 'Nexus Books',
    'Cyber Publications', 'Hologram House', 'Matrix Media', 'Pixel Press'
  ];
  return publishers[Math.floor(Math.random() * publishers.length)];
};

// Generate the book database
const bookDatabase = generateBookDatabase();
console.log(`📚 Generated database with ${bookDatabase.length} books`);

// Middleware to make user available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.get('/test', (req, res) => {
  res.render('test', { title: 'CSS Test' });
});

app.get('/', (req, res) => {
  const trendingBooks = bookDatabase
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 12);
  
  res.render('index', { 
    title: 'BookVerse - AI-Powered Book Discovery',
    trendingBooks 
  });
});

app.get('/books', (req, res) => {
  const { search, genre, page = 1, limit = 24 } = req.query;
  let filteredBooks = [...bookDatabase];

  // Apply filters
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.description.toLowerCase().includes(searchTerm)
    );
  }

  if (genre && genre !== 'all') {
    filteredBooks = filteredBooks.filter(book => 
      book.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredBooks.length / limit);

  // Get unique genres for filter
  const allGenres = [...new Set(bookDatabase.flatMap(book => book.genre))].sort();

  res.render('books', {
    title: 'Discover Books - BookVerse',
    books: paginatedBooks,
    currentPage: parseInt(page),
    totalPages,
    totalBooks: filteredBooks.length,
    search: search || '',
    selectedGenre: genre || 'all',
    genres: allGenres
  });
});

app.get('/books/:id', (req, res) => {
  const book = bookDatabase.find(b => b._id === req.params.id);
  
  if (!book) {
    return res.status(404).render('404', { title: 'Book Not Found' });
  }

  // Get related books (same genre)
  const relatedBooks = bookDatabase
    .filter(b => b._id !== book._id && b.genre.some(g => book.genre.includes(g)))
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  res.render('book-detail', {
    title: `${book.title} - BookVerse`,
    book,
    relatedBooks
  });
});

app.get('/ai-finder', (req, res) => {
  res.render('ai-finder', {
    title: 'AI Book Finder - BookVerse'
  });
});

app.post('/ai-finder', (req, res) => {
  const { description, genre, mood, themes } = req.body;
  
  if (!description) {
    return res.redirect('/ai-finder?error=Description is required');
  }

  // AI matching algorithm
  const keywords = description.toLowerCase();
  let matchedBooks = [...bookDatabase];

  // Filter by genre if specified
  if (genre && genre !== 'any') {
    matchedBooks = matchedBooks.filter(book => 
      book.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
    );
  }

  // Score books based on description
  const scoredBooks = matchedBooks.map(book => {
    let score = 0;
    const bookText = `${book.title} ${book.description} ${book.genre.join(' ')}`.toLowerCase();
    
    // Keyword matching
    const descWords = keywords.split(' ').filter(word => word.length > 3);
    descWords.forEach(word => {
      if (bookText.includes(word)) {
        score += 0.3;
      }
    });

    // Theme matching
    if (themes) {
      const themeWords = themes.toLowerCase().split(',').map(t => t.trim());
      themeWords.forEach(theme => {
        if (bookText.includes(theme)) {
          score += 0.4;
        }
      });
    }

    // Mood matching
    const moodKeywords = {
      'uplifting': ['success', 'hope', 'inspire', 'positive', 'growth'],
      'dark': ['mystery', 'thriller', 'dark', 'crime', 'horror'],
      'romantic': ['love', 'romance', 'relationship', 'heart'],
      'adventurous': ['adventure', 'journey', 'quest', 'explore'],
      'thoughtful': ['philosophy', 'wisdom', 'meaning', 'truth']
    };

    if (mood && moodKeywords[mood]) {
      moodKeywords[mood].forEach(keyword => {
        if (keywords.includes(keyword) || bookText.includes(keyword)) {
          score += 0.5;
        }
      });
    }

    // Add rating bonus
    score += (book.averageRating - 3) * 0.1;

    return { ...book, matchScore: score };
  });

  // Get top matches
  const recommendations = scoredBooks
    .filter(book => book.matchScore > 0.3)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 12);

  res.render('ai-results', {
    title: 'AI Recommendations - BookVerse',
    recommendations,
    query: { description, genre, mood, themes }
  });
});

app.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login - BookVerse' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo login (in real app, verify against database)
  if (email && password) {
    req.session.user = {
      id: 'demo-user',
      name: 'Demo User',
      email: email
    };
    res.redirect('/');
  } else {
    res.render('auth/login', { 
      title: 'Login - BookVerse',
      error: 'Please provide email and password'
    });
  }
});

app.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register - BookVerse' });
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Demo registration
  if (name && email && password) {
    req.session.user = {
      id: 'demo-user',
      name: name,
      email: email
    };
    res.redirect('/');
  } else {
    res.render('auth/register', { 
      title: 'Register - BookVerse',
      error: 'Please fill in all fields'
    });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  res.render('profile', {
    title: 'Profile - BookVerse'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found - BookVerse' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Visit http://localhost:${PORT}`);
  console.log(`📚 Database: ${bookDatabase.length} books loaded`);
  console.log(`🤖 AI-powered recommendations ready`);
});