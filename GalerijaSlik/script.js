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
    const storedImages = JSON.parse(localStorage.getItem('images')) || []; 

    // For each image, append it to the flex container
    storedImages.forEach(image => {
        addImageToContainer(image.image, image.author, image.description);  
    });
}

function loadImagesSearch(arrayImg) {
    const storedImages = arrayImg || []; 

    // For each image, append it to the flex container
    storedImages.forEach(image => {
        addImageToContainer(image.image, image.author, image.description);  
    });
}

// Function to add a new image
function addNewImage(event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const author = document.getElementById("author").value;

    const imgElement = document.getElementById("imagePreview").querySelector("img");

    if (!imgElement) {
        alert("Please select an image file.");
        return;
    }

    const base64Image = imgElement.src;

    if (!base64Image || !base64Image.startsWith("data:image/")) {
        alert("Invalid image format.");
        return;
    }

    const newImage = new Image(description, author, base64Image);

    const storedImages = JSON.parse(localStorage.getItem('images')) || [];
    storedImages.push({
        description: newImage.description,
        author: newImage.author,
        image: newImage.image
    });

    try {
        localStorage.setItem('images', JSON.stringify(storedImages));
        alert("Photo submitted successfully!");
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            alert("Image is too large to store in LocalStorage. Please try with a smaller image.");
        } else {
            alert("An unexpected error occurred while saving the image.");
        }
    }

    alert("Photo submitted successfully!");
    closeForm();
    clearFlexContainer();
    loadImages();

    document.getElementById("description").value = '';
    document.getElementById("author").value = '';
    document.getElementById("fileInput").value = '';  
    document.getElementById("imagePreview").innerHTML = '';  
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

        if (file && file.type.startsWith('image/')) {
            previewImage(file);  
        } else {
            alert("Please drop a valid image file.");
        }
    } else {
        alert("No files were dropped.");
    }
}


function previewImage(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';  
            const preview = document.getElementById("imagePreview");
            preview.innerHTML = '';  
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please select a valid image file.");
    }
}

// Handle the form submission
document.getElementById("imageForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const author = document.getElementById("author").value;
    const imagePreview = document.getElementById("imagePreview");

    const image = imagePreview.querySelector("img");

    if (description && author && image) {
        addNewImage(event, image);
        closeForm(); 

       
        document.getElementById("description").value = '';
        document.getElementById("author").value = '';
        imagePreview.innerHTML = '';  
    } else {
        alert("Please fill in all fields.");
    }
});


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
    flexContainer.innerHTML = ''; 
}

// Function to open the modal and show the image details
function openModal(imageSrc, author, description) {
    const modal = document.getElementById("photoModal");
    const modalImage = document.getElementById("modalImage");
    const modalAuthor = document.getElementById("modalAuthor");
    const modalDescriptionText = document.getElementById("modalDescriptionText");
    const modalImageSize = document.getElementById("modalImageSize");  

    
    modalImage.src = imageSrc;
    modalAuthor.textContent = "Author: " + author;
    modalDescriptionText.textContent = description;

    
    const sizeInBytes = getBase64ImageSize(imageSrc);
   
    const sizeInKB = (sizeInBytes / 1024).toFixed(2); 
    const sizeInMB = (sizeInKB / 1024).toFixed(2);    
    modalImageSize.textContent = "Image Size: " + `(${sizeInKB} KB) or (${sizeInMB} MB)` + " bytes"; 
    
    
    document.getElementById("removePhotoBtn").setAttribute('data-image-id', imageSrc);
    document.getElementById("editPhotoBtn").setAttribute('data-image-id', imageSrc);

    
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

    const confirmation = confirm("Are you sure you want to remove this photo?");
    if (confirmation) {
        
        const updatedImages = storedImages.filter(image => image.image !== imageId);
        
        localStorage.setItem('images', JSON.stringify(updatedImages));

        clearFlexContainer();
        loadImages();
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

        storedImages.forEach((image, index) => {
            
            if (image.image === imageId) {
                image.description = newDescription;
            }
        });

        localStorage.setItem('images', JSON.stringify(storedImages));
        document.getElementById("modalDescriptionText").textContent = newDescription;

        alert("Photo details updated successfully!");
    } else {
        alert("Description is required to update.");
    }
}


function getBase64ImageSize(base64String) { // WITH THIS WE GET THE SIZE OF AN IMAGE
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