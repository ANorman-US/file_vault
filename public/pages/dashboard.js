const uploadFileBtn = document.getElementById("upload-file-btn");
const fileInput = document.getElementById("file-input");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");



//file upload
uploadFileBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", async(e) => {
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try{
            const response  = await fetch('files/upload', {
                method: 'POST',
                headers: {'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`},
                body: formData
            });

            if(response.ok){
                alert("File uploaded");
            }
            else
                alert("File upload failed");    
        }
        catch(error){
            console.error("Error uploading file:", error);
        }
    }
});

//search
searchBtn.addEventListener("click", async () => {
    const keyword = searchInput.value;
    fetchSearchResults(keyword); 
});

// Function to fetch search results
async function fetchSearchResults(keyword = '') {
    try {
        const response = await fetch(`/files/search?keyword=${encodeURIComponent(keyword)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        });

        if (response.ok) {
            const files = await response.json();
            displayResults(files);
        } else {
            alert("Search failed");
        }
    }
    catch (error) {
        console.error("Error searching files:", error);
    }
}

//search results
function displayResults(files) {
    searchResults.innerHTML = ""; //clear previous result
    files.forEach(file => {
        const resultRow = document.createElement("div");
        resultRow.classList.add("result-row");

        //fileinfo
        const fileInfo = document.createElement("span");
        fileInfo.textContent = `${file.filename} (${file.file_type})`;

        //download btn
        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "Download";
        downloadBtn.onclick = async() => {
            try{
                const response = await fetch(`/files/download/${file.file_id}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
                });
        
                if(response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } 
                else{
                    alert("File download failed");
                }
            }
            catch (error) {
                console.error("Error downloading file:", error);
            }
        };

        //delete btn
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = async() => {

            try{
                const response = await fetch(`/files/delete/${file.file_id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
                });

                if(response.ok){
                    alert("File deleted");
                    resultRow.remove();//remove deleted row
                }
                else
                    alert("File deletion failed");
            }
            catch(error){
                console.error("Error deleting file:",error);
            }
        };

        //row
        resultRow.appendChild(fileInfo);
        resultRow.appendChild(downloadBtn);
        resultRow.appendChild(deleteBtn);

        searchResults.appendChild(resultRow);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchSearchResults(''); //Empty query returns all files
});

//logout
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem('jwtToken');
    window.location.href ='/login';
})
