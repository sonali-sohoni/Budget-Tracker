let db;
//1 Get listerner object after opening the connection

let request = indexedDB.open("budget", 1);

//2 Create an object store
request.onupgradeneeded = function (event) {
	db = event.target.result;
	db.createObjectStore("new-transaction", { autoIncrement: true });
};

//3 success and error handlers
request.onsuccess = function (event) {
	//set up global db object when connection gets finalized.
	db = event.target.result;
	if (navigator.onLine) {
		//	uploadData();
	}
};

request.onerror = function (event) {
	// log error here
	console.log(event.target.errorCode);
};

//save record if no network connection
const saveRecord = function (record) {
	//open a new transaction with the database with read and write permissions
	const transaction = db.transaction(["new-transaction"], "readwrite");
	// access the object store for `new_pizza`
	const transactionObjectStore = transaction.objectStore("new-transaction");
	transactionObjectStore.add(record);
};

const uploadData = function () {
	const transaction = db.transaction(["new-transaction"], "readwrite");
	const transactionObjectStore = transaction.objectStore("new-transaction");
	const getAll = transactionObjectStore.getAll();
	getAll.onsuccess = function () {
		// if there was data in indexedDb's store, let's send it to the api server
		if (getAll.result.length > 0) {
			fetch("/api/transaction", {
				method: "POST",
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then((serverResponse) => {
					if (serverResponse.message) {
						throw new Error(serverResponse);
					}
					// open one more transaction
					const transaction = db.transaction(["new-transaction"], "readwrite");
					// access the new_pizza object store
					const transactionObjectStore =
						transaction.objectStore("new-transaction");
					// clear all items in your store
					transactionObjectStore.clear();

					alert("All deposit and expense transactions have been submitted!");
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};
};
window.addEventListener("online", uploadData);
