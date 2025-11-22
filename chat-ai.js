// ========================
//       CONFIG
// ========================
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
if (consultationForm) {
    consultationForm.addEventListener('submit', handleConsultation);
}

const newConsultBtn = document.getElementById('new-consultation');
if (newConsultBtn) {
    newConsultBtn.addEventListener('click', resetForm);
}

// ========================
//       HANDLE FORM
// ========================
async function handleConsultation(e) {
    e.preventDefault(); // STOP PAGE REFRESH
    e.stopPropagation(); // Mencegah bubbling

    const formData = new FormData(consultationForm);
    const data = {
        dana: formData.get('dana'),
        keperluan: formData.get('keperluan'),
        jangkaWaktu: formData.get('jangkaWaktu')
    };

    if (!data.dana || !data.keperluan || !data.jangkaWaktu) {
        alert('Harap isi semua field!');
        return;
    }

    if (isNaN(data.dana) || data.dana <= 0) {
        alert('Dana harus berupa angka positif!');
        return;
    }

    showLoading();

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
    aiResponse.innerHTML = `<pre>${data}</pre>`;

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
            <ol>
                <li>Diversifikasi Portofolio</li>
                <li>Dana Darurat 3-6 bulan</li>
                <li>Mulai dengan jumlah kecil</li>
                <li>Edukasi diri sebelum berinvestasi</li>
                <li>Konsisten dan disiplin</li>
            </ol>
        </div>
    `;

    if (qrisDonation) qrisDonation.style.display = 'block';
    consultationForm?.closest('.consultation-form-section')?.style.display = 'none';
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
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
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    }
}

function hideLoading() {
    if (loadingElement) loadingElement.style.display = 'none';
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Dapatkan Saran AI';
    }
}

// ========================
//       INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Konsultan Keuangan AI siap digunakan');
});
