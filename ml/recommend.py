import json
import sys
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

def get_recommendations(user_data, books_data):
    """
    Generate book recommendations using collaborative filtering and content-based filtering
    """
    try:
        user = user_data['user']
        books = user_data['books']
        
        if not books:
            return []
        
        # Get user's read books and ratings
        read_books = {book['bookId']: book['rating'] for book in user['readBooks']}
        read_book_ids = set(read_books.keys())
        
        # Filter unread books
        unread_books = [book for book in books if book['id'] not in read_book_ids]
        
        if not unread_books:
            return []
        
        # Content-based filtering
        content_scores = calculate_content_similarity(user, books, unread_books)
        
        # Collaborative filtering (simplified)
        collab_scores = calculate_collaborative_scores(user, books, unread_books)
        
        # Combine scores
        final_scores = {}
        for book_id in content_scores:
            content_score = content_scores.get(book_id, 0)
            collab_score = collab_scores.get(book_id, 0)
            final_scores[book_id] = 0.6 * content_score + 0.4 * collab_score
        
        # Sort and get top recommendations
        sorted_books = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
        top_book_ids = [book_id for book_id, score in sorted_books[:10]]
        
        recommendations = [book for book in unread_books if book['id'] in top_book_ids]
        
        return recommendations[:10]
        
    except Exception as e:
        print(f"Error in recommendations: {e}", file=sys.stderr)
        return []

def calculate_content_similarity(user, all_books, unread_books):
    """
    Calculate content-based similarity scores
    """
    scores = {}
    
    # Get user's preferred genres from read books
    read_books = {book['bookId']: book['rating'] for book in user['readBooks']}
    user_genres = []
    
    for book in all_books:
        if book['id'] in read_books and read_books[book['id']] >= 4:
            user_genres.extend(book['genre'])
    
    # Add explicit preferences
    if 'genres' in user.get('preferences', {}):
        user_genres.extend(user['preferences']['genres'])
    
    # Calculate genre similarity
    for book in unread_books:
        genre_overlap = len(set(book['genre']) & set(user_genres))
        genre_score = genre_overlap / max(len(book['genre']), 1)
        
        # Factor in book rating
        rating_score = book['averageRating'] / 5.0 if book['averageRating'] > 0 else 0.5
        
        scores[book['id']] = genre_score * 0.7 + rating_score * 0.3
    
    return scores

def calculate_collaborative_scores(user, all_books, unread_books):
    """
    Simplified collaborative filtering
    """
    scores = {}
    
    # For simplicity, use popularity and rating as collaborative signals
    for book in unread_books:
        popularity_score = min(book.get('ratingsCount', 0) / 100.0, 1.0)
        rating_score = book['averageRating'] / 5.0 if book['averageRating'] > 0 else 0.5
        
        scores[book['id']] = popularity_score * 0.3 + rating_score * 0.7
    
    return scores

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.argv[1])
        recommendations = get_recommendations(input_data, input_data)
        print(json.dumps(recommendations))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        print(json.dumps([]))