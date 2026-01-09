# 📚 BookVerse - AI Book Recommendation Platform

A futuristic web app that helps you find your next great read using AI-powered recommendations.

## ✨ Features

- **AI Book Finder** - Describe what you want to read in plain English
- **12,000+ Books** - Large database across 25+ genres
- **Futuristic UI** - Dark theme with neon accents and animations
- **Smart Search** - Filter by genre, author, or keywords
- **User Auth** - Login/register system
- **Responsive** - Works on all devices

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, EJS
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: In-memory (12K generated books)
- **Styling**: Custom CSS with animations

## 🚀 Quick Start

```bash
git clone https://github.com/Sonu12426/bookverse-ai-recommendations.git
cd bookverse-ai-recommendations
npm install
npm start
```

Visit `http://localhost:3000`

## 🤖 How the AI Works

1. You describe what you want to read
2. Algorithm extracts keywords and analyzes mood
3. Matches against book descriptions and genres
4. Returns scored recommendations with explanations

## 📁 Project Structure

```
├── server.js              # Main server
├── views/                 # EJS templates
├── public/               # CSS & JS files
├── routes/               # API routes
└── models/               # Data models
```

## 🎨 UI Design

- Dark space theme with animated starfield background
- Neon blue/purple/green accent colors
- Glass-morphism cards with hover effects
- Mobile-first responsive design

## 🔧 Key Features

### AI Recommendation Engine
- Natural language processing for user queries
- Multi-factor scoring (keywords, mood, themes, ratings)
- Content-based filtering algorithm

### Book Database
- 12,000 algorithmically generated books
- Realistic metadata (ISBN, ratings, descriptions)
- 25+ genres with proper categorization

### Authentication
- Session-based login system
- Protected routes for user features
- Secure cookie management

## 📊 Performance

- Sub-second search across 12K books
- 60fps animations with hardware acceleration
- Optimized for mobile and desktop
- Efficient in-memory data structures

## 🚀 Future Plans

- Real database integration (MongoDB)
- User reading history and preferences
- Social features (reviews, ratings)
- Mobile app version

---

**Live Demo**: Deploy on Heroku/Vercel using the setup guide
**Documentation**: Check `TECHNICAL_GUIDE.md` for detailed implementation details