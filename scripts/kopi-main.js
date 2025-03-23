const sections = document.querySelectorAll(".scroll-section");

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