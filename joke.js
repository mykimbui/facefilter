function main(){
  //resize the canvas to the window size:
  var cv=document.getElementById('matrixCanvas');
  cv.setAttribute('width', window.innerWidth);
  cv.setAttribute('height', window.innerHeight);

  //initialize Jeeliz Facefilter :
  JEEFACEFILTERAPI.init({
    canvasId: 'matrixCanvas',
      //path of NNC.json, which is the neural network model:
      NNCpath: 'https://appstatic.jeeliz.com/faceFilter/',
      callbackReady: function(errCode, initState){
        if (errCode){
          console.log('AN ERROR HAPPENS BRO =', errCode);
          return;
        }
        console.log('JEEFACEFILTER WORKS YEAH !');
        init_scene(initState);
      }, //end callbackReady()

      callbackTrack: callbackTrack
    });
}

function init_scene(initState){
  var threeInstances=THREE.JeelizHelper.init(initState);

  //create the 20 degrees FoV camera:
  var aspecRatio=initState.canvasElement.width / initState.canvasElement.height;
  THREECAMERA=new THREE.PerspectiveCamera(20, aspecRatio, 0.1, 100);

    //create the background video texture :
    var video=document.createElement('video');
    video.src='swim.mp4';
    video.setAttribute('loop', 'true');
    video.setAttribute('preload', 'true');
    video.setAttribute('autoplay', 'true');
    var videoTexture = new THREE.VideoTexture( video );
    videoTexture.magFilter=THREE.LinearFilter;
    videoTexture.minFilter=THREE.LinearFilter;

    threeInstances.videoMesh.material.uniforms.samplerVideo.value=videoTexture;


  try{ //small trick otherwise Chrome sometimes do not start the video
    video.play(); //not in the tuto
  } catch(e){
  }
  var playVideo=function(){
    video.play();
    window.removeEventListener('mousemove', playVideo);
    window.removeEventListener('touchmove', playVideo);
  }
  window.addEventListener('mousedown', playVideo, false);
  window.addEventListener('touchdown', playVideo, false);

  //import the mesh:
  new THREE.BufferGeometryLoader().load('maskMesh.json', function(maskGeometry){
    maskGeometry.computeVertexNormals();
    //var maskMaterial=new THREE.MeshNormalMaterial();

    //creation the custom material:
    var maskMaterial=new THREE.ShaderMaterial({
      vertexShader: "\n\
      precision highp float;\n\
      attribute vec3 position;\n\
      attribute vec3 normal;\n\
      uniform mat3 normalMatrix;\n\
      uniform mat4 modelViewMatrix;\n\
      uniform mat4 projectionMatrix;\n\
      uniform float time;\n\
      varying vec3 fNormal;\n\
      varying vec3 fPosition;\n\
      varying vec3 vNormalView, vPosition;\n\
      void main(void){\n\
        #include <beginnormal_vertex>\n\
        #include <defaultnormal_vertex>\n\
        #include <begin_vertex>\n\
        #include <project_vertex>\n\
        fNormal = normalize(normalMatrix * normal);\n\
        vec4 pos = modelViewMatrix * vec4(position, 1.0);\n\
        pos.y += 0.2 * sin(35.0 * time);\n\
        fPosition = pos.xyz;\n\
        gl_Position = projectionMatrix * pos;\n\
      }",

      fragmentShader: "precision highp float;\n\
      uniform float time;\n\
      uniform vec2 resolution;\n\
      varying vec3 fPosition;\n\
      varying vec3 fNormal;\n\
      uniform vec2 resolution;\n\
      uniform sampler2D samplerWebcam, samplerVideo;\n\
      varying vec3 vNormalView, vPosition;\n\
      void main(void){\n\
        float len1 = distance(fPosition, vec3(0.0, 2.0, 0.1));\n\
        float len2 = distance(fPosition, vec3(0.1, 0.0, 0.2));\n\
        float len3 = distance(fPosition, vec3(0.0, 0.3, 0.3));\n\
        vec3 c = vec3(fract(len1 * 5.5 + time * 10.0),fract(len2 * 5.5 + time * 4.0),fract(len3 * 5.5 + time * 2.0));\n\
        if (c.r > 0.5) {discard;}\n\
        gl_FragColor = vec4(c.grb, 1.0);\n\
        float isNeck=1.-smoothstep(-1.2, -0.85, vPosition.y);\n\
        float isTangeant=pow(length(vNormalView.xy),3.);\n\
        float isInsideFace=(1.-isTangeant)*(1.-isNeck);\n\
        vec2 uv=gl_FragCoord.xy/resolution;\n\
        vec3 colorWebcam=texture2D(samplerWebcam, uv).rgb;\n\
        vec3 refracted=refract(vec3(0.,0.,-1.), vNormalView, 0.3);\n\
        vec2 uvRefracted=uv+0.1*refracted.xy;\n\
        uvRefracted=mix(uv, uvRefracted, smoothstep(0.,1.,isInsideFace));\n\
        vec3 colorLineCode=texture2D(samplerVideo, uvRefracted).rgb;\n\
        vec3 finalColor=colorWebcam*isInsideFace+colorLineCode;\n\
        gl_FragColor=vec4(finalColor, 1.); //1 for alpha channel\n\
        gl_FragColor=vec4(isNeck, isTangeant, 0.,1.);\n\
      }",

      uniforms:{
        samplerWebcam: {value: THREE.JeelizHelper.get_threeVideoTexture()},
        samplerVideo: {value: videoTexture},
        resolution: {value: new THREE.Vector2(initState.canvasElement.width,
         initState.canvasElement.height)}
      }
    });

    var maskMesh=new THREE.Mesh(maskGeometry, maskMaterial);
    maskMesh.position.set(0, 0.3,-0.35);
    threeInstances.faceObject.add(maskMesh);

    THREE.JeelizHelper.apply_videoTexture(maskMesh);
  });
}

function callbackTrack(detectState){
  //console.log(detectState.detected);
  THREE.JeelizHelper.render(detectState, THREECAMERA);
}
