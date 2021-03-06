
var app = {
	// Application Constructor

	initialize : function() {
		this.bindEvents();
		//this.randomizer();
		this.updated();
	},

	updated : function() {
	
		$.ajax({//call to login webservice
			url : "http://www.seeward.com/updated.php",
			type : "GET",
			dataType : 'json',

		}).done(function(response) {//success
			
			Storage.prototype.getObject = function(key) {
			var value = this.getItem(key);
			return value && JSON.parse(value);
		};
			lib = window.localStorage.getObject('books');
		
			if (lib != null){
			$.each(lib.items, function(i, obj) {
				if (obj.ISBN === response.ISBN) {
					
					if(obj.UPDATEDON < response.UPDATEDON){
						app.resetLibrary();
					} else {
						app.library();
					}
					
				} 

					
			});
			} else {
				app.library();
			}
		});
		
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// `load`, `deviceready`, `offline`, and `online`.
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
		document.getElementById('scan').addEventListener('click', this.scan, false);
		document.getElementById('add').addEventListener('click', this.add, false);
		document.getElementById('manual').addEventListener('click', this.enterISBN, false);
		document.getElementById('library').addEventListener('click', this.library, false);
		//document.getElementById('reset').addEventListener('click', this.resetLibrary, false);
	},

	// deviceready Event Handler
	//
	// The scope of `this` is the event. In order to call the `receivedEvent`
	// function, we must explicity call `app.receivedEvent(...);`
	onDeviceReady : function() {
		
		app.checkConnection();
	},
	

	
      checkConnection : function() {
            var networkState = navigator.network.connection.type;
			
            var states = {};
            states[Connection.UNKNOWN]  = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI]     = 'WiFi connection';
            states[Connection.CELL_2G]  = 'Cell 2G connection';
            states[Connection.CELL_3G]  = 'Cell 3G connection';
            states[Connection.CELL_4G]  = 'Cell 4G connection';
            states[Connection.CELL]     = 'Cell generic connection';
            states[Connection.NONE]     = 'No network connection';
			
            alert('Connection type: ' + states[networkState]);
       },

	

	
	
	resetLibrary : function() {
		window.localStorage.removeItem('books');
		app.library();
	},
	
	checkout : function(id) {
		
		checkedname = $('#checkedname').val();
		title = document.getElementById("titleTxt").innerHTML;
		$.ajax({//call to login webservice
			url : "http://www.seeward.com/app_books_checkout.php",
			type : "GET",
			dataType : 'html',
			data : {
				id : id,
				checkedname : checkedname,
				title : title
				
			},

		}).done(function(response) {//success
		alert(response);
		app.resetLibrary();
		});
	},

	checkin : function(id) {
	
		$.ajax({//call to login webservice
			url : "http://www.seeward.com/app_books_checkin.php",
			type : "GET",
			dataType : 'html',
			data : {
				id : id
			},

		}).done(function(response) {//success
		alert(response);
		app.resetLibrary();
		});
		
	},
	
	showoptions : function() {
		
		if ($('#checkboxOpt').is(":checked")) {
				$('#options').show();
				$.mobile.activePage.trigger('create');
				
			} else {
				$('#options').hide();
			}
		
	},
	
	enterISBN : function() {
		$('#content').empty();
		inputer = '<input type="tel" autocomplete="off" name="isbn" id="isbn"></input><p><button href="#" data-role="button" data-theme="a" onClick="app.manual();" id="searcher">Search</button></p><a data-role="button" onClick="app.resetLibrary();" data-theme="a">Reset Library</a><button href="#" data-role="button" data-icon="grid" onClick="app.randomizer();">Randomize</button>';
		$('#content').html(inputer);

		$.mobile.activePage.trigger('create');
	},

	
	randomizer : function() {
		
		$('#content').html("<img src='css/ajax-loader.gif'>");

		$.ajax({//call to login webservice
			url : "http://www.seeward.com/random.php",
			type : "GET",
			dataType : 'json',

		}).done(function(response) {//success
			$('#content').hide();
			Storage.prototype.setObject = function(key, value) {
				this.setItem(key, JSON.stringify(value));
			};

			window.localStorage.setObject('randomBook', response);

			Storage.prototype.getObject = function(key) {
				var value = this.getItem(key);
				return value && JSON.parse(value);
			};

			result = window.localStorage.getObject('randomBook');
		


			all = {
				"item" : result
			}
	
			var template = $('#detailList').html();

			var html = Mustache.to_html(template, all);
			$('#content').html(html).fadeIn('slow');
			$('#options').hide();
			$.mobile.activePage.trigger('create');

		});
		
	

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
		$('#content').html("<img src='css/ajax-loader.gif'>")
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
					document.getElementById("content").innerHTML = "<div id='title'>" + item.volumeInfo.title + "</div><div id='author'>" + item.volumeInfo.authors + " " + "</div><div id='thumb'>" + item.id + "</div><div id='date'>" + item.volumeInfo.publishedDate + "</div><div id='description'>" + item.volumeInfo.description + "</div><div id='isbn'>" + item.volumeInfo.industryIdentifiers[1].identifier + "</div><div id='subject'>" + item.volumeInfo.categories + "</div>";
				}
				$.mobile.activePage.trigger('create');
			});

			console.log("Scanner result: \n" + "text: " + result.text + "\n" + "format: " + result.format + "\n" + "cancelled: " + result.cancelled + "\n");
			document.getElementById("info").innerHTML = result.text;

		}, function(error) {
			console.log("Scanning failed: ", error);
		});
	},

	add : function() {

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
			dataType : 'html',
			data : {
				name : title,
				author : author,
				description : description,
				subject : subject,
				isbn : isbn,
				thumb : thumb,
				date : date
			},
		}).done(function(response) {//success
			alert(response);

		});

	},


	comment : function(id) {
		commentText = $('#commentText').val();
		$.ajax({//call to login webservice
			url : "https://www.seeward.com/book_app_comment.php",
			type : "GET",
			dataType : 'html',
			data: {
				id : id,
				comment : commentText
			},

		}).done(function(response) {//success
			
			alert(response);
			
			app.resetLibrary();
			
		});
	},
	
	manual : function() {
		search = $('#isbn').val();

		$('#content').html("<img src='css/ajax-loader.gif'>")
		$.ajax({//call to login webservice
			url : "https://www.googleapis.com/books/v1/volumes?q=isbn:" + search,
			type : "GET",
			dataType : 'json',

		}).done(function(response) {//success

			for (var i = 0; i < response.items.length; i++) {
				var item = response.items[i];

				// in production code, item.text should have the HTML entities escaped.
				document.getElementById("content").innerHTML = "<div id='title'>" + item.volumeInfo.title + "</div><div id='author'>" + item.volumeInfo.authors + " " + "</div><div id='thumb'>" + item.id + "</div><div id='date'>" + item.volumeInfo.publishedDate + "</div><div id='description'>" + item.volumeInfo.description + "</div><div id='isbn'>" + item.volumeInfo.industryIdentifiers[1].identifier + "</div><div id='subject'>" + item.volumeInfo.categories + "</div>";
			}
			$.mobile.activePage.trigger('create');

		});

	},

	displayBooks : function() {
			$('#content').html("<img src='css/ajax-loader.gif'>");
		Storage.prototype.getObject = function(key) {
			var value = this.getItem(key);
			return value && JSON.parse(value);
		};

		library = window.localStorage.getObject('books');
		var template = $('#libraryList').html();

		var html = Mustache.to_html(template, library);
		
		$('#content').html(html);
		$.mobile.activePage.trigger('create');

	},

	details : function(id) {
		var isbn2 = id;
		$('#content').html("<img src='css/ajax-loader.gif'>");
		Storage.prototype.getObject = function(key) {
			var value = this.getItem(key);
			return value && JSON.parse(value);
		};

		result = window.localStorage.getObject('books');

		var details;
		$.each(result.items, function(i, obj) {

			if (obj.ISBN == isbn2)
				details = obj;

		});

		all = {
			"item" : details
		};

		var template = $('#detailList').html();

		var html = Mustache.to_html(template, all);
		$('#content').html(html);
		$.mobile.activePage.trigger('create');
			  $('#options').hide();
	},

	library : function() {

		$('#content').html("<img src='css/ajax-loader.gif'>");
		
		if(window.localStorage.getObject('books') === null) {
		$.ajax({//call to login webservice
			url : "http://www.seeward.com/books_app.php",
			type : "GET",
			dataType : 'json',

		}).done(function(response) {//success

			var all = {
				"items" : response
			};
			Storage.prototype.setObject = function(key, value) {
				this.setItem(key, JSON.stringify(value));
			};
			window.localStorage.setObject("books", all);

			app.displayBooks();
		});
		}
		else {
			app.displayBooks();
		}
	},

};

