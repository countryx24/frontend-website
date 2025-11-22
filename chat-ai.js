// API configuration
const API_BASE_URL = 'http://103.149.177.182:3000/api/advice'; // Base URL tanpa endpoint

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

    // Validasi form
    if (!data.dana || !data.keperluan || !data.jangkaWaktu) {
        alert('Harap isi semua field!');
        return;
    }

    if (isNaN(data.dana) || data.dana <= 0) {
        alert('Dana harus berupa angka positif!');
        return;
    }

    // Show loading
    showLoading();
    
    // Set timeout for 15 seconds (lebih lama untuk AI processing)
    responseTimeout = setTimeout(() => {
        console.log('⏰ Timeout reached, showing QRIS');
        showQRISDonation();
    }, 15000);
    
    try {
        console.log('📤 Sending request to:', `${API_BASE_URL}/api/advice`);
        
        const response = await fetch(`${API_BASE_URL}/api/advice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        // Clear timeout jika response diterima
        clearTimeout(responseTimeout);

        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ HTTP error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Response success:', result);
        
        if (result.success) {
            displayResult(result.data);
        } else {
            throw new Error(result.error || 'Terjadi kesalahan pada server');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        // Clear timeout on error
        clearTimeout(responseTimeout);
        // Tampilkan QRIS sebagai fallback
        showQRISDonation();
    } finally {
        hideLoading();
    }
}

// Display AI response
function displayResult(data) {
    console.log('🎯 Displaying result:', data);
    
    try {
        // Update summary dari data backend
        if (data.details) {
            // Parse dari format: "Dana: Rp 50.000.000 | Jangka: 1 tahun"
            const details = data.details;
            const danaMatch = details.match(/Rp ([\d.,]+)/);
            const jangkaMatch = details.match(/Jangka: (.+)$/);
            
            document.getElementById('summary-dana').textContent = danaMatch ? `Rp ${danaMatch[1]}` : `Rp ${parseInt(data.dana).toLocaleString('id-ID')}`;
            document.getElementById('summary-keperluan').textContent = data.title ? data.title.replace('🤖 Saran Keuangan untuk ', '') : data.keperluan;
            document.getElementById('summary-jangkaWaktu').textContent = jangkaMatch ? jangkaMatch[1] : data.jangkaWaktu;
        } else {
            // Fallback jika details tidak ada
            document.getElementById('summary-dana').textContent = `Rp ${parseInt(data.dana).toLocaleString('id-ID')}`;
            document.getElementById('summary-keperluan').textContent = data.keperluan;
            document.getElementById('summary-jangkaWaktu').textContent = data.jangkaWaktu;
        }
        
        // Display AI response dengan prioritas full_ai_response
        const aiResponse = document.getElementById('ai-response');
        let responseText = '';
        
        if (data.full_ai_response) {
            responseText = data.full_ai_response;
        } else if (data.strategy && data.actionPlan && data.target) {
            responseText = `
🤖 **SARAN KEUANGAN ANDA**

**Strategi Utama:**
${data.strategy.map((s, i) => `${i+1}. ${s}`).join('\n')}

**Rencana Aksi:**
${data.actionPlan}

**Target:**
${data.target}

${data.note ? '\n**Catatan:** ' + data.note : ''}
${data.ai_error ? '\n**Info:** ' + data.ai_error : ''}
            `;
        } else {
            responseText = 'Saran keuangan sedang tidak tersedia. Silakan coba lagi.';
        }
        
        aiResponse.innerHTML = formatAIResponse(responseText);
        
        // Hide QRIS donation jika berhasil
        if (qrisDonation) {
            qrisDonation.style.display = 'none';
        }
        
    } catch (displayError) {
        console.error('❌ Error displaying result:', displayError);
        // Fallback ke QRIS jika ada error display
        showQRISDonation();
        return;
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

// Show QRIS donation after timeout atau error
function showQRISDonation() {
    console.log('💰 Showing QRIS donation');
    
    // Update summary dengan data form terakhir
    const formData = new FormData(consultationForm);
    const dana = formData.get('dana');
    const keperluan = formData.get('keperluan');
    const jangkaWaktu = formData.get('jangkaWaktu');
    
    document.getElementById('summary-dana').textContent = `Rp ${parseInt(dana).toLocaleString('id-ID')}`;
    document.getElementById('summary-keperluan').textContent = keperluan;
    document.getElementById('summary-jangkaWaktu').textContent = jangkaWaktu;
    
    // Display fallback message
    const aiResponse = document.getElementById('ai-response');
    aiResponse.innerHTML = `
        <div class="alert alert-info">
            <p><strong>💡 Tips Keuangan Umum</strong></p>
            <p>Berikut adalah saran keuangan dasar untuk Anda:</p>
        </div>
        
        <div class="strategy-item">
            <strong>1. Diversifikasi Portofolio</strong><br>
            Sebarkan investasi Anda ke berbagai instrumen (saham, reksadana, deposito) untuk mengurangi risiko.
        </div>
        
        <div class="strategy-item">
            <strong>2. Dana Darurat</strong><br>
            Pastikan Anda memiliki dana darurat 3-6 bulan pengeluaran sebelum berinvestasi besar.
        </div>
        
        <div class="strategy-item">
            <strong>3. Mulai dengan Amount Kecil</strong><br>
            Mulailah dengan amount yang nyaman dan tingkatkan secara bertahap seiring waktu.
        </div>
        
        <div class="strategy-item">
            <strong>4. Edukasi Diri</strong><br>
            Pelajari setiap instrumen investasi sebelum berkomitmen untuk menghindari kerugian.
        </div>
        
        <div class="strategy-item">
            <strong>5. Konsisten dan Disiplin</strong><br>
            Investasi yang konsisten dalam jangka panjang biasanya memberikan hasil terbaik.
        </div>
        
        <div class="mt-3 p-3 bg-light rounded">
            <small>💡 <strong>Tip:</strong> Untuk saran yang lebih personalized, pastikan koneksi internet stabil dan coba lagi nanti.</small>
        </div>
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
}

// Format AI response
function formatAIResponse(response) {
    if (!response) return '<p class="text-muted">Tidak ada saran yang tersedia.</p>';
    
    try {
        // Convert markdown-like formatting to HTML
        let formatted = response
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/🤖\s*\*\*(.*?)\*\*/g, '<h5 class="mt-3">$1</h5>')
            .replace(/(\d+\.)\s/g, '<br><strong>$1</strong> ')
            .replace(/\n\n/g, '</div><div class="strategy-item">')
            .replace(/\n/g, '<br>')
            .replace(/(Strategi|Rencana|Target|Tips|Risiko|Langkah|Rekomendasi)/gi, '<br><strong>$1</strong>');
        
        return `<div class="strategy-item">${formatted}</div>`;
    } catch (error) {
        console.error('❌ Error formatting response:', error);
        return `<div class="strategy-item">${response}</div>`;
    }
}

// Reset form for new consultation
function resetForm() {
    console.log('🔄 Resetting form');
    
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
        console.log('⏰ Cleared existing timeout');
    }
    
    // Scroll to form
    if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Loading states
function showLoading() {
    console.log('⏳ Showing loading');
    if (loadingElement) loadingElement.style.display = 'block';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    }
}

function hideLoading() {
    console.log('✅ Hiding loading');
    if (loadingElement) loadingElement.style.display = 'none';
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Dapatkan Saran AI';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Konsultan Keuangan AI siap digunakan');
    console.log('🔗 API Base URL:', API_BASE_URL);
    
    // Add animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Test connection on load
    testConnection();
});

// Test connection to backend
async function testConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connection OK:', data);
        } else {
            console.warn('⚠️ Backend connection issue:', response.status);
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
    }
}
