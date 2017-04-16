(function (ext) {
    
    //scratch stage mapping
    const RS_FACE_X_MAX_RIGHT = 0;    
    const RS_FACE_X_MAX_LEFT = 600;    
    const RS_FACE_Y_MAX_UP = 500;      
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
    

    function ValueMapper (value, source_min, source_max, dest_min, dest_max) {
       
        // Figure out range scales
        var sourceScale = source_max - source_min;
        var destScale = dest_max - dest_min;

        // Convert the source range into a 0-1 range (float)
        var normalizedSource = (value - source_min) / sourceScale;

        //Convert the 0-1 range into a value in the destination range.
        return dest_min + (normalizedSource * destScale);
       
   };
    
    
    //init dictionaries
    var FaceModule = function() {
        
        faceLandmarkDictionary = {   
                     "Left eye"         : 77
                    , "Right eye"       : 76
                    , "Left eye brow"   : 7
                    , "Right eye brow"  : 2
                    , "Chin"            : 61
                    , "Upper lip"       : 36
                    , "Bottom lip"      : 42
                    , "Nose"            : 29
                };
        expressionsDictionary = {
                    "Brow lifted right"     : 'EXPRESSION_BROW_RAISER_LEFT'
                    , "Brow lifted left"    : 'EXPRESSION_BROW_RAISER_LEFT'
                    , "Brow lowered left"   : 'EXPRESSION_BROW_LOWERER_LEFT'
                    , "Brow lowered right"  : 'EXPRESSION_BROW_LOWERER_RIGHT'
                    , "Smile"               : 'EXPRESSION_SMILE'
                    , "Kiss"                : 'EXPRESSION_KISS'
                    , "Mouth open"          : 'EXPRESSION_MOUTH_OPEN'
                    , "Wink left"           : 'EXPRESSION_EYES_CLOSED_LEFT'
                    , "Wink right"          : 'EXPRESSION_EYES_CLOSED_RIGHT'
                    , "Tongue out"          : 'EXPRESSION_TONGUE_OUT'
                };
        /*
        return {
            init: function() {
                this.expressionsDictionary = {
                    "Brow lifted right"     : 'EXPRESSION_BROW_RAISER_LEFT'
                    , "Brow lifted left"    : 'EXPRESSION_BROW_RAISER_LEFT'
                    , "Brow lowered left"   : 'EXPRESSION_BROW_LOWERER_LEFT'
                    , "Brow lowered right"  : 'EXPRESSION_BROW_LOWERER_RIGHT'
                    , "Smile"               : 'EXPRESSION_SMILE'
                    , "Kiss"                : 'EXPRESSION_KISS'
                    , "Mouth open"          : 'EXPRESSION_MOUTH_OPEN'
                    , "Wink left"           : 'EXPRESSION_EYES_CLOSED_LEFT'
                    , "Wink right"          : 'EXPRESSION_EYES_CLOSED_RIGHT'
                    , "Tongue out"          : 'EXPRESSION_TONGUE_OUT'
                };
                
                this.faceLandmarkDictionary = {   
                     "Left eye"         : 77
                    , "Right eye"       : 76
                    , "Left eye brow"   : 7
                    , "Right eye brow"  : 2
                    , "Chin"            : 61
                    , "Upper lip"       : 36
                    , "Bottom lip"      : 42
                    , "Nose"            : 29
                };
            }
        }*/
    };
    var HandModule = function() {
        return {
            init: function() {
                this.jointDictionary = {
                    "Wrist" : 0,		    /// The center of the wrist
                    "Center": 1,		/// The center of the palm
                    "Thumb base" : 2,	/// Thumb finger joint 1 (base)
                    "Thumb jointC" : 3,		/// Thumb finger joint 2
                    "Thumb jointB": 4,		/// Thumb finger joint 3
                    "Thumb tip" : 5,		/// Thumb finger joint 4 (fingertip)
                    "Index base": 6,	/// Index finger joint 1 (base)
                    "Index jointC" : 7,		/// Index finger joint 2
                    "Index jointB": 8,		/// Index finger joint 3
                    "Index tip"  : 9,		/// Index finger joint 4 (fingertip)
                    "Middle base" : 10,	/// Middle finger joint 1 (base)
                    "Middle jointC" : 11,	/// Middle finger joint 2
                    "Middle jointB" : 12,	/// Middle finger joint 3
                    "Middle tip": 13,	/// Middle finger joint 4 (fingertip)
                    "Ring base": 14,	/// Ring finger joint 1 (base)
                    "Ring jointC" : 15,		/// Ring finger joint 2
                    "Ring jointB": 16,		/// Ring finger joint 3
                    "Ring tip": 17,		/// Ring finger joint 4 (fingertip)
                    "Pinky base": 18,	/// Pinky finger joint 1 (base)
                    "Pinky jointC": 19,	/// Pinky finger joint 2
                    "Pinky jointB" : 20,	/// Pinky finger joint 3
                    "Pinky tip" : 21  	/// Pinky finger joint 4 (fingertip)
                };
                
                this.gestureDictionary = {
                    "Spread fingers": 'spreadfingers',
                    "V sign": 'v_sign',
                    "Full pinch": 'full_pinch',
                    "Two fingers pinch open": 'two_finger_pinch_open',
                    "Swipe": 'swipe', 
                    "Tap": 'tap', 
                    "Fist": 'fist', 
                    "Thumb up": 'thumb_up', 
                    "Thumb down": 'thumb_down', 
                    "Wave": 'wave' 
                };
            }
        }
    };
    
    
        
    var faceModule = new FaceModule();
    var handModule = new HandModule();
    window["faceModule"] = new FaceModule();
    
    //*************************************************
    
    
    ext.shouldContinue = true;
    var lst_update = (new Date).getTime();
    // Cleanup function when the extension is unloaded
    ext._shutdown = function () {
        //ext.shouldContinue = false;
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function () {
        console.log(lst_update + ", " + ((new Date).getTime() - lst_update));
        if ((new Date).getTime() - lst_update < 500)
            return { status: 2, msg: 'Ready!' };
        else
            return { status: 1, msg: 'Please start the desktop helper app' };
    };

    ext.tOut = null;

    window["pxcm"] = {};
    var extenstionSetup = function () {
        $.getJSON("http://localhost:25456/", function (e) {
            console.log("got pxcm");
            lst_update = (new Date).getTime();
            window["pxcm"] = e;
            if ("hands" in e) {
                var rh = null, lh = null;
                for (var i = 0; i < e["hands"].length; i++) {
                    if (e["hands"][i]["side"] == "BODY_SIDE_RIGHT") {
                        rh = e["hands"][i];
                    }
                    else
                        lh = e["hands"][i];
                }
                window["right_hand"] = rh;
                window["left_hand"] = lh;
                if (e["faces"].length == 0)
                    window["face"] = null;
                else
                    window["face"] = e["faces"][0];
            }
            if (ext.shouldContinue) setTimeout(a, 100);
        }).error(function () {
            if (ext.shouldContinue) setTimeout(a, 100);
        });
    };
    extenstionSetup();

    ext.face_visible = function () {
        return window["face"] ? true : false;
    };

    ext.face_position_landmark = function (axis, landmarkIndex) {
        if (!window["face"]) return 0;
        
        //console.error('requested face landmark: '+landmarkIndex);
        //console.error('is int or string: ' + parseInt(landmarkIndex, 10));
        console.error('faceModule: ' + window["faceModule"]);
        console.error('faceModule dict: ' + window["faceModule"].faceLandmarkDictionary);
        console.error('faceModule dict[0]: ' + window["faceModule"].faceLandmarkDictionary[0]);
        
        var requestedJointIndex = -1;
        //check if landmarkIndex is a number of a string
        if (landmarkIndex !== parseInt(landmarkIndex, 10)) {
            //joint_name is string variable from the menu
            for(var key in window["faceModule"].faceLandmarkDictionary){
                if (key == landmarkIndex){
                    requestedJointIndex = window["faceModule"].faceLandmarkDictionary[key];
                    break;
                }
            }
        } else {
            //joint_name is integer variable
            requestedJointIndex = landmarkIndex;
        }
        if (requestedJointIndex < 0) {
            //couldnt find requested joint 
            return -1000;
        }
        
        
        return window["face"]["landmarks"][requestedJointIndex]["position"][axis == 'X Position' ? 0 : (axis == 'Y Position' ? 1 : 2)];
    }

    ext.face_rotation = function (axis) {
        if (!window["face"]) return 0;
        return window["face"]["rotation"][axis == 'Roll' ? 0 : (axis == 'Pitch' ? 1 : 2)];
    }

    ext.face_expression = function (expression) {
        if (!window["face"]) return 0;
        
        var exp = "";
        for (var key in faceModule.expressionsDictionary){
            if (key == expression){
                exp = faceModule.expressionsDictionary[key];
                break;
            }
        }
        
        return (window["face"]["expressions"][exp] > 20);
    }

    ext.hand_visible = function (side) {
        if (side == 'Any Hand') return pxcm["hands"].length > 0;
        else if (side == 'Right Hand') return !!right_hand;
        else return !!left_hand;
    }

    ext.hand_position = function (side, axis) {
        var handObj;
        if (side == "Any Hand") handObj = right_hand || left_hand;
        else if (side == "Right Hand") handObj = right_hand;
        else handObj = left_hand;
        if (!handObj) return 0;
        return handObj["position"][axis == 'X Position' ? 0 : (axis == 'Y Position' ? 1 : 2)];
    }

    ext.hand_joint_position = function (axis, side, joint_name) {
        
        //get the requested joint index
        var requestedJointIndex = -1;
        if (joint_name !== parseInt(joint_name, 10)) {
            //joint_name is string variable from the menu
            for(var key in handModule.jointDictionary){
                if (key == joint_name){
                    requestedJointIndex = handModule.jointDictionary[key];
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
        
        var handObj;
        if (side == "Any Hand") handObj = (right_hand || left_hand)["joints"][requestedJointIndex];
        else if (side == "Right Hand") handObj = right_hand["joints"][requestedJointIndex];
        else handObj = left_hand["joints"][requestedJointIndex];
        if (!handObj) return 0;
        return handObj["position"][axis == 'X Position' ? 0 : (axis == 'Y Position' ? 1 : 2)];
    }

    ext.hand_gesture = function (side, gesture_name) {
        
        var gest = ''; 
        for(var key in handModule.gestureDictionary){
            if (key == gesture_name){
                gest = handModule.gestureDictionary[key];
                break; 
            }
        }
        
        var handObj;
        if (side == "Any Hand") handObj = right_hand || left_hand;
        else if (side == "Right Hand") handObj = right_hand;
        else handObj = left_hand;
        if (!handObj) return false;
        if (gest == handObj["gesture"]) return true;
        return false;
    }

    
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['b', 'face visible?', 'face_visible'],
            ['r', '%m.axis of %d.face_joints', 'face_position_landmark', 'X Position', 'Nose'],
            ['b', 'face expression %m.expression?', 'face_expression', 'Wink left'],
            ['r', '%m.angle rotation of head', 'face_rotation', 'Roll'],

            ['-'], ['-'],
            ['b', '%m.hand_type visible?', 'hand_visible', 'Any Hand'],
            ['r', '%m.axis of %m.hand_type %d.hand_joints', 'hand_joint_position', 'X Position', 'Any Hand', 'Index tip'],
            ['b', '%m.hand_type gesture %m.gesture?', 'hand_gesture', 'Any Hand', 'V sign'],
            ['r', '%m.axis of %m.hand_type', 'hand_position', 'X Position', 'Any Hand']
        ],
        
        menus: {
            'axis':         ['X Position',  'Y Position',  'Z Position'], 
            'face_joints':  [ 'Left eye', 'Right eye', 'Left eye brow', 'Right eye brow', 'Upper lip', 'Bottom lip', 'Nose', 'Chin' ],
            'expression': ['Wink left', 'Wink right' ,'Brow lifted left',  'Brow lifted right', 'Brow lowered left', 'Brow lowered right', 'Mouth open', 'Tongue out', 'Smile', 'Kiss'], 
            'angle':  ["Yaw", "Pitch", "Roll"],
            
            'gesture': ["Spread fingers", "V sign", "Full pinch", "Two fingers pinch open", "Swipe", "Tap", "Fist", "Thumb up", "Thumb down", "Wave" ],
            'hand_type':  ["Left Hand", "Right Hand", "Any Hand"],
            'hand_joints': ["Index tip", "Index base", "Index jointC", "Index jointB", "Thumb tip", "Thumb base", "Thumb jointC", "Thumb jointB",
            "Middle tip", "Middle base", "Middle jointC", "Middle jointB",
            "Ring tip", "Ring base", "Ring jointC", "Ring jointB", "Pinky tip", "Pinky base", "Pinky jointC", "Pinky jointB", "Wrist", "Center" ],
        }
        
        , url:    'http://www.intel.com/realsense/scratch'
    };

    
    // Register the extension
    ScratchExtensions.register('Intel RealSense', descriptor, ext);
})({});