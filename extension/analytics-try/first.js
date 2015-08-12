

$.getScript('http://intel-realsense-extension-for-scratch.github.io/public/extension/analytics.js')
    .done(function(script, textStatus) {

        dependencyAllCreated();

})
    .fail(function(jqxhr, settings, exception) {
        console.log('Load fails');
});

function dependencyAllCreated(){
     console.log('Load success');  
}