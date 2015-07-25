// intel_realsense_extension.js
// Shachar Oz , Omer Goshen 2015
// Intel RealSense Extension
//
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
    const RS_FACE_X_MAX_RIGHT = 150;    //MIRRORED!!!!!
    const RS_FACE_X_MAX_LEFT = 1800;    //MIRRORED!!!!!
    const RS_FACE_Y_MAX_UP = 1000;      //MIRRORED!!!!!
    const RS_FACE_Y_MAX_DOWN = 0;       //MIRRORED!!!!!
 
    const RS_HAND_X_MAX_RIGHT = -100;
    const RS_HAND_X_MAX_LEFT = 700;
    const RS_HAND_Y_MAX_UP = 400;
    const RS_HAND_Y_MAX_DOWN = -100;

    const SCRATCH_X_MAX_RIGHT = 240;    //MIRRORED!!!!!
    const SCRATCH_X_MAX_LEFT = -240;    //MIRRORED!!!!!
    const SCRATCH_Y_MAX_UP = -180;      //MIRRORED!!!!!
    const SCRATCH_Y_MAX_DOWN = 180;     //MIRRORED!!!!!
    //#endregion

    //#endregion

    
    
      
    var HandModule = function () {
        // private
        
       return {
            // public
            isRightExist: false
            , isLeftExist: false
            , joints: []  //array doesnt populate!
          
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
            isExist: true,
            joints: [ ],                 //array doesnt populate!
            expressions_this_frame : [ ] //array doesnt populate!  
        }
    };
    
      var BlobModule = function () {
        // private
        
        return {
            // public
            isExist: true
            
        }
    };
    
    var RealSenseData = function() {
        return {
            HandModule: new HandModule(),
            FaceModule: new FaceModule(),            
            BlobModule: new BlobModule()
        }
    };
    
    var rsd = new RealSenseData();
    
    
    
    
    // Saving name & positions x/y/z
    //   of every face joint that we track (see Face joints region above) 
    var faceJointsData = [ ];
    
    var leftHandJoints = [ ];
    
    var rightHandJoints = [ ];
    
    var leftHandJointsFoldness = [ ];
    
    var rightHandJointsFoldness = [ ];
       
    var gestures = { };
    
    
    
    var onConnect = function (sender, connected) {
        
        if (connected == true) {
            console.log('Connect with device instance: ' + sender.instance);
            
            
            //only after sense.init() and onDeviceConnected we know the sensor
            //console.log(' device info: ' + JSON.stringify( sender.deviceInfo));
            
            if (sender.deviceInfo.model == rs.DeviceModel.DEVICE_MODEL_R200 ||
                sender.deviceInfo.orientation == rs.DeviceOrientation.DEVICE_ORIENTATION_WORLD_FACING ) {
                realsenseStatusReport = { status: 0, msg: 'This extension supports only F200 Intel Realsense 3D Sensor.' };
                
                PopAlert();
            }
            
           
            
        } else {
            console.warn('sensor not connected');
            realsenseStatusReport = {status: 0, msg: 'Realsense sensor not connected'};
            
            PopAlert();
        }
    };
    
    var onStatus = function (sender, sts) {
        // console.log([sender, sts]);
        if (sts < 0) {
            console.warn('Error ' + sts + ' on module ' + sender);
            
            // No error on USB disconnect or reconnect from SDK
            if (sts == -301) {
                console.warn('Disconnecting camera from USB');
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

    var facial_expressions_this_frameArr = [];
    
    // Converter: face joint index => face joint name
    var getJointNameByIndex = function (joint_index)
    {
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
    };
    
  
    var onFaceHandData = function (sender, data) {
       // console.log("onFaceHandData: ");
        
        if (sender == faceModule)
            onFaceData(sender, data);
        else if (sender == handModule)
            onHandData(sender, data); 
    };
    
    
    var onFaceData = function(module, faceData) {
        console.log("onFaceData: ");
        
        //reset the face expression data every frame 
        //rsd.FaceModule.expressions_this_frame=[];
        
        faceJointsData=[];
        rsd.FaceModule.joints=[];
        
        if (faceData.faces == null || faceData.faces.length == 0) {
            rsd.FaceModule.isExist = false;
            return;
        }
        
        
        //for face exist block
        rsd.FaceModule.isExist = (faceData.faces.length > 0);
           
        

        console.log("onFaceData: "+ faceData.faces.length);
        
        
        if (faceData.faces.length > 0) {
           
            for (var f = 0; f < faceData.faces.length; f++) {
                var face = faceData.faces[f];
                
    //for face joints block
                if (face.landmarks.points !== undefined) {
                    var jointIndex = 0;
               
                    // console.log("onFaceData landmarks.points: "+ face.landmarks.points.length);
        
                    for (var i = 0; i < face.landmarks.points.length; i++) {
                        var joint = face.landmarks.points[i];
                        if (joint != null) {
                            var jointName = getJointNameByIndex(i);
                            if (jointName !== 'error') {
                                
                                var faceJoint = {};
                                faceJoint.jointName = jointName;
                                faceJoint.originalJointIndex = i;
                                faceJoint.position = {
                                     X: joint.image.x
                                    ,Y: joint.image.y
                                    ,Z: joint.world.z
                                };
                                
                                console.log("face1: "+ faceJoint+" "+ faceJoint.position +" "+ faceJoint.position.Z);
                                
                                console.log("face2 faceJointsData before "+faceJointsData.length);
                                
                                faceJointsData.push(faceJoint);
                                rsd.FaceModule.joints.push(faceJoint);
                                
                                console.log("face3 faceJointsData after "+faceJointsData.length);
                                console.log("face4 faceJointsData pos "+faceJointsData[0].position);
                                
                                console.log("face5 rsd.FaceModule.joints after "+rsd.FaceModule.joints.length);
                                
                            }
                        }
                    } 
                    //QA TAG
                    //console.log("(onFaceData) face Joints Data: " + JSON.stringify(faceJointsData));
                    //end of QA TAG
                }
                
  
                if (face.expressions !== null && face.expressions.expressions != null) {
                    // console.log('Expressions: ' + JSON.stringify(face.expressions.expressions));
                    
                    //go through all keys in expression object
                    for (var fe=0; fe<face.expressions.expressions.length; fe++){
                        
                        var f_expr = face.expressions.expressions[fe];
                        console.log('Expressions: ' + JSON.stringify(f_expr)+" "+f_expr +" "+f_expr.intensity);

                        
                        if (f_expr.intensity>20) {
                            //convert the expression to a string the extension would identify
                            var scratchFaceExpressionName = convertModuleExpressionIndexToScratchName(fe);

                            //add it to array of current frame only
                            //facial_expressions_this_frameArr.push(scratchFaceExpressionName);
                            //rsd.FaceModule.expressions_this_frame.push(scratchFaceExpressionName);
                            
                            console.log("exp1 "+f_expr);
                            //console.log("exp2 "+rsd.FaceModule.expressions_this_frame);


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
        }
    };
    
    
    
    
    var convertModuleExpressionIndexToScratchName = function (expression_index)
    {
     
        switch(expression_index)
        {
            case 0:
                return "Brow lifted left";
                break;

            case 1:
                return "Brow lifted right";
                break;
         
            case 2:
                return "Brow lowered left";
                break;
        
            case 3:
                return "Brow lowered right";
                break;
         
            case 4:
                return "Smile";
                break;
         
            case 5:
                return "Kiss";
                break;
         
            case 6:
                return "Mouth open";
                break;
         
            case 7:
                return "Wink left";
                break;
          
            case 8:
                return "Wink right";
                break;
         
            case 9:
                return "Look left";
                break;
         
            case 10:
                return "Look right";
                break;
         
            case 11:
                return "Look up";
                break;
         
             case 12:
                return "Look down";
                break;
         
            case 13: //EXPRESSION_HEAD_TILT_LEFT
                return "";
                break;
         
            case 14: //EXPRESSION_HEAD_TILT_RIGHT
                return "";
                break;
         
            case 15: //EXPRESSION_EYES_TURN_LEFT
                return "";
                break;
         
            case 16: //EXPRESSION_EYES_TURN_RIGHT
                return "";
                break;
         
            case 17: //EXPRESSION_EYES_UP
                return "";
                break;
         
            case 18: //EXPRESSION_EYES_DOWN
                return "";
                break;
         
            case 19:
                return "Tongue out";
                break;
   
            case 20: //EXPRESSION_PUFF_RIGHT
                return "";
                break;
         
            case 21: //EXPRESSION_PUFF_LEFT
                return "";
                break;
         
            
        }
        
       return "";
    };
    
    /**********************************************************************************************************/
    /*************************************END FACE RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
     /**********************************************************************************************************/
    /*************************************HAND RECOGNITION*****************************************************/
    /**********************************************************************************************************/

    
                                      
    var onHandData = function (module, handData) {
        
        //reset all data 
        rsd.HandModule.isRightExist = false;
        rsd.HandModule.isLeftExist = false;
        
        gestures = {};

        leftHandJoints=[];
        rightHandJoints=[];
        
        leftHandJointsFoldness=[];
        rightHandJointsFoldness=[];
        
        if (handData.numberOfHands == 0) {
            return;
        }
        
        
        
        //start collecting
        
        var allHandsData = handData.queryHandData(intel.realsense.hand.AccessOrderType.ACCESS_ORDER_NEAR_TO_FAR);
        for (var h = 0; h < handData.numberOfHands; h++) {
            var ihand = allHandsData[h];
            
            var resultJointsArray = [];
            
            var joints = ihand.trackedJoints;
            
            for (var j = 0; j < joints.length; j++) {
            //    console.log("hands data check "+ j+" "+joints[j]+ " "+joints[j].positionWorld.z);
            
                if (joints[j] == null || joints[j].confidence <= 0) continue;

                var joint = {};
                joint.originalJointIndex = j;
                joint.jointName = convertHandJointIndexToScratchName(j);
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
                
                
                resultJointsArray.push(joint);
            }
            
            
//get foldness data
            var resultFoldnessArray = [];
            for (var i = 0; i < ihand.fingerData.length; i++) {
                //console.log("left fold" + i + ": " + JSON.stringify(hand.fingerData[i].foldedness));
                
                var majorJoint = {};
                majorJoint.originalJointIndex = i;
                majorJoint.jointName = convertHandJointMajorIndexToScratchName(i);
                majorJoint.foldedness = ihand.fingerData[i].foldedness;
                
                resultFoldnessArray.push(majorJoint);
            }

            // console.log("hand joint fold "+resultFoldnessArray[1].jointName +" "+resultFoldnessArray[1].foldedness);
            //console.log("hand joint side "+(ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_LEFT));
            //console.log("hand joint index x "+resultJointsArray[5].position.Z);
            //console.log("hand side "+ihand.bodySide+" "+intel.realsense.hand.BodySideType.BODY_SIDE_LEFT);
            
            
            
           // console.log(" sdfsdf "+ leftHandJoints.length);
            
            if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_LEFT){
                //left hand
                leftHandJoints = resultJointsArray;
                leftHandJointsFoldness = resultFoldnessArray;
                rsd.HandModule.isLeftExist = true;
        
            } else if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_RIGHT){
                //right hand
                rightHandJoints = resultJointsArray;  
                rightHandJointsFoldness = resultFoldnessArray;
                
                rsd.HandModule.isRightExist = true;
        
            }   
            
            //console.log("3hand joint fold "+leftHandJointsFoldness[1].jointName +" "+leftHandJointsFoldness[1].foldedness);

            
            
            
            
            
//hand gestures block
            console.warn("gestures "+handData.firedGestureData.length);
            
            if (handData.firedGestureData.length>0){
                console.warn("  handData.firedGestureData  ");
                console.warn(JSON.stringify(handData.firedGestureData[0]));
                
            }
            
            
            
            // Gesture: {"timeStamp":130822251414152420,"handId":1,"state":2,"frameNumber":596,"name":"thumb_up"}
            
            /*
            
            {"timeStamp":130822268755799980,"handId":6,"state":0,"frameNumber":2066,"name":"full_pinch"}
intel_realsense_extension.js:547   handData.firedGestureData  
intel_realsense_extension.js:548 {"timeStamp":130822268765390400,"handId":6,"state":2,"frameNumber":2092,"name":"full_pinch"}
intel_realsense_extension.js:547   handData.firedGestureData  
intel_realsense_extension.js:548 {"timeStamp":130822268782358050,"handId":6,"state":0,"frameNumber":2138,"name":"full_pinch"}
intel_realsense_extension.js:547   handData.firedGestureData  
intel_realsense_extension.js:548 {"timeStamp":130822268782726910,"handId":6,"state":2,"frameNumber":2139,"name":"full_pinch"}
intel_realsense_extension.js:547   handData.firedGestureData  
intel_realsense_extension.js:548 {"timeStamp":130822268828096930,"handId":6,"state":0,"frameNumber":2262,"name":"fist"}
intel_realsense_extension.js:547   handData.firedGestureData  
intel_realsense_extension.js:548 {"timeStamp":130822268828465800,"handId":6,"state":0,"frameNumber":2263,"name":"full_pinch"}
intel_realsense_extension.js:547   handData.firedGestureData  
intel_realsense_extension.js:548 {"timeStamp":130822268848015460,"handId":6,"state":2,"frameNumber":2316,"name":"fist"}

*/
            for (g = 0; g < handData.firedGestureData.length; g++) {
                
                var gesture= handData.firedGestureData[g];
                
                console.log("gestures "+gesture);
                console.log("gestures "+gesture.state+ " "+gesture.name);
            
                
                if (gesture.state==intel.realsense.hand.GestureStateType.GESTURE_STATE_START || 
                    gesture.state==intel.realsense.hand.GestureStateType.GESTURE_STATE_IN_PROGRESS){
                    
                    // console.log('Gesture: ' + JSON.stringify(handData.firedGestureData[g]));
                    gestures[ihand.bodySide] = gesture;
                    gestures[intel.realsense.hand.BodySideType.BODY_SIDE_UNKNOWN] = gesture;
                }
            }
        }
        
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
                return "";
                break;
        }
        
        return "";
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
              return "";
              break;
              
      }
        return "";
    };

    
     /**********************************************************************************************************/
    /*************************************BLOB RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
    
    
    var onBlobData = function (module, blobData) {
        
        rsd.BlobModule.isExist=false;
        if (blobData == null) return;
         
        //for blob exist block
        rsd.BlobModule.isExist=(blobData.numberOfBlobs > 0);
        
    };
    
    
     
     /**********************************************************************************************************/
    /*************************************END BLOB RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
    
    //realsense: start sensor and load modules
    var StartRealSense = function(){
        var rs = intel.realsense;
                    
        rs.SenseManager.createInstance()
        .then(function (result) {
            sense = result;
            return result;
        })
        
        
        
        // .then(function (result) {
        //     return rs.blob.BlobModule.activate(sense);
        // })
        // .then(function (result) {
        //     blobModule = result;
        //     return blobModule.createActiveConfiguration();
        // })
        // .then(function (result) {
        //     blobConfiguration = result;
        //     blobConfiguration.maxBlobs = rs.blob.MAX_NUMBER_OF_BLOBS; 
        //     return blobConfiguration.applyChanges();
        // })
        // .then(function (result) {
        //     blobModule.onFrameProcessed = onBlobData;
        // })

        
   
  
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
            var meth = error.request.method;
            var sts = _.invert(intel.realsense.Status)[error.status];
            console.log([[meth, sts].join(' '), error]);     
            
            
            
            //if sensor not connected to usb - it gets here
            //other option: sensor is already running somewhere else on the web
            realsenseStatusReport = { status: 1, msg: 'Please Connect your Intel Realsense Sensor to USB and refresh page' };
        });
    
    
        
        
        
        //speech module init
        
        
    };
    
    
    
    
    //returns result object that is suitable for scratch status report
    var realsenseStatusReport = {status: 1, msg: 'checking system...'};
    
    
    // check platform compatibility
    var ValidatePlatformState = function (){
        var rs = intel.realsense;
          console.log("ValidatePlatformState");
          
        if (rs != null && rs.SenseManager != null)
        {
            rs.SenseManager.detectPlatform(['face3d','hand','blob'], ['f200'])
                
            .then(function (info) {
                
                console.warn("Error detectPlatform: isCameraReady "+info.isCameraReady+ " isDCMUpdateNeeded:  "+info.isDCMUpdateNeeded+" isRuntimeInstalled: "+info.isRuntimeInstalled);
                
                
                if (info.nextStep == 'ready') {
                    realsenseStatusReport = { status: 2, msg: 'RealSense sensor is ready' };
                    
                    //we are now able to start realsense sensor automatically!
                    StartRealSense();
                    
                } else if (info.nextStep == 'unsupported') {
                    //unsupported called when DCM not installed OR when browser is too old OR .......
                    realsenseStatusReport = { status: 0, msg: 'Intel® RealSense™ 3D F200 camera is not available or browser not supported' };
                
                } else if (info.nextStep == 'driver') {
                    //driver called when DCM is too old and should be upgraded
                    realsenseStatusReport = { status: 0, msg: 'Please upgrade RealSense(TM) F200 Depth Camera Manager and firmware' };
                
                } else if (info.nextStep == 'runtime') {
                    //runtime called when runtime needs to be installed
                    realsenseStatusReport = { status: 0, msg: 'Please download and install Intel(R) RealSense(TM) SDK Runtime' };
                
                }
                
                PopAlert();
                
            }).catch(function (error) {
                console.log('CheckPlatform failed: ' + JSON.stringify(error));
                
                realsenseStatusReport = { status: 0, msg: 'platform error' };
                
                PopAlert();
            });
            
        }else{
            realsenseStatusReport = { status: 0, msg: 'platform not ready' };  
            
            PopAlert();
        }
        
        
        
        
    };
    
    var PopAlert = function() {
            
        if (realsenseStatusReport.status == 0) {
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
        return realsenseStatusReport;
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
        
        var jointArray = {'Left Hand': leftHandJoints, 'Right Hand': rightHandJoints}[hand_side];
        
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
    
    ext.getHandGesture = function(hand_type, gesture_name) {
        
        if(Object.keys(gestures).length === 0)
            return false;
        
        // // map display name to SDK's
        var g = gesture_name.toLowerCase().replace(' ', '_');
        console.log([hand_type, gesture_name, g]);
        var h = {
            "Left Hand": intel.realsense.hand.BodySideType.BODY_SIDE_LEFT,
            "Right Hand": intel.realsense.hand.BodySideType.BODY_SIDE_RIGHT,
            "Any Hand": intel.realsense.hand.BodySideType.BODY_SIDE_UNKNOWN,
        }[hand_type];

        return h in gestures && gestures[h].name == g;
    }
    
    
    
    //foldedness values: closed 0 - spread 100
    ext.getHandJointFoldedness = function (hand_side, finger_name) {
    
        var jointArray = [];
       
        //console.warn("hand joint ext "+leftHandJointsFoldness[1].jointName +" "+leftHandJointsFoldness[1].foldedness);
        //console.warn("hand side "+hand_side+" "+(hand_side == "Left Hand"));
        
        var jointArray = {'Left Hand': leftHandJointsFoldness, 'Right Hand': rightHandJointsFoldness}[hand_side];
        
        // console.warn("foldness "+ hand_side + " "+jointArray.length);
        
        for (var f=0; f<jointArray.length; f++){
            //console.warn("foldness "+jointArray[f].jointName+" "+jointArray[f].foldedness);
            if (jointArray[f].jointName == finger_name){
                return jointArray[f].foldedness;
            }
        }
        
        return -1;
    };
    
    
    
    
    ext.isFaceExist = function () {
       
        return rsd.FaceModule.isExist;
    };
    
     
    ext.getFaceJointPosition = function (head_position, joint_name) {
        //QA TAG (Face module)
        //console.log('(getFaceJointPosition) *REQUESTED*  head position: ' + head_position + ', joint name: ' + joint_name);
        //end of QA TAG
         
        var result = {};
        
        if (joint_name === parseInt(joint_name, 10)) {
        //joint_name is integer variable
            for (var i = 0; i < faceJointsData.length; i++) {
                if (faceJointsData[i].originalJointIndex === joint_name) {
                    //console.log("joint index: " + i);
                    result = faceJointsData[i];
                    break;
                }
            }
            
        } else {
            
        //joint_name is string variable from the menu
            for (var i = 0; i < faceJointsData.length; i++) {
                if (faceJointsData[i].jointName === joint_name) {
                    //console.log("joint index: " + i);
                    result = faceJointsData[i];
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
     
        for (var i = 0; i < rsd.FaceModule.expressions_this_frame.length; i++){
            //console.log("hhhhh "+facial_expressions_this_frameArr[i]);
            
            if (rsd.FaceModule.expressions_this_frame[i] == facial_expression){                
                return true;
                break;
            }
        }
        return false;
        
    };
    
    ext.getRecognizedSpeech = function() {
        return "";
    };
    
    ext.whenRecognizedSpeech = function(speech, callback) {
        window.setTimeout(function(){
            callback();
        }, 1000);
        return false;
    };

    
    
    var descriptor = {
        blocks: [
            ['b', 'Face visible?', 'isFaceExist', '']
            ,['r', '%m.position_value of %d.face_joints', 'getFaceJointPosition', 'X Position', 'Left eye']
            ,['b', 'Face expression %m.facial_expressions?', 'isFacialExpressionOccured', 'Wink left']
     
        ,['-']
            ,['b', '%m.hand_type visible?', 'isHandExist', 'Left Hand']
            ,['r', '%m.position_value of %m.hand_type %d.hand_joints', 'getHandJointPosition', 'X Position', 'Left Hand', 'Index tip']
            ,['b', '%m.hand_type gesture %m.hand_gestures?', 'getHandGesture', 'Left Hand', 'Thumb Up']
            ,['r', '%m.hand_type_folded %m.major_joint_name foldedness amount', 'getHandJointFoldedness', 'Left Hand', 'Index']
      
        ]
         
        , menus: {
            "hand_type": ["Left Hand", "Right Hand", "Any Hand"],
            "hand_type_folded": ["Left Hand", "Right Hand"],
            "face_joints": ["Left eye", "Right eye", "Left eye brow", "Right eye brow", 
                            "Upper lip", "Bottom lip", "Nose", "Chin", "Center"],
            "hand_joints": ["Index tip", "Index base", "Index c", "Index jointB",
                            "Thumb tip", "Thumb base", "Thumb jointC", "Thumb jointB",
                            "Middle tip", "Middle base", "Middle jointC", "Middle jointB",
                            "Ring tip", "Ring base", "Ring jointC", "Ring jointB",
                            "Pinky tip", "Pinky base", "Pinky jointC", "Pinky jointB",
                            "Wrist", "Center"],
            "major_joint_name": ["Index", "Thumb", "Middle", "Ring", "Pinky"],
            "facial_expressions": ["Wink left", "Wink right" ,"Brow lifted left" ,"Brow lifted right" ,
                                   "Brow lowered left", "Brow lowered right", "Mouth open","Tongue out" ,                                       "Smile", "Kiss", 
                                   "Look down" ,"Look up", "Look left", "Look right"],
            "hand_gestures": ["Spread fingers", "V sign", "Click", "Full pinch",
                                "Two fingers pinch open", "Swipe down", "Swipe up", "Swipe left",
                                "Swipe right", "Tap", "Fist", "Thumb up", "Thumb down",
                                "Wave"],
            //"rotation_value": ["Rotation X", "Rotation Y", "Rotation Z"],
            "position_value": ["X Position",  "Y Position",  "Z Position"]
        }
        
        , url: 'http://intel-realsense-extension-for-scratch.github.io/public/realsense-system-check.html'
    };
    
    ScratchExtensions.register('Intel RealSense', descriptor, ext);
    
})({});
