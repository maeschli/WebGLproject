var parseStlBinary = function(stl) {
  var dv = new DataView(stl, 80), // 80 bytes unused header
      isLittleEndian = true, // All binary STLs are assumed to be little endian
      triangles = dv.getUint32(0, isLittleEndian),
      normals = new Float32Array(triangles*3),
      vertices = new Float32Array(triangles*9),
      i,
      j,
      k,
      offset = 4;

  for (i = 0; i < triangles; i+=3) {

    // Get the normal for this triangle
    // I didn't save it cause I'll compute normals for vertices later
    normals[i] = dv.getFloat32(offset, isLittleEndian);
    normals[i+1] = dv.getFloat32(offset+4, isLittleEndian);
    normals[i+2] = dv.getFloat32(offset+8, isLittleEndian);

    offset += 12;

    // Get 3 vertices for triangle
    for (j = 0; j < 3; j++) {
      k = (i+j)*3;
      vertices[k] = dv.getFloat32(offset, isLittleEndian);
      vertices[k+1] = dv.getFloat32(offset+4, isLittleEndian);
      vertices[k+2] = dv.getFloat32(offset+8, isLittleEndian);
      offset += 12;
    }

    // Skip Uint16 "attribute byte count"
    offset += 2;
  }
};

var parseStl = function(stl) {
  var state = '',
      lines = stl.split('\n'),
      name,
      parts,
      line,
      normals,
      done,
      vertices = [],
      len,
      i;

  for (len = lines.length, i = 0; i < len; i++) {
    if (done) {
      break;
    }
    line = lines[i].trim();
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
          normals.push(parseFloat(parts[2]));
          normals.push(parseFloat(parts[3]));
          normals.push(parseFloat(parts[4]));
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
          normals.push(parseFloat(parts[2]));
          normals.push(parseFloat(parts[3]));
          normals.push(parseFloat(parts[4]));
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
};
