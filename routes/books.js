const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 12 } = req.query;
    let query = {};

    if (genre) {
      query.genre = { $in: [genre] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ averageRating: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate a book
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update user's read books
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    const existingRating = user.readBooks.find(b => b.bookId === req.params.id);
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      user.readBooks.push({
        bookId: req.params.id,
        rating,
        dateRead: new Date(),
      });
    }
    
    await user.save();

    // Update book's average rating
    const allUsers = await User.find({ 'readBooks.bookId': req.params.id });
    const ratings = allUsers.flatMap(u => 
      u.readBooks.filter(b => b.bookId === req.params.id).map(b => b.rating)
    );
    
    book.averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    book.ratingsCount = ratings.length;
    await book.save();

    res.json({ message: 'Rating saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;