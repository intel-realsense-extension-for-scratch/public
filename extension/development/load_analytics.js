// intel_realsense_extension.js
// Shachar Oz , Omer Goshen , Moria Ilan Navi
// 2015
// Intel RealSense Extension for Scratch 


























"use strict";

(function (ext) {
    
        
    //modal alert window
        $.ajax({
            url: 'http://intel-realsense-extension-for-scratch.github.io/public/extension/dialog.html',
            method: 'GET',
            // async: false,
            success: function(data) {
                $('body').append(data);
            }
        });

    
    
    
    
    var rs = null;
    var sense; 
    var faceModule, blobModule, handModule;
    var blobConfiguration, handConfiguration, faceConfiguration;
    var imageSize;
    

    
    //stage mapping
    const RS_FACE_X_MAX_RIGHT = 0;    
    const RS_FACE_X_MAX_LEFT = 600;    
    const RS_FACE_Y_MAX_UP = 250;      
    const RS_FACE_Y_MAX_DOWN = 0;       
    
    const RS_FACE_ROTATION_MIN = -30;
    const RS_FACE_ROTATION_MAX = 30;
    
    const RS_HAND_X_MAX_RIGHT = 0;
    const RS_HAND_X_MAX_LEFT = 600;
    const RS_HAND_Y_MAX_UP = 600;
    const RS_HAND_Y_MAX_DOWN = 0;

    const SCRATCH_X_MAX_RIGHT = 240;    
    const SCRATCH_X_MAX_LEFT = -240;   
    const SCRATCH_Y_MAX_UP = -180; 
    const SCRATCH_Y_MAX_DOWN = 180;
    

    
    
      
    var HandModule = function () {
        // private
        
        return {
            // public
            isRightExist: false
            , isLeftExist: false
            , leftHandJoints: []  
            , leftHandJointsFoldness: []  
            , rightHandJoints: []  
            , rightHandJointsFoldness: []  
            , leftHandGestures: []
            , rightHandGestures: []
           
            , jointDictionary : {}
            , majorJointDictionary : {}
            , gestureDictionary : {}
            
            , init: function(){
                this.jointDictionary = {
                   "Wrist"                  : intel.realsense.hand.JointType.JOINT_WRIST
                    , "Center"              : intel.realsense.hand.JointType.JOINT_CENTER

                    , "Thumb base"          : intel.realsense.hand.JointType.JOINT_THUMB_BASE
                    , "Thumb jointC"        : intel.realsense.hand.JointType.JOINT_THUMB_JT1
                    , "Thumb jointB"        : intel.realsense.hand.JointType.JOINT_THUMB_JT2 
                    , "Thumb tip"           : intel.realsense.hand.JointType.JOINT_THUMB_TIP

                    , "Index base"          : intel.realsense.hand.JointType.JOINT_INDEX_BASE
                    , "Index jointC"        : intel.realsense.hand.JointType.JOINT_INDEX_JT1
                    , "Index jointB"        : intel.realsense.hand.JointType.JOINT_INDEX_JT2
                    , "Index tip"           : intel.realsense.hand.JointType.JOINT_INDEX_TIP

                    , "Middle base"         : intel.realsense.hand.JointType.JOINT_MIDDLE_BASE
                    , "Middle jointC"       : intel.realsense.hand.JointType.JOINT_MIDDLE_JT1
                    , "Middle jointB"       : intel.realsense.hand.JointType.JOINT_MIDDLE_JT2
                    , "Middle tip"          : intel.realsense.hand.JointType.JOINT_MIDDLE_TIP

                    , "Ring base"           : intel.realsense.hand.JointType.JOINT_RING_BASE
                    , "Ring jointC"         : intel.realsense.hand.JointType.JOINT_RING_JT1
                    , "Ring jointB"         : intel.realsense.hand.JointType.JOINT_RING_JT2
                    , "Ring tip"            : intel.realsense.hand.JointType.JOINT_RING_TIP

                    , "Pinky base"          : intel.realsense.hand.JointType.JOINT_PINKY_BASE
                    , "Pinky jointC"        : intel.realsense.hand.JointType.JOINT_PINKY_JT1
                    , "Pinky jointB"        : intel.realsense.hand.JointType.JOINT_PINKY_JT2
                    , "Pinky tip"           : intel.realsense.hand.JointType.JOINT_PINKY_TIP
                };

                this.majorJointDictionary = {
                    "Index"                 : intel.realsense.hand.FingerType.FINGER_INDEX
                    , "Thumb"               : intel.realsense.hand.FingerType.FINGER_THUMB
                    , "Middle"              : intel.realsense.hand.FingerType.FINGER_MIDDLE
                    , "Ring"                : intel.realsense.hand.FingerType.FINGER_RING
                    , "Pinky"               : intel.realsense.hand.FingerType.FINGER_PINKY
                };
                
                this.gestureDictionary = {
                    "Spread fingers"            : "spreadfingers"
                    , "V sign"                  : "v_sign"
                    , "Full pinch"              : "full_pinch"
                    , "Two fingers pinch open"  : "two_fingers_pinch_open"
                    , "Fist"                    : "fist"
                    , "Thumb up"                : "thumb_up"
                    , "Thumb down"              : "thumb_down"
                    
                    , "Swipe down"              : "swipe_down"
                    , "Swipe up"                : "swipe_up"
                    , "Swipe left"              : "swipe_left"
                    , "Swipe right"             : "swipe_right"
                    
                    , "Tap"                     : "tap"
                    , "Wave"                    : "wave"
                };
            }
        }
    };
    
    
  
    
    
    
    var FaceModule = function () {
        // private
        
        return {
            // public
            isExist: false
            , joints: []              
            , expressionsOccuredLastFrame : []
            , headRotation: {}
            
            , landmarkDictionary : {}  
            , expressionsDictionary : {}
            
            , init: function(){
                //Bug: Smile and Kiss are switched!
                this.expressionsDictionary = {
                     "Brow lifted right"    : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_RAISER_RIGHT
                    , "Brow lifted left"    : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_RAISER_LEFT
                    , "Brow lowered left"   : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_LOWERER_LEFT
                    , "Brow lowered right"  : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_LOWERER_RIGHT
                    , "Smile"               :
                    intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_KISS
                    , "Kiss"                :  intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_SMILE
                    , "Mouth open"          : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_MOUTH_OPEN
                    , "Wink left"           : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_EYES_CLOSED_LEFT
                    , "Wink right"          : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_EYES_CLOSED_RIGHT
                    , "Look left"           : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_HEAD_TURN_LEFT
                    , "Look right"          : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_HEAD_TURN_RIGHT
                    , "Look up"             : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_HEAD_UP
                    , "Look down"           : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_HEAD_DOWN
                    , "Tongue out"          : intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_TONGUE_OUT
                };
                
                // Converter: face joint index => face joint name
                // temporary solution. will be updated in the future
                this.landmarkDictionary = {
                    "Left eye"          : 77
                    , "Right eye"       : 76
                    , "Left eye brow"   : 7
                    , "Right eye brow"  : 2
                    , "Chin"            : 61
                    , "Upper lip"       : 36
                    , "Bottom lip"      : 42
                    , "Nose"            : 29
                };

            }
        }
    };
          
    
    
    
    var BlobModule = function () {
        // private
        
        return {
            // public
            isExist: false
        }
    };
    
    //suitable for scratch status api
    var ScratchStatus = function () {
        // private
        
        return {
            // public
            status: 1
            , msg: 'Checking your system...'
        }
    };
    
    var RealSenseData = function() {
        return {
            HandModule: new HandModule(),
            FaceModule: new FaceModule(),            
            BlobModule: new BlobModule(),
            Status: new ScratchStatus()
        }
    };
    
    var rsd = new RealSenseData();
    
    
    
    
    
    
    var onConnect = function (sender, connected) {
        
        if (connected == true) {
            console.log('Connect with device instance: ' + sender.instance);
            
            
            //only after sense.init() and onDeviceConnected we know the sensor
            if (sender.deviceInfo.model == rs.DeviceModel.DEVICE_MODEL_R200 ||
                sender.deviceInfo.orientation == rs.DeviceOrientation.DEVICE_ORIENTATION_WORLD_FACING ) {
                
                rsd.Status = { status: 0, msg: 'This extension supports only F200 Intel Realsense 3D Sensor' };
                
                PopAlert();
            }
            
        } else {
           // console.warn('sensor not connected');
            
            rsd.Status = {status: 0, msg: 'Realsense sensor not connected'};
            
            PopAlert();
        }
    };
    
    
    var onStatus = function (sender, sts) {
        // console.log([sender, sts]);
        if (sts < 0) {
            console.warn('Error ' + sts + ' on module ' + sender);
            
            switch (sts){
                case 503:
                    console.warn('Capabilities.Servicer.Realsense.exe must be restarted! shut it down and restart Intel technologyAccess and DCM');   
                    break;


                // error on sensor disconnect from USB (sometimes not occurs)
                case -301:
                    rsd.Status = {status: 1 , msg: 'intel realsense sensor was disconnected from USB. please plug in and refresh page'};
                    break;
            }
            
            onClearSensor();
        }
    };
    
    
    var onClearSensor = function () {
        console.log("reset realsense sensor");
        
        if (sense != undefined) {
            sense.release()
            .then(function (result) {
                sense = undefined;
            });
        }
    };
    
    
    //shutdown realsense when refresh window 
    $(window).bind("beforeunload", function (e) {
        onClearSensor();
    });
    
    
    /**********************************************************************************************************/
    /*************************************FACE RECOGNITION*****************************************************/
    /**********************************************************************************************************/

  
    var onFaceHandData = function (sender, data) {
        if (sender == faceModule)
            onFaceData(sender, data);
        else if (sender == handModule)
            onHandData(sender, data); 
    };
    
    
    /*RealSense Face Recognition event being called continuously, once enabling Face module*/
    var onFaceData = function(module, faceData) {
        
        //reset the face data every frame 
        rsd.FaceModule.expressionsOccuredLastFrame=[];
        
        rsd.FaceModule.joints = [];
        
        rsd.FaceModule.headRotation = {
                                        X: 0
                                        ,Y: 0
                                        ,Z: 0
                                    };      
        
        if (faceData.faces == null || faceData.faces.length == 0) {
            rsd.FaceModule.isExist = false;
            return;
        }
        
        
        
//for face exist block
        rsd.FaceModule.isExist = (faceData.faces.length > 0);
         
        if (faceData.faces.length > 0) {
            for (var f = 0; f < faceData.faces.length; f++) {
                var face = faceData.faces[f];
                
//for face joints block
                if (face.landmarks.points != undefined) {
                    var jointIndex = 0;
               
                    for (var i = 0; i < face.landmarks.points.length; i++) {
                        var joint = face.landmarks.points[i];
                        if (joint != null) {
                               
                            var faceJoint = {};
                            faceJoint.originalJointIndex = i; //maybe use joint.index;
                            faceJoint.position = {
                                 X: joint.image.x
                                ,Y: joint.image.y
                                ,Z: joint.world.z
                            };
                            
                            rsd.FaceModule.joints.push(faceJoint);
                        }
                    }
                }
                
  
//face expression block
                if (face.expressions !== null && face.expressions.expressions != null) {
                    // console.log('Expressions: ' + JSON.stringify(face.expressions.expressions));
                    
                    for (var fe=0; fe<face.expressions.expressions.length; fe++){
                        var f_expr = face.expressions.expressions[fe];
                        if (f_expr.intensity>20) {
                            //add it to array of current frame only
                            rsd.FaceModule.expressionsOccuredLastFrame.push(fe);
                            
                        }
                    }
                }
                
                
                
//for head rotation block
                if (face.pose != undefined && face.pose != null) {
                    /*
                    Pose: {"confidence":1,
                    "headPosition":{"headCenter":{"x":-231.4698,"y":27.50793,"z":496.4164},"confidence":1},
                    "poseAngles":{"yaw":-9.80811,"pitch":40.68155,"roll":-25.92934},"poseQuaternion":{"x":-0.2385482,"y":-0.1558126,"z":0.3195189,"w":0.9037283},"rotationMatrix":[0.7472601764402149,-0.5031789452630889,-0.4340658679860284,0.6518542284473986,0.6820048018979353,0.3315954086585106,0.12918317832359433,-0.5307357150523068,0.8376343517347717]}
                    */
                    //console.warn('Pose: ' + JSON.stringify(face.pose));
                    //console.warn('Pose: ' + face.pose.poseAngles.roll);
                    
                    var head_rotation = {
                                             Yaw: face.pose.poseAngles.yaw
                                            ,Pitch: face.pose.poseAngles.pitch
                                            ,Roll: face.pose.poseAngles.roll
                                        };
                    
                    rsd.FaceModule.headRotation = head_rotation;
                    
                }
            }
        }
    };
    


   


    /**********************************************************************************************************/
    /*************************************END FACE RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
     /**********************************************************************************************************/
    /*************************************HAND RECOGNITION*****************************************************/
    /**********************************************************************************************************/

    /* RealSense Hands Viewer event being called continuously, once enabling Hands module */
    var onHandData = function (module, handData) {
        
        //reset all data each frame
        var _isRightExist = false;
        var _isLeftExist = false;
        
        var _leftHandJoints = [];
        var _rightHandJoints = [];
        
        rsd.HandModule.leftHandJointsFoldness = [];
        rsd.HandModule.rightHandJointsFoldness = [];
        
        
        if (handData.numberOfHands == 0) {
            
            rsd.HandModule.isRightExist = _isRightExist;
            rsd.HandModule.isLeftExist = _isLeftExist;
            rsd.HandModule.leftHandJoints = _leftHandJoints;
            rsd.HandModule.rightHandJoints = _rightHandJoints;
            
            return;
        }
        
        
        //saving hand id rellevant in order to know which gesture belongs to which hand
        var _leftHandId, _rightHandId = -1;
        
        
        //start collecting
        var allHandsData = handData.queryHandData(intel.realsense.hand.AccessOrderType.ACCESS_ORDER_NEAR_TO_FAR);
        
        for (var h = 0; h < handData.numberOfHands; h++) {
            var ihand = allHandsData[h];
            var joints = ihand.trackedJoints;
            
            var tempResultJointsArray = [];
            
            for (var j = 0; j < joints.length; j++) {            
                
                if (joints[j] == null || joints[j].confidence <= 10) continue;
   
                var joint = {};
                joint.originalJointIndex = j;
                joint.confidence = joints[j].confidence;
                
                joint.position = {
                    X: joints[j].positionImage.x
                    ,Y: joints[j].positionImage.y
                    ,Z: joints[j].positionWorld.z
                };
                
                joint.rotation = {
                    X: joints[j].localRotation.x
                    ,Y: joints[j].localRotation.y
                    ,Z: joints[j].localRotation.z
                };
                
                tempResultJointsArray.push(joint);
            }
            
            
//foldness finger block
            var tempResultFoldnessArray = [];
            for (var i = 0; i < ihand.fingerData.length; i++) {
                
                var majorJoint = {};
                majorJoint.originalJointIndex = i;
                majorJoint.foldedness = ihand.fingerData[i].foldedness;
                
                tempResultFoldnessArray.push(majorJoint);
            }

                         
//joint position block  ;  hand exist block            
            if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_LEFT){
                //left hand
                _leftHandJoints = tempResultJointsArray;
                rsd.HandModule.leftHandJointsFoldness = tempResultFoldnessArray;
                
                _isLeftExist = true;
                
                _leftHandId = ihand.uniqueId;
                
            } else if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_RIGHT){
                //right hand
                _rightHandJoints = tempResultJointsArray;  
                rsd.HandModule.rightHandJointsFoldness = tempResultFoldnessArray;
                
                _isRightExist = true;
            
                _rightHandId = ihand.uniqueId;
            }
        }
        
        
//hand gestures block
            for (var g = 0; g < handData.firedGestureData.length; g++) {
                
                var gestureData = handData.firedGestureData[g];
                
                if (gestureData.handId == _leftHandId){
                    AddGestureObjectToArray(gestureData, rsd.HandModule.leftHandGestures);
        
                } else if (gestureData.handId == _rightHandId){
                    AddGestureObjectToArray(gestureData, rsd.HandModule.rightHandGestures);

                }
            }
    
        rsd.HandModule.isRightExist = _isRightExist;
        rsd.HandModule.isLeftExist = _isLeftExist;
        rsd.HandModule.leftHandJoints = _leftHandJoints;
        rsd.HandModule.rightHandJoints = _rightHandJoints;
    };
    
  
    /* add one gesture data object to a selected array (that differentiates between left or right hand) */
    var AddGestureObjectToArray = function(dataObj, arr) {
        for (var i = 0; i<arr.length; i++) {
        
            if (dataObj.name == arr[i].name) {
                
                //update the gesture state
                arr[i].state = dataObj.state;
                
                //break the cycle
                return;
            }
        }
        
        //if reach here, means gesture doesnt exist in array, so add it
        arr.push(dataObj);
        
    };
    
     /**********************************************************************************************************/
    /*************************************BLOB RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
    
    
    var onBlobData = function (module, blobData) {
        
        rsd.BlobModule.isExist=false;
        if (blobData == null) return;
         
        //for blob exist block
        rsd.BlobModule.isExist = (blobData.numberOfBlobs > 0);
        
    };
    
    
     
     /**********************************************************************************************************/
    /*************************************END BLOB RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
    
    /* Start RealSense- enable 4 modules: hands, face, blob & speech - not yet */
    var StartRealSense = function(){
        var rs = intel.realsense;
                    
        rs.SenseManager.createInstance()
        .then(function (result) {
            sense = result;
            return result;
        })
        
        
/*        
         .then(function (result) {
             return rs.blob.BlobModule.activate(sense);
         })
         .then(function (result) {
             blobModule = result;
             return blobModule.createActiveConfiguration();
         })
         .then(function (result) {
             blobConfiguration = result;
             blobConfiguration.maxBlobs = rs.blob.MAX_NUMBER_OF_BLOBS; 
             return blobConfiguration.applyChanges();
         })
         .then(function (result) {
             blobModule.onFrameProcessed = onBlobData;
         })
*/
        
   
  
        .then(function (result) {
            return rs.face.FaceModule.activate(sense); 
        })
        .then(function (result) {
            faceModule = result;
            return faceModule.createActiveConfiguration();
        })
        .then(function (result) {
            faceConfiguration = result;
            faceConfiguration.detection.isEnabled = true;
            faceConfiguration.detection.maxTrackedFaces = 1;
            faceConfiguration.trackingMode = intel.realsense.face.TrackingModeType.FACE_MODE_COLOR_PLUS_DEPTH;
            
            faceConfiguration.landmarks.isEnabled = true;
            faceConfiguration.landmarks.maxTrackedFaces = 1;
            faceConfiguration.pose.isEnabled = true;
            faceConfiguration.expressions.properties.isEnabled = true;

            return faceConfiguration.applyChanges();
        })
        
        //check if this works and fixes capabilities bug
        .then(function (result) {
            return faceConfiguration.release();
        })
        
        
        .then(function (result) {
            return rs.hand.HandModule.activate(sense);
        })
        .then(function (result) {
            handModule = result;
            return handModule.createActiveConfiguration();
        })
        .then(function (result) {
            handConfiguration = result;
            handConfiguration.allAlerts = false;
            handConfiguration.allGestures = true;
            return handConfiguration.applyChanges();
        })
        .then(function (result) {
            return handConfiguration.release();    
        })
        
        
        
        
        .then(function (result) {
            sense.onDeviceConnected = onConnect;
            sense.onStatusChanged = onStatus;
            
            faceModule.onFrameProcessed = onFaceHandData;
            handModule.onFrameProcessed = onFaceHandData;
            
            return sense.init();
        })
        
        //release function of the hand module configurations
        //Todo: if this fixes the size of the capabilities service - notify Erik!!!
        
        
        .then(function (result) {
            imageSize = sense.captureManager.queryImageSize(rs.StreamType.STREAM_TYPE_DEPTH);
            return sense.streamFrames();
        
        })
        .then(function (result) {
            console.log('Streaming ' + imageSize.width + 'x' + imageSize.height);
        })
        .catch(function (error) {
            //var meth = error.request.method;
            //var sts = _.invert(intel.realsense.Status)[error.status];
            //console.log([[meth, sts].join(' '), error]);     
            console.warn('Init failed: ' + JSON.stringify(error));
            
            
            
            switch (error.status)
            {
                case -102:
                    //sensor is already active on another window / app    //GZ said this should work
                    console.warn('Realsense Sensor is active in another window. please close the other one if you wish to work here');
                    rsd.Status = { status: 1, msg: 'Realsense Sensor is active in another window. please close the other one if you wish to work here' };
                    break;
            
                    
                case -3:
                    //unknown error
                    rsd.Status = { status: 0, msg: 'Try restarting your computer'};
                    
                    //happens when the sensor is disconnected
                    rsd.Status = { status: 1, msg: 'If your sensor is unplugged, plug it in and refresh.'};
                    
                    PopAlert();
                    break;
            
                default:
                    //if sensor not connected to usb - it gets here
                    //other option: sensor is already running somewhere else on the web
                    rsd.Status = { status: 1, msg: 'Please Connect your Intel Realsense Sensor to USB and refresh page' };
                    break;
            }
            
        });
        
        
        
        //speech module init
        
        //TODO load speech here
        
    };
    
    
    // check platform compatibility
    var ValidatePlatformState = function (){
        var rs = intel.realsense;
          console.log("ValidatePlatformState");
          
        if (rs != null && rs.SenseManager != null)
        {
            rs.SenseManager.detectPlatform(['face3d','hand','blob'], ['f200'])
                
            .then(function (info) {
                
                //console.warn("Error detectPlatform: isCameraReady "+info.isCameraReady+ " isDCMUpdateNeeded:  "+info.isDCMUpdateNeeded+" isRuntimeInstalled: "+info.isRuntimeInstalled);
                
                if (info.nextStep == 'ready') {
                    rsd.Status = { status: 2, msg: 'RealSense sensor is ready' };
                    
                    //we are now able to start realsense sensor automatically!
                    StartRealSense();
                    
                } else if (info.nextStep == 'unsupported') {
                    //unsupported called when DCM not installed OR when browser is too old OR .......
                    rsd.Status = { status: 0, msg: 'Intel® RealSense™ 3D F200 camera is not available or browser not supported' };
                
                } else if (info.nextStep == 'driver') {
                    //driver called when DCM is too old and should be upgraded
                    rsd.Status = { status: 0, msg: 'Please upgrade RealSense(TM) F200 Depth Camera Manager and firmware' };
                
                } else if (info.nextStep == 'runtime') {
                    //runtime called when runtime needs to be installed
                    rsd.Status = { status: 0, msg: 'Please download and install Intel(R) RealSense(TM) SDK Runtime' };
                
                }
                
                PopAlert();
                
            }).catch(function (error) {
                console.log('CheckPlatform failed: ' + JSON.stringify(error));
                
                rsd.Status = { status: 0, msg: 'platform error' };
                
                PopAlert();
            });
            
        }else{
            rsd.Status = { status: 0, msg: 'platform not ready' };  
            
            PopAlert();
        }
        
        
    };
    
    var PopAlert = function() {
            
        if (rsd.Status.status == 0) {
            //console.warn("sorry you have problems. go to http://intel-realsense-extension-for-scratch.github.io/public/#troubleshoot");

            showModal("template-realsense");
        }
    };
    
    var dependencyAllCreated = function () {
    
        //console.log("check if all loaded");
        rs = intel.realsense;
        
        
        //validate realsense platform state
        ValidatePlatformState();
        
        
        //create realsense data object
        rsd.FaceModule.init();
        rsd.HandModule.init();
    };
    
    
    
    
    console.log("Loading dependencies");
    
    $.getScript('https://www.promisejs.org/polyfills/promise-6.1.0.js')
    .done(function(script, textStatus) {
       
        $.getScript('https://autobahn.s3.amazonaws.com/autobahnjs/latest/autobahn.min.jgz')
        .done(function(script, textStatus) {

            $.getScript('https://cdn.rawgit.com/intel-realsense-extension-for-scratch/resources/master/intel/realsense.js')
            .done(function(script, textStatus) {
             
                $.getScript('https://intel-realsense-extension-for-scratch/public/extension/development/analytics-extension.js')
                .done(function(script, textStatus) {
             
                    dependencyAllCreated();
            
                })
                .fail(function(jqxhr, settings, exception) {
                    console.log('Load realsense fail');
                });

            })
            .fail(function(jqxhr, settings, exception) {
                console.log('Load realsense fail');
            });
        })
        .fail(function(jqxhr, settings, exception) {
            console.log('Load autobahn fail');
        });
    })
    .fail(function(jqxhr, settings, exception) {
        console.log('Load promise fail');
    });

    

   
    
    var ValueMapper = function(value, source_min, source_max, dest_min, dest_max) {
       
        // Figure out range scales
        var sourceScale = source_max - source_min;
        var destScale = dest_max - dest_min;

        // Convert the source range into a 0-1 range (float)
        var normalizedSource = (value - source_min) / sourceScale;

        //Convert the 0-1 range into a value in the destination range.
        return dest_min + (normalizedSource * destScale);
       
   };
    
        
        
    /**********************************************************************************************************/
    /************************************END WEB API***********************************************************/
    /**********************************************************************************************************/
 
        
        
        
        
        
        
        
        
        
        
         
    
    
    
    // works in scratchX not in scratch. added an event to the window.beforeupload in order for this to really restart the sensor
    ext._shutdown = function () {
        console.warn("Scratch _shutdown called");
        onClearSensor();
    };


    ext._getStatus = function () {
        return rsd.Status;
    };
   
    
    // Scratch blocks events
    ext.isBlobExist = function () {
        return rsd.BlobModule.isExist;
    };
    
    
    ext.isHandExist = function (hand_side) {
       
        if (hand_side == 'Left Hand'){
            return rsd.HandModule.isLeftExist;
        
        }else if (hand_side == 'Right Hand'){
            return rsd.HandModule.isRightExist;
        
        } else {
            return (rsd.HandModule.isRightExist || rsd.HandModule.isLeftExist);
        
        }
        
        return false;
    };
    
    
    ext.getHandJointPosition = function (hand_position, hand_side, joint_name) {        
                
        //if no rellevant hands exist, return false
        if (   (hand_side == 'Left Hand' && rsd.HandModule.isLeftExist == false)
            || (hand_side == 'Right Hand' && rsd.HandModule.isRightExist == false) 
            || (hand_side == 'Any Hand' && rsd.HandModule.isRightExist == false && rsd.HandModule.isLeftExist == false) ){
            //console.warn("exit 1");
            return -1000;   
        }
        
        
        //get array of requested hand
        var jointArray = [];
        
        if (hand_side == 'Any Hand'){
            if (rsd.HandModule.isLeftExist == true){
                hand_side = 'Left Hand';
            
            } else if (rsd.HandModule.isRightExist == true){
                hand_side = 'Right Hand';
            
            } else {
                //no hand available
                return -1000;
            }
        }
    
        jointArray = { 'Left Hand' : rsd.HandModule.leftHandJoints, 
                       'Right Hand': rsd.HandModule.rightHandJoints }[hand_side];
        
        //
        
        
        if (jointArray.length == 0){
            console.warn("exit 30");
            return -1000;
        }
        
        
        //get the requested joint index
        var requestedJointIndex = -1;
        
        if (joint_name !== parseInt(joint_name, 10)) {
        
            //joint_name is string variable from the menu
            for(var key in rsd.HandModule.jointDictionary){
                if (key == joint_name){
                    requestedJointIndex = rsd.HandModule.jointDictionary[key];
                    break; 
                }
            }
            
        } else {
            
            //joint_name is integer variable
            requestedJointIndex = joint_name;
        }
        
        if (requestedJointIndex < 0) {
            //couldnt find requested joint 
            return -1000;
            
        }
        
        //get requested joint data object
        var result = {};
        
        for (var i = 0; i < jointArray.length; i++) {
            if (jointArray[i].originalJointIndex === requestedJointIndex) {
                result = jointArray[i];
                break;
            }
        }

        
        
        //get the request value
        if (result.position != undefined) {
                   
            if (hand_position === "X Position") {
                return ValueMapper(result.position.X, RS_HAND_X_MAX_LEFT, RS_HAND_X_MAX_RIGHT, SCRATCH_X_MAX_LEFT, SCRATCH_X_MAX_RIGHT);
               
            } else {
                if (hand_position === "Y Position") {
                    return ValueMapper(result.position.Y, RS_HAND_Y_MAX_DOWN, RS_HAND_Y_MAX_UP, SCRATCH_Y_MAX_DOWN, SCRATCH_Y_MAX_UP);
                
                } else {
                   return result.position.Z;
                
                }
            }
        } else {
            //console.warn("exit 31");   
        }
        
        //console.warn("exit 3 "+requestedJointIndex+" "+ +result.position);
        return -1000;
    };
    

    
    ext.getHandGesture = function(hand_side, gesture_name) {
       
        var gesturesArray = [];
        
        //get array of requested hand
        if (hand_side == 'Any Hand'){
            gesturesArray = rsd.HandModule.rightHandGestures.concat(rsd.HandModule.leftHandGestures);
            
        } else {
            gesturesArray = { 'Left Hand'  : rsd.HandModule.leftHandGestures, 
                              'Right Hand' : rsd.HandModule.rightHandGestures}[hand_side];
        }
        
        
        //if no gestures, break now
        if (gesturesArray.length == 0) return false;
        
        //if no rellevant hands exist, return false
        if (   (hand_side == 'Left Hand' && rsd.HandModule.isLeftExist == false)
            || (hand_side == 'Right Hand' && rsd.HandModule.isRightExist == false) 
            || (hand_side == 'Any Hand' && rsd.HandModule.isRightExist == false && rsd.HandModule.isLeftExist == false) ){
            return false;   
        }
        
        
        
        //map display name to SDK's
        var requestedGestureSdkName = "";
        
        for (var key in rsd.HandModule.gestureDictionary){

            if (key == gesture_name){
                requestedGestureSdkName = rsd.HandModule.gestureDictionary[key];
                break;

            }
        }
            
        if (requestedGestureSdkName == "") {
            //couldnt find requested gesture
            return false;
        }
               
        for (var g = 0; g<gesturesArray.length; g++){
            if (gesturesArray[g].name == requestedGestureSdkName) {
                
                //return true if gesture started or in progress
                if (gesturesArray[g].state == intel.realsense.hand.GestureStateType.GESTURE_STATE_START)
                {
                    //we need to continue the cycle of testing since there is an option that we have 2 gestures with the same name in the AnyHand array
                    return true;   
                }
            }
        }
        
        //if reach here, no gesture occurs
        return false;
    }
    
    
    
    //foldedness values: closed 0 - spread 100
    ext.getHandJointFoldedness = function (hand_side, finger_name) {
    
        var jointArray = [];
       
        if (hand_side == 'Any Hand'){
            if (rsd.HandModule.isLeftExist == true){
                hand_side='Left Hand';
            
            } else if (rsd.HandModule.isRightExist == true){
                hand_side='Right Hand';
            
            } else {
                //no hand available
                return -1;   
            
            }
        } 
        
        jointArray = {'Left Hand': rsd.HandModule.leftHandJointsFoldness, 
                      'Right Hand': rsd.HandModule.rightHandJointsFoldness}[hand_side];
          
        
        var requestedJointIndex = -1;
        for(var key in rsd.HandModule.majorJointDictionary){
               
            if (key == finger_name){
                requestedJointIndex = rsd.HandModule.majorJointDictionary[key];
                break;

            }
        }
            
        if (requestedJointIndex == -1) {
            //couldnt find requested joint 
            return -1;

        }
        
        for (var f=0; f<jointArray.length; f++){
            if (jointArray[f].originalJointIndex == requestedJointIndex){
                return jointArray[f].foldedness;
            }
        }
        
        return -1;
    };
    
    //hand rotation
    ext.getHandRotation = function(rotation_type, hand_side){
        
        var jointArray = [];
        
        if (hand_side == 'Any Hand'){
            if (rsd.HandModule.isLeftExist == true){
                hand_side='Left Hand';
            
            } else if (rsd.HandModule.isRightExist == true){
                hand_side='Right Hand';
            
            } else {
                //no hand available
                return -1;   
            
            }
        } 
        
        jointArray = {  'Left Hand' : rsd.HandModule.leftHandJoints, 
                        'Right Hand': rsd.HandModule.rightHandJoints }[hand_side];
       
        
        
        var result = {};
        
        for (var i = 0; i < jointArray.length; i++) {
            if (jointArray[i].originalJointIndex == rsd.HandModule.jointDictionary.Wrist) {
                result = jointArray[i];
                break;
            }
        }
        
        
        
        if (result.rotation != undefined) {
            //return the right value
            if (rotation_type === 'Yaw') {
                return result.rotation.X;
               
            } else {
                if (rotation_type === 'Pitch') {
                    return result.rotation.Y;
                    
                } else {
                   return result.rotation.Z;
                
                }
            }
        }
        
        return -1000;
    };
    
    
    
    
    ext.isFaceExist = function () {
       
        return rsd.FaceModule.isExist;
    };
    
     
    ext.getFaceJointPosition = function (head_position, joint_name) {
         
        var result = {};
        
        var requestedJointIndex = -1;
        
        if (joint_name !== parseInt(joint_name, 10)) {
        
            //joint_name is string variable from the menu
            for(var key in rsd.FaceModule.landmarkDictionary){
               
                if (key == joint_name){
                    requestedJointIndex = rsd.FaceModule.landmarkDictionary[key];
                    break;
                    
                }
            }
            
        } else {
            
            //joint_name is integer variable
            requestedJointIndex = joint_name;
        }
        
        if (requestedJointIndex < 0) {
            //couldnt find requested joint 
            return -1000;
        }
        
        for (var i = 0; i < rsd.FaceModule.joints.length; i++) {
            if (rsd.FaceModule.joints[i].originalJointIndex === requestedJointIndex) {
                result = rsd.FaceModule.joints[i];
                break;
            }
        }
        
        if (result == {}) {
            //couldnt find requested joint 
            return -1000;
        }
        
        
        
        //return the right value
        if (head_position === "X Position") {
            return ValueMapper(result.position.X, RS_FACE_X_MAX_LEFT, RS_FACE_X_MAX_RIGHT, SCRATCH_X_MAX_LEFT, SCRATCH_X_MAX_RIGHT);
        
        } else {
            if (head_position === "Y Position") {
                return ValueMapper(result.position.Y, RS_FACE_Y_MAX_DOWN, RS_FACE_Y_MAX_UP, SCRATCH_Y_MAX_DOWN, SCRATCH_Y_MAX_UP);
           
            } else {
                return result.position.Z;
        
            }
        }
        
        return -1000;
    };
    
    
    ext.isFacialExpressionOccured = function (facial_expression) {
     
        var requestedExpressionIndex = -1;
        
        for (var key in rsd.FaceModule.expressionsDictionary){

            if (key == facial_expression){
                requestedExpressionIndex = rsd.FaceModule.expressionsDictionary[key];
                break;

            }
        }
            
        if (requestedExpressionIndex == -1) {
            //couldnt find requested expression
            return false;

        }
        
        for (var fe = 0; fe < rsd.FaceModule.expressionsOccuredLastFrame.length; fe++){
            
            if (rsd.FaceModule.expressionsOccuredLastFrame[fe] == requestedExpressionIndex){                
                return true;
                break;
            }
        }
        return false;
        
    };
    
    
    
    
    ext.getHeadRotation = function(rotation_type){
       
        if (rotation_type === "Yaw"){
            return ValueMapper(rsd.FaceModule.headRotation.Yaw, RS_FACE_ROTATION_MIN, RS_FACE_ROTATION_MAX, 0, 180);
           
        } else {
            if (rotation_type === "Pitch"){
                return ValueMapper(rsd.FaceModule.headRotation.Pitch, RS_FACE_ROTATION_MIN, RS_FACE_ROTATION_MAX, 0, 180);
           
            } else {
                return ValueMapper(rsd.FaceModule.headRotation.Roll, RS_FACE_ROTATION_MIN, RS_FACE_ROTATION_MAX, 0, 180);
            
            }
        }
        return 0;    
    };
    
    
    
    
    
    
    var descriptor = {
        blocks: [
             ['b', 'Face visible?', 'isFaceExist', '']
            ,['r', '%m.position_value of %d.face_joints', 'getFaceJointPosition', 'X Position', 'Nose']
            ,['b', 'Face expression %m.facial_expressions?', 'isFacialExpressionOccured', 'Wink left']
            ,['r', '%m.rotation_value rotation of Head', 'getHeadRotation', 'Yaw']
            
        ,['-']
            ,['b', '%m.hand_type visible?', 'isHandExist', 'Any Hand']
            ,['r', '%m.position_value of %m.hand_type %d.hand_joints', 'getHandJointPosition', 'X Position', 'Any Hand', 'Index tip']
            ,['b', '%m.hand_type gesture %m.hand_gestures?', 'getHandGesture', 'Any Hand', 'V sign']
            ,['r', '%m.hand_type %m.major_joint_name foldedness amount', 'getHandJointFoldedness', 'Any Hand', 'Index']
           // ,['r', '%m.rotation_value of %m.hand_type', 'getHandRotation', 'Rotation X', 'Any Hand']
			
        ]
         
        , menus: {
            "hand_type":            [ "Left Hand", "Right Hand", "Any Hand" ],
            "face_joints":          [ "Left eye", "Right eye", "Left eye brow", "Right eye brow", 
                                    "Upper lip", "Bottom lip", "Nose", "Chin" ],
            "hand_joints":          [ "Index tip", "Index base", "Index jointC", "Index jointB",
                                    "Thumb tip", "Thumb base", "Thumb jointC", "Thumb jointB",
                                    "Middle tip", "Middle base", "Middle jointC", "Middle jointB",
                                    "Ring tip", "Ring base", "Ring jointC", "Ring jointB",
                                    "Pinky tip", "Pinky base", "Pinky jointC", "Pinky jointB",
                                    "Wrist", "Center" ],
            "major_joint_name":     [ "Index", "Thumb", "Middle", "Ring", "Pinky" ],
            "facial_expressions":   [ "Wink left", "Wink right" ,"Brow lifted left", 
                                     "Brow lifted right", "Brow lowered left", 
                                     "Brow lowered right", "Mouth open", "Tongue out",
                                     "Smile", "Kiss", "Look down" ,"Look up", "Look left", 
                                     "Look right" ],
            "hand_gestures":      [ "Spread fingers", "V sign", "Full pinch",
                                    "Two fingers pinch open", "Swipe down", "Swipe up", 
                                   "Swipe left", "Swipe right", "Tap", "Fist", "Thumb up", 
                                   "Thumb down", "Wave" ],
            "rotation_value":       [ "Yaw", "Pitch", "Roll" ],
            "position_value":       [ "X Position",  "Y Position",  "Z Position" ]
        }
        
        , url: 'http://intel-realsense-extension-for-scratch.github.io/'
    };
    
    ScratchExtensions.register('Intel RealSense', descriptor, ext);
    
})
            ({});
