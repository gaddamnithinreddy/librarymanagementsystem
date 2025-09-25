const { Router } = require('express');
const { userModel, bookModel, borrowModel, ratingModel } = require('../db');
const dataExportRouter = Router();
const { adminMiddleware } = require('../middleware/admin');
const { userMiddleware } = require('../middleware/user');

// Admin Export All Data
dataExportRouter.get('/admin/export/all', adminMiddleware, async function (req, res) {
    try {
        const [users, books, borrows] = await Promise.all([
            userModel.find({}).select('-password'),
            bookModel.find({}),
            borrowModel.find({}).populate('bookId', 'title').populate('userId', 'firstName lastName')
        ]);

        const exportData = {
            exportDate: new Date(),
            data: { users, books, borrows }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=library_export_${new Date().toISOString().split('T')[0]}.json`);
        res.json(exportData);
    } catch (error) {
        res.status(500).json({ message: 'Export failed' });
    }
});

// User Export Personal Data
dataExportRouter.get('/user/export/profile', userMiddleware, async function (req, res) {
    try {
        const userId = req.userId;
        const [user, borrows, ratings] = await Promise.all([
            userModel.findById(userId).select('-password'),
            borrowModel.find({ userId }).populate('bookId'),
            ratingModel.find({ userId }).populate('bookId')
        ]);

        const userData = {
            profile: user,
            borrowHistory: borrows,
            ratings,
            exportDate: new Date()
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=my_library_data.json');
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: 'Export failed' });
    }
});

module.exports = { dataExportRouter };