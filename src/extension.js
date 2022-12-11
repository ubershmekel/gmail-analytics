"use strict";

// loader-code: wait until gmailjs has finished loading, before triggering actual extensiode-code.
const loaderId = setInterval(() => {
    if (!window._gmailjs) {
        return;
    }

    clearInterval(loaderId);
    startExtension(window._gmailjs);
}, 100);

// actual extension-code
function startExtension(gmail) {
    console.log("Extension loading...");
    window.gmail = gmail;

    gmail.observe.on("load", () => {
        const userEmail = gmail.get.user_email();
        console.log("Hello, " + userEmail + ". This is your extension talking!");
        setInterval(getTopMessages, 1000);

        gmail.observe.on("view_email", (domEmail) => {
            console.log("Looking at email:", domEmail);
            const emailData = gmail.new.get.email_data(domEmail);
            console.log("Email data:", emailData);
        });

        gmail.observe.on("compose", (compose) => {
            console.log("New compose window is opened!", compose);
        });
    });
}

function sortCounter(counter) {
    const sorted = Object.entries(counter).sort(([, a], [, b]) => b - a);
    // const sortedObj = Object.fromEntries(sorted);
    const noSingles = sorted.filter((item) => item[1] > 1);
    // console.log("singles count", sorted.length - noSingles.length);
    // console.log(noSingles);
    return noSingles;
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

let lastSummary = '';

function updateUI(counter) {
    const topSenderList = sortCounter(counter);
    const topSenderEmail = topSenderList[0][0];
    const topSenderCount = topSenderList[0][1];
    // console.log(topSender, topSenderCount);

    const summary = `${topSenderCount} emails from ${topSenderEmail}`;
    if (summary === lastSummary) {
        // Avoid thrashing the UI element, so that you can edit
        // the CSS without it flickering in the inspector.
        return;
    }
    const elementId = "gmail-analytics-widget";
    const existingEl = document.getElementById(elementId);
    const newEl = document.createElement("span");
    newEl.id = elementId;
    newEl.appendChild(document.createTextNode(`${topSenderCount} emails from `));

    const link = document.createElement("a");
    link.href = "#search/from: " + topSenderEmail;
    link.appendChild(document.createTextNode(topSenderEmail));
    newEl.appendChild(link);

    let didUpdate = false;
    if (existingEl) {
        // replace existing
        existingEl.parentNode.replaceChild(newEl, existingEl);
        didUpdate = true;
    } else {
        // insert new
        const searchBarEl = gmail.dom.search_bar();
        if (!searchBarEl) {
            console.log("search bar not found");
            return;
        }
        insertAfter(newEl, gmail.dom.search_bar()[0].parentNode.parentNode);
        didUpdate = true;
    }

    if (didUpdate) {
        lastSummary = summary;
    }
}

function getTopMessages() {
    const counter = {};
    gmail.dom.visible_messages().map((it) => {
        const sender = it.from.email;
        if (!counter[sender]) {
            counter[sender] = 0;
        }
        counter[sender] = counter[sender] + 1;
    });

    updateUI(counter);
}
