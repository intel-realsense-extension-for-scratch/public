function ValidatePlatform() {
 
    $("#platform-runtime-missing").hide(0);
    $("#platform-ready").hide(0);
    $("#platform-runtime-download").hide(0);
    $("#platform-browser").hide(0);
    $("#platform-driver").hide(0);
    $("#platform-detection-error").hide(0);
    $("#platform-detection").show(0);
    

    // check platform compatibility
   // intel.realsense.SenseManager.detectPlatform(['hand', 'face3d', 'voice', 'nuance_en_us_cnc'],['front'])
    intel.realsense.SenseManager.detectPlatform(['face3d', 'hand'], ['f200'])
   
    .then(function (info) {
     
        console.warn("detect platform result: isCameraReady: "+ info.isCameraReady
                     + " isDCMUpdateNeeded: "+info.isDCMUpdateNeeded
                     + " isRuntimeInstalled: "+info.isRuntimeInstalled 
                     + " isCheckNeeded: "+info.isCheckNeeded); 
        
        //ready (doesnt sense connection to usb)
        //isCameraReady: true isDCMUpdateNeeded: false isRuntimeInstalled: true isCheckNeeded: false
        
        //0. info.isCheckNeeded = true     - there was an error during the detection
        //1. info.isCameraReady = false    - when no sensor available / no dcm installed at all (rear or front)
        //2. info.isDCMUpdateNeeded = true - when installed DCM version is not updated (rear or front)
        //3. info.isRuntimeInstalled =false- when no runtime installed
        
        
        if (info.isCheckNeeded==true)
        {
            console.warn("info.isCheckNeeded true. please restart your pc");
            
            $("#platform-detection").show(0).delay(1000).hide(0);
            $("#platform-detection-error").hide(0).delay(1000).show(0);
                
        } else {
            if (info.isCameraReady==false){
                console.warn("info.isCameraReady false. no sensor detected on this machine. please install DCM");
                
                $("#platform-detection").show(0).delay(1000).hide(0);
                $("#platform-driver").hide(0).delay(1000).show(0);
                
            }
            
            if (info.isDCMUpdateNeeded==true){
                console.warn("info.isDCMUpdateNeeded true. DCM out of date. please update DCM");
                
                $("#platform-detection").show(0).delay(1000).hide(0);
                $("#platform-driver").hide(0).delay(1000).show(0);
            }
            
            if (info.isRuntimeInstalled==false){
                console.warn("info.isRuntimeInstalled false. please install runtime");
                
                $("#platform-detection").show(0).delay(1000).hide(0);
                $("#platform-runtime-missing").hide(0).delay(1000).show(0); 
           
            }
        }
        
        /*
        
        
        if (info.nextStep == 'ready') {
            // good to go
            // console.log("realsense good");
           
            
            $("#platform-detection").show(0).delay(1000).hide(0);
            $("#platform-ready").hide(0).delay(1000).show(0);
            
        }
        else if (info.nextStep == 'unsupported') {
            //console.warn('Platform is not supported for Intel(R) RealSense(TM) SDK: either you are missing the required camera, or your OS and browser are not supported ');
            $("#platform-detection").show(0).delay(1000).hide(0);
            $("#platform-browser").hide(0).delay(1000).show(0);
            
        } else if (info.nextStep == 'driver') {
           // console.warn('Please upgrade RealSense(TM) Depth Camera Manager (DCM) and firmware before running the application  http://www.intel.com/realsense ');
            $("#platform-detection").show(0).delay(1000).hide(0);
            $("#platform-dcm-missing").hide(0).delay(1000).show(0); 
            
        } else if (info.nextStep == 'runtime') {
            //console.warn('please download and install runtime exe');
            $("#platform-detection").show(0).delay(1000).hide(0);
            $("#platform-runtime-missing").hide(0).delay(1000).show(0); 
           
        }
*/
        
        
    }).catch(function (error) {
        // console.warn('other unknown failure. '+ JSON.stringify(error));
        $("#platform-detection").show(0).delay(1000).hide(0);
        $("#platform-detection-error").hide(0).delay(1000).show(0);
        
        
    });
}




$(document).ready(function() {
    ValidatePlatform();
 
    $('#install-button').click(function() {        
        
        $("#platform-runtime-missing").show(0).delay(2000).hide(0);
        $("#platform-runtime-download").hide(0).delay(2000).show(500);
        
        //start download
        window.location = "http://registrationcenter-download.intel.com/akdlm/irc_nas/7787/intel_rs_sdk_runtime_webapp_6.0.21.6598.exe";
    });
    
    
    //checkboxes
    $('#age-checkbox').checkboxpicker();
    $('#age-checkbox').change(function() {
        if ($('#age-checkbox').prop('checked') == true){
            $('#install-button').removeProp('disabled');
        } else {
            $('#install-button').prop('disabled', 'disabled');
        }
    });
    
});