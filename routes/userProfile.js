const { Router } = require("express");
const {
    userModel,
    favoriteModel,
    wishlistModel,
    readingHistoryModel,
    activityLogModel,
    ratingModel,
    readingListModel
} = require("../db");
const userProfileRouter = Router();
const { userMiddleware } = require("../middleware/user");
const { z } = require("zod");

// Update user profile
const updateProfileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional()
    }).optional(),
    preferences: z.object({
        favoriteGenres: z.array(z.string()).optional(),
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional()
    }).optional(),
    readingGoal: z.object({
        yearlyTarget: z.number().min(1).optional()
    }).optional()
});

userProfileRouter.get("/profile", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get additional stats
        const currentYear = new Date().getFullYear();
        const booksRead = await readingHistoryModel.countDocuments({
            userId,
            status: 'completed',
            completedDate: { $gte: new Date(currentYear, 0, 1) }
        });

        const favoritesCount = await favoriteModel.countDocuments({ userId });
        const wishlistCount = await wishlistModel.countDocuments({ userId });
        const readingListsCount = await readingListModel.countDocuments({ userId });

        res.json({
            user: {
                ...user.toObject(),
                readingGoal: {
                    ...user.readingGoal,
                    booksRead,
                    currentYear
                }
            },
            stats: {
                favoritesCount,
                wishlistCount,
                readingListsCount,
                booksRead
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

userProfileRouter.put("/profile", userMiddleware, async function (req, res) {
    try {
        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
        }

        const userId = req.userId;
        const updateData = parsed.data;

        if (updateData.dateOfBirth) {
            updateData.dateOfBirth = new Date(updateData.dateOfBirth);
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'profile_updated',
            targetType: 'user',
            targetId: userId,
            details: 'User profile updated'
        });

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Favorites management
userProfileRouter.post("/favorites", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).json({ message: "Book ID is required" });
        }

        // Check if already in favorites
        const existing = await favoriteModel.findOne({ userId, bookId });
        if (existing) {
            return res.status(400).json({ message: "Book already in favorites" });
        }

        await favoriteModel.create({ userId, bookId });

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'added_to_favorites',
            targetType: 'book',
            targetId: bookId,
            details: 'Added book to favorites'
        });

        res.json({ message: "Book added to favorites" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

userProfileRouter.delete("/favorites/:bookId", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const { bookId } = req.params;

        const deleted = await favoriteModel.findOneAndDelete({ userId, bookId });
        if (!deleted) {
            return res.status(404).json({ message: "Book not found in favorites" });
        }

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'removed_from_favorites',
            targetType: 'book',
            targetId: bookId,
            details: 'Removed book from favorites'
        });

        res.json({ message: "Book removed from favorites" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

userProfileRouter.get("/favorites", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const favorites = await favoriteModel.find({ userId })
            .populate('bookId')
            .sort({ dateAdded: -1 });

        res.json({ favorites });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Wishlist management
userProfileRouter.post("/wishlist", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const { bookId, priority = 'medium' } = req.body;

        if (!bookId) {
            return res.status(400).json({ message: "Book ID is required" });
        }

        // Check if already in wishlist
        const existing = await wishlistModel.findOne({ userId, bookId });
        if (existing) {
            return res.status(400).json({ message: "Book already in wishlist" });
        }

        await wishlistModel.create({ userId, bookId, priority });

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'added_to_wishlist',
            targetType: 'book',
            targetId: bookId,
            details: `Added book to wishlist with ${priority} priority`
        });

        res.json({ message: "Book added to wishlist" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

userProfileRouter.delete("/wishlist/:bookId", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const { bookId } = req.params;

        const deleted = await wishlistModel.findOneAndDelete({ userId, bookId });
        if (!deleted) {
            return res.status(404).json({ message: "Book not found in wishlist" });
        }

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'removed_from_wishlist',
            targetType: 'book',
            targetId: bookId,
            details: 'Removed book from wishlist'
        });

        res.json({ message: "Book removed from wishlist" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

userProfileRouter.get("/wishlist", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const wishlist = await wishlistModel.find({ userId })
            .populate('bookId')
            .sort({ priority: 1, dateAdded: -1 });

        res.json({ wishlist });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Reading History management
userProfileRouter.post("/reading-history", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const { bookId, status = 'reading', pagesRead = 0, totalPages, notes = '' } = req.body;

        if (!bookId) {
            return res.status(400).json({ message: "Book ID is required" });
        }

        // Check if already exists
        let history = await readingHistoryModel.findOne({ userId, bookId });

        if (history) {
            // Update existing
            history.status = status;
            history.pagesRead = pagesRead;
            history.totalPages = totalPages || history.totalPages;
            history.notes = notes;
            history.progress = totalPages ? (pagesRead / totalPages * 100) : 0;

            if (status === 'completed' && !history.completedDate) {
                history.completedDate = new Date();
            }

            await history.save();
        } else {
            // Create new
            const progress = totalPages ? (pagesRead / totalPages * 100) : 0;
            const historyData = {
                userId,
                bookId,
                status,
                pagesRead,
                totalPages,
                notes,
                progress
            };

            if (status === 'completed') {
                historyData.completedDate = new Date();
            }

            history = await readingHistoryModel.create(historyData);
        }

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'reading_progress_updated',
            targetType: 'book',
            targetId: bookId,
            details: `Reading status updated to ${status}`
        });

        res.json({ message: "Reading history updated", history });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

userProfileRouter.get("/reading-history", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const { status, limit = 50, page = 1 } = req.query;

        const query = { userId };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const history = await readingHistoryModel.find(query)
            .populate('bookId')
            .sort({ startDate: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await readingHistoryModel.countDocuments(query);

        res.json({
            history,
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

// Activity log
userProfileRouter.get("/activity", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const { limit = 20, page = 1 } = req.query;

        const skip = (page - 1) * limit;
        const activities = await activityLogModel.find({ userId })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await activityLogModel.countDocuments({ userId });

        res.json({
            activities,
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

// Dashboard stats
userProfileRouter.get("/dashboard", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        // Reading stats
        const booksReadThisYear = await readingHistoryModel.countDocuments({
            userId,
            status: 'completed',
            completedDate: { $gte: new Date(currentYear, 0, 1) }
        });

        const booksReadThisMonth = await readingHistoryModel.countDocuments({
            userId,
            status: 'completed',
            completedDate: { $gte: new Date(currentYear, currentMonth, 1) }
        });

        const currentlyReading = await readingHistoryModel.countDocuments({
            userId,
            status: 'reading'
        });

        // Collection stats
        const favoritesCount = await favoriteModel.countDocuments({ userId });
        const wishlistCount = await wishlistModel.countDocuments({ userId });
        const readingListsCount = await readingListModel.countDocuments({ userId });

        // Recent activity
        const recentActivity = await activityLogModel.find({ userId })
            .sort({ timestamp: -1 })
            .limit(5);

        // Reading goal progress
        const user = await userModel.findById(userId).select('readingGoal');
        const goalProgress = user.readingGoal?.yearlyTarget ?
            (booksReadThisYear / user.readingGoal.yearlyTarget * 100) : 0;

        res.json({
            readingStats: {
                booksReadThisYear,
                booksReadThisMonth,
                currentlyReading,
                goalProgress: Math.round(goalProgress)
            },
            collectionStats: {
                favoritesCount,
                wishlistCount,
                readingListsCount
            },
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = {
    userProfileRouter
};