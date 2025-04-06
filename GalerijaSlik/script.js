const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

class Image {
    constructor(description, author, image) {
        this.description = description;
        this.author = author;
        this.image = image;
    }
}

window.onload = loadImages;

// Function to load all images from LocalStorage
function loadImages() {
    const storedImages = JSON.parse(localStorage.getItem('images')) || []; // Retrieve stored images, or an empty array if none exist

    // For each image, append it to the flex container
    storedImages.forEach(image => {
        addImageToContainer(image.image, image.author, image.description);  // image.image is the Base64 string or URL
    });
}

// Function to load all images from LocalStorage
function loadImagesSearch(arrayImg) {
    const storedImages = arrayImg || []; // Retrieve stored images, or an empty array if none exist

    // For each image, append it to the flex container
    storedImages.forEach(image => {
        addImageToContainer(image.image, image.author, image.description);  // image.image is the Base64 string or URL
    });
}

// Function to add a new image
function addNewImage(event) {
    // Prevent default behavior (form submission)
    event.preventDefault();

    // Get values from the form
    const description = document.getElementById("description").value;
    const author = document.getElementById("author").value;

    // Get the image from the preview (imagePreview child)
    const imgElement = document.getElementById("imagePreview").querySelector("img");

    // Check if an image exists in the preview
    if (!imgElement) {
        alert("Please select an image file.");
        return;
    }

    // Get the Base64 string from the img element (this is the image data)
    const base64Image = imgElement.src;

    // Check if the src is a valid Base64 image string (simple check)
    if (!base64Image || !base64Image.startsWith("data:image/")) {
        alert("Invalid image format.");
        return;
    }

    // Create a new Image object with description, author, and the Base64 image data
    const newImage = new Image(description, author, base64Image);

    // Optionally, store this image in LocalStorage or anywhere else
    const storedImages = JSON.parse(localStorage.getItem('images')) || [];
    storedImages.push({
        description: newImage.description,
        author: newImage.author,
        image: newImage.image
    });

    try {
        // Try saving the updated images array to LocalStorage
        localStorage.setItem('images', JSON.stringify(storedImages));
        alert("Photo submitted successfully!");
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            alert("Image is too large to store in LocalStorage. Please try with a smaller image.");
        } else {
            alert("An unexpected error occurred while saving the image.");
        }
    }

    // Show success message and close form
    alert("Photo submitted successfully!");
    closeForm();
    clearFlexContainer();
    loadImages();
    // Clear the form fields
    document.getElementById("description").value = '';
    document.getElementById("author").value = '';
    document.getElementById("fileInput").value = '';  // Clear file input
    document.getElementById("imagePreview").innerHTML = '';  // Clear image preview
}


// Function to open the photo form
function addPhoto() {
    document.getElementById("photoForm").style.display = "block";
}

// Function to close the form
function closeForm() {
    document.getElementById("photoForm").style.display = "none";
}

// Allow files to be dropped
function allowDrop(event) {
    event.preventDefault();
}

// Handle the drop event (when the user drops a file into the drop area)
function drop(event) {
    event.preventDefault();

    // Check if files are dropped
    if (event.dataTransfer && event.dataTransfer.files) {
        const file = event.dataTransfer.files[0];  // Get the dropped file

        // Check if the dropped file is an image
        if (file && file.type.startsWith('image/')) {
            previewImage(file);  // Pass the file to the previewImage function
        } else {
            alert("Please drop a valid image file.");
        }
    } else {
        alert("No files were dropped.");
    }
}
// Handle file selection through the file input
function previewImage(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';  // Make sure the image fits in the preview box
            const preview = document.getElementById("imagePreview");
            preview.innerHTML = '';  // Clear any previous preview
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please select a valid image file.");
    }
}

// Optionally handle the form submission
document.getElementById("imageForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const author = document.getElementById("author").value;
    const imagePreview = document.getElementById("imagePreview");

    // Get the image preview element
    const image = imagePreview.querySelector("img");

    if (description && author && image) {
        addNewImage(event, image);
        closeForm();  // Close the form after submission

        // Clear the form values
        document.getElementById("description").value = '';
        document.getElementById("author").value = '';
        imagePreview.innerHTML = '';  // Remove the image preview
    } else {
        alert("Please fill in all fields.");
    }
});



// Add event listeners to the images dynamically or directly in HTML
function addImageToContainer(imageSrc, author, description) {
    const newDiv = document.createElement("div");
    newDiv.classList.add("flex-item");

    const newImage = document.createElement("img");
    newImage.src = imageSrc;
    newImage.alt = "Image Preview";

    // Add click event to open the modal with image details
    newImage.onclick = function() {
        openModal(imageSrc, author, description);
    };

    newDiv.appendChild(newImage);
    const flexContainer = document.querySelector(".flex-container");
    flexContainer.appendChild(newDiv);
}

function clearFlexContainer() {
    const flexContainer = document.querySelector(".flex-container");
    flexContainer.innerHTML = ''; // Clears all child elements
}

