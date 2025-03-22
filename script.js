const m1Url = 'https://freddatastorage123.blob.core.windows.net/fred-data/m1.json';
const m2Url = 'https://freddatastorage123.blob.core.windows.net/fred-data/m2.json';

let chart; // Store chart instance globally for updates
let m1Data, m2Data; // Store raw data

// Fetch data and initialize chart
Promise.all([
    fetch(m1Url).then(res => res.json()),
    fetch(m2Url).then(res => res.json())
]).then(([m1, m2]) => {
    m1Data = m1.observations || [];
    m2Data = m2.observations || [];

    console.log('m1Data:', m1Data);
    console.log('m2Data:', m2Data);

    renderChart('all', 'linear'); // Initial render

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
            startDate = null;
    }

    const filterData = (data) => {
        if (!Array.isArray(data)) {
            console.error('Data is not an array:', data);
            return [];
        }
        if (!startDate) return data;
        return data.filter(d => new Date(d.date) >= startDate);
    };

    const filteredM1 = filterData(m1Data);
    const filteredM2 = filterData(m2Data);

    if (chart) chart.destroy();

    const ctx = document.getElementById('fredChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredM1.map(d => d.date),
            datasets: [
                {
                    label: 'M1',
                    data: filteredM1.map(d => parseFloat(d.value)),
                    borderColor: 'blue',
                    fill: false
                },
                {
                    label: 'M2',
                    data: filteredM2.map(d => parseFloat(d.value)),
                    borderColor: 'green',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: { size: 14 }
                    }
                }
            },
            scales: {
                x: { 
                    title: { 
                        display: true, 
                        text: 'Date',
                        font: { size: 16 }
                    },
                    ticks: { font: { size: 12 } }
                },
                y: {
                    title: { 
                        display: true, 
                        text: 'Value',
                        font: { size: 16 }
                    },
                    ticks: { font: { size: 12 } },
                    type: scaleType
                }
            }
        }
    });
}