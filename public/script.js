// Get DOM elements
const cityInput = document.getElementById('cityInput');
const locationElement = document.querySelector('.location');
const weatherIcon = document.querySelector('.weather-icon');
const temperatureElement = document.querySelector('.temperature');
const descriptionElement = document.querySelector('.description');
const humidityElement = document.querySelector('.humidity');
const windSpeedElement = document.querySelector('.wind-speed');
const feelsLikeElement = document.querySelector('.feels-like');
const precipitationElement = document.querySelector('.precipitation');
const airQualityElement = document.querySelector('.air-quality');

// Set default background
document.body.style.backgroundImage = "url('/images/Clear.png')";

// Add event listener for Enter key
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Handle search function
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    } else {
        alert('Please enter a city name');
    }
}

// Get weather data
async function getWeather(city) {
    try {
        const response = await fetch(`/api/weather/${city}`);
        const data = await response.json();
        
        if (response.ok) {
            updateWeatherUI(data);
        } else {
            alert(data.error || 'Error fetching weather data');
            // Ensure background is set even on error
            document.body.style.backgroundImage = "url('/images/Clear.png')";
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching weather data');
        // Ensure background is set even on error
        document.body.style.backgroundImage = "url('/images/Clear.png')";
    }
}

// Update UI with weather data
function updateWeatherUI(data) {
    locationElement.textContent = `${data.name}, ${data.sys.country}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionElement.textContent = data.weather[0].description;
    humidityElement.textContent = `${data.main.humidity}%`;
    windSpeedElement.textContent = `${data.wind.speed} m/s`;
    feelsLikeElement.textContent = `${Math.round(data.main.feels_like)}°C`;
    
    // Update precipitation (rain volume for the last hour)
    if (data.rain && data.rain['1h']) {
        precipitationElement.textContent = `${data.rain['1h']} mm`;
    } else if (data.snow && data.snow['1h']) {
        precipitationElement.textContent = `${data.snow['1h']} mm`;
    } else {
        precipitationElement.textContent = '0 mm';
    }
    
    // Update air quality (using pressure as a proxy since OpenWeatherMap free API doesn't include air quality)
    // Pressure values typically range from 980 to 1030 hPa
    // We'll use a simple scale: < 990 = Poor, 990-1000 = Moderate, 1000-1010 = Good, > 1010 = Excellent
    const pressure = data.main.pressure;
    let airQualityText = '';
    let airQualityClass = '';
    
    if (pressure < 990) {
        airQualityText = 'Poor';
        airQualityClass = 'poor';
    } else if (pressure < 1000) {
        airQualityText = 'Moderate';
        airQualityClass = 'moderate';
    } else if (pressure < 1010) {
        airQualityText = 'Good';
        airQualityClass = 'good';
    } else {
        airQualityText = 'Excellent';
        airQualityClass = 'excellent';
    }
    
    airQualityElement.textContent = airQualityText;
    airQualityElement.className = `air-quality ${airQualityClass}`;

    // Update background
    if (data.backgroundUrl) {
        document.body.style.backgroundImage = `url('${data.backgroundUrl}')`;
    } else {
        // Fallback to default background if no weather-specific background is provided
        document.body.style.backgroundImage = "url('/images/Clear.png')";
    }
}

// Get user's location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await fetch(`/api/weather/coordinates/${position.coords.latitude}/${position.coords.longitude}`);
                    const data = await response.json();
                    
                    if (response.ok) {
                        updateWeatherUI(data);
                    } else {
                        alert(data.error || 'Error fetching weather data');
                        // Ensure background is set even on error
                        document.body.style.backgroundImage = "url('/images/Clear.png')";
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error fetching weather data');
                    // Ensure background is set even on error
                    document.body.style.backgroundImage = "url('/images/Clear.png')";
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Error getting location. Please enter a city name manually.');
                // Ensure background is set even on error
                document.body.style.backgroundImage = "url('/images/Clear.png')";
            }
        );
    } else {
        alert('Geolocation is not supported by your browser. Please enter a city name manually.');
        // Ensure background is set even on error
        document.body.style.backgroundImage = "url('/images/Clear.png')";
    }
}

// Initialize with user's location
getUserLocation(); 