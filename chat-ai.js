// API configuration - PERBAIKI: HAPUS SLASH DI AKHIR
const API_BASE_URL = 'https://a46e1b6fd6a278.lhr.life/'; // ✅ TANPA SLASH DI AKHIR

// DOM Elements
const consultationForm = document.getElementById('consultation-form');
const resultSection = document.getElementById('result-section');
const loadingElement = document.getElementById('loading');
const submitBtn = document.getElementById('submit-btn');
const qrisDonation = document.getElementById('qris-donation');

// Variables for timeout
let responseTimeout;

// Event Listeners
if (consultationForm) {
    consultationForm.addEventListener('submit', handleConsultation);
}

if (document.getElementById('new-consultation')) {
    document.getElementById('new-consultation').addEventListener('click', resetForm);
}

// Handle consultation form submission
async function handleConsultation(e) {
    e.preventDefault();
    
    const formData = new FormData(consultationForm);
    const data = {
        dana: formData.get('dana'),
        keperluan: formData.get('keperluan'),
        jangkaWaktu: formData.get('jangkaWaktu')
    };

    // Show loading
    showLoading();
    
    // Set timeout for 20 seconds
    responseTimeout = setTimeout(() => {
        showQRISDonation();
    }, 20000);
    
    try {
        // ✅ PERBAIKI: HAPUS DOUBLE SLASH DI URL
        const response = await fetch(`${API_BASE_URL}/api/advice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        // Clear timeout if response received
        clearTimeout(responseTimeout);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            displayResult(result.data);
        } else {
            throw new Error(result.error || 'Terjadi kesalahan');
        }
        
    } catch (error) {
        console.error('Error:', error);
        // Clear timeout on error
        clearTimeout(responseTimeout);
        // Tidak menampilkan alert, langsung tampilkan QRIS
        showQRISDonation();
    } finally {
        hideLoading();
    }
}

// Display AI response
function displayResult(data) {
    // Update summary
    document.getElementById('summary-dana').textContent = `Rp ${parseInt(data.dana).toLocaleString('id-ID')}`;
    document.getElementById('summary-keperluan').textContent = data.keperluan;
    document.getElementById('summary-jangkaWaktu').textContent = data.jangkaWaktu;
    
    // Display AI response with formatting
    const aiResponse = document.getElementById('ai-response');
    aiResponse.innerHTML = formatAIResponse(data.saran);
    
    // Hide QRIS donation if shown
    if (qrisDonation) {
        qrisDonation.style.display = 'none';
    }
    
    // Show result section and hide form
    const formSection = document.querySelector('.consultation-form-section');
    if (formSection) {
        formSection.style.display = 'none';
    }
    resultSection.style.display = 'block';
    
    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Show QRIS donation after timeout
function showQRISDonation() {
    // Update summary with current form data
    const formData = new FormData(consultationForm);
    document.getElementById('summary-dana').textContent = `Rp ${parseInt(formData.get('dana')).toLocaleString('id-ID')}`;
    document.getElementById('summary-keperluan').textContent = formData.get('keperluan');
    document.getElementById('summary-jangkaWaktu').textContent = formData.get('jangkaWaktu');
    
    // Display timeout message
    const aiResponse = document.getElementById('ai-response');
    aiResponse.innerHTML = `
        <div style="color: orange; padding: 15px; border: 2px solid orange; border-radius: 10px; background: #fffaf0;">
            <p><strong>⏰ Response Timeout</strong></p>
            <p>Server membutuhkan waktu lebih lama dari yang diharapkan.</p>
            <p>Berikut saran keuangan umum untuk Anda:</p>
        </div>
        <br>
        <p><strong>1. Diversifikasi Portofolio</strong><br>
        Sebarkan investasi Anda ke berbagai instrumen untuk mengurangi risiko.</p>
        
        <p><strong>2. Dana Darurat</strong><br>
        Pastikan Anda memiliki dana darurat 3-6 bulan pengeluaran sebelum berinvestasi.</p>
        
        <p><strong>3. Mulai dengan Amount Kecil</strong><br>
        Mulailah dengan amount yang nyaman dan tingkatkan secara bertahap.</p>
        
        <p><strong>4. Pelajari Instrumen Investasi</strong><br>
        Pahami setiap instrumen sebelum berinvestasi untuk menghindari kerugian.</p>
        
        <p><strong>5. Konsisten dan Disiplin</strong><br>
        Investasi yang konsisten dalam jangka panjang biasanya memberikan hasil terbaik.</p>
    `;
    
    // Show QRIS donation section
    if (qrisDonation) {
        qrisDonation.style.display = 'block';
    }
    
    // Show result section and hide form
    const formSection = document.querySelector('.consultation-form-section');
    if (formSection) {
        formSection.style.display = 'none';
    }
    resultSection.style.display = 'block';
    
    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    // Hide loading
    hideLoading();
}

// Format AI response
function formatAIResponse(response) {
    if (!response) return '<p>Tidak ada saran yang tersedia.</p>';
    
    // Convert markdown-like formatting to HTML
    let formatted = response
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/(\d+\.)\s/g, '<br><strong>$1</strong> ')
        .replace(/\n/g, '<br>')
        .replace(/(Strategi|Tips|Risiko|Langkah|Rekomendasi)/gi, '<br><strong>$1</strong>');
    
    return formatted;
}

// Reset form for new consultation
function resetForm() {
    consultationForm.reset();
    const formSection = document.querySelector('.consultation-form-section');
    if (formSection) {
        formSection.style.display = 'block';
    }
    resultSection.style.display = 'none';
    
    // Hide QRIS donation
    if (qrisDonation) {
        qrisDonation.style.display = 'none';
    }
    
    // Clear any existing timeout
    if (responseTimeout) {
        clearTimeout(responseTimeout);
    }
    
    // Scroll to form
    formSection.scrollIntoView({ behavior: 'smooth' });
}

// Loading states
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

// Fix QRIS image source
function fixQRISImage() {
    // Update semua gambar qris.png dengan URL yang benar
    const qrisImages = document.querySelectorAll('img[src*="qris.png"], img[alt*="qris"], img[alt*="QRIS"]');
    qrisImages.forEach(img => {
        img.src = 'https://01789907f3bf58.lhr.life/qris.png';
        img.onerror = function() {
            // Fallback jika gambar tidak ditemukan
            this.style.display = 'none';
            console.log('QRIS image not found');
        };
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Konsultan Keuangan AI siap digunakan');
    
    // Fix QRIS images
    fixQRISImage();
    
    // Add animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});
