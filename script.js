// Preloader dengan animasi flip up
window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 1000);
});

// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Scroll Navigation
class ScrollNavigation {
    constructor() {
        this.sections = document.querySelectorAll('.scroll-section');
        this.dots = document.querySelectorAll('.dot');
        this.nextButtons = document.querySelectorAll('.scroll-next');
        this.navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        this.currentSection = 'home';
        
        this.init();
    }
    
    init() {
        // Show initial section
        this.showSection(this.currentSection);
        
        // Add event listeners to dots
        this.dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const sectionName = dot.getAttribute('data-section');
                this.showSection(sectionName);
            });
        });
        
        // Add event listeners to next buttons
        this.nextButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.nextSection();
            });
        });
        
        // Add event listeners to nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    const sectionName = href.substring(1);
                    this.showSection(sectionName);
                    
                    // Close mobile menu if open
                    if (navMenu) navMenu.classList.remove('active');
                }
            });
        });
        
        // Add scroll event listener dengan debounce
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                this.updateActiveSection();
            }, 100);
        });
        
        // Initial active section update
        this.updateActiveSection();
    }
    
    showSection(sectionName) {
        const targetSection = document.getElementById(sectionName);
        if (!targetSection) return;
        
        // Update current section
        this.currentSection = sectionName;
        
        // Scroll to section dengan smooth behavior
        targetSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
        
        // Update active states
        this.updateActiveStates(sectionName);
    }
    
    nextSection() {
        const currentIndex = Array.from(this.sections).findIndex(
            section => section.id === this.currentSection
        );
        
        if (currentIndex < this.sections.length - 1) {
            const nextSection = this.sections[currentIndex + 1];
            this.showSection(nextSection.id);
        }
    }
    
    updateActiveSection() {
        let foundActive = false;
        
        this.sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            const windowHeight = window.innerHeight;
            
            // Jika section berada di tengah viewport
            if (sectionTop <= windowHeight / 2 && sectionBottom >= windowHeight / 2) {
                this.currentSection = section.id;
                this.updateActiveStates(section.id);
                foundActive = true;
            }
        });
        
        // Fallback: jika tidak ada section yang aktif, pilih yang paling dekat
        if (!foundActive) {
            let closestSection = null;
            let closestDistance = Infinity;
            
            this.sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const distance = Math.abs(rect.top - window.innerHeight / 2);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestSection = section;
                }
            });
            
            if (closestSection) {
                this.currentSection = closestSection.id;
                this.updateActiveStates(closestSection.id);
            }
        }
    }
    
    updateActiveStates(activeSection) {
        // Update sections
        this.sections.forEach(section => {
            if (section.id === activeSection) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
        
        // Update dots
        this.dots.forEach(dot => {
            if (dot.getAttribute('data-section') === activeSection) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Update URL hash tanpa trigger scroll
        if (history.replaceState) {
            history.replaceState(null, null, `#${activeSection}`);
        }
    }
}

// Initialize Scroll Navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize scroll navigation if we're on the index page
    if (document.querySelector('.scroll-container')) {
        new ScrollNavigation();
    }
    console.log('Website Keuangan siap digunakan');
});