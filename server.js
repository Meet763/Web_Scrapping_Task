const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
const TrendingTopic = require('./models/TrendingTopic');  // Import your model
const app = express();
const port = 3000;
const db = require('./db')
require('dotenv').config()

// MongoDB connection (replace with your connection string)
mongoose.connect('mongodb://localhost:27017/trending_topics_db', { useNewUrlParser: true, useUnifiedTopology: true });

// Serve static HTML page
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to trigger the Python script
app.get('/run-script', (req, res) => {
    // Credentials - you can replace these with dynamic values if needed
    const email = process.env.email;
    const username = process.env.username;
    const password = process.env.password;
    
    // Path to your Python virtual environment
    const venvPath = path.join(__dirname, 'venv', 'Scripts', 'activate');

    // Run the Python script with the virtual environment
    exec(`${venvPath} && python demo.py ${email} ${username} ${password}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return res.status(500).send('Error running script');
        }

        // Check for stderr
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send('Error in Python script execution');
        }
        console.log(stdout)

        // Parse the JSON output from the Python script
        try {
            const jsonOutput = JSON.parse(stdout);
            const { ip_address, trending_topics } = jsonOutput;

            // Save data to MongoDB
            const newTrendingTopic = new TrendingTopic({
                trending_topics: trending_topics
            });

            newTrendingTopic.save()
                .then(() => {
                    const date = new Date().toLocaleString();  // Get current date and time
                    const topicsList = Object.values(trending_topics).map(topic => `- ${topic}`).join('<br>');
                    const message = `
                        <h3>These are the most happening topics as on ${date}:</h3>
                        ${topicsList}.
                        <p>The IP address used for this query was <strong>${ip_address}</strong>.</p>
                        <br>
                        <h4>Here’s a JSON extract of this record from the MongoDB:</h4>
                        <pre>${JSON.stringify(jsonOutput, null, 4)}</pre>
                    `;

                    // Send the message back to the HTML page
                    res.send(message);
                })
                .catch(err => {
                    console.error('Error saving to MongoDB:', err);
                    res.status(500).send('Error saving data to MongoDB');
                });

        } catch (parseError) {
            console.error(`JSON parsing error: ${parseError}`);
            res.status(500).send('Error parsing Python script output');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
