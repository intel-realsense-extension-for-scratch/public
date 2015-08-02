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
    
    
    
    
    const MAX_NUM_OF_RECOGNIZED_FACE_EXPRESSIONS = 10;  //saving last 11 recognized facial expression
    const MAX_NUM_OF_RECOGNIZED_WORDS = 99;             //saving last 100 recognized words

    
    //#region stage mapping
    const RS_FACE_X_MAX_RIGHT = 0;    //MIRRORED!!!!!
    const RS_FACE_X_MAX_LEFT = 600;    //MIRRORED!!!!!
    const RS_FACE_Y_MAX_UP = 250;      //MIRRORED!!!!!
    const RS_FACE_Y_MAX_DOWN = 0;       //MIRRORED!!!!!

    const RS_FACE_ROTATION_MIN = -30;
    const RS_FACE_ROTATION_MAX = 30;
    
    const RS_HAND_X_MAX_RIGHT = -100;
    const RS_HAND_X_MAX_LEFT = 700;
    const RS_HAND_Y_MAX_UP = 400;
    const RS_HAND_Y_MAX_DOWN = -100;

    const SCRATCH_X_MAX_RIGHT = 240;    //MIRRORED!!!!!
    const SCRATCH_X_MAX_LEFT = -240;    //MIRRORED!!!!!
    const SCRATCH_Y_MAX_UP = -180;      //MIRRORED!!!!!
    const SCRATCH_Y_MAX_DOWN = 180;     //MIRRORED!!!!!
    
    //#endregion

    
    
      
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
            , gestures: {}
            , tempLeftHandGestures: []
            , tempRightHandGestures: []
           
         /*   , JointIndexToScratchName : {
                intel.realsense.hand.JointType.JOINT_WRIST:  "Wrist"
                , intel.realsense.hand.JointType.JOINT_CENTER: "Center"

                , intel.realsense.hand.JointType.JOINT_THUMB_BASE: "Thumb base"
                , intel.realsense.hand.JointType.JOINT_THUMB_JT1: "Thumb jointC"
                , intel.realsense.hand.JointType.JOINT_THUMB_JT2: "Thumb jointB"
                , intel.realsense.hand.JointType.JOINT_THUMB_TIP: "Thumb tip"

                , intel.realsense.hand.JointType.JOINT_INDEX_BASE: "Index base"
                , intel.realsense.hand.JointType.JOINT_INDEX_JT1: "Index jointC"
                , intel.realsense.hand.JointType.JOINT_INDEX_JT2: "Index jointB"
                , intel.realsense.hand.JointType.JOINT_INDEX_TIP: "Index tip"

                , intel.realsense.hand.JointType.JOINT_MIDDLE_BASE: "Middle base"
                , intel.realsense.hand.JointType.JOINT_MIDDLE_JT1: "Middle jointC"
                , intel.realsense.hand.JointType.JOINT_MIDDLE_JT2: "Middle jointB"
                , intel.realsense.hand.JointType.JOINT_MIDDLE_TIP: "Middle tip"

                , intel.realsense.hand.JointType.JOINT_RING_BASE: "Ring base"
                , intel.realsense.hand.JointType.JOINT_RING_JT1: "Ring jointC"
                , intel.realsense.hand.JointType.JOINT_RING_JT2: "Ring jointB"
                , intel.realsense.hand.JointType.JOINT_RING_TIP: "Ring tip"

                , intel.realsense.hand.JointType.JOINT_PINKY_BASE: "Pinky base"
                , intel.realsense.hand.JointType.JOINT_PINKY_JT1: "Pinky jointC"
                , intel.realsense.hand.JointType.JOINT_PINKY_JT2: "Pinky jointB"
                , intel.realsense.hand.JointType.JOINT_PINKY_TIP: "Pinky tip"
            }
              */
        }
    };
    
  
    
    var FaceModule = function () {
        // private
        
        return {
            // public
            isExist: false,
            joints: [],                 
            expressions_this_frame : [],
            headRotation: {}
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
            
            if (sts == 503){
                console.warn('Capabilities.Servicer.Realsense.exe must be restarted! shut it down and restart Intel technologyAccess and DCM');   
            }
            
            
            // error on sensor disconnect from USB (sometimes not occurs)
            if (sts == -301) {
                rsd.Status = {status: 1 , msg: 'intel realsense sensor was disconnected from USB. please plug in and refresh page'};
                
                onClearSensor();
            }
        }
    };
    
    
    var onClearSensor = function () {
        console.log("reset realsense sensor");
        
        if (sense != undefined) {
            sense.release().then(function (result) {
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
        rsd.FaceModule.expressions_this_frame=[];
        
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
                            //var jointName = convertFaceJointIndexToScratchName(i);
                           // if (jointName !== "error") {
                                
                                var faceJoint = {};
                             //   faceJoint.jointName = jointName;
                                faceJoint.originalJointIndex = i;
                                faceJoint.position = {
                                     X: joint.image.x
                                    ,Y: joint.image.y
                                    ,Z: joint.world.z
                                };
                                
                                rsd.FaceModule.joints.push(faceJoint);
                          //  }
                        }
                    }
                }
                
  
//face expression block
                if (face.expressions !== null && face.expressions.expressions != null) {
                    // console.log('Expressions: ' + JSON.stringify(face.expressions.expressions));
                    
                    for (var fe=0; fe<face.expressions.expressions.length; fe++){
                        var f_expr = face.expressions.expressions[fe];
                        if (f_expr.intensity>20) {
                            //convert the expression to a string the extension would identify
                            var scratchFaceExpressionName = convertFaceExpressionIndexToScratchName(fe);

                            if (scratchFaceExpressionName != "error"){
                                //add it to array of current frame only
                                rsd.FaceModule.expressions_this_frame.push(scratchFaceExpressionName);

        /*  
                                //add expression to array with timestamp
                                var f_expression = new Object();
                                f_expression.text = f_expr;
                                f_expression.timestamp = new Date();

                                faceExpressionArray.push(f_expression);

                                //remove first array element if reached max number of face expressions allowed to save
                                if (faceExpressionArray.length == MAX_NUM_OF_RECOGNIZED_FACE_EXPRESSIONS){
                                    faceExpressionArray.shift();   
                                }
        */
                            }
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
                                             X: face.pose.poseAngles.yaw
                                            ,Y: face.pose.poseAngles.pitch
                                            ,Z: face.pose.poseAngles.roll
                                        };
                    
                    rsd.FaceModule.headRotation = head_rotation;
                    
                }
            }
        }
    };
    
    
    var landmarkDictionary = {
        "Left eye": 77
        , "Right eye": 76
    };
    
    
    // Converter: face joint index => face joint name
    var convertFaceJointIndexToScratchName = function (joint_index)
    {
        //due to a temporary bug in the SDK i need to use real numbers.
        switch (joint_index){
                
            case 77: //intel.realsense.face.LandmarkType.LANDMARK_EYE_LEFT_CENTER:
                return "Left eye";
                break;

            case 76: // intel.realsense.face.LandmarkType.LANDMARK_EYE_RIGHT_CENTER:
                return "Right eye";
                break;

            case 7:// intel.realsense.face.LandmarkType.LANDMARK_EYEBROW_LEFT_CENTER:
                return "Left eye brow";
                break;

            case 2: //intel.realsense.face.LandmarkType.LANDMARK_EYEBROW_RIGHT_CENTER:
                return "Right eye brow";
                break;
                
            case 61: // intel.realsense.face.LandmarkType.LANDMARK_CHIN:
                return "Chin";
                break;
                
            case 36: //intel.realsense.face.LandmarkType.LANDMARK_UPPER_LIP_CENTER:
                return "Upper lip";
                break;
                
            case 42: //intel.realsense.face.LandmarkType.LANDMARK_LOWER_LIP_CENTER:
                return "Bottom lip";
                break;
                
            case 29: //intel.realsense.face.LandmarkType.LANDMARK_NOSE_TIP:
                return "Nose";
                break;
        }
        
        return "error";
        
        
        
        /* 
        //these 2 work
        if (joint_index === intel.realsense.face.LandmarkType.LANDMARK_EYE_LEFT_CENTER){
            console.log("hi 1 ");
        }
        if (joint_index == intel.realsense.face.LandmarkType.LANDMARK_EYE_LEFT_CENTER){
            console.log("hi 2 "); 
        }
        
        
        //didnt work. return undefined
        
        return  
            (joint_index === intel.realsense.face.LandmarkType.LANDMARK_EYE_LEFT_CENTER) ? "Left eye" :
            (joint_index === intel.realsense.face.LandmarkType.LANDMARK_EYE_RIGHT_CENTER) ? "Right eye" :
            (joint_index === intel.realsense.face.LandmarkType.LANDMARK_EYEBROW_LEFT_CENTER) ? "Left eye brow" :
            (joint_index === intel.realsense.face.LandmarkType.LANDMARK_EYEBROW_RIGHT_CENTER) ? "Right eye brow" :
            (joint_index === intel.realsense.face.LandmarkType.LANDMARK_CHIN) ? "Chin" :
            (joint_index === intel.realsense.face.LandmarkType.LANDMARK_UPPER_LIP_CENTER) ? "Upper lip" :
            (joint_index === intel.realsense.face.LandmarkType.LANDMARK_LOWER_LIP_CENTER) ? "Bottom lip" :
            (joint_index === intel.realsense.face.LandmarkType.LANDMARK_NOSE_TIP) ? "Nose" : 
            "error";  
            */
    };
    
    
    var convertFaceExpressionIndexToScratchName = function (expression_index)
    {
        switch (expression_index)
        {
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_RAISER_LEFT:
                return "Brow lifted left";
                break;

            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_RAISER_RIGHT:
                return "Brow lifted right";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_LOWERER_LEFT:
                return "Brow lowered left";
                break;
        
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_BROW_LOWERER_RIGHT:
                return "Brow lowered right";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_SMILE:
                return "Smile";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_KISS:
                return "Kiss";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_MOUTH_OPEN:
                return "Mouth open";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_EYES_CLOSED_LEFT:
                return "Wink left";
                break;
          
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_EYES_CLOSED_RIGHT:
                return "Wink right";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_HEAD_TURN_LEFT:
                return "Look left";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_HEAD_TURN_RIGHT:
                return "Look right";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_HEAD_UP:
                return "Look up";
                break;
         
             case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_HEAD_DOWN:
                return "Look down";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_HEAD_TILT_LEFT: 
                return "error";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_HEAD_TILT_RIGHT: 
                return "error";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_EYES_TURN_LEFT:
                return "error";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_EYES_TURN_RIGHT:
                return "error";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_EYES_UP:
                return "error";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_EYES_DOWN:
                return "error";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_TONGUE_OUT:
                return "Tongue out";
                break;
   
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_PUFF_RIGHT:
                return "error";
                break;
         
            case intel.realsense.face.ExpressionsData.FaceExpression.EXPRESSION_PUFF_LEFT:
                return "error";
                break; 
        }
        
       return "error";
    };
    
    /**********************************************************************************************************/
    /*************************************END FACE RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
     /**********************************************************************************************************/
    /*************************************HAND RECOGNITION*****************************************************/
    /**********************************************************************************************************/

    /*RealSense Hands Viewer event being called continuously, once enabling Hands module*/
    var onHandData = function (module, handData) {
        
        //reset all data each frame
        rsd.HandModule.isRightExist = false;
        rsd.HandModule.isLeftExist = false;
        
        //rsd.HandModule.gestures = {};
        
        rsd.HandModule.leftHandJoints=[];
        rsd.HandModule.rightHandJoints=[];
        
        rsd.HandModule.leftHandJointsFoldness=[];
        rsd.HandModule.rightHandJointsFoldness=[];
        
        if (handData.numberOfHands == 0) {
            return;
        }
        
        //start collecting
        var allHandsData = handData.queryHandData(intel.realsense.hand.AccessOrderType.ACCESS_ORDER_NEAR_TO_FAR);
        for (var h = 0; h < handData.numberOfHands; h++) {
            var ihand = allHandsData[h];
            var joints = ihand.trackedJoints;
            
            var tempResultJointsArray = [];
            
            for (var j = 0; j < joints.length; j++) {            
                
                var handJointName = convertHandJointIndexToScratchName(j);
                
                if (joints[j] == null || joints[j].confidence <= 10 || handJointName == "error") continue;

                var joint = {};
                joint.originalJointIndex = j;
                joint.jointName = handJointName;
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
                majorJoint.jointName = convertHandJointMajorIndexToScratchName(i);
                majorJoint.foldedness = ihand.fingerData[i].foldedness;
                
                tempResultFoldnessArray.push(majorJoint);
            }

            
            
//joint position block  ;  hand exist block            
            if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_LEFT){
                //left hand
                rsd.HandModule.leftHandJoints = tempResultJointsArray;
                rsd.HandModule.leftHandJointsFoldness = tempResultFoldnessArray;
                
                rsd.HandModule.isLeftExist = true;
        
            } else if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_RIGHT){
                //right hand
                rsd.HandModule.leftHandJoints = tempResultJointsArray;  
                rsd.HandModule.rightHandJointsFoldness = tempResultFoldnessArray;
                
                rsd.HandModule.isRightExist = true;
            }
            
            
            
