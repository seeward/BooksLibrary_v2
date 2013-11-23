
var app = {
	// Application Constructor
	initialize : function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// `load`, `deviceready`, `offline`, and `online`.
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
		document.getElementById('scan').addEventListener('click', this.scan, false);
	
	},

	// deviceready Event Handler
	//
	// The scope of `this` is the event. In order to call the `receivedEvent`
	// function, we must explicity call `app.receivedEvent(...);`
	onDeviceReady : function() {
		app.receivedEvent('deviceready');
	},

	// Update DOM on a Received Event
	receivedEvent : function(id) {
		var parentElement = document.getElementById(id);
		var listeningElement = parentElement.querySelector('.listening');
		var receivedElement = parentElement.querySelector('.received');

		listeningElement.setAttribute('style', 'display:none;');
		receivedElement.setAttribute('style', 'display:block;');

		console.log('Received Event: ' + id);
	},

	scan : function() {
		console.log('scanning');

		var scanner = cordova.require("cordova/plugin/BarcodeScanner");

		scanner.scan(function(result) {
			var ISBN = result.text;

			$.ajax({//call to login webservice
				url : "https://www.googleapis.com/books/v1/volumes?q=isbn:" + ISBN,
				type : "GET",
				dataType : 'json',

			}).done(function(response) {//success

				for (var i = 0; i < response.items.length; i++) {
					var item = response.items[i];

					// in production code, item.text should have the HTML entities escaped.
					document.getElementById("content").innerHTML = "<div id='title'>" + item.volumeInfo.title + "</div><div id='author'>" + item.volumeInfo.authors + " " + "</div><div id='thumb'>" + "<img src='" + item.volumeInfo.imageLinks.thumbnail + "'></div><div id='date'>" + item.volumeInfo.publishedDate + "</div><div id='description'>" + item.volumeInfo.description + "</div><div id='isbn'>" + item.volumeInfo.industryIdentifiers[1].identifier + "</div><div id='subject'>" + item.volumeInfo.categories[0] + "</div>";
				}
			});

			console.log("Scanner result: \n" + "text: " + result.text + "\n" + "format: " + result.format + "\n" + "cancelled: " + result.cancelled + "\n");
			document.getElementById("info").innerHTML = result.text;
			console.log(result);
			/*
			 if (args.format == "QR_CODE") {
			 window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
			 }
			 */

		}, function(error) {
			console.log("Scanning failed: ", error);
		});
	},

	encode : function() {
		var scanner = cordova.require("cordova/plugin/BarcodeScanner");

		scanner.encode(scanner.Encode.TEXT_TYPE, "http://www.nhl.com", function(success) {
			alert("encode success: " + success);
		}, function(fail) {
			alert("encoding failed: " + fail);
		});

	}
};


(function() {
	adder = function() {
		title = document.getElementById("title").innerHTML;
		author = document.getElementById("author").innerHTML;
		subject = document.getElementById("subject").innerHTML;
		description = document.getElementById("description").innerHTML;
		isbn = document.getElementById("isbn").innerHTML;
		thumb = document.getElementById("thumb").innerHTML;
		date = document.getElementById("date").innerHTML;
		
		
		$.ajax({//call to books add webservice
				url : "http://www.seeward.com/books_app_add.php",
				type : "GET",
				dataType : 'json',
				data : {
					name : title,
					author : author,
					subject : subject,
					description : description,
					isbn : isbn,
					thumb : thumb,
					date : date
				},
			}).done(function(response) {//success
					$('#response').html(response);
			
			});
	};
})(jQuery);
