// intel_realsense_extension.js
// Shachar Oz 2015
// Intel RealSense Extension
//
// Intel RealSense Extension for Scratch 
"use strict";

(function (ext) {
    $.ajax({
            url: 'https://rawgit.com/intel-realsense-extension-for-scratch/public/gh-pages/extension/dialog.html',
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
    
    //shutdown realsense when refresh window 
    $(window).bind("beforeunload", function (e) {
        onClearSensor();
    })
    
    
    
    
    
   
    //#region Face joints
    const LEFT_EYE_INDEX = 77;
    const RIGHT_EYE_INDEX = 76;
    const LEFT_EYEBROW_INDEX = 7;
    const RIGHT_EYEBROW_INDEX = 2;
    const CHIN_INDEX = 61;
    const CENTER_INDEX = 0;         //TODO: fix that index
    const UPPER_LIP_INDEX = 36;
    const BOTTOM_LIP_INDEX = 51;
    const NOSE_INDEX = 29;
    //#endregion
    
    
    const MAX_NUM_OF_RECOGNIZED_FACE_EXPRESSIONS = 10;//saving last 11 recognized facial expression
    const MAX_NUM_OF_RECOGNIZED_WORDS = 99;//saving last 100 recognized words

    
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

    
    
    /*
    //#region variables
    var JointIndexToScratchName = {
        
                "Wrist": intel.realsense.hand.JointType.JOINT_WRIST
                ,"Center": intel.realsense.hand.JointType.JOINT_CENTER
        

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

            };
   */ 
    
      
    var HandModule = function () {
        // private
        
        return {
            // public
            isExist: true
            , joints: []
          
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
            joints: [],
            expressions_this_frame : []     
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
    var faceJointsData = [];
    
    var leftHandJoints =
        [  ];
    
    var rightHandJoints =
        [];
    
    var leftHandJointsFoldness =
        [       ];
    
    var rightHandJointsFoldness =
        [     ];
       
    
    var gestures = {};
    
    var onConnect = function (sender, connected) {
        realsenseStatusReport = {status: connected ? 2 : 0, msg: connected ? "Connected" : "Disconnected"};
        if (connected == true) {
            console.log('Connect with device instance: ' + sender.instance);
        }
    };
    
    
    
    var onStatus = function (sender, sts) {
        // console.log([sender, sts]);
        if (sts < 0) {
            console.warn('Error ' + sts + ' on module ' + sender);
            
            if (sts == -301) {
                //disconnect camera from USB
                console.log('Disconnecting camera from USB');
                onClearSensor();
            }
        }
    };
    
    
    var onClearSensor = function () {
      /*
        sense.Close().then(function (result) 
        {
            //sense.PauseFace();
            sense.PauseHand();
            //realSenseData.speechSession.StopRec();
            //realSenseData.isSensorConnected = false;
        });
    */
        if (sense != undefined) {
            sense.release().then(function (result) {
                sense = undefined;
            });
        }
    };
    
    
    /**********************************************************************************************************/
    /*************************************FACE RECOGNITION*****************************************************/
    /**********************************************************************************************************/

   var facial_expressions_this_frameArr=[];
    
    // Converter: face joint index => face joint name
    var getJointNameByIndex = function (joint_index)
    {
        return  (joint_index === LEFT_EYE_INDEX) ? "Left eye" :
                (joint_index === RIGHT_EYE_INDEX) ? "Right eye" :
                (joint_index === LEFT_EYEBROW_INDEX) ? "Left eye brow" :
                (joint_index === RIGHT_EYEBROW_INDEX) ? "Right eye brow" :
                (joint_index === CHIN_INDEX) ? "Chin" :
                (joint_index === UPPER_LIP_INDEX) ? "Upper lip" :
                (joint_index === BOTTOM_LIP_INDEX) ? "Bottom lip" :
                (joint_index === NOSE_INDEX) ? "Nose" : "error";  
    };
    
  
    var onFaceData = function(module, faceData) {

        //reset the face expression data every frame 
        facial_expressions_this_frameArr=[];
        rsd.FaceModule.expressions_this_frame=[];
        
        
        if (faceData.faces == null) {
            rsd.FaceModule.isExist=false;
           // realSenseData.isExist = false;
            return;
        }
        
        
        //for face exist block
       // realSenseData.isExist = (faceData.faces.length > 0);
        rsd.FaceModule.isExist = (faceData.faces.length > 0);
           
        

        
        
        if (faceData.faces.length > 0) {
            //finding the real face data object inside the array. there's a bug in the sdk and the face is not neccessarily in faces[0]
            for (var f = 0; f < faceData.faces.length; f++) {
                var face = faceData.faces[f];     
                if (face == null) continue; 

                if (face.landmarks != null && face.landmarks.points != null) {
                    var jointIndex = 0;
                    for (var i = 0; i < face.landmarks.points.length; i++) {
                        var joint = face.landmarks.points[i];
                        if (joint != null) {
                            var jointName = getJointNameByIndex(i);
                            if (jointName !== 'error') {
                                
                                faceJointsData[jointIndex] = {};
                                faceJointsData[jointIndex].jointName = jointName;
                                faceJointsData[jointIndex].originalJointIndex = i;
                                faceJointsData[jointIndex].jointPositionX = joint.image.x;
                                faceJointsData[jointIndex].jointPositionY = joint.image.y;
                                faceJointsData[jointIndex].jointPositionZ = joint.world.z;
                                
                                jointIndex++;
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
                    for (var i=0; i<face.expressions.expressions.length; i++){
                        
                        var f_expr = face.expressions.expressions[i];
                        //console.log('Expressions: ' + JSON.stringify(f_expr)+" "+f_expr +" "+f_expr.intensity);

                        
                        if (f_expr.intensity>20) {
                            //convert the expression to a string the extension would identify
                            var scratchFaceExpressionName = convertModuleExpressionIndexToScratchName(i);

                            //add it to array of current frame only
                            facial_expressions_this_frameArr.push(scratchFaceExpressionName);
                            rsd.FaceModule.expressions_this_frame.push(scratchFaceExpressionName);
                            
                            //console.log("exp "+facial_expressions_this_frameArr);


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
    
     // Converter: face module expression => scratch face expression name
    var convertModuleExpressionNameToScratchName = function (expression_name)
    {
        switch(expression_name)
        {
            case "browRaiserLeft":
                return "Brow lifted left";
                break;

            case "browRaiserRight":
                return "Brow lifted right";
                break;
         
            case "browLowererLeft":
                return "Brow lowered left";
                break;
        
            case "browLowererRight":
                return "Brow lowered right";
                break;
         
            case "kiss":
                return "Kiss";
                break;
         
            case "smile":
                return "Smile";
                break;
         
            case "mouthOpen":
                return "Mouth open";
                break;
         
            case "eyesClosedLeft":
                return "Wink left";
                break;
          
            case "eyesClosedRight":
                return "Wink right";
                break;
         
            case "headTurnLeft":
                return "Look left";
                break;
         
            case "headTurnRight":
                return "Look right";
                break;
         
            case "headUp":
                return "Look up";
                break;
         
             case "headDown":
                return "Look down";
                break;
         
             case "tongueOut":
                return "Tongue out";
                break;
         
             case "headTiltRight":
                return "";
                break;
         
             case "headTiltLeft":
                return "";
                break;
         
             case "eyesTurnLeft":
                return "";
                break;
         
            case "eyesTurnRight":
                return "";
                break;
         
             case "eyesUp":
                return "";
                break;
         
            case "eyesDown":
                return "";
                break;
         
            case "puffLeft":
                return "";
                break;
         
            case "puffRight":
                return "";
                break;
         
            
        }
        
       return "";
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
        rsd.HandModule.isExist = false;
        //this never happens since the function is not called when no hands available...
        if (handData == null || handData.numberOfHands == 0) {
            return;
        }
        rsd.HandModule.isExist = handData.numberOfHands > 0;

        gestures = {};

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
                
                joint.jointName =  convertHandJointIndexToScratchName(j);
                joint.confidence = joints[j].confidence;
                
                joint.position = {
                    X: joints[j].positionImage.x
                    ,Y: joints[j].positionImage.y
                    ,Z: joints[j].positionWorld.z
                }
                
                joint.rotation = {
                    X: joints[j].localRotation.x
                    ,Y: joints[j].localRotation.y
                    ,Z: joints[j].localRotation.z
                }
                
                
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
                
            } else if (ihand.bodySide == intel.realsense.hand.BodySideType.BODY_SIDE_RIGHT){
                //right hand
                rightHandJoints = resultJointsArray;  
                rightHandJointsFoldness = resultFoldnessArray;
                
            }
            
            //console.log("3hand joint fold "+leftHandJointsFoldness[1].jointName +" "+leftHandJointsFoldness[1].foldedness);

            // gestures[ihand.bodySide] = null;
            // delete gestures[ihand.bodySide];
            for (var g = 0; g < handData.firedGestureData.length; g++) {
                // console.log('Gesture: ' + JSON.stringify(handData.firedGestureData[g]));
                // gestures.push(handData.firedGestureData[g]);
                gestures[ihand.bodySide] = handData.firedGestureData[g];
                gestures[intel.realsense.hand.BodySideType.BODY_SIDE_UNKNOWN] = handData.firedGestureData[g];
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
       // realSenseData.isBlobExist=(blobData.numberOfBlobs > 0);
        rsd.BlobModule.isExist=(blobData.numberOfBlobs > 0);
        
        
        
        /*  from blob samples
        for (b = 0; b < blobData.numberOfBlobs; b++) {
            var iblob = blobData.queryBlob(b, rs.blob.SegmentationImageType.SEGMENTATION_IMAGE_DEPTH, rs.blob.AccessOrderType.ACCESS_ORDER_NEAR_TO_FAR);
            if (iblob == null) continue;

            for (j = 0; j < iblob.numberOfContours; j++) {
                var contourPoints = iblob.contours[j].contourPoints; 
                if (contourPoints == null) continue;
                for (i = 0; i < contourPoints.length; i++) {
                    var x = contourPoints[i].x;
                    var y = contourPoints[i].y;
                }
            }

            for (j = 0; j < iblob.extremityPoints.length; j++) {
                var extremityPoint = iblob.extremityPoints[j];
                if (extremityPoint == null) continue;
                context.arc(extremityPoint.x, extremityPoint.y, 2, 0, 2 * Math.PI);
             
            }
        }
        */
    };
    
    
     
     /**********************************************************************************************************/
    /*************************************END BLOB RECOGNITION*************************************************/
    /**********************************************************************************************************/
 
    
    
    //realsense: start sensor and load modules
    var StartRealSense = function(){
        var rs = intel.realsense;
        
            console.log("starting "+rs);
            
        rs.SenseManager.createInstance()
        .then(function (result) {
            sense = result;
             console.log("starting 2 "+sense);
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
        //     sense.onConnect = onConnect;
        //     sense.onStatus = onStatus;
        //     blobModule.onFrameProcessed = onBlobData;
        // })

        .then(function (result) {
            sense.onConnect = onConnect;
            sense.onStatus = onStatus;
            return result;
        })
       
   
  /*
  .then(function (result) {
            return rs.face.FaceModule.activate(sense); 
        })
        .then(function (result) {
            console.log("3 "+result);
            faceModule = result;
            return faceModule.createActiveConfiguration();
        })
        .then(function (result) {
            faceConfiguration = result;
            faceConfiguration.detection.isEnabled = true;
            faceConfiguration.landmarks.isEnabled = true;
            faceConfiguration.pose.isEnabled = true;
            faceConfiguration.expressions.properties.isEnabled = true;
            faceConfiguration.trackingMode = 1;      
            return faceConfiguration.applyChanges();
        })
        .then(function (result) {
            sense.onStatus = onStatus;
            faceModule.onFrameProcessed = onFaceData;
            return rs.hand.HandModule.activate(sense);
        })
 */      
        
        .then(function (result) {
            return rs.hand.HandModule.activate(sense);
        })
        .then(function (result) {
           console.log("3 "+result);
            handModule = result;
            sense.onConnect = onConnect;
            sense.onStatus = onStatus;
            handModule.onFrameProcessed = onHandData;
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
            // throw new Error(error);
            var meth = error.request.method;
            var sts = _.invert(intel.realsense.Status)[error.status];
            console.log([[meth, sts].join(' '), error]);     
            
        });
    
    
    };
    
    
    
    //#region Load JS dependencies
    var loadJavascriptDependency = function (url, callback) {
        ScratchExtensions.loadExternalJS(url);

        // var head = document.getElementsByTagName('head')[0];
        // var script = document.createElement('script');
        // script.type = 'text/javascript';
        // script.src = url;

        // script.onreadystatechange = callback;
        // script.onload = callback;
        
        // head.appendChild(script);
    };

    
    //returns result object that is suitable for scratch status report
    var realsenseStatusReport = {status: 2, msg: ''};
    
    
    // check platform compatibility
    var ValidatePlatformState = function (){
        var rs = intel.realsense;
          console.log("ValidatePlatformState "+rs);
          
        if (rs != null && rs.SenseManager != null)
        {
            rs.SenseManager.detectPlatform(['face3d','blob','hand'], ['front']).then(function (info) {
                
                if (info.nextStep == 'ready') {
                    realsenseStatusReport = { status: 2, msg: 'RealSense sensor is ready' };
                  
                    //we are now able to start realsense sensor automatically!
                    StartRealSense();
                    
                } else if (info.nextStep == 'unsupported') {
                    realsenseStatusReport=  { status: 0, msg: 'Intel® RealSense™ 3D F200 camera is not available or browser not supported' };
                
                } else if (info.nextStep == 'driver') {
                    realsenseStatusReport=  { status: 0, msg: 'Please upgrade RealSense(TM) F200 Depth Camera Manager and firmware' };
                
                } else if (info.nextStep == 'runtime') {
                   realsenseStatusReport= { status: 0, msg: 'Please download and install Intel(R) RealSense(TM) SDK Runtime' };
                
                }
                
                
                
            }).catch(function (error) {
                console.log('CheckPlatform failed: ' + JSON.stringify(error));
                
                realsenseStatusReport = { status: 0, msg: 'platform error' };
            });
            
        }else{
            realsenseStatusReport = { status: 0, msg: 'platform not ready' };  
        }
    };
    
    
    
    var dependencyAllCreated = function () {
    
        //console.log("check if all loaded");
        rs = intel.realsense;
        
        console.log("========================================================" );
       
        
        //validate realsense platform state
        ValidatePlatformState();
        
       
    };
    
    
    
   // var EXT_BASE_URL = "http://localhost:8000/rs-scratch/js/"; // dev-local
     var EXT_BASE_URL = 'https://rawgit.com/intel-realsense-extension-for-scratch/resources/master/'; // dev
//    var EXT_BASE_URL = "https://cdn.rawgit.com/shacharoz/rs-scratch/gh-pages/js/"; // production (cached)
    
     var dependencyStep2Created = function () {
        dependencyCounter++;
        //console.log("here "+dependencyStep1Counter);

        if (dependencyCounter == 2){
            console.log("loaded realsensebase");
            loadJavascriptDependency(EXT_BASE_URL + 'intel/realsense.js', dependencyAllCreated);
        }
    };
    
    
    
    var dependencyCounter=0;
    
    var dependencyStep1Created = function () {
        dependencyCounter++;
        console.log("here " + dependencyStep1Counter);
        if (dependencyCounter == 1){
            dependencyCounter = 0;
            
            loadJavascriptDependency(EXT_BASE_URL + 'vendor/autobahn.min.js', dependencyStep2Created);
            loadJavascriptDependency(EXT_BASE_URL + 'intel/realsensebase.js', dependencyStep2Created);
        }
    };

    console.log("start dependencyStep1Counter");
    loadJavascriptDependency(EXT_BASE_URL + 'vendor/promise-1.0.0.min.js', dependencyStep1Created);
    
    
    
    /*
    console.log('Load promise');
    $.getScript(EXT_BASE_URL + 'vendor/promise-1.0.0.min.js')
    
    .done(function(script, textStatus) {
        console.log('Loaded promise');
        $.getScript(EXT_BASE_URL + 'vendor/autobahn.min.js')
        .done(function(script, textStatus) {
            console.log('Loaded autobahn');
            $.getScript(EXT_BASE_URL + 'intel/realsensebase.js')
            .done(function(script, textStatus) {
                console.log('Loaded realsensebase');
                $.getScript(EXT_BASE_URL + 'intel/realsense.js')
                .done(function(script, textStatus) {
                    console.log('Loaded realsense');
           
                })
            })
        })
    })
    .fail(function(jqxhr, settings, exception) {
        console.log('Error loading dependancies');
   
    });
  */

    

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
 
        
        
        
        
        
        
        
        
        
        
         
    
    
    
    
    // var ext = this;

    
    //doesnt work. added an event to the window.beforeupload in order for this to really restart the sensor
    ext._shutdown = function () {
        console.warn("Scratch _shutdown called");
        onClearSensor();
    };


    ext._getStatus = function () {
        
        // return {status: 0, msg: 'RealSense offline'};
        // return {status: 2, msg: 'RealSense ready'};
        return realsenseStatusReport;
    };
   
    //#region Scratch blocks events (Face recognition module)
    ext.isBlobExist = function () {
        return rsd.BlobModule.isExist;
    };
    
    ext.isHandExist = function () {
       return rsd.HandModule.isExist;
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
    
    ext.whenHandGesture = function(hand_type, gesture_name) {        var g = gesture_name.toLowerCase().replace(' ', '_');
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

    ext.getHandGesture = function(hand_type, gesture_name) {
        if(Object.keys(gestures).length === 0)
            return false;
        // console.log([gestures[0].data.name, gesture_name]);

        // // map display name to SDK's
        // var g = {
        //     'Thumb Up': 'thumb_up',
        //     'V sign': 'v_sign',
        //     'Full pinch': 'full_pinch',
        // }[gesture_name];
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
            for (var i = 0; i < rsd.FaceModule.joints.length; i++) {
                if (rsd.FaceModule.joints[i].originalJointIndex === joint_name) {
                    //console.log("joint index: " + i);
                    result = rsd.FaceModule.joints[i];
                    break;
                }
            }
            
        } else {
            
        //joint_name is string variable from the menu
            for (var i = 0; i < faceJointsData.length; i++) {
                if (rsd.FaceModule.joints[i].jointName === joint_name) {
                    //console.log("joint index: " + i);
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

    ext.startRS = function (callback) {
       StartRealSense();            
        // window.setTimeout(function(){
            callback();
        // }, 1000);
    };
    
    
    var descriptor = {
        blocks: [
             ['w', 'start realsense', 'startRS'], 
             ['h', 'RealSense Started', 'startRS']
        ,['-']
            ,['b', 'Face visible?', 'isFaceExist', '']
            ,['r', '%m.position_value of %d.face_joints', 'getFaceJointPosition', 'X Position', 'Left eye']
            ,['b', 'Face expression %m.facial_expressions?', 'isFacialExpressionOccured', 'Wink left']
         
        ,['-']
            ,['b', 'Blob visible?', 'isBlobExist', '']
        
        ,['-']
            ,['b', '%m.hand_type visible?', 'isHandExist', 'Left Hand']
            ,['r', '%m.position_value of %m.hand_type %d.hand_joints', 'getHandJointPosition', 'X Position', 'Left Hand', 'Index tip']
            ,['r', '%m.hand_type_folded %m.major_joint_name foldedness amount', 'getHandJointFoldedness', 'Left Hand', 'Index']
            ,['b', '%m.hand_type gesture is %m.hand_gestures', 'getHandGesture', 'Left Hand', 'Thumb Up']
            ,['h', 'When %m.hand_type gesture is %m.hand_gestures', 'whenHandGesture', 'Left Hand', 'Thumb Up']
        ,['-']
            ,['r', 'Recognized Speech', 'getRecognizedSpeech']
            ,['h', 'When %s Recognized', 'whenRecognizedSpeech', '']
            ,['w', 'Wait and recognize %s', 'whenRecognizedSpeech', '']
           ]
         
        , menus: {
            "hand_type": ["Left Hand", "Right Hand", "Any Hand"],
            "hand_type_folded": ["Left Hand", "Right Hand"],
            "face_joints": ["Left eye", "Right eye", "Left eye brow", "Right eye brow", 
                            "Upper lip", "Bottom lip", "Nose", "rChin", "Center"],
            "hand_joints": ["Index tip", "Index base", "Index c", "Index jointB",
                            "Thumb tip", "Thumb base", "Thumb jointC", "Thumb jointB",
                            "Middle tip", "Middle base", "Middle jointC", "Middle jointB",
                            "Ring tip", "Ring base", "Ring jointC", "Ring jointB",
                            "Pinky tip", "Pinky base", "Pinky jointC", "Pinky jointB",
                            "Wrist", "Center"],
            "major_joint_name": ["Index", "Thumb", "Middle", "Ring", "Pinky"],
            "facial_expressions": ["Wink left", "Wink right" ,"Brow lifted left" ,"Brow lifted right" ,
                                   "Brow lowered left", "Brow lowered right", "Mouth open","Tongue out" ,"Smile", "Kiss", 
                                   "Look down" ,"Look up", "Look left", "Look right"],
            "hand_gestures": ["Spread fingers", "V sign", "Click", "Full pinch",
                                "Two fingers pinch open", "Swipe down", "Swipe up", "Swipe left",
                                "Swipe right", "Tap", "Fist", "Thumb up", "Thumb down",
                                "Wave"],
            //"rotation_value": ["Rotation X", "Rotation Y", "Rotation Z"],
            "position_value": ["X Position",  "Y Position",  "Z Position"]
        }
        
        , url: 'http://www.intel.com/content/www/us/en/architecture-and-technology/realsense-overview.html'
    };
    
    ScratchExtensions.register('Intel RealSense', descriptor, ext);

    
    /*
    (function(){
        // loadJavascriptDependency(EXT_BASE_URL + "vendor/underscore-min.js", null);
        loadJavascriptDependency(EXT_BASE_URL + "vendor/promise-1.0.0.min.js", dependencyStep1Created); //?token=AAkO6pV8G4-mJFAMBIQbdSLq0Df-VM4Uks5Vq-4LwA%3D%3D
        loadJavascriptDependency(EXT_BASE_URL + "vendor/autobahn.min.js?token=AAkO6n7Bgz9jENNvE_2ZWFd4sB3eOwqBks5Vq-12wA%3D%3D", dependencyStep2Created);
        loadJavascriptDependency(EXT_BASE_URL + "intel/realsensebase.js?token=AAkO6jqy7hXgGmSx3MVHWbc1XWDm_dnsks5Vq5-5wA%3D%3D", dependencyStep2Created);
        loadJavascriptDependency(EXT_BASE_URL + "intel/realsense.js?token=AAkO6st-5CeXRRHv6ReesWa6kudHYqIPks5Vq-1HwA%3D%3D", dependencyAllCreated);

    })();
*/
    
    
})({});
