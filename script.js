const m1Url = 'https://freddatastorage123.blob.core.windows.net/fred-data/m1.json';
const m2Url = 'https://freddatastorage123.blob.core.windows.net/fred-data/m2.json';

let chart;
let m1Data, m2Data;

Promise.all([
    fetch(m1Url).then(res => res.json()),
    fetch(m2Url).then(res => res.json())
]).then(([m1, m2]) => {
    m1Data = m1.observations || [];
    m2Data = m2.observations || [];

    console.log('m1Data:', m1Data);
    console.log('m2Data:', m2Data);

    renderChart('all', 'linear');
    updateStats();
    populateDataTable();

    document.getElementById('timeScale').addEventListener('change', (e) => {
        renderChart(e.target.value, document.getElementById('scaleType').value);
    });
    document.getElementById('scaleType').addEventListener('change', (e) => {
        renderChart(document.getElementById('timeScale').value, e.target.value);
    });
}).catch(err => console.error('Error fetching data:', err));

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
        if (!Array.isArray(data)) return [];
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
                    borderColor: '#ff6200',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'M2',
                    data: filteredM2.map(d => parseFloat(d.value)),
                    borderColor: '#4682b4',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 12 } }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Date', font: { size: 14 } },
                    ticks: { font: { size: 10 } }
                },
                y: {
                    title: { display: true, text: 'Billions of USD', font: { size: 14 } },
                    ticks: { font: { size: 10 } },
                    type: scaleType
                }
            }
        }
    });
}

function updateStats() {
    const latestM1 = m1Data.length > 0 ? parseFloat(m1Data[m1Data.length - 1].value).toFixed(2) : '-';
    const latestM2 = m2Data.length > 0 ? parseFloat(m2Data[m2Data.length - 1].value).toFixed(2) : '-';
    document.getElementById('latestM1').textContent = latestM1;
    document.getElementById('latestM2').textContent = latestM2;
}

function populateDataTable() {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';
    const maxLength = Math.max(m1Data.length, m2Data.length);
    for (let i = maxLength - 1; i >= 0; i--) {
        const m1 = m1Data[i] || {};
        const m2 = m2Data[i] || {};
        const date = m1.date || m2.date || '-';
        const m1Value = m1.value ? parseFloat(m1.value).toFixed(2) : '-';
        const m2Value = m2.value ? parseFloat(m2.value).toFixed(2) : '-';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>${m1Value}</td>
            <td>${m2Value}</td>
        `;
        tbody.appendChild(row);
    }
}