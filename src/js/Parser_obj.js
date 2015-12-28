

var unwrap = function(ind, crd, cpi) {
	var ncrd = new Array(Math.floor(ind.length/3)*cpi);
	for(var i=0; i<ind.length; i++) {
		for(var j=0; j<cpi; j++) {
			ncrd[i*cpi+j] = crd[ind[i]*cpi+j];
		}
	}
	return ncrd;
}


var readLine = function(a, off) {
	var s = "";
	while(a[off] != 10) s += String.fromCharCode(a[off++]);
	return s;
}


var indpars = function(fff, vlen, nlen) {
    var f = fff.split("/");
    var vind = parseInt(f[0])-1;
    if(vind<0) vind = vlen + vind+1; 
    var nind = parseInt(f[2])-1;
    if(nind<0) nind = nlen + nind+1;
    return {
        v: vind, 
        n: nind
    };
}

var parseObj = function(obj) {	
    var c_verts = [],
        c_norms = [],
        i_verts = [],
        i_norms = [];
    
	var offset = 0;
	var fileData = new Uint8Array(obj);
	
	while(offset < fileData.length) {
		var line = readLine(fileData, offset);
		offset += line.length + 1;
		line = line.replace(/ +(?= )/g,'');
		line = line.replace(/(^\s+|\s+$)/g, '');
		var parts = line.split(" ");

		if(parts[0] == "v") {
			var x = parseFloat(parts[1]);
			var y = parseFloat(parts[2]);
			var z = parseFloat(parts[3]);
			c_verts.push(x,y,z);
		}
		if(parts[0] == "vn") {
			var x = parseFloat(parts[1]);
			var y = parseFloat(parts[2]);
			var z = parseFloat(parts[3]);
			c_norms.push(x,y,z);
		}
		if(parts[0] == "f") {  
            var vlen = c_verts.length/3;
            var nlen = c_norms.length/3;
           
            var g0 = indpars(parts[1], vlen, nlen);     
            var g1 = indpars(parts[2], vlen, nlen); 
            var g2 = indpars(parts[3], vlen, nlen); 
            i_verts.push(g0.v, g1.v, g2.v);
            i_norms.push(g0.n, g1.n, g2.n);
            
			if(parts.length == 5) {   
                var g3 = indpars(parts[4], vlen, nlen); 
                i_verts.push(g0.v, g2.v, g3.v);
                i_norms.push(g0.n, g2.n, g3.n);                
			}           
		}

	}
    
    var vts = unwrap(i_verts, c_verts, 3);
    var nts = unwrap(i_norms, c_norms, 3);
   
    return {
        vertices: vts,
        normals: nts
    };  
};
