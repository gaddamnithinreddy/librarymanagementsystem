require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { userRouter } = require("./routes/user");
const { userProfileRouter } = require("./routes/userProfile");
const { bookRouter } = require("./routes/book");
const { bookFeatureRouter } = require("./routes/bookFeatures");
const { socialRouter } = require("./routes/social");
const { dataExportRouter } = require("./routes/dataExport");
const { adminRouter } = require("./routes/admin");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Enable CORS for all requests
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(express.json());

app.use("/user", userRouter)
app.use("/user", userProfileRouter)
app.use("/book", bookRouter)
app.use("/book", bookFeatureRouter)
app.use("/social", socialRouter)
app.use("/export", dataExportRouter)
app.use("/admin", adminRouter)
async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ Connected to MongoDB successfully");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Frontend URL: ${FRONTEND_URL}`);
        });
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}

main();
