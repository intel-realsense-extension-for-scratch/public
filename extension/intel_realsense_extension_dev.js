/*******************************************************************************
INTEL CORPORATION PROPRIETARY INFORMATION
This software is supplied under the terms of a license agreement or nondisclosure
agreement with Intel Corporation and may not be copied or disclosed except in
accordance with the terms of that agreement
@licence Copyright(c) 2014-2015 Intel Corporation. All Rights Reserved.
*******************************************************************************/



// intel_realsense_extension.js
// Shachar Oz , Omer Goshen
// 2015
// Intel RealSense Extension for Scratch 
// version 2.0

// http://scratchx.org/?url=http://intel-realsense-extension-for-scratch.github.io/public/extension/intel_realsense_extension_dev.js&version=2.5

"use strict";

(function (ext) {
    
//find the version we want to give the user
    var resultExtensionUrl= 'http://intel-realsense-extension-for-scratch.github.io/public/extension/';
    
    var urlParams = new URLSearchParams(window.location.search);
    
    if ( urlParams.has('version') )
    {
        resultExtensionUrl += 'development/realsense-extension-api-v' + urlParams.get('version') + '.js';
    }
    else 
    {
        //give public version
        resultExtensionUrl += 'realsense-extension-api-v2.0.js';
    }
        
        
    var impl;
    
    
    $.getScript(resultExtensionUrl)
    .done(function(script, textStatus) {

        loadingAPIFinished(script, textStatus);
        impl = window.RealSenseExtImpl;

    })
    .fail(function(jqxhr, settings, exception) {
        console.log('Load realsense fail');
    });


    
    
    var loadingAPIFinished = function(script, textStatus) {
         console.log('loadingAPIFinished '+ script +' '+ textStatus);
    };
    
    
    var onConnect = function (sender, connected) {
        
        if(impl.onConnect !== undefined)
            return impl.onConnect(sender, connected);
        
        return false;
    };
    
    
    var onStatus = function (sender, sts) {
        if(impl && impl.onStatus)
            return impl.onStatus(sender, sts);
        return 0;
    };
    
    
    
    
        
        
        
        
        
        
        
        
        
         
    
    
    //shutdown realsense when refresh window 
    $(window).bind("beforeunload", function (e) {
        onClearSensor();
    });
    
    
    // works in scratchX not in scratch. added an event to the window.beforeupload in order for this to really restart the sensor
    ext._shutdown = function () {
        console.warn("Scratch _shutdown called");
        if(impl.onClearSensor !== undefined)
            return impl.onClearSensor();
    };


    ext._getStatus = function () {
        if(impl && impl.scratchStatus)
            return impl && impl.scratchStatus();
        
        return 0;
    };
   
    
    // Scratch blocks events
    ext.isBlobExist = function () {
        if(impl.isBlobExist !== undefined)
            return impl.isBlobExist();
        
        return false;
    };
    
    
    ext.isHandExist = function (hand_side) {
        if(impl.isHandExist !== undefined)
            return impl.isHandExist();
        
        return false;
    };
    
    
    ext.getHandJointPosition = function (hand_position, hand_side, joint_name) {       
        if(impl.getHandJointPosition !== undefined)
            return impl.getHandJointPosition(hand_position, hand_side, joint_name);
        
        return 0;
    };
    

    
    ext.getHandGesture = function(hand_side, gesture_name) {
       if(impl.getHandGesture !== undefined)
            return impl.getHandGesture(hand_side, gesture_name);
        
        return false;
    }
    
    
    
    //foldedness values: closed 0 - spread 100
    ext.getHandJointFoldedness = function (hand_side, finger_name) {
        if(impl.getHandJointFoldedness !== undefined)
            return impl.getHandJointFoldedness(hand_side, finger_name);
        
        return 0;
    };
    
    //hand rotation
    ext.getHandRotation = function(rotation_type, hand_side) {
        if(impl.getHandRotation !== undefined)
            return impl.getHandRotation(rotation_type, hand_side);
        
        return 0;
    };
    
    
    
    
    ext.isFaceExist = function () {
        if(impl.isFaceExist !== undefined)
            return impl.isFaceExist();
        
        return false;
    };
    
     
    ext.getFaceJointPosition = function (head_position, joint_name) {
        if(impl.getFaceJointPosition !== undefined)
            return impl.getFaceJointPosition(head_position, joint_name);
        
        return 0;
    };
    
    
    ext.isFacialExpressionOccured = function (facial_expression) {
        if(impl.isFacialExpressionOccured !== undefined)
            return impl.isFacialExpressionOccured(facial_expression);
        
        return false;
        
    };
    
    
    
    
    ext.getHeadRotation = function(rotation_type) {
        if(impl.getHeadRotation !== undefined)
            return impl.getHeadRotation(rotation_type);
        
        return 0;   
    };
    
    
    
    
    
    
    
    ext.getRecognizedSpeech = function() {
        if(impl.getRecognizedSpeech !== undefined)
            return impl.getRecognizedSpeech();
        
        return "";
    };

    
    ext.hasUserSaid = function (word) {
        if(impl.hasUserSaid !== undefined)
            return impl.hasUserSaid(word);
        
        return false;
    };
    
    
    ext.hasUserSaidAnything = function() {
        if(impl.hasUserSaidAnything !== undefined)
            return impl.hasUserSaidAnything();
        
        return false;
        
    };
    
    
    
    
    var descriptor = {
        blocks: [
             ['b', 'face visible?', 'isFaceExist', '']
            ,['r', '%m.position_value of %d.face_joints', 'getFaceJointPosition', 'X Position', 'Nose']
            ,['b', 'face expression %m.facial_expressions?', 'isFacialExpressionOccured', 'Wink left']
            ,['r', '%m.rotation_value rotation of Head', 'getHeadRotation', 'Yaw']
            
        ,['-']
            ,['b', '%m.hand_type visible?', 'isHandExist', 'Any Hand']
            ,['r', '%m.position_value of %m.hand_type %d.hand_joints', 'getHandJointPosition', 'X Position', 'Any Hand', 'Index tip']
            ,['b', '%m.hand_type gesture %m.hand_gestures?', 'getHandGesture', 'Any Hand', 'V sign']
            ,['r', '%m.hand_type %m.major_joint_name foldedness amount', 'getHandJointFoldedness', 'Any Hand', 'Index']
           // ,['r', '%m.rotation_value of %m.hand_type', 'getHandRotation', 'Rotation X', 'Any Hand']
/*    
        ,['-']
            ,['b', 'user said %s?', 'hasUserSaid', 'Hello']
            ,['b', 'user said anything?', 'hasUserSaidAnything']
            ,['r', 'last word user said', 'getRecognizedSpeech']
*/  
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
                                     "Brow lowered right", "Mouth open", 
                                     "Tongue out", "Smile", "Kiss"],
            "hand_gestures":        [ "Spread fingers", "V sign", "Full pinch",
                                    "Two fingers pinch open", "Swipe down", "Swipe up", 
                                    "Swipe left", "Swipe right", "Tap", "Fist", "Thumb up", 
                                    "Thumb down", "Wave" ],
            "rotation_value":       [ "Yaw", "Pitch", "Roll" ],
            "position_value":       [ "X Position",  "Y Position",  "Z Position" ],
        }
        
        , url:                      'http://www.intel.com/realsense/scratch'
    };
    
    ScratchExtensions.register('Intel RealSense', descriptor, ext);
    
})
({});