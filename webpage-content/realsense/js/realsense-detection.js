function ValidatePlatform() {
 
    $("#platform-runtime-missing").hide(0);
    $("#platform-ready").hide(0);
    $("#platform-runtime-download").hide(0);
    $("#platform-browser").hide(0);
    $("#platform-detection").show(0);
    

    // check platform compatibility
    intel.realsense.SenseManager.detectPlatform(['hand', 'face3d', 'voice', 'nuance_en_us_cnc'],['front']).then(function (info) {
     
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

    }).catch(function (error) {
        // console.warn('other unknown failure. '+ JSON.stringify(error));
        $("#platform-detection").show(0).delay(1000).hide(0);
        
        
    });
}


$(document).ready(function() {
    ValidatePlatform();
 
    $('#install-button').click(function() {        
        
        $("#platform-runtime-missing").show(0).delay(2000).hide(0);
        $("#platform-runtime-download").hide(0).delay(2000).show(500);
        
        //start download
        //debug version offline installer
        //window.location = "file:///\\jfspercbits001.amr.corp.intel.com\RS_Outgoing\erpaulso\Web_Offline_Drop\webapp_offline_do_not_distribute_6.0.21.4168.exe";
            
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