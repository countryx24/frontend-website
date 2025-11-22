const API_BASE_URL = 'http://103.149.177.182:3000';

const consultationForm = document.getElementById('consultation-form');
const resultSection = document.getElementById('result-section');
const loadingElement = document.getElementById('loading');
const submitBtn = document.getElementById('submit-btn');
const qrisDonation = document.getElementById('qris-donation');

let responseTimeout;

// ========================
//       EVENT LISTENERS
// ========================
consultationForm?.addEventListener('submit', handleConsultation);
document.getElementById('new-consultation')?.addEventListener('click', resetForm);

// ========================
//       SUBMIT FORM
// ========================
async function handleConsultation(e) {
    e.preventDefault();

    const formData = new FormData(consultationForm);
    const data = {
        dana: formData.get('dana'),
        keperluan: formData.get('keperluan'),
        jangkaWaktu: formData.get('jangkaWaktu')
    };

    // Validasi
    if (!data.dana || !data.keperluan || !data.jangkaWaktu) {
        alert('Harap isi semua field!');
        return;
    }
    if (isNaN(data.dana) || data.dana <= 0) {
        alert('Dana harus berupa angka positif!');
        return;
    }

    showLoading();

    // Timeout fallback 15 detik
    responseTimeout = setTimeout(showQRISDonation, 15000);

    try {
        const response = await fetch(`${API_BASE_URL}/api/advice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        clearTimeout(responseTimeout);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) displayResult(result.data);
        else throw new Error(result.error || 'Terjadi kesalahan server');

    } catch (err) {
        console.error('❌ Error:', err);
        clearTimeout(responseTimeout);
        showQRISDonation();
    } finally {
        hideLoading();
    }
}

// ========================
//       DISPLAY RESULT
// ========================
function displayResult(data) {
    const aiResponse = document.getElementById('ai-response');
    aiResponse.innerHTML = formatAIResponse(data);

    if (qrisDonation) qrisDonation.style.display = 'none';

    consultationForm?.closest('.consultation-form-section')?.style.display = 'none';
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// ========================
//       FALLBACK QRIS
// ========================
function showQRISDonation() {
    const formData = new FormData(consultationForm);
    document.getElementById('summary-dana').textContent = `Rp ${parseInt(formData.get('dana')).toLocaleString('id-ID')}`;
    document.getElementById('summary-keperluan').textContent = formData.get('keperluan');
    document.getElementById('summary-jangkaWaktu').textContent = formData.get('jangkaWaktu');

    document.getElementById('ai-response').innerHTML = `
        <div class="alert alert-info">
            <p><strong>💡 Tips Keuangan Umum</strong></p>
            <p>Berikut adalah saran keuangan dasar untuk Anda:</p>
            <ol>
                <li>Diversifikasi Portofolio</li>
                <li>Dana Darurat 3-6 bulan</li>
                <li>Mulai dengan jumlah kecil</li>
                <li>Edukasi diri sebelum berinvestasi</li>
                <li>Konsisten dan disiplin</li>
            </ol>
            <small>💡 Tip: Untuk saran lebih personalized, pastikan koneksi internet stabil dan coba lagi nanti.</small>
        </div>
    `;

    if (qrisDonation) qrisDonation.style.display = 'block';

    consultationForm?.closest('.consultation-form-section')?.style.display = 'none';
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// ========================
//       FORMAT AI RESPONSE
// ========================
function formatAIResponse(response) {
    if (!response) return '<p class="text-muted">Tidak ada saran yang tersedia.</p>';
    return `<pre class="strategy-item">${response}</pre>`;
}

// ========================
//       RESET FORM
// ========================
function resetForm() {
    consultationForm.reset();
    consultationForm?.closest('.consultation-form-section')?.style.display = 'block';
    resultSection.style.display = 'none';
    if (qrisDonation) qrisDonation.style.display = 'none';
    if (responseTimeout) clearTimeout(responseTimeout);
    consultationForm.scrollIntoView({ behavior: 'smooth' });
}

// ========================
//       LOADING STATES
// ========================
function showLoading() {
    if (loadingElement) loadingElement.style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
}

function hideLoading() {
    if (loadingElement) loadingElement.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Dapatkan Saran AI';
}

// ========================
//       INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Konsultan Keuangan AI siap digunakan');

    // Test koneksi backend
    fetch(`${API_BASE_URL}/api/health`)
        .then(res => res.json())
        .then(data => console.log('✅ Backend connection OK:', data))
        .catch(err => console.error('❌ Backend connection failed:', err));
});