//hand gestures block
            if (handData.firedGestureData.length == 0) return;
            
            for (var g = 0; g < handData.firedGestureData.length; g++) {
                
                var gestureData = handData.firedGestureData[g];
                
                if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_LEFT){
                    AddGestureObjectToArray(gestureData, rsd.HandModule.tempLeftHandGestures);
               
                } else if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_RIGHT){
                    AddGestureObjectToArray(gestureData, rsd.HandModule.tempRightHandGesturestempRightHandGestures);
                
                }
            }
        }
        
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
    
    
    // Converter: hand major joint index => scratch joint name
    var convertHandJointMajorIndexToScratchName =function (joint_index)
    {
        switch (joint_index) {
            
            case intel.realsense.hand.FingerType.FINGER_THUMB:
                return "Thumb";
                break;

            case intel.realsense.hand.FingerType.FINGER_INDEX:       
                return "Index";
                break;

            case intel.realsense.hand.FingerType.FINGER_MIDDLE:
                return "Middle";
                break;

            case intel.realsense.hand.FingerType.FINGER_RING:
                return "Ring";
                break;

            case intel.realsense.hand.FingerType.FINGER_PINKY:
                return "Pinky";
                break;
                
            default:
                return "error";
                break;
        }
        
        return "error";
    };
    

     
    
    // Converter: hand joint index => scratch joint name
    var convertHandJointIndexToScratchName = function (joint_index)
    {
        switch (joint_index) {
          
           case intel.realsense.hand.JointType.JOINT_WRIST:
                return "Wrist";
                break;

           case intel.realsense.hand.JointType.JOINT_CENTER:
                return "Center";
                break;

              
            case intel.realsense.hand.JointType.JOINT_THUMB_BASE:
                return "Thumb base";
                break;

           case intel.realsense.hand.JointType.JOINT_THUMB_JT1:
                return "Thumb jointC";
                break;

           case intel.realsense.hand.JointType.JOINT_THUMB_JT2:
                return "Thumb jointB";
                break;

           case intel.realsense.hand.JointType.JOINT_THUMB_TIP:
                return "Thumb tip";
                break;

            
            case intel.realsense.hand.JointType.JOINT_INDEX_BASE:
                return "Index base";
                break;

            case intel.realsense.hand.JointType.JOINT_INDEX_JT1:
                return "Index jointC";
                break;

            case intel.realsense.hand.JointType.JOINT_INDEX_JT2:
                return "Index jointB";
                break;

            case intel.realsense.hand.JointType.JOINT_INDEX_TIP:
                return "Index tip";
                break;

              
           case intel.realsense.hand.JointType.JOINT_MIDDLE_BASE:
                return "Middle base";
                break;

            case intel.realsense.hand.JointType.JOINT_MIDDLE_JT1:
                return "Middle jointC";
                break;

            case intel.realsense.hand.JointType.JOINT_MIDDLE_JT2:
                return "Middle jointB";
                break;

            case intel.realsense.hand.JointType.JOINT_MIDDLE_TIP:
                return "Middle tip";
                break;


            case intel.realsense.hand.JointType.JOINT_RING_BASE:
                return "Ring base";
                break;

           case intel.realsense.hand.JointType.JOINT_RING_JT1:
                return "Ring jointC";
                break;

            case intel.realsense.hand.JointType.JOINT_RING_JT2:
                return "Ring jointB";
                break;

            case intel.realsense.hand.JointType.JOINT_RING_TIP:
                return "Ring tip";
                break;

 
            case intel.realsense.hand.JointType.JOINT_PINKY_BASE:
                return "Pinky base";
                break;

            case intel.realsense.hand.JointType.JOINT_PINKY_JT1:
                return "Pinky jointC";
                break;

            case intel.realsense.hand.JointType.JOINT_PINKY_JT2:
                return "Pinky jointB";
                break;

            case intel.realsense.hand.JointType.JOINT_PINKY_TIP:
                return "Pinky tip";
                break;
              

          default:
              return "error";
              break;
              
      }
        return "error";
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
                case  -102:
                    //sensor is already active on another window / app    //GZ said this should work
                    console.warn('Realsense Sensor is active in another window. please close the other one if you wish to work here');
                    rsd.Status = { status: 1, msg: 'Realsense Sensor is active in another window. please close the other one if you wish to work here' };
                    break;
            
                    
                case -3:
                    //unknown error
                    rsd.Status = { status: 0, msg: 'Try restarting your computer'};
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
    };
    
    
    
    
    console.log("Loading dependencies");
    
    $.getScript('https://www.promisejs.org/polyfills/promise-6.1.0.js')
    .done(function(script, textStatus) {
       
        $.getScript('https://autobahn.s3.amazonaws.com/autobahnjs/latest/autobahn.min.jgz')
        .done(function(script, textStatus) {

            $.getScript('https://rawgit.com/intel-realsense-extension-for-scratch/resources/master/intel/realsense.js')
            .done(function(script, textStatus) {
                dependencyAllCreated();
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

    

    //#endregion
    
    
    
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
 
        
        
        
        
        
        
        
        
        
        
         
    
    
    
    // work in scratchX not in scratch. added an event to the window.beforeupload in order for this to really restart the sensor
    ext._shutdown = function () {
        console.warn("Scratch _shutdown called");
        onClearSensor();
    };


    ext._getStatus = function () {
        return rsd.Status;
    };
   
    
    //#region Scratch blocks events (Face recognition module)
    ext.isBlobExist = function () {
        return rsd.BlobModule.isExist;
    };
    
    
    ext.isHandExist = function (hand_side) {
        if (hand_side == "Left Hand"){
            return rsd.HandModule.isLeftExist;
        }else if (hand_side == "Right Hand"){
            return rsd.HandModule.isRightExist;
        } else {
            return (rsd.HandModule.isRightExist || rsd.HandModule.isLeftExist);
        }
    };
    
    
    ext.getHandJointPosition = function (hand_position, hand_side, joint_name) {
        //QA TAG (Hand module)
        //console.log("(getHandJointPosition) *REQUESTED* hand position: " + hand_position + ", hand side: " + hand_side + ", joint name: " + joint_name);
        //end of QA TAG*
        
        
        var jointArray = [];
        
        //get array of requested hand
        if (hand_side == 'Any Hand'){
            jointArray = rsd.HandModule.leftHandJoints;
            //jointArray.join(rsd.HandModule.rightHandJoints);
            
        } else {
            jointArray = { 'Left Hand' : rsd.HandModule.leftHandJoints, 
                           'Right Hand': rsd.HandModule.rightHandJoints }[hand_side];
        }
        
        
        var result = {};
        
        if (joint_name === parseInt(joint_name, 10)) {
        //joint_name is integer variable
           for (var i = 0; i < jointArray.length; i++) {
               if (jointArray[i].originalJointIndex === joint_name) {
                    //console.log("joint index: " + i);
                    result = jointArray[i];
                    break;
                }
           }
          
         } else {
            
        //joint_name is string variable from the menu
            for (var i = 0; i < jointArray.length; i++) {
                if (jointArray[i].jointName === joint_name) {
                    //console.log("joint index: " + i);
                    result = jointArray[i];
                    break;
                }
            }
        }
        
        
        if(result.position != undefined) {
            //return the right value
            if (hand_position === "X Position") {
                return ValueMapper(result.position.X, RS_HAND_X_MAX_LEFT, RS_HAND_X_MAX_RIGHT, SCRATCH_X_MAX_LEFT, SCRATCH_X_MAX_RIGHT);
               
            } else {
                if (hand_position === "Y Position") {
                    return ValueMapper(result.position.Y, RS_HAND_Y_MAX_DOWN, RS_HAND_Y_MAX_UP, SCRATCH_Y_MAX_DOWN, SCRATCH_Y_MAX_UP);
                
                } else {
                   return result.position.Z;
                
                }
            }
        }
        
        return -1000;
    };
    
    
/*
    ext.whenHandGesture = function(hand_type, gesture_name) {        
        var g = gesture_name.toLowerCase().replace(' ', '_');
        var h = {
            "Left Hand": intel.realsense.hand.BodySideType.BODY_SIDE_LEFT,
            "Right Hand": intel.realsense.hand.BodySideType.BODY_SIDE_RIGHT,
            "Any Hand": intel.realsense.hand.BodySideType.BODY_SIDE_UNKNOWN,
        }[hand_type];
        if(h in gestures && gestures[h].name == g) {
            return true;
        }
        return false;
    }
*/
    
    ext.getHandGesture = function(hand_side, gesture_name) {
        
        var gesturesArray = [];
        
        //get array of requested hand
        if (hand_side == 'Any Hand'){
            gesturesArray = rsd.HandModule.tempLeftHandGestures;
            gesturesArray.join(rsd.HandModule.tempRightHandGestures);
            
        } else {
            gesturesArray = { 'Left Hand' : rsd.HandModule.tempLeftHandGestures, 
                             'Right Hand': rsd.HandModule.tempRightHandGestures}[hand_side];
        }
        
        
        //if no gestures, break now
        if (gesturesArray.length == 0) return false;
        
        //map display name to SDK's
        var g_name = gesture_name.toLowerCase().replace(' ', '_');
        
        for (var g = 0; g<gesturesArray.length; g++){
            if (gesturesArray[g].name == g_name) {
                
                //return true if gesture started or in progress
                return (gesturesArray[g].state == intel.realsense.hand.GestureStateType.GESTURE_STATE_START || 
                        gesturesArray[g].state == intel.realsense.hand.GestureStateType.GESTURE_STATE_IN_PROGRESS);
                
            }
        }
        
        //if reach here, no gesture occurs
        return false;
    }
    
    
    
    //foldedness values: closed 0 - spread 100
    ext.getHandJointFoldedness = function (hand_side, finger_name) {
    
        var jointArray = [];
       
        //console.warn("hand joint ext "+leftHandJointsFoldness[1].jointName +" "+leftHandJointsFoldness[1].foldedness);
        //console.warn("hand side "+hand_side+" "+(hand_side == "Left Hand"));
        
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
          
        
        // console.warn("foldness "+ hand_side + " "+jointArray.length);
        
        for (var f=0; f<jointArray.length; f++){
            //console.warn("foldness "+jointArray[f].jointName+" "+jointArray[f].foldedness);
            if (jointArray[f].jointName == finger_name){
                return jointArray[f].foldedness;
            }
        }
        
        return -1;
    };
    
    //hand rotation
    ext.getHandRotation = function(rotation_type, hand_side){
        
        var jointArray = [];
        
        //get array of requested hand
        if (hand_side == 'Any Hand'){
            jointArray = rsd.HandModule.leftHandJoints;
            //jointArray.join(rsd.HandModule.rightHandJoints);
            
        } else {
            jointArray = { 'Left Hand' : rsd.HandModule.leftHandJoints, 
                           'Right Hand': rsd.HandModule.rightHandJoints }[hand_side];
        }
        
        
        var result = {};
        
        //joint_name is string variable from the menu
        for (var i = 0; i < jointArray.length; i++) {
            if (jointArray[i].jointName === "Wrist") {
                result = jointArray[i];
                break;
            }
        }
        
        
        
        if (result.rotation != undefined) {
            //return the right value
            if (rotation_type === "Rotation X") {
                return result.rotation.X;
               
            } else {
                if (rotation_type === "Rotation Y") {
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
        //QA TAG (Face module)
        //console.log('(getFaceJointPosition) *REQUESTED*  head position: ' + head_position + ', joint name: ' + joint_name);
        //end of QA TAG
         
        var result = {};
        
        //console.warn('(getFaceJointPosition) *REQUESTED*  head position: ' + head_position + ', joint name: ' + joint_name);
        //console.warn('(getFaceJointPosition) ' + (joint_name === parseInt(joint_name, 10)));
        
        
        
        
        if (joint_name === parseInt(joint_name, 10)) {
        //joint_name is integer variable
            for (var i = 0; i < rsd.FaceModule.joints.length; i++) {
                if (rsd.FaceModule.joints[i].originalJointIndex === joint_name) {
                    //console.warn("joint requested "+rsd.FaceModule.joints[i].originalJointIndex+" "+rsd.FaceModule.joints[i].jointName);
                    result = rsd.FaceModule.joints[i];
                    break;
                }
            }
            
        } else {
            
        //joint_name is string variable from the menu
            
            var j_name = "";
            for(var key in landmarkDictionary){
                if (key == joint_name){
                    j_name = landmarkDictionary[key];
                    break;
                }
            }
            
            
            for (var i = 0; i < rsd.FaceModule.joints.length; i++) {
                if (rsd.FaceModule.joints[i].jointName == j_name) {
                    //console.warn("joint requested "+rsd.FaceModule.joints[i].originalJointIndex+" "+rsd.FaceModule.joints[i].jointName);
                    result = rsd.FaceModule.joints[i];
                    break;
                }
            }
        }
        
        //return the right value
        if (head_position === "X Position") {
            // console.warn("face joint original value: "+result.jointPositionX);
            return ValueMapper(result.position.X, RS_FACE_X_MAX_LEFT, RS_FACE_X_MAX_RIGHT, SCRATCH_X_MAX_LEFT, SCRATCH_X_MAX_RIGHT);
        
        } else {
            if (head_position === "Y Position") {
                // console.warn("face joint original value: "+result.jointPositionY);
                return ValueMapper(result.position.Y, RS_FACE_Y_MAX_DOWN, RS_FACE_Y_MAX_UP, SCRATCH_Y_MAX_DOWN, SCRATCH_Y_MAX_UP);
           
            } else {
                return result.position.Z;
        
            }
        }
        
        return -1000;
    };
    
    
    ext.isFacialExpressionOccured = function (facial_expression) {
     
        for (var fe = 0; fe < rsd.FaceModule.expressions_this_frame.length; fe++){
            //console.log("hhhhh "+facial_expressions_this_frameArr[i]);
            
            if (rsd.FaceModule.expressions_this_frame[fe] == facial_expression){                
                return true;
                break;
            }
        }
        return false;
        
    };
    
    
    
    /*
    ext.getRecognizedSpeech = function() {
        return "";
    };
    
    ext.whenRecognizedSpeech = function(speech, callback) {
        window.setTimeout(function(){
            callback();
        }, 1000);
        return false;
    };

    */
    
    ext.getHeadRotation = function(rotation_type){
       
        if (rotation_type === "Rotation X"){
            return ValueMapper(rsd.FaceModule.headRotation.X, RS_FACE_ROTATION_MIN, RS_FACE_ROTATION_MAX, -100, 100);
           
        } else {
            if (rotation_type === "Rotation Y"){
                return ValueMapper(rsd.FaceModule.headRotation.Y, RS_FACE_ROTATION_MIN, RS_FACE_ROTATION_MAX, -100, 100);
           
            } else {
                return ValueMapper(rsd.FaceModule.headRotation.Z, RS_FACE_ROTATION_MIN, RS_FACE_ROTATION_MAX, -100, 100);
            
            }
        }
        return 0;    
    };
    
   
 
    
    var descriptor = {
        blocks: [
             ['b', 'Face visible?', 'isFaceExist', '']
            ,['r', '%m.position_value of %d.face_joints', 'getFaceJointPosition', 'X Position', 'Nose']
            ,['b', 'Face expression %m.facial_expressions?', 'isFacialExpressionOccured', 'Wink left']
            ,['r', '%m.rotation_value of Head', 'getHeadRotation', 'Rotation X']
            
        ,['-']
            ,['b', '%m.hand_type visible?', 'isHandExist', 'Any Hand']
            ,['r', '%m.position_value of %m.hand_type %d.hand_joints', 'getHandJointPosition', 'X Position', 'Any Hand', 'Index tip']
            ,['b', '%m.hand_type gesture %m.hand_gestures?', 'getHandGesture', 'Any Hand', 'V sign']
            ,['r', '%m.hand_type %m.major_joint_name foldedness amount', 'getHandJointFoldedness', 'Any Hand', 'Index']
           // ,['r', '%m.rotation_value of %m.hand_type', 'getHandRotation', 'Rotation X', 'Any Hand']
			
        ]
         
        , menus: {
            "hand_type": ["Left Hand", "Right Hand", "Any Hand"],
            "face_joints": ["Left eye", "Right eye", "Left eye brow", "Right eye brow", 
                            "Upper lip", "Bottom lip", "Nose", "Chin"],
            "hand_joints": ["Index tip", "Index base", "Index c", "Index jointB",
                            "Thumb tip", "Thumb base", "Thumb jointC", "Thumb jointB",
                            "Middle tip", "Middle base", "Middle jointC", "Middle jointB",
                            "Ring tip", "Ring base", "Ring jointC", "Ring jointB",
                            "Pinky tip", "Pinky base", "Pinky jointC", "Pinky jointB",
                            "Wrist", "Center"],
            "major_joint_name": ["Index", "Thumb", "Middle", "Ring", "Pinky"],
            "facial_expressions": ["Wink left", "Wink right" ,"Brow lifted left" ,"Brow lifted right" ,
                                   "Brow lowered left", "Brow lowered right", "Mouth open","Tongue out" ,                                                              "Smile", "Kiss", "Look down" ,"Look up", "Look left", "Look right"],
            "hand_gestures": ["Spread fingers", "V sign", "Full pinch",
                                "Two fingers pinch open", "Swipe down", "Swipe up", "Swipe left",
                                "Swipe right", "Tap", "Fist", "Thumb up", "Thumb down",
                                "Wave"],
            "rotation_value": ["Rotation X", "Rotation Y", "Rotation Z"],
            "position_value": ["X Position",  "Y Position",  "Z Position"]
        }
        
        , url: 'http://intel-realsense-extension-for-scratch.github.io/public/realsense-system-check.html'
    };
    
    ScratchExtensions.register('Intel RealSense', descriptor, ext);
    
})({});
