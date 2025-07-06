document.addEventListener('DOMContentLoaded', () => {
    // --- Ambil semua elemen penting dari DOM ---
    const analyzeBtn = document.getElementById('analyze-btn');
    const textInput = document.getElementById('text-input');
    const loader = document.getElementById('loader');
    const errorBox = document.getElementById('error-message-box');
    const analysisResults = document.getElementById('analysis-results');
    const scoresGrid = document.getElementById('scores-grid');
    const originalTextElem = document.getElementById('original-text');
    const correctedTextElem = document.getElementById('corrected-text');
    const errorsList = document.getElementById('errors-list');

    // --- Alamat URL API FastAPI Anda ---
    // Pastikan server FastAPI Anda sedang berjalan!
    const apiUrl = 'https://claristaeve-english-score-apps.hf.space/correct_and_score';

    // --- Fungsi untuk membuat gauge skor ---
    const createScoreGauge = (scoreData) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';

        const percentage = scoreData.value;
        const color = scoreData.color || '#6a5acd'; // Default to primary color

        scoreItem.innerHTML = `
            <div class="score-circle">
                <div class="score-value" style="color: ${color};">${percentage}</div>
            </div>
            <h3 class="score-name">${scoreData.name}</h3>
            <p class="score-desc">${scoreData.description}</p>
        `;

        // Atur gradien untuk animasi
        const circle = scoreItem.querySelector('.score-circle');
        circle.style.background = `conic-gradient(${color} ${percentage * 3.6}deg, #e0e0e0 0deg)`;
        
        return scoreItem;
    };

    // --- Fungsi untuk membuat item daftar kesalahan ---
    const createErrorItem = (match) => {
        const errorItem = document.createElement('div');
        errorItem.className = 'error-item';

        const suggestion = match.replacements.length > 0 ? match.replacements.join(', ') : 'N/A';
        
        errorItem.innerHTML = `
            <span class="error-message-text">${match.message}</span>
            <strong class="error-suggestion">Saran: ${suggestion}</strong>
            <span class="error-category">${match.category}</span>
        `;
        return errorItem;
    };

    // --- Event listener untuk tombol "Analisis" ---
    analyzeBtn.addEventListener('click', async () => {
        const textToAnalyze = textInput.value;
        if (!textToAnalyze.trim()) {
            alert('Please enter text first.');
            return;
        }

        // 1. Persiapan UI sebelum request
        analysisResults.style.display = 'none';
        errorBox.style.display = 'none';
        loader.style.display = 'block';

        try {
            // 2. Kirim request ke API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToAnalyze }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();

            // 3. Tampilkan data ke UI
            // Isi perbandingan teks
            originalTextElem.innerText = data.original_text;
            correctedTextElem.innerText = data.corrected_text;

            // Kosongkan hasil lama
            scoresGrid.innerHTML = '';
            errorsList.innerHTML = '';

            // Buat dan tampilkan skor
            const scoresData = [
                { name: 'Final Score', value: data.scores.final_score, description: 'Overview of your writing', color: '#6a5acd' },
                { name: 'Grammar Score', value: data.scores.grammar_score, description: 'Accuracy of structure & rules', color: '#2980b9' },
                { name: 'Vocabulary Score', value: data.scores.vocabulary_score, description: 'Variety & richness of words', color: '#27ae60' },
                { name: 'Readability Score', value: data.scores.readability_score, description: 'Ease of understanding', color: '#f39c12' }
            ];
            scoresData.forEach(score => scoresGrid.appendChild(createScoreGauge(score)));

            // Buat dan tampilkan daftar kesalahan
            if (data.matches.length > 0) {
                data.matches.forEach(match => errorsList.appendChild(createErrorItem(match)));
            } else {
                errorsList.innerHTML = '<div class="no-errors">Excellent! No grammar issues were detected.</div>';
            }
            
            // Tampilkan seluruh kontainer hasil
            analysisResults.style.display = 'block';

        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            errorBox.innerText = `Maaf, terjadi kesalahan: ${error.message}. Coba lagi nanti.`;
            errorBox.style.display = 'block';
        } finally {
            // 4. Sembunyikan loader
            loader.style.display = 'none';
        }
    });
});