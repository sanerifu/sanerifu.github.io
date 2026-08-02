/** @type {HTMLTableSectionElement} */
const post_data = document.getElementById("post-data");

/** @type {HTMLParagraphElement} */
const count_field = document.getElementById("post-count-field")

/** @type {HTMLInputElement} */
const search = document.getElementById("searchbar");

function addEntries(index) {
    post_data.replaceChildren();
    for (let entry of index) {
        let row = document.createElement('li');

        let top_row = document.createElement('a');
        top_row.classList.add("post-title-date");
        top_row.href = `/${entry.path}`;
        let name = document.createElement('span');
        let date = document.createElement('div');

        let bottom_row = document.createElement('div')
        let author = document.createElement('span');
        let tags = document.createElement('div');

        let date_string = entry.date ? entry.date[0]: "";

        name.innerHTML = entry.title ? entry.title[0] : "";
        date.innerHTML = `Tarih: ${date_string}`;
        author.innerHTML = `Yazar${entry.authors && entry.authors.length > 1 ? "lar" : ""}: ${entry.authors ? entry.authors.join(", ") : ""}`;

        if(entry.tags) {
            tags.innerText = `Etiketler: ${entry.tags.join(", ")}`;
        }

        name.classList.add("post-name");
        date.classList.add("post-date");

        top_row.append(name);
        
        bottom_row.append(author);
        bottom_row.append(tags);
        
        row.append(top_row);
        row.append(date);
        row.append(bottom_row);

        post_data.append(row);
    }

    count_field.textContent = `${index.length} gönderi`;
}

addEntries(__INDEX__.toSorted((lhs, rhs) => {
    if (lhs.date && rhs.date) {
        return lhs.date[0].localeCompare(rhs.date[0]);
    } else {
        return lhs.path.localeCompare(rhs.path);
    }
}));

search.addEventListener('input', e => {
    /** @type {string} */
    let query = e.target.value.toLowerCase();

    let index = __INDEX__.filter(
        entry => {
            let has_date = (entry.date && entry.date[0].toLowerCase().includes(query));
            let has_name = (entry.title && entry.title[0].toLowerCase().includes(query));
            let has_author = (entry.authors && entry.authors.some(author => author.toLowerCase().includes(query)));
            let has_tag = (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(query)));
            return has_date || has_name || has_author || has_tag;
        }
    );

    addEntries(index);
});
