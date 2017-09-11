if (localStorage.map_places){
	var all_points = JSON.parse(localStorage.map_places);
	console.log("local storage found..reading...");
	}
// check local storage first for points, if they dont exist read this	
else {
	console.log("no local storage found..reading model data...");
	var model = {
		places: [
			{ name: "Vulcan Statue",
			  position: { lat: 33.4917, lng: -86.795537},
			  wiki_link: "https://en.wikipedia.org/wiki/Vulcan_statue"
			},
			{ name: "Sloss Furnaces",
			  position: { lat: 33.520651, lng: -86.791061  } ,
			  wiki_link: "https://en.wikipedia.org/wiki/Sloss_Furnaces"
			},
			{ name: "McWane Science Center",
			  position: { lat: 33.514785, lng: -86.808295} ,
			  wiki_link: "https://en.wikipedia.org/wiki/McWane_Science_Center"
			},
			{ name: "Railroad Park",
			  position: { lat: 33.508301, lng: -86.811972 } ,
			  wiki_link: "https://en.wikipedia.org/wiki/Railroad_Park"
			},
			{ name: "Birmingham Zoo",
			  position: { lat: 33.486009, lng: -86.779541 } ,
			  wiki_link: "https://en.wikipedia.org/wiki/Birmingham_Zoo"
			},
			{ name: "Birmingham Civil Rights Institute",
			  position: { lat: 33.516092, lng: -86.814521 } ,
			  wiki_link: "https://en.wikipedia.org/wiki/Birmingham_Civil_Rights_Institute"
			}
		]
	};
	localStorage.map_places = JSON.stringify(model); // save to local storage for future use
	var all_points = model;
}


var view_model = {
		place_list : ko.observableArray(all_points.places), // to create item list
		// read data from models to create markers
		places : all_points.places,
		markers: [],
		initMap : function () {
			console.log("adding map to page");
			largeInfowindow = new google.maps.InfoWindow();
			var bounds = new google.maps.LatLngBounds();
			var gmap = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 33.517641, lng: -86.802979},
				zoom: 15,
				mapTypeControl: false
				});
			var menubtndiv = document.getElementById('menubtn');
			menubtndiv.style.margin = '1em';
			gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(menubtndiv);
			for( i = 0; i < this.places.length; i++){
			// create markers from places
				marker = new google.maps.Marker({
					position : this.places[i].position,
					map: gmap,
					animation: google.maps.Animation.DROP,
					icon: 'http://maps.google.com/mapfiles/ms/icons/blue.png',
					title: this.places[i].name
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
					{ marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue.png');}
				if (marker == selectedMarker) 
					{ marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');}
			});
		},
		populateInfoWindow : function (marker, infowindow) {
			// Check to make sure the infowindow is not already opened on this marker.
			if (infowindow.marker != marker) {
			  infowindow.marker = marker;
			  infowindow.setContent('<div>' + marker.title + '</div>');
			  infowindow.open(map, marker);
			  // Make sure the marker property is cleared if the infowindow is closed.
			  infowindow.addListener('closeclick', function() {
				infowindow.marker = null;
			  });
			}
        },
		selectPlace : function (place, markers) { // called when clicking item in list
			for( marker_id = 0; marker_id < markers.length; marker_id++){
				marker = markers[marker_id];
				if (markers[marker_id].title == place.name){
					this.populateInfoWindow(marker, largeInfowindow);
					this.highlightSelected(markers, marker);
				}
			}
		}
	};
$(document).foundation();
ko.applyBindings(view_model);
