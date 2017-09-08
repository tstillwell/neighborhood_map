if (localStorage.map_places){
	var all_points = JSON.parse(localStorage.map_places);
	console.log("local storage found..reading...");
	}
// check local storage first for points, if they dont exist read this	
else {
	console.log("no local storage found..reading model data...");
	var model = {
		selected_place: null,
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
		marker_array : all_points.places,
		initMap : function () { // make global so gmapsapi can use for callback
			console.log("adding map to page");
			var gmap = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 33.517641, lng: -86.802979},
				zoom: 15
				});
			console.log(gmap);	
			for( i = 0; i < this.marker_array.length; i++){
				marker = new google.maps.Marker({
					position : this.marker_array[i].position,
					map: gmap,
					title: this.marker_array[i].name
				});
			}
		}
	};

ko.applyBindings(view_model);
