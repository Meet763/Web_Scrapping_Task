const mongoose = require('mongoose');

// Connect to MongoDB (you can use a local or remote MongoDB database URL)
mongoose.connect('mongodb://localhost:27017/trending_topics_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.log('Error connecting to MongoDB', err);
    });
