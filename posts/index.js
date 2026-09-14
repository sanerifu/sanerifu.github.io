/** @type {HTMLTableSectionElement} */
const post_data = document.getElementById("post-data");

/** @type {HTMLParagraphElement} */
const count_field = document.getElementById("post-count-field")

/** @type {HTMLInputElement} */
const search = document.getElementById("searchbar");

/** @type {HTMLDivElement} */
const result_container = document.getElementById("result-container");

const js_enabled = document.querySelectorAll(".hidden-when-js-unavailable");

search.addEventListener('input', e => {
    /** @type {string} */
    let query = e.target.value.toLowerCase();

    let filtered_count = 0;
    Array.from(post_data.children).forEach(child => {
        if (child.textContent.toLowerCase().includes(query)) {
            child.hidden = false;
            filtered_count += 1;
        } else {
            child.hidden = true;
        }
    });

    count_field.innerText = `${filtered_count} Gönderi`
    if (filtered_count == 0) {
        result_container.style.display = "none";
    } else {
        result_container.style.display = "block";
    }
});

js_enabled.forEach(element => element.classList.remove("hidden-when-js-unavailable"));
