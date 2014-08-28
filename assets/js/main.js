$(function () {
    /* Global coordinates for cropping */
    var trueW = 0;
    var trueH = 0;
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    var w = 0;
    var h = 0;

    var jcrop_api;
    var restorable = false;
    var graph;

    function updateCoords(c) {
	x1 = c.x;
	y1 = c.y;
	x2 = c.x2;
	y2 = c.y2;
	w = c.w;
	h = c.h;
    };

    function undoCoords() {
	x1 = 0;
	y1 = 0;
	x2 = 0;
	y2 = 0;
	w = 0;
	h = 0;
    };

    function closeAlerts(time) {
	time = (typeof time === "undefined") ? 0 : time;
	if ($("#file-alert").length) {
	    $("#file-alert").fadeTo(time,0,function() {
		this.remove();
	    });
	};
    };

    function incrementBadge() {
	var badge = $('.badge');
	var val = parseInt(badge.html());
	badge.html(val+1);
    };

    /* On file select, load image */
    $('#file-input').on('change', function (event) {
	event.preventDefault();
	closeAlerts();
	e = event.originalEvent;
	var target = e.dataTransfer || e.target;
	var file = target && target.files && target.files[0];



	// If file is invalid, don't change anything
	if (!file) {
	    return;
	}
	
	var img = $('#SpecImage');
	
	// if img exists, delete jcrop
	if (img[0].src) {
	    if (jcrop_api) {
		jcrop_api.destroy();
	    };
	    img.css("max-height","");
	    img.css("height","");
	    $('CanInvis').removeClass("active-canvas");
	};

	// Spawn file reader
	var fr = new FileReader();
	fr.onload = function(event2) {
	    // Create temp image to get true coordinates
	    var tempIMG = new Image();
	    tempIMG.onload = function() {
		trueW = tempIMG.width;
		trueH = tempIMG.height;

		// Replace img src with new data
		img.attr('src',event2.target.result);

		// Save to local storage
		localStorage['origImg'] = JSON.stringify(event2.target.result);

		img.Jcrop({
		    bgOpacity: 0.5,
		    bgColor: 'white',
		    addClass: 'jcrop-light',
		    trueSize:[trueW,trueH],
		    onChange: updateCoords,
		    onSelect: updateCoords,
		    onRelease: undoCoords
		}, function(){
		    jcrop_api = this;
		});
	    };
	    tempIMG.src = event2.target.result;
	};
	
	// On fr load, send data url to SpecImage
	fr.readAsDataURL(file);
	restorable = true;
    });

    /* On Crop click, replace with strip */
    $('#crop').on('click', function (event) {
	event.preventDefault();
	closeAlerts(600);
	var img = $('#SpecImage')[0];
	
	// If coords are zero, crop is inactive
	if ((w == 0) && (h == 0)) {
	    return;
	}

	// Create canvas
	var canvas = $('#CanInvis')[0];
	$('#CanInvis').addClass("active-canvas");
	canvas.width=w;
	canvas.height=h;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img,x1,y1,w,h,0,0,w,h);
	// Get new img src
	var newImgSrc = canvas.toDataURL();
	// Save to local storage
	//localStorage['cropImg'] = JSON.stringify(newImgSrc);

	// Reset img
	jcrop_api.destroy();

	// Create temp image to get true coordinates
	var tempIMG = new Image();
	tempIMG.onload = function() {
	    var img = $('#SpecImage');

	    // Set height to static size
	    img.css("max-height","100px");
	    img.attr('src',newImgSrc);
	    
	    img.Jcrop({
		bgOpacity: 0.5,
		bgColor: 'white',
		addClass: 'jcrop-light',
	        trueSize:[tempIMG.width,tempIMG.height],
		onChange: updateCoords,
		onSelect: updateCoords,
		onRelease: undoCoords
	    }, function(){
		jcrop_api = this;
		

	    });
	   
	};
	tempIMG.src = newImgSrc;
	// Force coord reset upon completion
	undoCoords();

	// Reset spectrum
	if (graph) {
	    $('#morris-line-chart').find("svg").remove();
	};
	graph = false;
    });



    /* On Restore click, replace with origImg */
    $('#restore').on('click', function (event) {
	event.preventDefault();
	closeAlerts(0);
	var img = $('#SpecImage');
	var oldIMGsrc = JSON.parse(localStorage['origImg']);
	
	if (!restorable) {
	    return;
	}

	// Reset img
	if (jcrop_api) {
	    jcrop_api.destroy();
	}
	$('#CanInvis').removeClass("active-canvas");

	// Reset spectrum
	if (graph) {
	    $('#morris-line-chart').find("svg").remove();
	};
	graph = false;
	
	// Create temp image to get true coordinates
	var tempIMG = new Image();
	tempIMG.onload = function() {
	    trueW = tempIMG.width;
	    trueH = tempIMG.height;

	    // Replace img src with old data
	    img.attr('src',oldIMGsrc);
	    img.css("max-height","");
	    img.css("height","");

	    img.Jcrop({
		bgOpacity: 0.5,
		bgColor: 'white',
		addClass: 'jcrop-light',
		trueSize:[trueW,trueH],
		onChange: updateCoords,
		onSelect: updateCoords,
		onRelease: undoCoords
	    }, function(){
		jcrop_api = this;
	    });
	};
	tempIMG.src = oldIMGsrc;
    });
	
    /* On Spectrum click, generate Spectrum */
    $('#spectrum').on('click', function (event) {
	event.preventDefault();
	closeAlerts(600);

	if (!$('#CanInvis').hasClass("active-canvas")) {
	    return;
	};
	// Get canvas data
	var canvas = $('#CanInvis')[0]; 
	var ctx = canvas.getContext("2d");
	imW = canvas.width,
	imH = canvas.height;
	var imgd = ctx.getImageData(0,0,imW,imH);
	var pix = imgd.data;

	// collapse RGB to 1D map of all pixels
	var allPix = new Array(pix.length/4);
	for (var i = 0,j=0; i < pix.length-2; i+=4,j++) {
	    allPix[j] = 0.3*pix[i]+0.59*pix[i+1]+0.11*pix[i+2];
	}
	
	
	// Preallocate zero-ed array to spectrum
	/*
	  var spectrum = Array.apply(null, new Array(imW)).map(Number.prototype.valueOf,0);
	  
	  // Sum along columns
	  for (var i = 0; i < imH; i++) {
	  for (var j = 0; j < imW; j++) {
	  spectrum[j] += allPix[i*imW+j]
	  }
	  }
	*/
	
	// Make array of arrays
	var spectrum = new Array(imW)
	for (var i = 0; i < spectrum.length; i++)
	    spectrum[i] = new Array(imH);
	
	
	// Median along columns
	for (var j = 0; j < imW; j++) {
	    for (var i = 0; i < imH; i++) {
		spectrum[j][i] = allPix[i*imW+j];
	    }
	    spectrum[j] = median(spectrum[j]);
	}
	
	var data = [];
	for (var i = 0; i < imW; i++) {
	    data.push({
		x:i,
		y:spectrum[i]
	    });
	}
	
	// if graph exists, just update
	if (graph) {
	    graph.setData(data);
	}
	
	else {
	    graph = Morris.Line({
		element: 'morris-line-chart',
		data: data,
		xkey:'x',
		ykeys: ['y'],
		hideHover: 'always',
		resize: false,
		parseTime:false,
		smooth:false,
		pointSize:0,
		grid:true,
		xLabels:"",
		yLabels:"",
		axes:false,
		lineWidth:5
            });
	}
    });

    /* On Save click, save to localStorage */
    $('#save').on('click', function (event) {
	event.preventDefault();
	closeAlerts(0);

	// If no canvas, image not ready
	if (!$('#CanInvis').hasClass("active-canvas")) {
	    return;
	};

	// If no graph, spectrum not ready
	if (!graph) {
	    return;
	};

	// Spectral image
	var img = $('#SpecImage')[0];
	var imgW = img.width;
	var imgH = img.height;
	// Create graph from SVG
	var spec = $('#morris-line-chart').find('svg')[0];
	var svg_xml = (new XMLSerializer()).serializeToString(spec);
	var specW = spec.width.animVal.value;
	var specH = spec.height.animVal.value;

	// Build new canvas
	var canvas = document.createElement("canvas");
	canvas.width = specW;//((specW < imgW) ? imgW : specW);
	canvas.height = specH + 100;//imgH;  hard-coded 100px
	var context = canvas.getContext("2d");
	// Set background white
	context.fillStyle = '#FFFFFF';
	context.fillRect(0,0,canvas.width,canvas.height);
	
	// Draw image, rescaled to width of graph
	context.drawImage(img,0,0,specW,100);
	
	// Draw spectrum
	context.drawSvg(svg_xml,0,100);

	// Get value of lamp
	var selected = document.getElementById("lampselect");
        var selectedValue = selected.options[selected.selectedIndex].value;
	
	// Save image
	var key = 'lamp-'+selectedValue;
	var value = JSON.stringify(canvas.toDataURL());

	// If already stored, throw alert
	if (localStorage.getItem(key) != null) {
	    $("#div-file-alert").wrapInner('<div id="file-alert" class="alert alert-danger alert-dismissable fade in" role="alert">\n		<button id="button-close" type="button" class="close" data-dismiss="alert">\n		  <span aria-hidden="true">&times;</span>\n		  <span class="sr-only">Close</span>\n		</button>\n		<h3><i class="fa fa-exclamation-triangle"></i> File already exists!</h3>\n		<p>Select new lamp number or confirm overwrite</p>\n		<p><button id="button-overwrite" type="button" class="btn btn-danger"><i class="fa fa-pencil-square"></i> Overwrite</button>\n		</p>	      </div> <!-- /. ALERT -->\n');

	    /* On Overwrite click, save to localStorage */
	    $('#button-overwrite').on('click', function (event) {
		event.preventDefault();
		closeAlerts(0);
		localStorage[key] = value;
		$("#div-file-alert").wrapInner('<div id="file-alert" class="alert alert-success alert-dismissable fade in" role="alert">\n		<button id="button-close" type="button" class="close" data-dismiss="alert">\n		  <span aria-hidden="true">&times;</span>\n		  <span class="sr-only">Close</span>\n		</button>\n		<h3><i class="fa fa-check-square"></i>  Saved!</h3>\n	      </div> <!-- /. ALERT -->\n');
		closeAlerts(3000);
		//incrementBadge();
	    });
	}
	
	// Else write file and spawn new alert
	else {
	    localStorage[key] = value;
	    $("#div-file-alert").wrapInner('<div id="file-alert" class="alert alert-success alert-dismissable fade in" role="alert">\n		<button id="button-close" type="button" class="close" data-dismiss="alert">\n		  <span aria-hidden="true">&times;</span>\n		  <span class="sr-only">Close</span>\n		</button>\n		<h3><i class="fa fa-check-square"></i>  Saved!</h3>\n	      </div> <!-- /. ALERT -->\n');
	    closeAlerts(3000);
	    //incrementBadge();
	}
    });

});
