const express = require('express');
const { PythonShell } = require('python-shell');
const Book = require('../models/Book');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get personalized recommendations
router.get('/personalized', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const allBooks = await Book.find();

    // Prepare data for ML model
    const userData = {
      userId: user._id.toString(),
      readBooks: user.readBooks,
      preferences: user.preferences,
    };

    const booksData = allBooks.map(book => ({
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      genre: book.genre,
      averageRating: book.averageRating,
      features: book.features,
    }));

    // Call Python ML script
    const options = {
      mode: 'json',
      pythonPath: 'python',
      scriptPath: './ml/',
      args: [JSON.stringify({ user: userData, books: booksData })],
    };

    PythonShell.run('recommend.py', options, (err, results) => {
      if (err) {
        console.error('ML Error:', err);
        // Fallback to simple recommendation
        return getFallbackRecommendations(user, allBooks, res);
      }

      const recommendations = results[0];
      res.json(recommendations);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending books
router.get('/trending', async (req, res) => {
  try {
    const trendingBooks = await Book.find()
      .sort({ averageRating: -1, ratingsCount: -1 })
      .limit(10);

    res.json(trendingBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fallback recommendation function
async function getFallbackRecommendations(user, allBooks, res) {
  try {
    const readBookIds = user.readBooks.map(b => b.bookId);
    const unreadBooks = allBooks.filter(book => !readBookIds.includes(book._id.toString()));
    
    // Simple genre-based recommendation
    const preferredGenres = user.preferences.genres || [];
    let recommendations = unreadBooks.filter(book => 
      book.genre.some(g => preferredGenres.includes(g))
    );

    if (recommendations.length < 5) {
      recommendations = unreadBooks.sort((a, b) => b.averageRating - a.averageRating);
    }

    res.json(recommendations.slice(0, 10));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = router;