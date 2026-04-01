require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const purge = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.deleteMany({});
        console.log(`purged ${result.deletedCount} users from database.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

purge();
