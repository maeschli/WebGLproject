/**
 * Created by Maeschli on 22.12.2015.
 */

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    //do your stuff!
} else {
    alert('The File APIs are not fully supported by your browser.');
}

oFReader = new FileReader();
oFReader.onload = function (oFREvent) {
    console.log(oFREvent.target.result);
};

function loadImageFile() {
    if (document.getElementById("uploadImage").files.length === 0) { return; }
    var oFile = document.getElementById("uploadImage").files[0];

    oFReader.readAsArrayBuffer(oFile);
}