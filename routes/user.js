const { Router } = require("express");
const { userModel, bookModel, borrowModel } = require("../db");
const userRouter = Router();
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");
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

userRouter.post("/signup", async function (req, res) {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
        }
        const { email, password, firstName, lastName } = req.body;
        const existing = await userModel.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.create({
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

userRouter.post("/signin", async function (req, res) {
    try {
        const parsed = signinSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
        }
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(403).json({ message: "incorrect credentials" });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(403).json({ message: "incorrect credentials" });
        }
        const token = jwt.sign({ id: user._id }, JWT_USER_PASSWORD);
        res.json({ token });
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all available books
userRouter.get("/books", async function (req, res) {
    const books = await bookModel.find({});
    res.json({ books });
});

// Borrow a book
userRouter.post("/borrow", userMiddleware, async function (req, res) {
    const userId = req.userId;
    const { bookId } = req.body;

    // Check if user already has an active borrow for this book
    const existingBorrow = await borrowModel.findOne({ bookId, userId, returned: false });
    if (existingBorrow) {
        return res.status(400).json({ message: "You have already borrowed this book" });
    }

    const book = await bookModel.findById(bookId);
    if (!book || book.copiesAvailable < 1) {
        return res.status(400).json({ message: "Book not available" });
    }
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);
    await borrowModel.create({
        bookId,
        userId,
        borrowDate,
        dueDate,
        returnDate: null,
        returned: false,
        fine: 0
    });
    book.copiesAvailable -= 1;
    await book.save();
    res.json({ message: "Book borrowed successfully", dueDate });
});

// Return a book
userRouter.post("/return", userMiddleware, async function (req, res) {
    const userId = req.userId;
    const { borrowId } = req.body;
    const borrow = await borrowModel.findOne({ _id: borrowId, userId, returned: false });
    if (!borrow) {
        return res.status(400).json({ message: "No active borrow record found for this book" });
    }
    const returnDate = new Date();
    let fine = 0;
    if (returnDate > borrow.dueDate) {
        const daysLate = Math.ceil((returnDate - borrow.dueDate) / (1000 * 60 * 60 * 24));
        fine = daysLate * 10;
    }
    borrow.returnDate = returnDate;
    borrow.returned = true;
    borrow.fine = fine;
    await borrow.save();
    await bookModel.findByIdAndUpdate(borrow.bookId, { $inc: { copiesAvailable: 1 } });
    res.json({ message: "Book returned successfully", fine });
});

// Get all borrowed books and fines for the user
userRouter.get("/borrowed", userMiddleware, async function (req, res) {
    const userId = req.userId;
    const borrows = await borrowModel.find({ userId });
    const bookIds = borrows.map(b => b.bookId);
    const books = await bookModel.find({ _id: { $in: bookIds } });
    res.json({ borrows, books });
});

module.exports = {
    userRouter: userRouter
}