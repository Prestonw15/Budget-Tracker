// variable to connect db
let db

// establishes connection to Database
const request = indexedDB.open('Budget-Tracker', 1);

// this event will emit if the db version changes
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    // creates a table to have a set auto incrementing primary key
    db.createObjectStore('new_transaction', {autoIncrement: true});
};

// if successul
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    // console logs the error here
    console.log(event.target.errorCode);
}


function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const trackerObjectStore = transaction.objectStore('new_transaction');

    trackerObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const trackerObjectStore = transaction.objectStore('new_transaction');

    const getAll = trackerObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['new_transaction'], 'readwrite');

                const trackerObjectStore = transaction.objectStore('new_transaction');

                trackerObjectStore.clear();

                alert('All saved transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};

window.addEventListener('online', uploadTransaction);