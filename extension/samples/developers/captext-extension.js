(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready to go, folks!'};
    };
	
	ext.captimg = function (callback) {
		$.ajax({
			url: "http://localhost:18058",
			type: "GET",
			success: function(e)
			{
				callback(1);
			},
			error: function(a,b,c) {callback(0);}
		});
	}

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
			["w", "Capture image!", "captimg"]
        ]
    };

    // Register the extension
    ScratchExtensions.register('Capture extension', descriptor, ext);
})({});