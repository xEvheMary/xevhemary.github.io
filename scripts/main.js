const sections = document.querySelectorAll(".scroll-section");
const slidesContainer = document.querySelector(".slides");
const slides = document.querySelectorAll(".slide");
const cvslides = document.querySelectorAll(".cv-slide");
const pageNavItems = document.querySelectorAll("header #logo ,#nav li"); // Main section nav
const slideNavItems = document.querySelectorAll(".left-part a"); // Slide nav
let autoSlideInterval;

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