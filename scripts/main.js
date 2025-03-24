const sections = document.querySelectorAll(".scroll-section");
const slidesContainer = document.querySelector(".slides");
const slides = document.querySelectorAll(".slide");
const cvslides = document.querySelectorAll(".cv-slide");
const pageNavItems = document.querySelectorAll("header #logo ,#nav li"); // Main section nav
const slideNavItems = document.querySelectorAll(".left-part a"); // Slide nav
// Variables
let autoSlideInterval;
let isDragging = false;
let startX, currentX, translateX = 0;
let currentIndex = 0;

function updateActiveSection() {
    let firstVisibleSection = [...sections].find(section => {
        let rect = section.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    });

    sections.forEach(section => section.classList.remove("on-display"));
    if (firstVisibleSection) {
        let index = [...sections].indexOf(firstVisibleSection);
        firstVisibleSection.classList.add("on-display");
        pageNavItems.forEach(item => item.classList.remove("page-active"));
        if (pageNavItems[index]) pageNavItems[index].classList.add("page-active");
    }
}

function updateActiveSlide() {
    let firstVisibleSlide = [...slides].find(slide => {
        let rect = slide.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= window.innerWidth;
    });

    if (firstVisibleSlide) {
        let index = [...slides].indexOf(firstVisibleSlide);
        slideNavItems.forEach(item => item.classList.remove("slide-active"));
        if (slideNavItems[index]) slideNavItems[index].classList.add("slide-active");
    }
}

function startAutoSlide(section, start=0) {
    stopAutoSlide(); // Stop any existing auto-slide
    let index = start;
    const slideCount = slides.length;

    autoSlideInterval = setInterval(() => {
        index = (index + 1) % slideCount;
        let slideWidth = slides[0].offsetWidth;
        slidesContainer.style.transform = `translateX(-${index * slideWidth}px)`;
        updateActiveSlide(index);
    }, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

function startDrag(e) {
    isDragging = true;
    startX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX; // Get initial position
    slidesContainer.style.transition = "none";  // Disable smooth transition while dragging

    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchmove", onDrag, { passive: true });
    document.addEventListener("touchend", endDrag);
}

// Dragging event
function onDrag(e) {
    if (!isDragging) return;

    currentX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    let movedX = currentX - startX;

    slidesContainer.style.transform = `translateX(${translateX + movedX}px)`;
}

// End drag and snap to closest slide
function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;

    let movedX = currentX - startX;
    let slideWidth = slides[0].offsetWidth;

    if (Math.abs(movedX) > slideWidth / 4) {
        // If swipe distance is significant, move to next or previous slide
        currentIndex = movedX > 0 ? currentIndex - 1 : currentIndex + 1;
    }

    // Prevent out-of-bounds sliding
    currentIndex = Math.max(0, Math.min(slides.length - 1, currentIndex));

    // Snap to the nearest slide
    translateX = -currentIndex * slideWidth;
    slidesContainer.style.removeProperty("transition");
    slidesContainer.style.transform = `translateX(${translateX}px)`;
    
    startAutoSlide(sections[1], currentIndex); // restart auto-slide
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("touchend", endDrag);
}

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            let index = [...sections].indexOf(entry.target);
            entry.target.classList.toggle("on-display", entry.isIntersecting);

            if (entry.isIntersecting) {
                const section = entry.target;
                if (section.querySelector(".slides")) {
                    startAutoSlide(section);
                } else {
                    stopAutoSlide();
                }
                pageNavItems.forEach(item => item.classList.remove("page-active"));
                if (pageNavItems[index]) pageNavItems[index].classList.add("page-active");
            }
        });
    },
    { threshold: 0.8 }
);

const slideObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                let index = [...slides].indexOf(entry.target);
                slideNavItems.forEach(item => item.classList.remove("slide-active"));
                if (slideNavItems[index]) slideNavItems[index].classList.add("slide-active");
            }
        });
    },
    { threshold: 0.5 }
);

const cvObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            let index = [...cvslides].indexOf(entry.target);
            entry.target.classList.toggle("cv-display", entry.isIntersecting);
            if (entry.isIntersecting) {
                const cvslide = entry.target;
            }
        });
    },
    { threshold: 0.8 }
);

document.addEventListener("DOMContentLoaded", () => {
    // Observe sections and slides
    sections.forEach((section) => sectionObserver.observe(section));
    slides.forEach((slide) => slideObserver.observe(slide));
    cvslides.forEach((cvslide) => cvObserver.observe(cvslide));

    // Initialize active state on load
    updateActiveSection();
    updateActiveSlide();
});

// Handle clicking nav items
slideNavItems.forEach((link, index) => {
    link.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent page jump

        let slideWidth = slides[0].offsetWidth; // Get actual slide width
        slidesContainer.style.transform = `translateX(-${index * slideWidth}px)`;

        startAutoSlide(sections[1], index); // Start auto-slide
        updateActiveSlide(index); // Update active state
    });
});

const totalcvSlides = cvslides.length;

//Handle clickling next and previous buttons
document.querySelector(".slide-left").addEventListener("click", function (e) {
    e.preventDefault(); // Prevent page jump
    
    let activeIndex = getActiveIndex("cv-slide", "cv-display");
    let nextIndex = (activeIndex - 1) % totalcvSlides;
    updateCVSlide(nextIndex);
});

document.querySelector(".slide-right").addEventListener("click", function (e) {
    e.preventDefault(); // Prevent page jump

    let activeIndex = getActiveIndex("cv-slide", "cv-display");
    let nextIndex = (activeIndex + 1) % totalcvSlides;
    updateCVSlide(nextIndex);    
});

function updateCVSlide(index) {
    let slideWidth = document.querySelector(".slide-container").offsetWidth; // Get actual slide width
    document.querySelector(".cv-slides").style.transform = `translateX(-${index * slideWidth}px)`;
}

// Auxiliary functions
function getActiveIndex(slideClass, activeClass) {
    const slides = document.querySelectorAll(`.${slideClass}`);
    return Array.from(slides).findIndex(slide => slide.classList.contains(activeClass));
}

// Listen for manual scrolling (if allowed)
slidesContainer.addEventListener("transitionend", updateActiveSlide);
// Listen for dragging events
slidesContainer.addEventListener("mousedown", startDrag);
slidesContainer.addEventListener("touchstart", startDrag, { passive: true });