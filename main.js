function main(){
  var cv=document.getElementById('matrixCanvas');
  cv.setAttribute('width', window.innerWidth);
  cv.setAttribute('height', window.innerHeight);

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
  //vide pour le moment
  var threeInstances=THREE.JeelizHelper.init(initState);

  //create a camera with a 20° FoV:
  var cv=initState.canvasElement;
  var aspecRatio=cv.width/cv.height;
  THREECAMERA=new THREE.PerspectiveCamera(20, aspecRatio, 0.1, 100);

  var video=document.createElement('video');
  video.src='matrixRain.mp4';
  video.setAttribute('loop', 'true');
  video.setAttribute('preload', 'true');
  video.setAttribute('autoplay', 'true');
  var videoTexture = new THREE.VideoTexture( video );
  videoTexture.magFilter=THREE.LinearFilter;
  videoTexture.minFilter=THREE.LinearFilter;

  threeInstances.videoMesh.material.uniforms.samplerVideo.value=videoTexture;

  new THREE.BufferGeometryLoader().load('maskMesh.json', function(maskGeometry){
    maskGeometry.computeVertexNormals();

    // var maskMaterial=new THREE.MeshNormalMaterial();
    var maskMaterial=new THREE.ShaderMaterial({
      vertexShader: "\n\
      varying vec3 vNormalView, vPosition; \n\
      void main(void){\n\
        #include <beginnormal_vertex>\n\
        #include <defaultnormal_vertex>\n\
        #include <begin_vertex>\n\
        #include <project_vertex>\n\
        vNormalView=vec3(viewMatrix*vec4( normalize(transformedNormal), 0.));\n\
        vPosition=position;\n\
      }",

      fragmentShader: "precision lowp float;\n\
      uniform vec2 resolution;\n\
      uniform sampler2D samplerWebcam, samplerVideo;\n\
      void main(void){\n\
        vec2 uv=gl_FragCoord.xy/resolution;\n\
        vec3 colorWebcam=texture2D(samplerWebcam, uv).rgb;\n\
        vec3 colorLineCode=texture2D(samplerVideo, uv).rgb;\n\
        vec3 finalColor=colorWebcam+colorLineCode;\n\
        gl_FragColor=vec4(finalColor, 1.); //1 for alpha channel\n\
      }",

      uniforms:{
        samplerWebcam: {value: THREE.JeelizHelper.get_threeVideoTexture()},
        samplerVideo: {value: videoTexture},
        resolution: {value: new THREE.Vector2(
          initState.canvasElement.width,
          initState.canvasElement.height)}
      }
    });

    var maskMesh=new THREE.Mesh(maskGeometry, maskMaterial);
    maskMesh.position.set(0,0.3,-0.35);
    threeInstances.faceObject.add(maskMesh);
    // THREE.JeelizHelper.apply_videoTexture(maskMesh);
  });


}





function callbackTrack(detectState){
  THREE.JeelizHelper.render(detectState, THREECAMERA);
  // console.log(detectState.detected);
}