// Function to open the modal and show the image details
function openModal(imageSrc, author, description) {
    const modal = document.getElementById("photoModal");
    const modalImage = document.getElementById("modalImage");
    const modalAuthor = document.getElementById("modalAuthor");
    const modalDescriptionText = document.getElementById("modalDescriptionText");
    const modalImageSize = document.getElementById("modalImageSize");  // Add a new element for displaying image size

    // Set the content of the modal
    modalImage.src = imageSrc;
    modalAuthor.textContent = "Author: " + author;
    modalDescriptionText.textContent = description;

    // Calculate and display the size of the image
    const sizeInBytes = getBase64ImageSize(imageSrc);
    // Convert bytes to KB and MB
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);  // Convert to KB (2 decimal places)
    const sizeInMB = (sizeInKB / 1024).toFixed(2);    // Convert to MB (2 decimal places)
    modalImageSize.textContent = "Image Size: " + `(${sizeInKB} KB) or (${sizeInMB} MB)` + " bytes";  // Display the image size in bytes
    
    // Store the imageId for later reference when removing
    document.getElementById("removePhotoBtn").setAttribute('data-image-id', imageSrc);
    document.getElementById("editPhotoBtn").setAttribute('data-image-id', imageSrc);

    // Show the modal
    modal.style.display = "block";
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById("photoModal");
    modal.style.display = "none";
}

// Function to close the modal
function closeSort() {
    const sort = document.getElementById("sort-menu");
    sort.style.display = "none";
}

// Function to close the modal
function closeSearch() {
    const search = document.getElementById("search-form");
    search.style.display = "none";
}

// Function to remove the photo
function removePhoto() {
    const imageId = document.getElementById("removePhotoBtn").getAttribute('data-image-id');
    const storedImages = JSON.parse(localStorage.getItem('images')) || [];

    // Ask for confirmation before removing
    const confirmation = confirm("Are you sure you want to remove this photo?");
    if (confirmation) {
        // Filter out the image to be removed
        const updatedImages = storedImages.filter(image => image.image !== imageId);
        // Save the updated images array back to localStorage
        localStorage.setItem('images', JSON.stringify(updatedImages));

        clearFlexContainer();
        loadImages();

        // Close the modal after removal
        closeModal();

        alert("Photo removed successfully!");
    }
}


// Edit photo details (description)
function editPhoto() {
    const newDescription = prompt("Enter a new description:", document.getElementById("description").textContent);
    const imageId = document.getElementById("editPhotoBtn").getAttribute('data-image-id');

    if (newDescription && imageId) {
        const storedImages = JSON.parse(localStorage.getItem('images')) || [];

        // Use forEach to loop through the stored images and find the one that matches the imageId or image src
        storedImages.forEach((image, index) => {
            // Check if the image's unique identifier or src matches the one in the modal
            if (image.image === imageId) {
                // Update the description of the matching image
                image.description = newDescription;
            }
        });

        // Save the updated images array back to LocalStorage
        localStorage.setItem('images', JSON.stringify(storedImages));

        // Update the displayed description in the modal
        document.getElementById("modalDescriptionText").textContent = newDescription;

        alert("Photo details updated successfully!");
    } else {
        alert("Description is required to update.");
    }
}


function getBase64ImageSize(base64String) { //WITH THIS WE GET THE SIZE OF AN IMAGE
    const sizeInBytes = (base64String.length * 3 / 4) - (base64String.indexOf("=") > 0 ? base64String.length - base64String.indexOf("=") : 0);
    //console.log("Base64 image size in bytes:", sizeInBytes);

    return sizeInBytes; 
}


function sortImages() {
    const sort = document.getElementById("sort-menu");
    sort.style.display = "block";
    
    const option = document.getElementById("sortSelect").value;
    const storedImages = JSON.parse(localStorage.getItem('images')) || [];

    switch (option) {
        case 'descriptionLength':
            storedImages.sort((a, b) => a.description.length - b.description.length);
            break;
        case 'authorAZ':
            storedImages.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'imageSize':
            storedImages.sort((a, b) => getBase64ImageSize(a.image) - getBase64ImageSize(b.image));
            break;
        default:
            return;
    }

    // Save and reload
    localStorage.setItem('images', JSON.stringify(storedImages));
    clearFlexContainer();
    loadImages();
}

function searchImages() {
    const search = document.getElementById("search-form");
    search.style.display = "block";

    const authorSearch = document.getElementById("authorSearch").value.toLowerCase();
    const descriptionSearch = document.getElementById("descriptionSearch").value.toLowerCase();
    const sizeSearch = parseInt(document.getElementById("sizeSearch").value);
    //console.log(authorSearch + ", " + descriptionSearch + ", " + sizeSearch);
    // Retrieve stored images from localStorage
    const storedImages = JSON.parse(localStorage.getItem("images")) || [];
    
    // Filter the images based on the search criteria
    const filteredImages = storedImages.filter(image => {
        let matches = true;

        // Filter by author
        if (authorSearch && !image.author.toLowerCase().includes(authorSearch)) {
            matches = false;
        }

        // Filter by description
        if (descriptionSearch && !image.description.toLowerCase().includes(descriptionSearch)) {
            matches = false;
        }

        // Filter by image size if size threshold is set
        if (sizeSearch && getBase64ImageSize(image.image)/1024 < sizeSearch) {
            matches = false;
        }

        return matches;
    });

    clearFlexContainer();
    loadImagesSearch(filteredImages);
}

function updateSizeLabel(value){
    let size = document.getElementById("sizeLabel");
    size.innerHTML = value;
}