const m1Url = 'https://freddatastorage123.blob.core.windows.net/fred-data/m1.json';
const m2Url = 'https://freddatastorage123.blob.core.windows.net/fred-data/m2.json';

let chart; // Store chart instance globally for updates
let m1Data, m2Data; // Store raw data

// Fetch data and initialize chart
Promise.all([
    fetch(m1Url).then(res => res.json()),
    fetch(m2Url).then(res => res.json())
]).then(([m1, m2]) => {
    // Extract the 'observations' array from the fetched JSON
    m1Data = m1.observations || []; // Fallback to empty array if observations is missing
    m2Data = m2.observations || []; // Fallback to empty array if observations is missing

    // Log data for debugging (optional, can remove later)
    console.log('m1Data:', m1Data);
    console.log('m2Data:', m2Data);

    renderChart('all', 'linear'); // Initial render with default settings

    // Add event listeners for dropdowns
    document.getElementById('timeScale').addEventListener('change', (e) => {
        renderChart(e.target.value, document.getElementById('scaleType').value);
    });
    document.getElementById('scaleType').addEventListener('change', (e) => {
        renderChart(document.getElementById('timeScale').value, e.target.value);
    });
}).catch(err => console.error('Error fetching data:', err));

// Function to filter data by time scale and render chart
function renderChart(timeScale, scaleType) {
    const now = new Date();
    let startDate;

    // Set start date based on selected time scale
    switch (timeScale) {
        case '5y':
            startDate = new Date(now.setFullYear(now.getFullYear() - 5));
            break;
        case '1y':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        case '6m':
            startDate = new Date(now.setMonth(now.getMonth() - 6));
            break;
        case 'all':
        default:
            startDate = null; // Show all data
    }

    // Filter data based on the start date
    const filterData = (data) => {
        // Ensure data is an array; if not, return empty array to prevent errors
        if (!Array.isArray(data)) {
            console.error('Data is not an array:', data);
            return [];
        }
        if (!startDate) return data; // Return all data if no start date
        return data.filter(d => new Date(d.date) >= startDate);
    };

    // Apply filtering to M1 and M2 data
    const filteredM1 = filterData(m1Data);
    const filteredM2 = filterData(m2Data);

    // Destroy existing chart if it exists to prevent overlap
    if (chart) chart.destroy();

    // Create new chart
    const ctx = document.getElementById('fredChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredM1.map(d => d.date), // Extract dates for x-axis
            datasets: [
                {
                    label: 'M1',
                    data: filteredM1.map(d => parseFloat(d.value)), // Convert string values to numbers
                    borderColor: 'blue',
                    fill: false
                },
                {
                    label: 'M2',
                    data: filteredM2.map(d => parseFloat(d.value)), // Convert string values to numbers
                    borderColor: 'green',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true, // Makes the chart resize with its container
            maintainAspectRatio: false, // Allows custom height and width
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 14 // Increase legend font size
                        }
                    }
                }
            },
            scales: {
                x: { 
                    title: { 
                        display: true, 
                        text: 'Date',
                        font: { size: 16 } // Increase x-axis title font size
                    },
                    ticks: {
                        font: { size: 12 } // Increase x-axis tick font size
                    }
                },
                y: {
                    title: { 
                        display: true, 
                        text: 'Value',
                        font: { size: 16 } // Increase y-axis title font size
                    },
                    ticks: {
                        font: { size: 12 } // Increase y-axis tick font size
                    },
                    type: scaleType // 'linear' or 'logarithmic'
                }
            }
        }
    });
}