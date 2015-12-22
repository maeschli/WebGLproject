/**
 * Created by Maeschli on 22.12.2015.
 */

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    //do your stuff!
} else {
    alert('The File APIs are not fully supported by your browser.');
}


oFReader = new FileReader(), rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;

oFReader.onload = function (oFREvent) {
    document.getElementById("uploadPreview").src = oFREvent.target.result;
};

function loadImageFile() {
    if (document.getElementById("uploadImage").files.length === 0) { return; }
    var oFile = document.getElementById("uploadImage").files[0];

    if (!rFilter.test(oFile.type)) { alert("You must select a valid image file!"); return; }
    oFReader.readAsDataURL(oFile);
}