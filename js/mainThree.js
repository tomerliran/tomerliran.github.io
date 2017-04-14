$(function(){

    //Global variables to be used in the webGL
    var scene, camera, renderer;
    var controls, guiControls, datGUI;
    var stats;
    var spotLight, hemi;
    var SCREEN_WIDTH, SCREEN_HEIGHT;
    var mouse, raycaster;
    var objects = [];

    //function to run all three.js code
    function init(){
        $(".popup").hide();                        //hiding the popup until a part of the mechanism is clicked.

        //creates empty scene object and renderer
        scene = new THREE.Scene();
        camera =  new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, .1, 500);
        renderer = new THREE.WebGLRenderer({antialias:true});

        //set renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled= false;
        renderer.shadowMapSoft = false;

        //for the orbit controls (for the camera to move around)
        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.addEventListener( 'change', render );
        
        //set up the camera to look at the scene
        camera.position.x = -2;
        camera.position.y = 4;
        camera.position.z = -9;
        camera.lookAt(scene.position);

        // dat.gui so user can adjust lighting and other variables.
        guiControls = new function(){
            
           this.SceneToConsole= function(){
               console.log(scene);
               console.log(camera.position.x + " X Position");
               console.log(camera.position.y + " Y Position");
               console.log(camera.position.z + " Z Position");
           };

           this.rotationX  = 0.0;
           this.rotationY  = 0.0;
           this.rotationZ  = 0.0;

           this.lightX = 19;
           this.lightY = 47;
           this.lightZ = 19;
           this.intensity = .5;
           this.distance = 373;
           this.angle = 1.6;
           this.exponent = 38;
           this.shadowCameraNear = 34;
           this.shadowCameraFar = 2635;
           this.shadowCameraFov = 68;
           this.shadowCameraVisible=false;
           this.shadowMapWidth=512;
           this.shadowMapHeight=512;
           this.shadowBias=0.00;
           this.shadowDarkness=0.11;
       };

        //hemi light to add to the scene
        hemi = new THREE.HemisphereLight(0xbbbbbb, 0x660066);
        scene.add(hemi);

        //adds spot light with starting parameters
        spotLight = new THREE.SpotLight(0xffffff);
        spotLight.castShadow = false;
        spotLight.position.set (20, 35, 40);
        spotLight.intensity = guiControls.intensity;
        spotLight.distance = guiControls.distance;
        spotLight.angle = guiControls.angle;
        spotLight.exponent = guiControls.exponent;
        spotLight.shadowCameraNear = guiControls.shadowCameraNear;
        spotLight.shadowCameraFar = guiControls.shadowCameraFar;
        spotLight.shadowCameraFov = guiControls.shadowCameraFov;
        spotLight.shadowCameraVisible = guiControls.shadowCameraVisible;
        spotLight.shadowBias = guiControls.shadowBias;
        spotLight.shadowDarkness = guiControls.shadowDarkness;
        scene.add(spotLight);


        // instantiate a loader
        var loader = new THREE.JSONLoader();

        // load a resource
        loader.load(
                // resource URL
                'img/AntikytheraMechanismOneObject.json',
                // Function when resource is loaded
                function ( geometry, materials ) {
                        var material = new THREE.MultiMaterial( materials );
                        var object = new THREE.Mesh( geometry, material );
                        scene.add( object );
                }
        );
        /*
        loader.load('img/AntikytheraMechanismOneObject.json', function(geometry, materials) {
        mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        //mesh.scale.x = x;
        //mesh.scale.y = y;
        //mesh.scale.z = z;
        //mesh.opacity=1;
        var model = new THREE.Object3D();
        model.add(mesh);
        model.position.set(0,0,0);
        //mesh.translation = THREE.GeometryUtils.center(geometry);
        group.add(model);
    });
*/

        //add raycaster and mouse as 2D vector to get the point
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        //add event listener for mouse and calls function when activated
        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );

        //adds datGUI controls to scene
        datGUI = new dat.GUI();
        datGUI.add(guiControls, 'SceneToConsole');

        datGUI.add(guiControls, 'lightX',-60,180);
        datGUI.add(guiControls, 'lightY',0,180);
        datGUI.add(guiControls, 'lightZ',-60,180);

        datGUI.add(guiControls, 'intensity',0.01, 5).onChange(function(value){
            spotLight.intensity = value;
        });
        datGUI.add(guiControls, 'distance',0, 1000).onChange(function(value){
            spotLight.distance = value;
        });
        datGUI.add(guiControls, 'angle',0.001, 1.570).onChange(function(value){
            spotLight.angle = value;
        });
        datGUI.add(guiControls, 'exponent',0 ,50 ).onChange(function(value){
            spotLight.exponent = value;
        });
        datGUI.add(guiControls, 'shadowCameraNear',0,100).name("Near").onChange(function(value){
            spotLight.shadowCamera.near = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
        datGUI.add(guiControls, 'shadowCameraFar',0,5000).name("Far").onChange(function(value){
            spotLight.shadowCamera.far = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
        datGUI.add(guiControls, 'shadowCameraFov',1,180).name("Fov").onChange(function(value){
            spotLight.shadowCamera.fov = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
        datGUI.add(guiControls, 'shadowCameraVisible').onChange(function(value){
            spotLight.shadowCameraVisible = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
        datGUI.add(guiControls, 'shadowBias',0,1).onChange(function(value){
            spotLight.shadowBias = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
        datGUI.add(guiControls, 'shadowDarkness',0,1).onChange(function(value){
            spotLight.shadowDarkness = value;
            spotLight.shadowCamera.updateProjectionMatrix();
        });
        datGUI.close();

        $("#webGL-container").append(renderer.domElement);
        
        //stats
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        $("#webGL-container").append( stats.domElement );

    }
    
    //to check for the mouse touch
    function onDocumentTouchStart( event ) {

        event.preventDefault();

        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
        onDocumentMouseDown( event );

    }
    
    //find where the raycaster and the mouse or the touch(touch screen) intersect and give a message on what part of the mechanism the user clicked on
    function onDocumentMouseDown( event ) {

        event.preventDefault();

        mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
        mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( objects );

        if ( intersects.length > 0 ) {

            this.name = intersects[ 0 ].object.name;

            $( ".text" ).empty(); //empty the text
            $( ".popup" ).append( "<div class='text'><p>This part is the <strong>" + this.name  + " of the mechanism </strong></p></div>" );    //get the message to show in the popup
            $(".popup").show();     //show the above message to the user

        }

    }

    //render the scene adn light
    function render() {
        spotLight.position.x = guiControls.lightX;
        spotLight.position.y = guiControls.lightY;
        spotLight.position.z = guiControls.lightZ;
        //scene.rotation.y += .001;
    }
    
    //animate the scene
    function animate(){
        requestAnimationFrame(animate);
        render();
        stats.update();
        renderer.render(scene, camera);
    }

    init(); //initialise and animate the code
    animate();
    
    //resize the screen to the window to make the model viewable across devices
    $(window).resize(function(){
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;
        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    });

});