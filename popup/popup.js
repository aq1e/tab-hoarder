const tree = await chrome.bookmarks.getTree();
const groups = tree[0].children[1].children.filter(node => !node.url);

const template = document.getElementById("group-li-template");
const elements = new Set();
for (const group of groups) {
    const element = template.content.firstElementChild.cloneNode(true);

    element.querySelector(".group-name").textContent = group.title;
    element.querySelector("div").addEventListener("click", async () => {
        const window = await chrome.windows.create();  // create a new window
        await chrome.windows.update(window.id, {focused: true}); // make the created window active
        const tabs = group.children.filter(node => node.url);  // get all tabs in this group
        const tabIds = [];
        tabs.forEach(async tab => {
            const newTab = await chrome.tabs.create({'url': tab.url, 'windowId': window.id});
            tabIds.push(newTab.id);
        });  // open tabs in the created window and log tab id
        // const tabGroup = await chrome.tabs.group(await chrome.tabs.query({ currentWindow: true}).map(({id}) => id));
        // console.log(tabIds);
        const tabGroup = await chrome.tabs.group({tabIds});
        await chrome.tabGroup.update(tabGroup, {title: group.title});
    });
    
    elements.add(element);
}
document.querySelector("#group-list").append(...elements);
