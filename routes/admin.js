const { Router } = require("express");
const {
    adminModel,
    bookModel,
    userModel,
    borrowModel,
    ratingModel,
    categoryModel,
    activityLogModel,
    fineModel
} = require("../db");
const adminRouter = Router();
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middleware/admin");
const bcrypt = require("bcrypt");
const { z } = require("zod");

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
});

const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

adminRouter.post("/signup", async function (req, res) {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
        }
        const { email, password, firstName, lastName } = req.body;
        const existing = await adminModel.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await adminModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });
        res.json({ message: "signup succeded" });
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.post("/signin", async function (req, res) {
    try {
        const parsed = signinSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
        }
        const { email, password } = req.body;
        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.status(403).json({ message: "incorrect credentials" });
        }
        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) {
            return res.status(403).json({ message: "incorrect credentials" });
        }
        const token = jwt.sign({ id: admin._id }, JWT_ADMIN_PASSWORD);
        res.json({ token });
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add a new book
adminRouter.post("/book", adminMiddleware, async function (req, res) {
    const adminId = req.userId;
    const { title, author, description, isbn, imageUrl, category, totalCopies } = req.body;
    const book = await bookModel.create({
        title,
        author,
        description,
        isbn,
        imageUrl,
        category: category || 'General',
        totalCopies,
        copiesAvailable: totalCopies,
        addedBy: adminId
    });
    res.json({
        message: "Book added",
        bookId: book._id
    });
});

// Edit a book
adminRouter.put("/book", adminMiddleware, async function (req, res) {
    const adminId = req.userId;
    const { bookId, title, author, description, isbn, imageUrl, category, totalCopies } = req.body;
    const book = await bookModel.findOneAndUpdate({ _id: bookId, addedBy: adminId }, {
        title,
        author,
        description,
        isbn,
        imageUrl,
        category: category || 'General',
        totalCopies,
        // Optionally update copiesAvailable if totalCopies changes
    }, { new: true });
    if (!book) return res.status(404).json({ message: "Book not found or not authorized" });
    res.json({ message: "Book updated", book });
});

// Delete a book
adminRouter.delete("/book", adminMiddleware, async function (req, res) {
    const adminId = req.userId;
    const { bookId } = req.body;
    const book = await bookModel.findOneAndDelete({ _id: bookId, addedBy: adminId });
    if (!book) return res.status(404).json({ message: "Book not found or not authorized" });
    res.json({ message: "Book deleted" });
});

// List all books
adminRouter.get("/books", adminMiddleware, async function (req, res) {
    const books = await bookModel.find({});
    res.json({ books });
});

// View all users and their borrowing history/fines
adminRouter.get("/users", adminMiddleware, async function (req, res) {
    const users = await userModel.find({});
    const borrows = await borrowModel.find({});
    res.json({ users, borrows });
});

