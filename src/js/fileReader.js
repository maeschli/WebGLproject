/**
 * Created by Maeschli on 22.12.2015.
 */

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    //do your stuff!
} else {
    alert('The File APIs are not fully supported by your browser.');
}
var fileName;
oFReader = new FileReader();
oFReader.onload = function (oFREvent) {
    var fileType = fileName.slice(-3),
        result;

    if(fileType === "stl") {
      result = parseStl(oFREvent.target.result);
    }
    else if(fileType === "obj") {
      result = parseObj(oFREvent.target.result);
    }

    webGLStart(result.vertices, result.normals);
};

function loadImageFile() {
    var files = document.getElementById("uploadImage").files;
    if (files.length === 0) { return; }
    var oFile = files[0];
    fileName = oFile.name;

    oFReader.readAsArrayBuffer(oFile);
}
