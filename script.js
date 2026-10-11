const listingForm = document.querySelector("#listing-form");
const materialsList = document.querySelector("#materials-list");
const formMessage = document.querySelector("#form-message");
const addListingButton = listingForm.querySelector('button[type="submit"]');
const materialFilterButtons = document.querySelectorAll("[data-material-filter]");
const storageKey = "encore-materials";
const storageErrorMessage = "Couldn't save this change. Browser storage may be unavailable or full. Please free storage space or enable site storage, then try again.";
let isSubmitting = false;
let submitUnlockTimer;
let activeMaterialFilter = "all";

function releaseSubmitButton(delay) {
	window.clearTimeout(submitUnlockTimer);
	submitUnlockTimer = window.setTimeout(function () {
		isSubmitting = false;
		addListingButton.disabled = false;
	}, delay);
}

function isValidMaterial(material) {
	return material !== null &&
		typeof material === "object" &&
		typeof material.itemName === "string" && material.itemName.trim() !== "" &&
		typeof material.category === "string" && material.category !== "" &&
		Number.isInteger(material.quantity) && material.quantity > 0 &&
		typeof material.condition === "string" && material.condition !== "" &&
		typeof material.societyName === "string" && material.societyName.trim() !== "" &&
		(typeof material.reserved === "undefined" || typeof material.reserved === "boolean");
}

function loadMaterials() {
	let savedMaterials;

	try {
		savedMaterials = localStorage.getItem(storageKey);
	} catch (error) {
		console.error("Unable to read saved materials.", error);
		return [];
	}

	if (savedMaterials === null) {
		return [];
	}

	try {
		const parsedMaterials = JSON.parse(savedMaterials);

		if (!Array.isArray(parsedMaterials)) {
			return [];
		}

		return parsedMaterials.filter(isValidMaterial).map(function (material) {
			return {
				itemName: material.itemName,
				category: material.category,
				quantity: material.quantity,
				condition: material.condition,
				societyName: material.societyName,
				reserved: material.reserved === true
			};
		});
	} catch (error) {
		console.error("Saved materials are not valid JSON.", error);
		return [];
	}
}

function saveMaterials() {
	try {
		localStorage.setItem(storageKey, JSON.stringify(materials));
		return true;
	} catch (error) {
		console.error("Unable to save materials.", error);
		return false;
	}
}

function createMaterialCard(material) {
	const materialCard = document.createElement("article");
	materialCard.className = "material-card";

	const cardTitle = document.createElement("h3");
	cardTitle.textContent = material.itemName;
	materialCard.appendChild(cardTitle);

	const details = [
		["Category", material.category],
		["Quantity", String(material.quantity)],
		["Condition", material.condition],
		["Society", material.societyName]
	];

	details.forEach(function (detail) {
		const detailLine = document.createElement("p");
		detailLine.textContent = detail[0] + ": " + detail[1];
		materialCard.appendChild(detailLine);
	});

	const reserveButton = document.createElement("button");
	reserveButton.className = "button reserve-button";
	reserveButton.type = "button";
	reserveButton.textContent = material.reserved ? "Reserved" : "Reserve";
	reserveButton.disabled = material.reserved;

	const reserveMessage = document.createElement("p");
	reserveMessage.className = "reserve-message";
	reserveMessage.setAttribute("role", "status");
	reserveMessage.setAttribute("aria-live", "polite");
	if (material.reserved) {
		reserveMessage.textContent = "Item reserved successfully!";
	}

	reserveButton.addEventListener("click", function () {
		if (material.reserved) {
			return;
		}

		material.reserved = true;
		if (!saveMaterials()) {
			material.reserved = false;
			reserveMessage.textContent = storageErrorMessage;
			return;
		}

		reserveButton.textContent = "Reserved";
		reserveButton.disabled = true;
		reserveMessage.textContent = "Item reserved successfully!";
	});

	materialCard.appendChild(reserveButton);
	materialCard.appendChild(reserveMessage);

	return materialCard;
}

function renderMaterials() {
	materialsList.replaceChildren();
	const visibleMaterials = activeMaterialFilter === "all"
		? materials
		: materials.filter(function (material) {
			return material.category === activeMaterialFilter;
		});

	if (visibleMaterials.length === 0) {
		const emptyMessage = document.createElement("p");
		emptyMessage.className = "empty-message";
		emptyMessage.textContent = materials.length === 0
			? "No materials listed yet."
			: "No materials match this category yet.";
		materialsList.appendChild(emptyMessage);
		return;
	}

	visibleMaterials.forEach(function (material) {
		materialsList.appendChild(createMaterialCard(material));
	});
}

const materials = loadMaterials();
renderMaterials();

materialFilterButtons.forEach(function (button) {
	button.addEventListener("click", function () {
		activeMaterialFilter = button.dataset.materialFilter;
		materialFilterButtons.forEach(function (filterButton) {
			filterButton.setAttribute("aria-pressed", String(filterButton === button));
		});
		renderMaterials();
	});
});

listingForm.addEventListener("submit", function (event) {
	event.preventDefault();
	if (isSubmitting) {
		return;
	}

	isSubmitting = true;
	addListingButton.disabled = true;

	const itemName = document.querySelector("#item-name").value.trim();
	const category = document.querySelector("#category").value;
	const quantityText = document.querySelector("#quantity").value.trim();
	const condition = document.querySelector("#condition").value;
	const societyName = document.querySelector("#society-name").value.trim();
	const quantity = Number(quantityText);

	if (!itemName || !category || !quantityText || !condition || !societyName) {
		formMessage.textContent = "Please fill in every field before adding your listing.";
		releaseSubmitButton(0);
		return;
	}

	if (!Number.isInteger(quantity) || quantity <= 0) {
		formMessage.textContent = "Quantity must be a positive whole number.";
		releaseSubmitButton(0);
		return;
	}

	const material = {
		itemName: itemName,
		category: category,
		quantity: quantity,
		condition: condition,
		societyName: societyName,
		reserved: false
	};
	materials.push(material);
	if (!saveMaterials()) {
		materials.pop();
		formMessage.textContent = storageErrorMessage;
		releaseSubmitButton(0);
		return;
	}

	renderMaterials();
	listingForm.reset();
	formMessage.textContent = "Your material listing has been added. Thanks for sharing!";
	releaseSubmitButton(400);
});
