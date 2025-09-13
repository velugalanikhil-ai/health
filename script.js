+document.addEventListener('DOMContentLoaded', function() {
    const moodSlider = document.getElementById('mood');
    const moodValue = document.getElementById('moodValue');
    const form = document.getElementById('moodForm');
    const recList = document.getElementById('recList');
    const ctx = document.getElementById('moodChart').getContext('2d');
    let moodChart; // Variable to hold the chart instance

    // Update mood value display
    moodSlider.addEventListener('input', function() {
        moodValue.textContent = this.value;
        moodSlider.setAttribute('aria-valuenow', this.value);
    });

    // Load existing data
    let checkIns = JSON.parse(localStorage.getItem('checkIns')) || [];
    updateDashboard();

    // Form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const mood = parseInt(moodSlider.value);
        const thoughts = document.getElementById('thoughts').value;
        const sentiment = Sentiment.analyze(thoughts);
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        checkIns.push({ date, mood, thoughts, sentiment: sentiment.score });
        localStorage.setItem('checkIns', JSON.stringify(checkIns));
        updateDashboard();
        form.reset();
        moodValue.textContent = '5';
        moodSlider.setAttribute('aria-valuenow', '5');
        alert('Check-in submitted!');
    });

    function updateDashboard() {
        // Generate recommendations
        generateRecommendations();

        // Render chart
        renderChart();
    }

    function generateRecommendations() {
        recList.innerHTML = '';
        if (checkIns.length === 0) {
            recList.innerHTML = '<li>Welcome! Start your first check-in to get personalized recommendations.</li>';
            return;
        }

        const latest = checkIns[checkIns.length - 1];
        const recommendations = [];

        if (latest.mood < 5) {
            recommendations.push('Consider taking a short walk or practicing deep breathing.');
            recommendations.push('Reach out to a friend or counselor for support.');
        } else if (latest.mood >= 5 && latest.mood < 8) {
            recommendations.push('Keep up the good work! Try journaling your positive thoughts.');
        } else {
            recommendations.push('You\'re doing great! Share your positivity with others.');
        }

        if (latest.sentiment < 0) {
            recommendations.push('Focus on positive affirmations or mindfulness exercises.');
        } else if (latest.sentiment > 0) {
            recommendations.push('Continue nurturing your positive mindset.');
        }

        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recList.appendChild(li);
        });
    }

    function renderChart() {
        // Destroy existing chart if it exists
        if (moodChart) {
            moodChart.destroy();
        }

        const labels = checkIns.map(ci => ci.date);
        const data = checkIns.map(ci => ci.mood);

        moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Level',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }
});
