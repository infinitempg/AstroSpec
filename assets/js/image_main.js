$(document).ready(function () {

 function closeAlerts(time) {
	time = (typeof time === "undefined") ? 0 : time;
	if ($("#clear-alert").length) {
	    $("#clear-alert").fadeTo(time,0,function() {
		this.remove();
	    });
	};
    };
    
    // If false after loop, display message
    var items = false;
    
    var keyList = ['1','2','3','4','5','6','7','Incandescent','Flourescent','Halogen','Sun'];
    for (var i = 0; i < keyList.length; ++i) {
	// If exists, display; else skip
	var key = "lamp-" + keyList[i];
	if (localStorage.getItem(key) === null) {
	    continue;
	}
	items = true;
	var value = JSON.parse(localStorage[key]);
	$("#nanoGallery").append('<a href="'+value+'" data-ngthumb="'+value+'">'+key+'</a>')
    }
    
    if (!items) {
	$("#nanoGallery").append('<div id="file-alert" class="alert alert-info alert-dismissable fade in" role="alert">\n		<button id="button-close" type="button" class="close" data-dismiss="alert">\n		  <span aria-hidden="true">&times;</span>\n		  <span class="sr-only">Close</span>\n		</button>\n		<h3><i class="fa fa-minus-circle"></i> No images found.  Return to <a href="index.html"><strong><i class="fa fa-dashboard"></i> Dashboard</strong></a> and save your spectra</h3>\n	      </div> <!-- /. ALERT -->\n');
    }
    
    else {
	jQuery("#nanoGallery").nanoGallery({
	    theme: 'light',
	    colorScheme: 'light',
	    colorSchemeViewer:'light',
	    thumbnailWidth: 'auto',
	    thumbnailHeight: 200,
	    thumbnailLabel: {
		display: true,
		position: 'overImageOnBottom'
	    },
	    thumbnailHoverEffect:'borderDarker,scale120'
	});

	// Show delete button
	$('#row-clear').removeClass('hidden');
    }

    //On clear-all press, prompt to clear
    $('#clear-all').on('click', function (event) {
	closeAlerts(0);
	$("#div-clear-alert").wrapInner('<div id="clear-alert" class="alert alert-danger alert-dismissable fade in" role="alert">\n		<button id="button-close" type="button" class="close" data-dismiss="alert">\n		  <span aria-hidden="true">&times;</span>\n		  <span class="sr-only">Delete</span>\n		</button>\n		<h3><i class="fa fa-exclamation-triangle"></i> Confirm Delete</h3>\n		<p>Pressing <strong><i class="fa fa-minus-circle"></i> Delete</strong> will erase all images in gallery.</p>\n		<p><button id="button-delete-all" type="button" class="btn btn-danger"><i class="fa fa-minus-circle"></i> Delete</button>\n		</p>	      </div> <!-- /. ALERT -->\n');

	// On delete, actually delete
	$('#button-delete-all').on('click', function (event) {
	    for (var i = 0; i < keyList.length; ++i) {
		var key = "lamp-" + keyList[i];
		if (localStorage.getItem(key) === null) {
		    continue;
		}
		localStorage.removeItem(key);
	    }
	    closeAlerts(0);
	location.reload();
	});
    });
});
