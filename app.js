// Application logic for Shin Dong-yeop's Sanmun 1 Slideshow Web App

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startOverlay = document.getElementById('startOverlay');
    const startBtn = document.getElementById('startBtn');
    const bgmAudio = document.getElementById('bgmAudio');
    
    const slides = document.querySelectorAll('.slide-item');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    const slideCounter = document.getElementById('slideCounter');
    const slideProgressBar = document.getElementById('slideProgressBar');

    // App Configurations
    const totalSlides = slides.length;
    const slideIntervalMs = 8000; // 8 seconds per slide
    const progressUpdateStepMs = 100; // update progress bar every 100ms
    
    // App State
    let currentIndex = 0;
    let isPlaying = false;
    let isMuted = false;
    let slideshowTimer = null;
    let progressTimer = null;
    let progressElapsedMs = 0;

    /* ==========================================
       1. Initialization & Start Action
       ========================================== */
    startBtn.addEventListener('click', () => {
        // Play audio (workaround for browser autoplay policies)
        playAudio();
        
        // Hide overlay
        startOverlay.classList.add('fade-out');
        
        // Start slideshow
        playSlideshow();
    });

    function playAudio() {
        if (!bgmAudio) return;
        bgmAudio.play().catch(err => {
            console.warn("BGM Audio play blocked or failed. Please ensure 'bgm.mp3' exists in the root folder.", err);
        });
    }

    function pauseAudio() {
        if (!bgmAudio) return;
        bgmAudio.pause();
    }

    /* ==========================================
       2. Slideshow Control Logic
       ========================================== */
    function playSlideshow() {
        if (isPlaying) return;
        isPlaying = true;
        
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        playAudio();
        
        // Clear previous timers just in case
        clearTimers();

        // Start progress bar tick
        progressTimer = setInterval(() => {
            progressElapsedMs += progressUpdateStepMs;
            
            // Calculate progress percentage
            const percentage = (progressElapsedMs / slideIntervalMs) * 100;
            slideProgressBar.style.width = `${Math.min(percentage, 100)}%`;
            
            // If time is up, go to next slide
            if (progressElapsedMs >= slideIntervalMs) {
                nextSlide();
            }
        }, progressUpdateStepMs);
    }

    function pauseSlideshow() {
        if (!isPlaying) return;
        isPlaying = false;
        
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        pauseAudio();
        
        clearTimers();
    }

    function clearTimers() {
        if (progressTimer) {
            clearInterval(progressTimer);
            progressTimer = null;
        }
    }

    function goToSlide(index) {
        // Remove active class from current slide
        slides[currentIndex].classList.remove('active');
        
        // Update index
        currentIndex = index;
        if (currentIndex >= totalSlides) currentIndex = 0;
        if (currentIndex < 0) currentIndex = totalSlides - 1;
        
        // Add active class to new slide
        slides[currentIndex].classList.add('active');
        
        // Reset progress bar
        progressElapsedMs = 0;
        slideProgressBar.style.width = '0%';
        
        // Update Counter
        slideCounter.textContent = `${currentIndex + 1} / ${totalSlides}`;
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    /* ==========================================
       3. Event Listeners
       ========================================== */
    // Play/Pause button toggle
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSlideshow();
        } else {
            playSlideshow();
        }
    });

    // Mute/Unmute button toggle
    audioToggleBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        bgmAudio.muted = isMuted;
        
        if (isMuted) {
            audioToggleBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            audioToggleBtn.title = "배경음악 음소거 해제";
        } else {
            audioToggleBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            audioToggleBtn.title = "배경음악 음소거";
        }
    });

    // Manual navigation buttons
    prevBtn.addEventListener('click', () => {
        prevSlide();
        if (isPlaying) {
            // Reset timer to give full time for the new manually selected slide
            progressElapsedMs = 0;
        }
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        if (isPlaying) {
            // Reset timer
            progressElapsedMs = 0;
        }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Only active if overlay is hidden
        if (!startOverlay.classList.contains('fade-out')) return;

        if (e.key === 'ArrowRight' || e.key === 'Space') {
            nextSlide();
            if (isPlaying) progressElapsedMs = 0;
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
            if (isPlaying) progressElapsedMs = 0;
        } else if (e.key === 'p' || e.key === 'P') {
            // P key toggles play/pause
            if (isPlaying) pauseSlideshow();
            else playSlideshow();
        }
    });

    // Pause slideshow and BGM when page is hidden (tab switched, minimized, or screen locked on mobile)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pauseSlideshow();
        }
    });
});
