const mongoose = require('mongoose');

// Define the schema for trending topics
const trendingTopicSchema = new mongoose.Schema({
    trending_topics: {
        type: Map, // Use Map to represent key-value pairs
        of: String, // Values in the map are strings (e.g., topic names)
        required: [true, "Trending topics cannot be empty"], // Field is required
        validate: {
            validator: function (v) {
                return v.size > 0; // Ensure the map has at least one entry
            },
            message: "Trending topics map must have at least one entry"
        }
    }
});

// Create and export the model
module.exports = mongoose.model('TrendingTopic', trendingTopicSchema);
