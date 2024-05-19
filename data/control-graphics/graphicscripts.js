// graphicscripts.js
document.addEventListener('DOMContentLoaded', () => {
    generateTableData();
    generateControlCharts();
});

function generateTableData() {
    const tableBody = document.querySelector('#dataTable tbody');
    const dataPoints = generateRandomData(30, 1000, 1500);

    dataPoints.forEach((data, index) => {
        const row = document.createElement('tr');
        const cellIndex = document.createElement('td');
        const cellData = document.createElement('td');

        cellIndex.textContent = `Dron ${index + 1}`;
        cellData.textContent = data.toFixed(2);

        row.appendChild(cellIndex);
        row.appendChild(cellData);
        tableBody.appendChild(row);
    });
}

function generateRandomData(numPoints, min, max) {
    const data = [];
    for (let i = 0; i < numPoints; i++) {
        data.push(Math.random() * (max - min) + min);
    }
    return data;
}

function generateControlCharts() {
    const dataPoints = Array.from(document.querySelectorAll('#dataTable tbody tr td:nth-child(2)')).map(td => parseFloat(td.textContent));
    const n = dataPoints.length;

    const mean = dataPoints.reduce((sum, value) => sum + value, 0) / n;
    const ranges = dataPoints.map((value, index, arr) => index > 0 ? Math.abs(value - arr[index - 1]) : 0).slice(1);

    const meanRange = ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
    const d2 = 1.128; // Valor para n=2

    const UCLx = mean + 3 * (meanRange / d2);
    const LCLx = mean - 3 * (meanRange / d2);

    const UCLR = meanRange + 3 * meanRange / d2;
    const LCLR = Math.max(0, meanRange - 3 * meanRange / d2);

    const ctxControl = document.getElementById('controlChart').getContext('2d');
    const ctxRange = document.getElementById('rangeChart').getContext('2d');

    new Chart(ctxControl, {
        type: 'line',
        data: {
            labels: dataPoints.map((_, index) => index + 1),
            datasets: [{
                label: 'Pesos',
                data: dataPoints,
                borderColor: 'blue',
                fill: false
            }, {
                label: 'LSC',
                data: new Array(n).fill(UCLx),
                borderColor: 'orange',
                borderDash: [5, 5],
                fill: false
            }, {
                label: 'LIC',
                data: new Array(n).fill(LCLx),
                borderColor: 'green',
                borderDash: [5, 5],
                fill: false
            }, {
                label: 'LCC',
                data: new Array(n).fill(mean),
                borderColor: 'red',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Dron'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Peso en gramos'
                    }
                }
            }
        }
    });

    new Chart(ctxRange, {
        type: 'line',
        data: {
            labels: ranges.map((_, index) => index + 1),
            datasets: [{
                label: 'Rangos',
                data: ranges,
                borderColor: 'blue',
                fill: false
            }, {
                label: 'LCS',
                data: new Array(ranges.length).fill(UCLR),
                borderColor: 'orange',
                borderDash: [5, 5],
                fill: false
            }, {
                label: 'LCI',
                data: new Array(ranges.length).fill(LCLR),
                borderColor: 'green',
                borderDash: [5, 5],
                fill: false
            }, {
                label: 'LCC',
                data: new Array(ranges.length).fill(meanRange),
                borderColor: 'red',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Dron'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Rango'
                    }
                }
            }
        }
    });
}
