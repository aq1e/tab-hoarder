// use date+time as default group name 
const date = new Date();
const dateTimeString = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
document.getElementById("create-group-name").placeholder = dateTimeString;

const tabs = await chrome.tabs.query({ currentWindow: true});
const template = document.getElementById("tab-li-template");
const elements = new Set();

for (const tab of tabs) {
    const element = template.content.firstElementChild.cloneNode(true);
    const pathname = new URL(tab.url).pathname.slice("/docs".length);

    element.querySelector(".url-input").value = tab.url;
    element.querySelector(".title-input").value = tab.title;
    element.querySelector(".btn-delete").addEventListener("click", () => {
        document.getElementById("tab-list").removeChild(element);
    })
    
    elements.add(element);
}

document.querySelector("#tab-list").append(...elements);

document.querySelector("#submit-button").addEventListener("click", async () => {
    let groupName = document.querySelector("#create-group-name").value;
    if (!groupName) { groupName = dateTimeString; }
    console.log(groupName);
    const groupFolder = await chrome.bookmarks.create({'title': groupName });
    document.querySelectorAll('.tab').forEach( tab => {
        const title = tab.querySelector('.title-input').value;
        const url = tab.querySelector('.url-input').value;
        chrome.bookmarks.create({
            'parentId': groupFolder.id, 
            'url': url, 
            'title': title
        });
    });
});
