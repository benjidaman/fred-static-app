const m1Url = 'https://freddatastorage123.blob.core.windows.net/fred-data/m1.json';
const m2Url = 'https://freddatastorage123.blob.core.windows.net/fred-data/m2.json';

let chart; // Store chart instance globally for updates
let m1Data, m2Data; // Store raw data

// Fetch data and initialize chart
Promise.all([
    fetch(m1Url).then(res => res.json()),
    fetch(m2Url).then(res => res.json())
]).then(([m1, m2]) => {
    m1Data = m1;
    m2Data = m2;
    renderChart('all', 'linear'); // Initial render

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

    // Filter data
    const filterData = (data) => {
        if (!startDate) return data;
        return data.filter(d => new Date(d.date) >= startDate);
    };

    const filteredM1 = filterData(m1Data);
    const filteredM2 = filterData(m2Data);

    // Destroy existing chart if it exists
    if (chart) chart.destroy();

    // Create new chart
    const ctx = document.getElementById('fredChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredM1.map(d => d.date),
            datasets: [
                {
                    label: 'M1',
                    data: filteredM1.map(d => d.value),
                    borderColor: 'blue',
                    fill: false
                },
                {
                    label: 'M2',
                    data: filteredM2.map(d => d.value),
                    borderColor: 'green',
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: {
                    title: { display: true, text: 'Value' },
                    type: scaleType // 'linear' or 'logarithmic'
                }
            }
        }
    });
}