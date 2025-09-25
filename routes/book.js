const { Router } = require("express");
const { bookModel, borrowModel } = require("../db");
const { userMiddleware } = require("../middleware/user");
const bookRouter = Router();

// List all books (public)
bookRouter.get("/all", async function (req, res) {
    const books = await bookModel.find({});
    res.json({ books });
});

// Borrow a book (user only)
bookRouter.post("/borrow", userMiddleware, async function (req, res) {
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
    // Set due date to 14 days from now
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

// Return a book (user only)
bookRouter.post("/return", userMiddleware, async function (req, res) {
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
        fine = daysLate * 10; // 10 units per day late
    }
    borrow.returnDate = returnDate;
    borrow.returned = true;
    borrow.fine = fine;
    await borrow.save();
    // Increment book copies
    await bookModel.findByIdAndUpdate(borrow.bookId, { $inc: { copiesAvailable: 1 } });
    res.json({ message: "Book returned successfully", fine });
});

module.exports = {
    bookRouter: bookRouter
}; 