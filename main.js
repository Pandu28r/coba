document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card-carousel .card');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const startAutoSlideBtn = document.getElementById('startAutoSlide');
    const stopAutoSlideBtn = document.getElementById('stopAutoSlide');
    let currentIndex = 0;
    let autoSlideInterval;
    let imageCarousels = [];
    const imageSlideInterval = 3000; // 3 seconds between image slides
    const cardSlideInterval = 5000;  // 5 seconds between card slides
    
    // Initialize Bootstrap carousels for images and store instances
    document.querySelectorAll('.image-carousel').forEach(carouselEl => {
        const carousel = new bootstrap.Carousel(carouselEl, {
            interval: false, // Disable built-in auto sliding
            wrap: true
        });
        
        imageCarousels.push({
            element: carouselEl,
            instance: carousel,
            cardIndex: parseInt(carouselEl.getAttribute('data-card-index')),
            totalItems: carouselEl.querySelectorAll('.carousel-item').length,
            currentItemIndex: 0
        });
        
        // Listen for slide events to track current image index
        carouselEl.addEventListener('slid.bs.carousel', function(event) {
            const carouselIndex = imageCarousels.findIndex(c => c.element === this);
            if (carouselIndex !== -1) {
                imageCarousels[carouselIndex].currentItemIndex = 
                    Array.from(this.querySelectorAll('.carousel-item'))
                        .findIndex(item => item.classList.contains('active'));
            }
        });
    });
    
    // Function to update card positions
    function updateCardPositions() {
        cards.forEach((card, index) => {
            card.className = 'card shadow bg-body rounded';
            
            // Calculate the position relative to the current index
            let position = (index - currentIndex) % cards.length;
            if (position < 0) position += cards.length;
            
            if (position === 0) {
                card.classList.add('active-card');
            } else if (position === 1) {
                card.classList.add('next-card');
            } else if (position === cards.length - 1) {
                card.classList.add('prev-card');
            } else {
                card.classList.add('hidden-card');
            }
        });
    }
    
    // Function to get current active card's image carousel
    function getCurrentCardImageCarousel() {
        return imageCarousels.find(carousel => carousel.cardIndex === currentIndex);
    }
    
    // Function to handle sequential auto slide
    function sequentialAutoSlide() {
        const currentCarousel = getCurrentCardImageCarousel();
        
        if (currentCarousel) {
            // If we haven't gone through all images in current card
            if (currentCarousel.currentItemIndex < currentCarousel.totalItems - 1) {
                // Slide to next image
                currentCarousel.instance.next();
            } else {
                // We've gone through all images, reset image index
                currentCarousel.currentItemIndex = 0;
                
                // Move to next card
                currentIndex = (currentIndex + 1) % cards.length;
                updateCardPositions();
            }
        }
    }
    
    // Function to start auto sliding
    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        
        // Set up autoSlideInterval
        autoSlideInterval = setInterval(sequentialAutoSlide, imageSlideInterval);
        
        // Update buttons
        startAutoSlideBtn.disabled = true;
        stopAutoSlideBtn.disabled = false;
    }
    
    // Function to stop auto sliding
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
        
        // Update buttons
        startAutoSlideBtn.disabled = false;
        stopAutoSlideBtn.disabled = true;
    }
    
    // Initialize card positions
    updateCardPositions();
    
    // Event listeners for manual navigation buttons
    prevBtn.addEventListener('click', function() {
        stopAutoSlide();
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCardPositions();
    });
    
    nextBtn.addEventListener('click', function() {
        stopAutoSlide();
        currentIndex = (currentIndex + 1) % cards.length;
        updateCardPositions();
    });
    
    // Enable clicking on cards to navigate the card carousel
    cards.forEach((card, index) => {
        card.addEventListener('click', function(event) {
            // Check if the click was on a card or on an inner carousel control
            if (!event.target.closest('.inner-control')) {
                stopAutoSlide();
                if (index !== currentIndex) {
                    // If it's the next card in order
                    if ((index === currentIndex + 1) || (currentIndex === cards.length - 1 && index === 0)) {
                        currentIndex = (currentIndex + 1) % cards.length;
                    } 
                    // If it's the previous card in order
                    else if ((index === currentIndex - 1) || (currentIndex === 0 && index === cards.length - 1)) {
                        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
                    }
                    updateCardPositions();
                }
                
                // Start auto-slide again after a brief delay (user might be interacting)
                setTimeout(startAutoSlide, 5000);
            }
        });
    });
    
    // Prevent card carousel navigation when interacting with inner image carousel
    const innerControls = document.querySelectorAll('.inner-control');
    innerControls.forEach(control => {
        control.addEventListener('click', function(event) {
            stopAutoSlide();
            event.stopPropagation();
            
            // Start auto-slide again after a brief delay
            setTimeout(startAutoSlide, 5000);
        });
    });
    
    // Pause auto-slide when user hovers over carousel
    document.querySelector('.card-carousel').addEventListener('mouseenter', function() {
        if (autoSlideInterval) stopAutoSlide();
    });
    
    // Restart auto-slide when user leaves carousel
    document.querySelector('.card-carousel').addEventListener('mouseleave', function() {
        startAutoSlide();
    });
    
    // Start auto-slide automatically when page loads
    startAutoSlide();
    
    // Hide the auto-slide control buttons since we're using hover instead
    document.querySelector('.auto-slide-controls').style.display = 'none';
});