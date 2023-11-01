const tree = await chrome.bookmarks.getTree();
const groups = tree[0].children[1].children.filter(node => !node.url);

const template = document.getElementById("group-li-template");
const elements = new Set();
for (const group of groups) {
    const element = template.content.firstElementChild.cloneNode(true);

    element.querySelector(".group-name").textContent = group.title;
    element.querySelector("div").addEventListener("click", () => {
        const urls = group.children.filter(node => node.url).map(node => node.url);  // get all urls in this group
        let windowId;

        chrome.windows.create()  // create a new window
        .then(window => {
            return chrome.windows.update(window.id, {focused: true});  // focus on the new window
        })
        .then(window => {
            windowId = window.id;
            return Promise.all(urls.map(url => createTab(url, window.id)));  // open all urls
        })
        .then(newTabs => {
            return newTabs.map(newTab => newTab.id);  // get ids of new tabs
        })
        .then(async tabIds => {
            // group new tabs together
            const tabGroup = await chrome.tabs.group({'tabIds': tabIds, 'createProperties': {'windowId':windowId}});
            chrome.tabGroups.update(tabGroup, {title: group.title});
        });
    });
    
    elements.add(element);
}
document.querySelector("#group-list").append(...elements);

const createTab = function(url, windowId) {
    return chrome.tabs.create({'url': url, 'windowId': windowId});
}
