const { Router } = require("express");
const {
    bookModel,
    ratingModel,
    categoryModel,
    recommendationModel,
    activityLogModel,
    favoriteModel,
    wishlistModel,
    readingHistoryModel
} = require("../db");
const bookFeatureRouter = Router();
const { userMiddleware } = require("../middleware/user");
const { z } = require("zod");

// Rating and Review System
const ratingSchema = z.object({
    bookId: z.string().min(1),
    rating: z.number().min(1).max(5),
    review: z.string().optional()
});

bookFeatureRouter.post("/rate", userMiddleware, async function (req, res) {
    try {
        const parsed = ratingSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
        }

        const userId = req.userId;
        const { bookId, rating, review } = parsed.data;

        // Check if user already rated this book
        let existingRating = await ratingModel.findOne({ bookId, userId });

        if (existingRating) {
            // Update existing rating
            existingRating.rating = rating;
            existingRating.review = review || '';
            existingRating.reviewDate = new Date();
            await existingRating.save();
        } else {
            // Create new rating
            existingRating = await ratingModel.create({
                bookId,
                userId,
                rating,
                review: review || ''
            });
        }

        // Update book's average rating
        const ratings = await ratingModel.find({ bookId });
        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

        await bookModel.findByIdAndUpdate(bookId, {
            averageRating: Math.round(avgRating * 10) / 10,
            ratingsCount: ratings.length
        });

        // Log activity
        await activityLogModel.create({
            userId,
            action: existingRating.isNew ? 'rated_book' : 'updated_rating',
            targetType: 'book',
            targetId: bookId,
            details: `Rated book ${rating}/5 stars`
        });

        res.json({ message: "Rating submitted successfully", rating: existingRating });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

bookFeatureRouter.get("/ratings/:bookId", async function (req, res) {
    try {
        const { bookId } = req.params;
        const { page = 1, limit = 10, sortBy = 'reviewDate' } = req.query;

        const skip = (page - 1) * limit;
        const ratings = await ratingModel.find({ bookId, review: { $ne: '' } })
            .populate('userId', 'firstName lastName')
            .sort({ [sortBy]: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await ratingModel.countDocuments({ bookId, review: { $ne: '' } });

        res.json({
            ratings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Category Management
bookFeatureRouter.get("/categories", async function (req, res) {
    try {
        const categories = await categoryModel.find({})
            .sort({ name: 1 });

        res.json({ categories });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

bookFeatureRouter.get("/categories/:categoryId/books", async function (req, res) {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 20, sortBy = 'title' } = req.query;

        const category = await categoryModel.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const skip = (page - 1) * limit;
        const books = await bookModel.find({ category: category.name })
            .sort({ [sortBy]: 1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await bookModel.countDocuments({ category: category.name });

        res.json({
            books,
            category,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Advanced Search
bookFeatureRouter.get("/search", async function (req, res) {
    try {
        const {
            q,
            category,
            author,
            minRating,
            maxRating,
            available,
            tags,
            sortBy = 'relevance',
            page = 1,
            limit = 20
        } = req.query;

        let query = {};
        let sortOptions = {};

        // Text search
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { author: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Author filter
        if (author) {
            query.author = { $regex: author, $options: 'i' };
        }

        // Rating filter
        if (minRating || maxRating) {
            query.averageRating = {};
            if (minRating) query.averageRating.$gte = parseFloat(minRating);
            if (maxRating) query.averageRating.$lte = parseFloat(maxRating);
        }

        // Availability filter
        if (available === 'true') {
            query.copiesAvailable = { $gt: 0 };
        }

        // Tags filter
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagArray };
        }

        // Sorting
        switch (sortBy) {
            case 'title':
                sortOptions = { title: 1 };
                break;
            case 'author':
                sortOptions = { author: 1 };
                break;
            case 'rating':
                sortOptions = { averageRating: -1 };
                break;
            case 'popularity':
                sortOptions = { borrowCount: -1 };
                break;
            case 'newest':
                sortOptions = { dateAdded: -1 };
                break;
            default: // relevance
                sortOptions = { averageRating: -1, borrowCount: -1 };
        }

        const skip = (page - 1) * limit;
        const books = await bookModel.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await bookModel.countDocuments(query);

        res.json({
            books,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            searchParams: {
                q, category, author, minRating, maxRating, available, tags, sortBy
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Book Recommendations
bookFeatureRouter.get("/recommendations", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const { limit = 10 } = req.query;

        // Get user's favorite genres and rated books
        const userRatings = await ratingModel.find({ userId, rating: { $gte: 4 } });
        const ratedBookIds = userRatings.map(r => r.bookId);

        const userFavorites = await favoriteModel.find({ userId });
        const favoriteBookIds = userFavorites.map(f => f.bookId);

        const allUserBooks = [...new Set([...ratedBookIds, ...favoriteBookIds])];

        if (allUserBooks.length === 0) {
            // New user - recommend popular books
            const popularBooks = await bookModel.find({})
                .sort({ averageRating: -1, borrowCount: -1 })
                .limit(parseInt(limit));

            return res.json({
                recommendations: popularBooks.map(book => ({
                    book,
                    reason: "Popular among all users",
                    score: book.averageRating + (book.borrowCount / 100)
                }))
            });
        }

        // Get categories of books user likes
        const likedBooks = await bookModel.find({ _id: { $in: allUserBooks } });
        const likedCategories = [...new Set(likedBooks.map(book => book.category))];
        const likedAuthors = [...new Set(likedBooks.map(book => book.author))];

        // Find similar books
        const similarBooks = await bookModel.find({
            _id: { $nin: allUserBooks },
            $or: [
                { category: { $in: likedCategories } },
                { author: { $in: likedAuthors } },
                { tags: { $in: likedBooks.flatMap(book => book.tags || []) } }
            ]
        })
            .sort({ averageRating: -1, borrowCount: -1 })
            .limit(parseInt(limit));

        const recommendations = similarBooks.map(book => {
            let reason = "Recommended for you";
            let score = book.averageRating;

            if (likedCategories.includes(book.category)) {
                reason = `Because you like ${book.category} books`;
                score += 1;
            }
            if (likedAuthors.includes(book.author)) {
                reason = `Because you like books by ${book.author}`;
                score += 2;
            }

            return { book, reason, score };
        });

        // Sort by score
        recommendations.sort((a, b) => b.score - a.score);

        res.json({ recommendations });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get book details with enhanced information
bookFeatureRouter.get("/:bookId/details", async function (req, res) {
    try {
        const { bookId } = req.params;
        const userId = req.headers.userid; // Optional user context

        const book = await bookModel.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Get rating statistics
        const ratingStats = await ratingModel.aggregate([
            { $match: { bookId: book._id } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingStats.forEach(stat => {
            ratingDistribution[stat._id] = stat.count;
        });

        // Get recent reviews
        const recentReviews = await ratingModel.find({
            bookId,
            review: { $ne: '' }
        })
            .populate('userId', 'firstName lastName')
            .sort({ reviewDate: -1 })
            .limit(5);

        // Get user-specific data if userId provided
        let userInteraction = null;
        if (userId) {
            const userRating = await ratingModel.findOne({ bookId, userId });
            const userFavorite = await favoriteModel.findOne({ bookId, userId });
            const userWishlist = await wishlistModel.findOne({ bookId, userId });
            const userReading = await readingHistoryModel.findOne({ bookId, userId });

            userInteraction = {
                rating: userRating?.rating || null,
                review: userRating?.review || '',
                isFavorite: !!userFavorite,
                inWishlist: !!userWishlist,
                readingStatus: userReading?.status || null,
                progress: userReading?.progress || 0
            };
        }

        // Get similar books
        const similarBooks = await bookModel.find({
            _id: { $ne: bookId },
            $or: [
                { category: book.category },
                { author: book.author },
                { tags: { $in: book.tags || [] } }
            ]
        })
            .sort({ averageRating: -1 })
            .limit(6);

        res.json({
            book,
            ratingDistribution,
            recentReviews,
            userInteraction,
            similarBooks
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get popular/trending books
bookFeatureRouter.get("/featured/popular", async function (req, res) {
    try {
        const { limit = 10, timeframe = 'all' } = req.query;

        let dateFilter = {};
        if (timeframe === 'week') {
            dateFilter = { dateAdded: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
        } else if (timeframe === 'month') {
            dateFilter = { dateAdded: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
        }

        const popularBooks = await bookModel.find(dateFilter)
            .sort({ borrowCount: -1, averageRating: -1 })
            .limit(parseInt(limit));

        res.json({ books: popularBooks });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get highly rated books
bookFeatureRouter.get("/featured/top-rated", async function (req, res) {
    try {
        const { limit = 10, minRatings = 5 } = req.query;

        const topRatedBooks = await bookModel.find({
            ratingsCount: { $gte: parseInt(minRatings) }
        })
            .sort({ averageRating: -1, ratingsCount: -1 })
            .limit(parseInt(limit));

        res.json({ books: topRatedBooks });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get new arrivals
bookFeatureRouter.get("/featured/new-arrivals", async function (req, res) {
    try {
        const { limit = 10 } = req.query;

        const newBooks = await bookModel.find({})
            .sort({ dateAdded: -1 })
            .limit(parseInt(limit));

        res.json({ books: newBooks });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = {
    bookFeatureRouter
};