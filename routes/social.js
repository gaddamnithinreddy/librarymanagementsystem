const { Router } = require("express");
const {
    readingListModel,
    userModel,
    bookModel,
    activityLogModel,
    ratingModel,
    readingHistoryModel
} = require("../db");
const socialRouter = Router();
const { userMiddleware } = require("../middleware/user");
const { z } = require("zod");

// Reading Lists Management
const createListSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional()
});

const updateListSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional()
});

// Create a reading list
socialRouter.post("/reading-lists", userMiddleware, async function (req, res) {
    try {
        const parsed = createListSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
        }

        const userId = req.userId;
        const { name, description = '', isPublic = false } = parsed.data;

        // Check if user already has a list with this name
        const existing = await readingListModel.findOne({ userId, name });
        if (existing) {
            return res.status(400).json({ message: "You already have a reading list with this name" });
        }

        const readingList = await readingListModel.create({
            userId,
            name,
            description,
            isPublic,
            books: []
        });

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'created_reading_list',
            targetType: 'list',
            targetId: readingList._id,
            details: `Created reading list: ${name}`
        });

        res.json({ message: "Reading list created successfully", readingList });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get user's reading lists
socialRouter.get("/reading-lists", userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const { includeBooks = 'false' } = req.query;

        let query = readingListModel.find({ userId }).sort({ dateModified: -1 });

        if (includeBooks === 'true') {
            query = query.populate('books');
        }

        const readingLists = await query;

        // Add book count for each list
        const listsWithCounts = readingLists.map(list => ({
            ...list.toObject(),
            bookCount: list.books.length
        }));

        res.json({ readingLists: listsWithCounts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get a specific reading list
socialRouter.get("/reading-lists/:listId", async function (req, res) {
    try {
        const { listId } = req.params;
        const userId = req.userId; // From userMiddleware if authenticated

        const readingList = await readingListModel.findById(listId)
            .populate('books')
            .populate('userId', 'firstName lastName');

        if (!readingList) {
            return res.status(404).json({ message: "Reading list not found" });
        }

        // Check if user can view this list
        if (!readingList.isPublic && readingList.userId._id.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json({ readingList });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update a reading list
socialRouter.put("/reading-lists/:listId", userMiddleware, async function (req, res) {
    try {
        const parsed = updateListSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
        }

        const { listId } = req.params;
        const userId = req.userId;

        const readingList = await readingListModel.findOne({ _id: listId, userId });
        if (!readingList) {
            return res.status(404).json({ message: "Reading list not found" });
        }

        const updateData = { ...parsed.data, dateModified: new Date() };
        const updatedList = await readingListModel.findByIdAndUpdate(
            listId,
            updateData,
            { new: true }
        );

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'updated_reading_list',
            targetType: 'list',
            targetId: listId,
            details: `Updated reading list: ${updatedList.name}`
        });

        res.json({ message: "Reading list updated successfully", readingList: updatedList });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a reading list
socialRouter.delete("/reading-lists/:listId", userMiddleware, async function (req, res) {
    try {
        const { listId } = req.params;
        const userId = req.userId;

        const readingList = await readingListModel.findOne({ _id: listId, userId });
        if (!readingList) {
            return res.status(404).json({ message: "Reading list not found" });
        }

        await readingListModel.findByIdAndDelete(listId);

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'deleted_reading_list',
            targetType: 'list',
            targetId: listId,
            details: `Deleted reading list: ${readingList.name}`
        });

        res.json({ message: "Reading list deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add book to reading list
socialRouter.post("/reading-lists/:listId/books", userMiddleware, async function (req, res) {
    try {
        const { listId } = req.params;
        const { bookId } = req.body;
        const userId = req.userId;

        if (!bookId) {
            return res.status(400).json({ message: "Book ID is required" });
        }

        const readingList = await readingListModel.findOne({ _id: listId, userId });
        if (!readingList) {
            return res.status(404).json({ message: "Reading list not found" });
        }

        // Check if book exists
        const book = await bookModel.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if book is already in the list
        if (readingList.books.includes(bookId)) {
            return res.status(400).json({ message: "Book is already in this reading list" });
        }

        readingList.books.push(bookId);
        readingList.dateModified = new Date();
        await readingList.save();

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'added_book_to_list',
            targetType: 'list',
            targetId: listId,
            details: `Added "${book.title}" to reading list "${readingList.name}"`
        });

        res.json({ message: "Book added to reading list successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Remove book from reading list
socialRouter.delete("/reading-lists/:listId/books/:bookId", userMiddleware, async function (req, res) {
    try {
        const { listId, bookId } = req.params;
        const userId = req.userId;

        const readingList = await readingListModel.findOne({ _id: listId, userId });
        if (!readingList) {
            return res.status(404).json({ message: "Reading list not found" });
        }

        const bookIndex = readingList.books.indexOf(bookId);
        if (bookIndex === -1) {
            return res.status(404).json({ message: "Book not found in this reading list" });
        }

        readingList.books.splice(bookIndex, 1);
        readingList.dateModified = new Date();
        await readingList.save();

        const book = await bookModel.findById(bookId);

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'removed_book_from_list',
            targetType: 'list',
            targetId: listId,
            details: `Removed "${book?.title || 'Unknown book'}" from reading list "${readingList.name}"`
        });

        res.json({ message: "Book removed from reading list successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get public reading lists (discover)
socialRouter.get("/discover/reading-lists", async function (req, res) {
    try {
        const { page = 1, limit = 20, sortBy = 'popular' } = req.query;

        let sortOptions = {};
        switch (sortBy) {
            case 'newest':
                sortOptions = { dateCreated: -1 };
                break;
            case 'updated':
                sortOptions = { dateModified: -1 };
                break;
            case 'popular':
            default:
                // Sort by number of books in list
                sortOptions = { dateModified: -1 };
        }

        const skip = (page - 1) * limit;
        const publicLists = await readingListModel.find({ isPublic: true })
            .populate('userId', 'firstName lastName')
            .populate('books', 'title author imageUrl averageRating')
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await readingListModel.countDocuments({ isPublic: true });

        // Add additional info for each list
        const listsWithInfo = publicLists.map(list => ({
            ...list.toObject(),
            bookCount: list.books.length,
            owner: `${list.userId.firstName} ${list.userId.lastName}`
        }));

        res.json({
            readingLists: listsWithInfo,
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

// Get user's public profile with their public lists
socialRouter.get("/users/:userId/profile", async function (req, res) {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId).select('firstName lastName bio joinDate');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get public reading lists
        const publicLists = await readingListModel.find({ userId, isPublic: true })
            .populate('books', 'title author imageUrl')
            .sort({ dateModified: -1 })
            .limit(10);

        // Get reading statistics
        const totalBooksRead = await readingHistoryModel.countDocuments({
            userId,
            status: 'completed'
        });

        const totalReviews = await ratingModel.countDocuments({
            userId,
            review: { $ne: '' }
        });

        res.json({
            user,
            readingLists: publicLists.map(list => ({
                ...list.toObject(),
                bookCount: list.books.length
            })),
            stats: {
                totalBooksRead,
                totalReviews,
                publicListsCount: publicLists.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Search reading lists
socialRouter.get("/search/reading-lists", async function (req, res) {
    try {
        const { q, page = 1, limit = 20 } = req.query;

        if (!q) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchQuery = {
            isPublic: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        };

        const skip = (page - 1) * limit;
        const readingLists = await readingListModel.find(searchQuery)
            .populate('userId', 'firstName lastName')
            .populate('books', 'title author imageUrl')
            .sort({ dateModified: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await readingListModel.countDocuments(searchQuery);

        const listsWithInfo = readingLists.map(list => ({
            ...list.toObject(),
            bookCount: list.books.length,
            owner: `${list.userId.firstName} ${list.userId.lastName}`
        }));

        res.json({
            readingLists: listsWithInfo,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            searchQuery: q
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Copy a public reading list to user's account
socialRouter.post("/reading-lists/:listId/copy", userMiddleware, async function (req, res) {
    try {
        const { listId } = req.params;
        const userId = req.userId;
        const { newName } = req.body;

        const originalList = await readingListModel.findById(listId);
        if (!originalList || !originalList.isPublic) {
            return res.status(404).json({ message: "Public reading list not found" });
        }

        const listName = newName || `${originalList.name} (Copy)`;

        // Check if user already has a list with this name
        const existing = await readingListModel.findOne({ userId, name: listName });
        if (existing) {
            return res.status(400).json({ message: "You already have a reading list with this name" });
        }

        const copiedList = await readingListModel.create({
            userId,
            name: listName,
            description: `Copied from ${originalList.name}`,
            books: [...originalList.books],
            isPublic: false
        });

        // Log activity
        await activityLogModel.create({
            userId,
            action: 'copied_reading_list',
            targetType: 'list',
            targetId: copiedList._id,
            details: `Copied reading list: ${originalList.name}`
        });

        res.json({ message: "Reading list copied successfully", readingList: copiedList });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = {
    socialRouter
};