var parseStl = function(stl) {
  var data = new Uint8Array(stl, 0, 5),
      str = data.reduce(function (str, item) {
        return str + String.fromCharCode(item);
      }, "");
  if(str === "solid") {
    return parseStlASCII(arrayBufferToString(stl));
  }
  return parseStlBinary(stl);
}

function arrayBufferToString(ab) {
  var str = "";
  var offset = 0;
  while(offset + 512 < ab.byteLength) {
    str += String.fromCharCode.apply(null, new Uint8Array(ab, offset, 512));
    offset += 512;
  }
  str += String.fromCharCode.apply(null, new Uint8Array(ab, offset, ab.byteLength-offset));
  return str;
}

var parseStlBinary = function(stl) {
  var data = new DataView(stl, 80), // 80 bytes unused header
      isLittleEndian = true, // All binary STLs are assumed to be little endian
      triangles = data.getUint32(0, isLittleEndian),
      normals = new Float32Array(triangles*9),
      vertices = new Float32Array(triangles*9),
      i,
      j,
      k,
      offset = 4,
      normal = [];

  for (i = 0; i < triangles; i++) {

    // Get the normal for this triangle
    // I didn't save it cause I'll compute normals for vertices later
    normal[0] = data.getFloat32(offset, isLittleEndian);
    normal[1] = data.getFloat32(offset+4, isLittleEndian);
    normal[2] = data.getFloat32(offset+8, isLittleEndian);

    offset += 12;

    // Get 3 vertices for triangle
    for (j = 0; j < 3; j++) {
      k = i*9 + j*3;

      normals[k] = normal[0];
      normals[k+1] = normal[1];
      normals[k+2] = normal[2];

      vertices[k] = data.getFloat32(offset, isLittleEndian);
      vertices[k+1] = data.getFloat32(offset+4, isLittleEndian);
      vertices[k+2] = data.getFloat32(offset+8, isLittleEndian);
      offset += 12;
    }

    // Skip Uint16 "attribute byte count"
    offset += 2;
  }
  return {
    vertices: vertices,
    normals: normals
  }
};

var parseStlASCII = function(stl) {
  var state = '',
      lines = stl.split('\n'),
      name,
      parts,
      line,
      done,
      len,
      i,
      normal = [], // tmp array to hold normal coordinates
      normals = [],
      vertices = [];


  for (len = lines.length, i = 0; i < len; i++) {
    if (done) {
      break;
    }
    line = lines[i].trim().replace(/ +/, ' ');
    parts = line.split(' ');
    switch (state) {
      case '':
        if (parts[0] !== 'solid') {
          console.error(line);
          console.error('Invalid state "' + parts[0] + '", should be "solid"');
          return;
        } else {
          name = parts[1];
          state = 'solid';
        }
        break;
      case 'solid':
        if (parts[0] !== 'facet' || parts[1] !== 'normal') {
          console.error(line);
          console.error('Invalid state "' + parts[0] + '", should be "facet normal"');
          return;
        } else {
          normal[0] = parseFloat(parts[2]);
          normal[1] = parseFloat(parts[3]);
          normal[2] = parseFloat(parts[4]);
          state = 'facet normal';
        }
        break;
      case 'facet normal':
        if (parts[0] !== 'outer' || parts[1] !== 'loop') {
          console.error(line);
          console.error('Invalid state "' + parts[0] + '", should be "outer loop"');
          return;
        } else {
          state = 'vertex';
        }
        break;
      case 'vertex':
        if (parts[0] === 'vertex') {
          // Add normal for vertice
          normals.push(normal[0]);
          normals.push(normal[1]);
          normals.push(normal[2]);
          // Add vertice
          vertices.push(parseFloat(parts[1]));
          vertices.push(parseFloat(parts[2]));
          vertices.push(parseFloat(parts[3]));
        } else if (parts[0] === 'endloop') {
          state = 'endloop';
        } else {
          console.error(line);
          console.error('Invalid state "' + parts[0] + '", should be "vertex" or "endloop"');
          return;
        }
        break;
      case 'endloop':
        if (parts[0] !== 'endfacet') {
          console.error(line);
          console.error('Invalid state "' + parts[0] + '", should be "endfacet"');
          return;
        } else {
            state = 'endfacet';
        }
        break;
      case 'endfacet':
        if (parts[0] === 'endsolid') {
          done = true;
        } else if (parts[0] === 'facet' && parts[1] === 'normal') {
          // Add normal for vertice
          normal[0] = parseFloat(parts[2]);
          normal[1] = parseFloat(parts[3]);
          normal[2] = parseFloat(parts[4]);
          state = 'facet normal';
        } else {
          console.error(line);
          console.error('Invalid state "' + parts[0] + '", should be "endsolid" or "facet normal"');
          return;
        }
        break;
      default:
        console.error('Invalid state "' + state + '"');
        break;
    }
  }
  vertices = new Float32Array(vertices);
  normals = new Float32Array(normals);
  return {
    vertices: vertices,
    normals: normals
  };
};
