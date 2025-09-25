const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Note: Connection is handled in index.js to avoid duplicate connections
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String,
    profilePicture: { type: String, default: '' },
    dateOfBirth: Date,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    phone: String,
    bio: { type: String, default: '' },
    joinDate: { type: Date, default: Date.now },
    preferences: {
        favoriteGenres: [String],
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false }
    },
    readingGoal: {
        yearlyTarget: { type: Number, default: 12 },
        currentYear: Number,
        booksRead: { type: Number, default: 0 }
    }
})
const adminSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String
})
const bookSchema = new Schema({
    title: String,
    author: String,
    description: String,
    isbn: { type: String, unique: true },
    imageUrl: String,
    category: { type: String, default: 'General' },
    copiesAvailable: Number,
    totalCopies: Number,
    addedBy: ObjectId, // admin id
    publisher: String,
    publicationDate: Date,
    language: { type: String, default: 'English' },
    pages: Number,
    tags: [String],
    averageRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    dateAdded: { type: Date, default: Date.now },
    popularity: { type: Number, default: 0 }, // for recommendations
    borrowCount: { type: Number, default: 0 }
})
const borrowSchema = new Schema({
    bookId: ObjectId,
    userId: ObjectId,
    borrowDate: Date,
    dueDate: Date,
    returnDate: Date,
    returned: { type: Boolean, default: false },
    fine: Number
})
const userModel = mongoose.model('user', userSchema);
const adminModel = mongoose.model('admin', adminSchema);
const bookModel = mongoose.model('book', bookSchema);
// Rating and Review Schema
const ratingSchema = new Schema({
    bookId: { type: ObjectId, required: true },
    userId: { type: ObjectId, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: String,
    reviewDate: { type: Date, default: Date.now },
    helpful: { type: Number, default: 0 },
    reported: { type: Boolean, default: false }
});

// Reading History Schema
const readingHistorySchema = new Schema({
    userId: { type: ObjectId, required: true },
    bookId: { type: ObjectId, required: true },
    status: { type: String, enum: ['reading', 'completed', 'abandoned'], default: 'reading' },
    startDate: { type: Date, default: Date.now },
    completedDate: Date,
    pagesRead: { type: Number, default: 0 },
    totalPages: Number,
    notes: String,
    progress: { type: Number, default: 0 } // percentage
});

// Favorites Schema
const favoriteSchema = new Schema({
    userId: { type: ObjectId, required: true },
    bookId: { type: ObjectId, required: true },
    dateAdded: { type: Date, default: Date.now }
});

// Wishlist Schema
const wishlistSchema = new Schema({
    userId: { type: ObjectId, required: true },
    bookId: { type: ObjectId, required: true },
    dateAdded: { type: Date, default: Date.now },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
});

// Reading Lists Schema
const readingListSchema = new Schema({
    userId: { type: ObjectId, required: true },
    name: { type: String, required: true },
    description: String,
    books: [ObjectId],
    isPublic: { type: Boolean, default: false },
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

// Book Recommendations Schema
const recommendationSchema = new Schema({
    userId: { type: ObjectId, required: true },
    bookId: { type: ObjectId, required: true },
    reason: String, // "Because you liked...", "Popular in your genre", etc.
    score: Number, // recommendation confidence score
    dateGenerated: { type: Date, default: Date.now },
    clicked: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false }
});

// Book Categories Schema
const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    parentCategory: ObjectId, // for subcategories
    imageUrl: String,
    color: String, // for UI theming
    bookCount: { type: Number, default: 0 }
});

// User Activity Log Schema
const activityLogSchema = new Schema({
    userId: { type: ObjectId, required: true },
    action: { type: String, required: true }, // 'borrowed', 'returned', 'rated', 'reviewed', etc.
    targetType: { type: String, required: true }, // 'book', 'list', 'user'
    targetId: ObjectId,
    details: String,
    timestamp: { type: Date, default: Date.now }
});

// Fine Schema (separate from borrow for better tracking)
const fineSchema = new Schema({
    userId: { type: ObjectId, required: true },
    borrowId: { type: ObjectId, required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'waived'], default: 'pending' },
    dateIssued: { type: Date, default: Date.now },
    datePaid: Date,
    paymentMethod: String
});

const borrowModel = mongoose.model('borrow', borrowSchema);
const ratingModel = mongoose.model('rating', ratingSchema);
const readingHistoryModel = mongoose.model('readingHistory', readingHistorySchema);
const favoriteModel = mongoose.model('favorite', favoriteSchema);
const wishlistModel = mongoose.model('wishlist', wishlistSchema);
const readingListModel = mongoose.model('readingList', readingListSchema);
const recommendationModel = mongoose.model('recommendation', recommendationSchema);
const categoryModel = mongoose.model('category', categorySchema);
const activityLogModel = mongoose.model('activityLog', activityLogSchema);
const fineModel = mongoose.model('fine', fineSchema);

module.exports = ({
    userModel,
    adminModel,
    bookModel,
    borrowModel,
    ratingModel,
    readingHistoryModel,
    favoriteModel,
    wishlistModel,
    readingListModel,
    recommendationModel,
    categoryModel,
    activityLogModel,
    fineModel
})
