const mongoose = require('mongoose');

module.exports = {
    connectToDatabase: function () {
        mongoose.connect(process.env.MONGODB_URL)
            .then(() => {
                console.log('Connected to the database');
            })
            .catch((error) => {
                console.error('Error connecting to the database:', error);
            });
    }
};
