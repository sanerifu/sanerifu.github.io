/** @type {HTMLTableSectionElement} */
const post_data = document.getElementById("post-data");

/** @type {HTMLParagraphElement} */
const count_field = document.getElementById("post-count-field")

/** @type {HTMLInputElement} */
const search = document.getElementById("searchbar");

/** @type {HTMLSpanElement} */
const notification = document.getElementById("notification-count");

function addEntries(index) {
    post_data.replaceChildren();
    for (let entry of index) {
        let row = document.createElement('tr');
        
        let date = document.createElement('td');
        let name = document.createElement('td');
        let author = document.createElement('td');
        let tags = document.createElement('td');

        let date_string = entry.date ? entry.date[0] : "";
        let name_string = entry.title ? entry.title[0] : "";
        let author_string = entry.authors ? entry.authors.join(", ") : "";
        let tags_string = entry.tags ? entry.tags.join(", ") : "";

        let path = entry.path;

        date.innerHTML = `<a href="/${path}">${date_string}</a>`;
        name.innerHTML = `<a href="/${path}">${name_string}</a>`;
        author.innerHTML = `<a href="/${path}">${author_string}</a>`;
        tags.innerHTML = `<a href="/${path}">${tags_string}</a>`;

        row.append(date);
        row.append(name);
        row.append(author);
        row.append(tags);

        post_data.append(row);
    }

    count_field.textContent = `${index.length} gönderi`;
    notification.textContent = `${index.length} gönderi`;
}

addEntries(__INDEX__.toSorted((lhs, rhs) => {
    if(lhs.date && rhs.date) {
        return lhs.date[0].localeCompare(rhs.date[0]);
    } else {
        return lhs.path.localeCompare(rhs.path);
    }
}));

search.addEventListener('input', e => {
    /** @type {string} */
    let query = e.target.value;

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
