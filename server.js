require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Weather condition to background image mapping
const weatherBackgrounds = {
    'Clear': '/images/Clear.png',
    'Clouds': '/images/Cloud.png',
    'Rain': '/images/Rain.png',
    'Snow': '/images/Snow.png',
    'Thunderstorm': '/images/Thunderstorm.png',
    'Drizzle': '/images/Drizzle.png',
    'Mist': '/images/Mist.png',
    'Smoke': '/images/Smoke.png',
    'Haze': '/images/Haze.png',
    'Dust': '/images/Dust.png',
    'Fog': '/images/Fog.png',
    'Sand': '/images/Sand.png',
    'Ash': '/images/Ash.png',
    'Squall': '/images/Squall.png',
    'Tornado': '/images/Tornado.png',
    'Scattered Clouds': '/images/Scattered Clouds.png',
    'Broken Clouds': '/images/Broken Clouds.png',
    'Few Clouds': '/images/Few Clouds.png',
    'Overcast Clouds': '/images/Overcast Clouds.png'
};

// API endpoint for city-based weather
app.get('/api/weather/:city', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}?q=${req.params.city}&appid=${API_KEY}&units=metric`);
        const weatherCondition = response.data.weather[0].main;
        const weatherDescription = response.data.weather[0].description;
        
        // Change the background based on the weather condition and description
        let backgroundUrl;
        
        // Check for specific cloud types in the description
        if (weatherDescription.toLowerCase().includes('scattered clouds')) {
            backgroundUrl = weatherBackgrounds['Scattered Clouds'];}
        else if (weatherDescription.toLowerCase().includes('few clouds')) {
            backgroundUrl = weatherBackgrounds['Few Clouds'];
            }
        } else if (weatherDescription.toLowerCase().includes('broken clouds')) {
            backgroundUrl = weatherBackgrounds['Broken Clouds'];
        } else if (weatherDescription.toLowerCase().includes('overcast clouds')) {
            backgroundUrl = weatherBackgrounds['Overcast Clouds'];
        } else if (weatherCondition === 'Clouds') {
            // Default for any other type of clouds
            backgroundUrl = weatherBackgrounds['Clouds'];
        } else {
            backgroundUrl = weatherBackgrounds[weatherCondition] || weatherBackgrounds['Clear'];
        }

        res.json({
            ...response.data,
            backgroundUrl
        });
    } catch (error) {
        console.error('Error fetching weather data:', error.response?.data || error.message);
        
        if (error.response) {
            if (error.response.status === 404) {
                res.status(404).json({
                    error: 'City not found. Please check the spelling and try again.'
                });
            } else {
                res.status(error.response.status).json({
                    error: error.response?.data?.message || 'Error fetching weather data'
                });
            }
        } else if (error.request) {
            res.status(500).json({ error: 'No response from weather service' });
        } else {
            res.status(500).json({ error: 'Error setting up the request' });
        }
    }
});

// API endpoint for coordinates-based weather
app.get('/api/weather/coordinates/:lat/:lon', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}?lat=${req.params.lat}&lon=${req.params.lon}&appid=${API_KEY}&units=metric`);
        const weatherCondition = response.data.weather[0].main;
        const weatherDescription = response.data.weather[0].description;
        
        // Set background based on the weather condition and description
        let backgroundUrl;
        
        // Check for specific cloud types in the description
        if (weatherDescription.toLowerCase().includes('scattered clouds')) {
            backgroundUrl = weatherBackgrounds['Scattered Clouds'];
        } else if (weatherDescription.toLowerCase().includes('broken clouds')) {
            backgroundUrl = weatherBackgrounds['Broken Clouds'];
        } else if (weatherDescription.toLowerCase().includes('overcast clouds')) {
            backgroundUrl = weatherBackgrounds['Overcast Clouds'];
        } else if (weatherCondition === 'Clouds') {
            // Default for any other type of clouds
            backgroundUrl = weatherBackgrounds['Clouds'];
        } else {
            backgroundUrl = weatherBackgrounds[weatherCondition] || weatherBackgrounds['Clear'];
        }

        res.json({
            ...response.data,
            backgroundUrl
        });
    } catch (error) {
        console.error('Error fetching weather data:', error.response?.data || error.message);
        
        if (error.response) {
            res.status(error.response.status).json({
                error: error.response?.data?.message || 'Error fetching weather data'
            });
        } else if (error.request) {
            res.status(500).json({ error: 'No response from weather service' });
        } else {
            res.status(500).json({ error: 'Error setting up the request' });
        }
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 