// Admin Dashboard Analytics
adminRouter.get("/dashboard", adminMiddleware, async function (req, res) {
    try {
        const currentDate = new Date();
        const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const currentYear = new Date(currentDate.getFullYear(), 0, 1);

        // Basic Stats
        const totalBooks = await bookModel.countDocuments({});
        const totalUsers = await userModel.countDocuments({});
        const totalBorrows = await borrowModel.countDocuments({});
        const activeBorrows = await borrowModel.countDocuments({ returned: false });

        // Monthly Stats
        const borrowsThisMonth = await borrowModel.countDocuments({
            borrowDate: { $gte: currentMonth }
        });
        const returnsThisMonth = await borrowModel.countDocuments({
            returnDate: { $gte: currentMonth }
        });
        const newUsersThisMonth = await userModel.countDocuments({
            joinDate: { $gte: currentMonth }
        });
        const newBooksThisMonth = await bookModel.countDocuments({
            dateAdded: { $gte: currentMonth }
        });

        // Financial Stats
        const totalFines = await borrowModel.aggregate([
            { $match: { fine: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: "$fine" } } }
        ]);
        const pendingFines = await borrowModel.aggregate([
            { $match: { fine: { $gt: 0 }, returned: false } },
            { $group: { _id: null, total: { $sum: "$fine" } } }
        ]);

        // Popular Books
        const popularBooks = await borrowModel.aggregate([
            { $group: { _id: "$bookId", borrowCount: { $sum: 1 } } },
            { $sort: { borrowCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "books",
                    localField: "_id",
                    foreignField: "_id",
                    as: "book"
                }
            },
            { $unwind: "$book" },
            {
                $project: {
                    title: "$book.title",
                    author: "$book.author",
                    borrowCount: 1
                }
            }
        ]);

        // Top Rated Books
        const topRatedBooks = await ratingModel.aggregate([
            {
                $group: {
                    _id: "$bookId",
                    avgRating: { $avg: "$rating" },
                    ratingCount: { $sum: 1 }
                }
            },
            { $match: { ratingCount: { $gte: 3 } } },
            { $sort: { avgRating: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "books",
                    localField: "_id",
                    foreignField: "_id",
                    as: "book"
                }
            },
            { $unwind: "$book" },
            {
                $project: {
                    title: "$book.title",
                    author: "$book.author",
                    avgRating: { $round: ["$avgRating", 1] },
                    ratingCount: 1
                }
            }
        ]);

        // Active Users (users with recent activity)
        const activeUsers = await borrowModel.aggregate([
            { $match: { borrowDate: { $gte: currentMonth } } },
            { $group: { _id: "$userId" } },
            { $count: "activeUsers" }
        ]);

        // Category Distribution
        const categoryStats = await bookModel.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Overdue Books
        const overdueBooks = await borrowModel.find({
            returned: false,
            dueDate: { $lt: currentDate }
        }).populate('bookId', 'title author').populate('userId', 'firstName lastName email');

        // Monthly Borrowing Trend (last 6 months)
        const borrowingTrend = await borrowModel.aggregate([
            {
                $match: {
                    borrowDate: {
                        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$borrowDate" },
                        month: { $month: "$borrowDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json({
            basicStats: {
                totalBooks,
                totalUsers,
                totalBorrows,
                activeBorrows
            },
            monthlyStats: {
                borrowsThisMonth,
                returnsThisMonth,
                newUsersThisMonth,
                newBooksThisMonth
            },
            financialStats: {
                totalFines: totalFines[0]?.total || 0,
                pendingFines: pendingFines[0]?.total || 0
            },
            popularBooks,
            topRatedBooks,
            activeUsersCount: activeUsers[0]?.activeUsers || 0,
            categoryStats,
            overdueBooks,
            borrowingTrend
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// User Management
adminRouter.get("/users/detailed", adminMiddleware, async function (req, res) {
    try {
        const { page = 1, limit = 20, search = '', sortBy = 'joinDate' } = req.query;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const skip = (page - 1) * limit;
        const users = await userModel.find(query)
            .select('-password')
            .sort({ [sortBy]: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await userModel.countDocuments(query);

        // Get borrowing stats for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const borrowCount = await borrowModel.countDocuments({ userId: user._id });
            const activeBorrows = await borrowModel.countDocuments({ userId: user._id, returned: false });
            const totalFines = await borrowModel.aggregate([
                { $match: { userId: user._id, fine: { $gt: 0 } } },
                { $group: { _id: null, total: { $sum: "$fine" } } }
            ]);

            return {
                ...user.toObject(),
                stats: {
                    borrowCount,
                    activeBorrows,
                    totalFines: totalFines[0]?.total || 0
                }
            };
        }));

        res.json({
            users: usersWithStats,
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

// Book Management with Enhanced Features
adminRouter.get("/books/detailed", adminMiddleware, async function (req, res) {
    try {
        const { page = 1, limit = 20, search = '', category = '', sortBy = 'dateAdded' } = req.query;

        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            query.category = category;
        }

        const skip = (page - 1) * limit;
        const books = await bookModel.find(query)
            .sort({ [sortBy]: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await bookModel.countDocuments(query);

        // Get additional stats for each book
        const booksWithStats = await Promise.all(books.map(async (book) => {
            const borrowCount = await borrowModel.countDocuments({ bookId: book._id });
            const activeBorrows = await borrowModel.countDocuments({ bookId: book._id, returned: false });
            const avgRating = await ratingModel.aggregate([
                { $match: { bookId: book._id } },
                { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
            ]);

            return {
                ...book.toObject(),
                stats: {
                    borrowCount,
                    activeBorrows,
                    avgRating: avgRating[0]?.avg || 0,
                    ratingCount: avgRating[0]?.count || 0
                }
            };
        }));

        res.json({
            books: booksWithStats,
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
adminRouter.post("/category", adminMiddleware, async function (req, res) {
    try {
        const { name, description, color } = req.body;

        const existing = await categoryModel.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = await categoryModel.create({
            name,
            description: description || '',
            color: color || '#1976d2'
        });

        res.json({ message: "Category created", category });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.get("/categories", adminMiddleware, async function (req, res) {
    try {
        const categories = await categoryModel.find({}).sort({ name: 1 });
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Reports and Analytics
adminRouter.get("/reports/borrowing", adminMiddleware, async function (req, res) {
    try {
        const { startDate, endDate, type = 'monthly' } = req.query;

        let matchStage = {};
        if (startDate && endDate) {
            matchStage.borrowDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        let groupStage;
        if (type === 'daily') {
            groupStage = {
                _id: {
                    year: { $year: "$borrowDate" },
                    month: { $month: "$borrowDate" },
                    day: { $dayOfMonth: "$borrowDate" }
                },
                count: { $sum: 1 }
            };
        } else {
            groupStage = {
                _id: {
                    year: { $year: "$borrowDate" },
                    month: { $month: "$borrowDate" }
                },
                count: { $sum: 1 }
            };
        }

        const borrowingReport = await borrowModel.aggregate([
            { $match: matchStage },
            { $group: groupStage },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        res.json({ report: borrowingReport });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Export Data
adminRouter.get("/export/users", adminMiddleware, async function (req, res) {
    try {
        const users = await userModel.find({}).select('-password');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.get("/export/books", adminMiddleware, async function (req, res) {
    try {
        const books = await bookModel.find({});
        res.json({ books });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.get("/export/borrows", adminMiddleware, async function (req, res) {
    try {
        const borrows = await borrowModel.find({})
            .populate('bookId', 'title author isbn')
            .populate('userId', 'firstName lastName email');
        res.json({ borrows });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = {
    adminRouter: adminRouter
}

