if (localStorage.map_places){
	var all_points = JSON.parse(localStorage.map_places);
	console.log("local storage found..reading...");
	}
// check local storage first for points, if they dont exist read this	
else {
	console.log("no local storage found..reading model data...");
	const model = {
		places: [
			{ name: "Vulcan Statue",
			  position: { lat: 33.4917, lng: -86.795537},
			  admission: "paid"
			},
			{ name: "Sloss Furnaces",
			  position: { lat: 33.520651, lng: -86.791061  } ,
			  admission: "free"
			},
			{ name: "McWane Science Center",
			  position: { lat: 33.514785, lng: -86.808295} ,
			  admission: "paid"
			},
			{ name: "Railroad Park",
			  position: { lat: 33.508301, lng: -86.811972 } ,
			  admission: "free"
			},
			{ name: "Birmingham Zoo",
			  position: { lat: 33.486009, lng: -86.779541 } ,
			  admission: "paid"
			},
			{ name: "Birmingham Civil Rights Institute",
			  position: { lat: 33.516092, lng: -86.814521 } ,
			  admission: "paid"
			}
		]
	};
	localStorage.map_places = JSON.stringify(model); // save to local storage for future use
	const all_points = model;
}


var view_model = {
		places : all_points.places, // used by initmap to make markers
		filtered_places : [], // stores places that are being actively filtered
		displayed_places : ko.observableArray(all_points.places), 
		markers: [], // store markers in this after creation
		sidebar_title : ko.observable('All Attractions'),
		initMap : function () {
			console.log("adding map to page");
			largeInfowindow = new google.maps.InfoWindow();
			let bounds = new google.maps.LatLngBounds();
			gmap = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 33.517641, lng: -86.802979},
				zoom: 15,
				mapTypeControl: false
				});
			let menubtndiv = document.getElementById('menubtn');
			menubtndiv.style.margin = '1em';
			gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(menubtndiv);
			for( i = 0; i < this.places.length; i++){
			// create markers from places
				marker = new google.maps.Marker({
					position : this.places[i].position,
					map: gmap,
					animation: google.maps.Animation.DROP,
					icon: 'http://maps.google.com/mapfiles/ms/icons/blue.png',
					title: this.places[i].name,
					admissionType : this.places[i].admission
				});
				bounds.extend(this.places[i].position);
				marker.addListener('click', function() {
					// add infowindow listeners
					view_model.populateInfoWindow(this, largeInfowindow);
				});
				this.markers.push(marker); // populate markers array
			}
			// once all markers are created, add highlight listeners
			// since each highlight listener requires a list of all markers
			for (c = 0; c < this.markers.length; c++){ 
				marker = this.markers[c];
				markers = this.markers;
				marker.addListener('click', function() {
					view_model.highlightSelected(markers, this);
				});
			}
			gmap.fitBounds(bounds);
		},
		highlightSelected : function (markers, selectedMarker) {
			// highlight currently selected marker and un-highlight the others
			markers.forEach(function(marker) {
				if (marker != selectedMarker)
					{marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue.png');}
				if (marker == selectedMarker) 
					{marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');}
			});
		},
		populateInfoWindow : function (marker, infowindow) {
			// Check to make sure the infowindow is not already opened on this marker.
			if (infowindow.marker != marker) {
			  infowindow.marker = marker;
			  console.log("creating infowindow");
			  let wikidata = this.populateWikiData(marker.title);
			  console.log(wikidata);
			  infowindow.setContent('<div>' + marker.title + '</div>');
			  infowindow.open(map, marker);
			  // Make sure the marker property is cleared if the infowindow is closed.
			  infowindow.addListener('closeclick', function() {
				infowindow.marker = null;
			  });
			}
        },
		selectPlace : function (place) { // called when clicking item in list
			for( marker_id = 0; marker_id < this.markers.length; marker_id++){
				marker = this.markers[marker_id];
				if (markers[marker_id].title == place.name && markers[marker_id].map != null){
					this.populateInfoWindow(marker, largeInfowindow);
					this.highlightSelected(this.markers, marker);
				}
			}
		},
		resetFilter : function() {
		/* combine filtered_places and displayed_places observable arrays
		   so places that were removed from the displayed_places (by filters)
		   can be displayed again when a new filter is selected. Then, empty
		   the filtered_places array so a new filter can be applied */
			for (i = 0; i < this.filtered_places.length; i++) {
				this.displayed_places.push(this.filtered_places[i]);
			}
			this.filtered_places = [];
		},
		hideMarkers : function(admissionString){
			this.markers.forEach(function(marker){ // hide filtered markers
				marker.setMap(this.gmap);
				if (marker.admissionType != admissionString){
					marker.setMap(null);
				}
			});
		},
		filterFree : function() { // when user clicks "free" in dropdown
			this.resetFilter();
			this.filtered_places = this.displayed_places.remove(function(place) {
				return (place.admission != 'free');
			});
			this.hideMarkers('free');
			this.sidebar_title('Free Attractions');
		},
		filterPaid : function() {  // when user clicks "paid" in dropdown
			this.resetFilter();
			this.filtered_places = this.displayed_places.remove(function(place) {
				return (place.admission != 'paid');
			});
			this.hideMarkers('paid');
			this.sidebar_title('Paid Attractions');
		},
		filterAll : function() { // when user clicks all" in dropdown
			this.resetFilter();
			this.sidebar_title('All Attractions');
			this.markers.forEach(function(marker){ // show all markers
				marker.setMap(this.gmap);
			});
		},
		populateWikiData: function(placeName) {
			console.log("Creating wikipedia API request");
			let wiki_api_url = 'https://en.wikipedia.org/w/api.php?';
			wiki_api_url += $.param({
			  'action' : 'opensearch',
			  'search' : placeName,
			  'limit' : 1,
			  'format' : 'json'
			}); // API lookup URL with URL encoded parameters
			console.log(wiki_api_url);
			$.ajax({
			  url: wiki_api_url,
			  method: 'GET',
			  jsonp: "callback",
			  dataType: "jsonp"
			}).done(function(result) {
			  console.log("success!");
			  let text = result[2].toString();
			  console.log(text);
			  return text; 
			}).fail(function(err) {
			  console.log("In the fail method...");
			  var text = "Wikipedia article text could not be retrieved";
			  return text;
			  throw err;
			}); 
		}
	};		
$(document).foundation();
ko.applyBindings(view_model);
