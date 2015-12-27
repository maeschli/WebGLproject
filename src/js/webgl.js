
    var gl;
    var shaderProgram;
    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();
    var cubeVertexPositionBuffer;
    var cubeVertexColorBuffer;
    var cubeVertexIndexBuffer;
    var lastTime = 0;
    var deg=Math.PI/18;
    var Nx=0, Ny=0, scal=1;
    var Nvertex;
    var vertices=[];

          var colors=[[0.6, 0.6, 0.6, 1.0]];

function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
            alert("Could not initialise shaders");

        gl.useProgram(shaderProgram);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");

 function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript)  return null;
        var str = "", shader;
        var k = shaderScript.firstChild;
        do{ if (k.nodeType == 3)  str += k.textContent; }while(k = k.nextSibling);
        if (shaderScript.type == "x-shader/x-fragment")
            shader = gl.createShader(gl.FRAGMENT_SHADER);   // 1
        else if (shaderScript.type == "x-shader/x-vertex")
            shader = gl.createShader(gl.VERTEX_SHADER);
        else  return null;
        gl.shaderSource(shader, str);						// 2
        gl.compileShader(shader);							// 3
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
 }
}


function initBuffers(v, normals, colors) {
 var bc,i,x1,y1,z1,x2,y2,z2,nx,ny,nz,dl;
 Nvertex = parseInt(v.length/3);
 Xmin=Ymin=Zmin=1E+10,Xmax=Ymax=Zmax=-1E+10;
 for(i=0;i<Nvertex;i++){Xmin=Math.min(Xmin,v[3*i]);Xmax=Math.max(Xmax,v[3*i]);Ymin=Math.min(Ymin,v[1+3*i]);Ymax=Math.max(Ymax,v[1+3*i]);Zmin=Math.min(Zmin,v[2+3*i]);Zmax=Math.max(Zmax,v[2+3*i]);}

 initBuf("aVertexPosition",v,3);
 bc=[]; for(i=0;i<Nvertex;i++) bc=bc.concat(colors[i%colors.length]);
 initBuf("aVertexColor",bc,4);
 bc=[]; for(i=0;i<v.length;i+=9) bc=bc.concat(1,0,0,0,1,0,0,0,1);
 initBuf("barycentric",bc,3);

 initBuf("aVertexNormal",normals,3);

 function initBuf(attr,buf,size){
    shaderProgram[attr] = gl.getAttribLocation(shaderProgram, attr);
    gl.enableVertexAttribArray(shaderProgram[attr]);
    var aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buf), gl.STATIC_DRAW);
    aBuffer.itemSize = size;
    aBuffer.numItems = Nvertex;
    gl.vertexAttribPointer(shaderProgram[attr], size, gl.FLOAT, false, 0, 0);
 }
}


function drawScene(){
 gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
 gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 mat4.ortho(-2.0, 2.0, -2.0, 2.0, 0.1, 100, pMatrix);

 mat4.identity(mvMatrix);
 mat4.translate(mvMatrix, [0, 0, -10]);

 gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
 gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

 uNMatrix = mat3.create();
 mat4.toInverseMat3(mvMatrix, uNMatrix);
 mat3.transpose(uNMatrix);
 gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, uNMatrix);

 gl.uniform3fv(shaderProgram.lightingDirectionUniform, new Float32Array([0.4,Math.sqrt(0.2),-0.8]));

 gl.drawArrays(gl.TRIANGLES, 0, Nvertex);
}

function Change(fun,a){
/* mat4 uNMatrix = transpose(inverse(modelView));*/
 gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 mat4[fun](mvMatrix,a);
 gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

// var uNMatrix = mat3.create();
 mat4.toInverseMat3(mvMatrix, uNMatrix);
 mat3.transpose(uNMatrix);
 gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, uNMatrix);

 gl.drawArrays(gl.TRIANGLES, 0, Nvertex);
/*
s=mvMatrix[0]+"  "+mvMatrix[1]+"  "+mvMatrix[2]+"  "+mvMatrix[3]+"\n"+mvMatrix[4]+"  "+mvMatrix[5]+"  "+mvMatrix[6]+"  "+mvMatrix[7]+"\n"+mvMatrix[8]+"  "+mvMatrix[9]+"  "+mvMatrix[10]+"  "+mvMatrix[11]+"\n"+mvMatrix[12]+"  "+mvMatrix[13]+"  "+mvMatrix[14]+"  "+mvMatrix[15];
alert(s)
*/
}

function webGLStart(v, normals){
 if(typeof(v)=="string"){GetModel(v);return}
  var canvas = document.getElementById("Plot3D");
  var W=Math.min(window.innerWidth,window.innerHeight)-16;
  Plot3D.width=W,Plot3D.height=W;
  try{
    gl = canvas.getContext("experimental-webgl",{depth:true});
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0,1.0);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.frontFace(gl.CCW);
    gl.hint(gl.GENERATE_MIPMAP_HINT,gl.FASTEST);
  }catch(e){gl=false}
 if(!gl){ alert("Could not initialise WebGL, sorry :-(");return}
 initShaders();
 initBuffers(v,normals,colors);
 gl.clearColor(1.0, 1.0, 1.0, 1.0);
 gl.enable(gl.DEPTH_TEST);
 drawScene();
}
function Key(e){
 console.log("keypress =" + e.keyCode);
 if(e.keyCode==38 || e.keyCode===100) Change('rotateX',deg);
 else if(e.keyCode==40 || e.keyCode===97) Change('rotateX',-deg);
 else if(e.keyCode==37 || e.keyCode===115) Change('rotateY',-deg);
 else if(e.keyCode==39 || e.keyCode===119) Change('rotateY',deg);
}
