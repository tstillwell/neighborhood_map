if (localStorage.mapPlaces){
	var allPoints = JSON.parse(localStorage.mapPlaces);
}
// check local storage first for points, if they dont exist read this
else {
	const model = {
		places: [
			{ name: 'Vulcan Statue',
			  position: { lat: 33.4917, lng: -86.795537},
			  admission: 'paid'
			},
			{ name: 'Sloss Furnaces',
			  position: { lat: 33.520651, lng: -86.791061  } ,
			  admission: 'free'
			},
			{ name: 'McWane Science Center',
			  position: { lat: 33.514785, lng: -86.808295} ,
			  admission: 'paid'
			},
			{ name: 'Railroad Park',
			  position: { lat: 33.508301, lng: -86.811972 } ,
			  admission: 'free'
			},
			{ name: 'Birmingham Zoo',
			  position: { lat: 33.486009, lng: -86.779541 } ,
			  admission: 'paid'
			},
			{ name: 'Birmingham Civil Rights Institute',
			  position: { lat: 33.516092, lng: -86.814521 } ,
			  admission: 'paid'
			}
		]
	};
	// save to local storage for future use
	localStorage.mapPlaces = JSON.stringify(model);
	var allPoints = model;
}


var viewModel = {
		places : allPoints.places, // used by initmap to make markers
		filteredPlaces : [], // stores places that are being actively filtered
		displayedPlaces : ko.observableArray(allPoints.places), // for list
		markers: [], // store markers in this after creation
		wikitext : {}, // stores wikipedia data for places retrieved via api
		sidebarTitle : ko.observable('All Attractions'), // dropdown name
		initMap : function () {
			/* Initilizes the google map and all markers. Sets up markers and
			   infowindow behavior inside the map pane.
			   Used as a callback from Google Maps
			   API query in index.html */
			let self = this;
			largeInfowindow = new google.maps.InfoWindow({
				maxWidth: 150
			});
			let bounds = new google.maps.LatLngBounds();
			gmap = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 33.517641, lng: -86.802979},
				zoom: 15,
				mapTypeControl: false,
				styles: 
				[{ 'featureType': 'poi',
				'stylers': [{'visibility': 'off'}]
				},
				{ 'featureType': 'road',
				'elementType': 'geometry.fill',
				'stylers': [{'color': '#c2c2c2'}]
				}]
			});
			let menubtndiv = document.getElementById('menubtn');
			menubtndiv.style.margin = '1em';
			gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(menubtndiv);
			self.populateWikiData();
			self.places.forEach(function(place){
			// create markers from places
				marker = new google.maps.Marker({
					position : place.position,
					map: gmap,
					animation: google.maps.Animation.DROP,
					icon: 'https://maps.google.com/mapfiles/ms/icons/blue.png',
					title: place.name,
					admissionType : place.admission
				});
				bounds.extend(place.position);
				marker.addListener('click', function() {
					// marker click listeners to highlight & show infowindow
					self.populateInfoWindow(this, largeInfowindow);
					self.highlightSelected(this);
				});
				self.markers.push(marker); // populate markers array
			});
			gmap.fitBounds(bounds); // ensure map holds all markers
		},
		mapError : function () { // if maps API request fails, notify user
			$('#map').html("Google Maps failed to load");
		},	
		highlightSelected : function (selectedMarker) {
			// highlight currently selected marker and un-highlight the others
			markers = this.markers
			markers.forEach(function(marker) {
				if (marker != selectedMarker) // deselected icons
					{marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue.png');}
				if (marker == selectedMarker) // highlighted/selected icon 
					{marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');}
			});
		},
		populateInfoWindow : function (marker, infowindow) {
			// Put data loaded from wikipedia into infowindow on map
			if (infowindow.marker != marker) {
			  infowindow.marker = marker;
			  title = '<div class="title">' + marker.title + '</div>';
			  text = '<div class="desc">' + this.wikitext[marker.title].text + '</div>';
			  text += '<a href="' + this.wikitext[marker.title].link + '">More From Wikipedia</a>';
			  infowindow.setContent( title + text );
			  infowindow.open(map, marker);
			  infowindow.addListener('closeclick', function() {
				infowindow.marker = null;
			  });
			}
        },
		selectPlace : function (place) { // called when clicking item in list
			self = this;
			self.markers.forEach(function(marker){
				if (marker.title == place.name && marker.map != null){
					marker.map.panTo(marker.position);
					self.populateInfoWindow(marker, largeInfowindow);
					self.highlightSelected(marker);
				}
			})
		},
		resetFilter : function() {
		/* combine filteredPlaces and displayedPlaces observable arrays
		   so places that were removed from the displayedPlaces (by filters)
		   can be displayed again when a new filter is selected. Then, empty
		   the filteredPlaces array so a new filter can be applied */
			for (i = 0; i < this.filteredPlaces.length; i++) {
				this.displayedPlaces.push(this.filteredPlaces[i]);
			}
			this.filteredPlaces = [];
		},
		hideMarkers : function(admissionString){
			this.markers.forEach(function(marker){ // hide filtered markers
				marker.setMap(this.gmap);
				if (marker.admissionType != admissionString){
					marker.setMap(null); // marker still exists
				}
			});
		},
		filterFree : function() { // when user clicks 'free' in dropdown
			this.resetFilter();
			this.filteredPlaces = this.displayedPlaces.remove(function(place) {
				return (place.admission != 'free');
			});
			this.hideMarkers('free');
			this.sidebarTitle('Free Attractions');
		},
		filterPaid : function() {  // when user clicks 'paid' in dropdown
			this.resetFilter();
			this.filteredPlaces = this.displayedPlaces.remove(function(place) {
				return (place.admission != 'paid');
			});
			this.hideMarkers('paid');
			this.sidebarTitle('Paid Attractions');
		},
		filterAll : function() { // when user clicks 'all' in dropdown
			this.resetFilter();
			this.sidebarTitle('All Attractions');
			this.markers.forEach(function(marker){ // show all markers
				marker.setMap(this.gmap);
			});
		},
		populateWikiData: function() { // retrieve wikipedia text via API
			wikitext = this.wikitext;
			this.places.forEach(function(place){
				let wikiAPIrequest = 'https://en.wikipedia.org/w/api.php?';
				wikiAPIrequest += $.param({
				  'action' : 'opensearch',
				  'search' : place.name,
				  'limit' : 1,
				  'format' : 'json'
				}); // API lookup URL with URL encoded parameters
				$.ajax({
				  url: wikiAPIrequest,
				  method: 'GET',
				  jsonp: 'callback',
				  dataType: 'jsonp'
				}).done(function(result) {
				  let text = result[2];
				  let link = result[3];
				  wikitext[place.name] = {text,link}
				}).fail(function(err) {
				  let error = 'Wikipedia article text could not be retrieved';
				  let link = '#';
				  wikitext[place.name] = {text,link}
				  throw(err);
				});
			});
		}
	};
$(document).foundation(); // initilize foundation javascript plugins
ko.applyBindings(viewModel); // connect knockout bindings in html to viewModel
