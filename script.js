async function loadData() {
    try {
        const m1Url = 'https://freddatastorage123.blob.core.windows.net/fred-data/m1.json';
        const m2Url = 'https://freddatastorage123.blob.core.windows.net/fred-data/m2.json';

        const m1Response = await fetch(m1Url);
        const m2Response = await fetch(m2Url);
        const m1Data = await m1Response.json();
        const m2Data = await m2Response.json();

        const dates = m1Data.observations.map(obs => obs.date);
        const m1Values = m1Data.observations.map(obs => parseFloat(obs.value));
        const m2Values = m2Data.observations.map(obs => parseFloat(obs.value));

        const ctx = document.getElementById('moneyChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'M1 (Billions USD)',
                        data: m1Values,
                        borderColor: 'blue',
                        fill: false
                    },
                    {
                        label: 'M2 (Billions USD)',
                        data: m2Values,
                        borderColor: 'green',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Billions of USD' } }
                }
            }
        });
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

loadData();