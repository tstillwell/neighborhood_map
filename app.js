// check local storage first for points, if they dont exist read this

var model = {
	places : [
		{ name: "Vulcan Statue",
		  latlng: { 33.4917, -86.795537} ,
		  wiki_link: "https://en.wikipedia.org/wiki/Vulcan_statue"
		},
		{ name: "Sloss Furnaces",
		  latlng: { 33.520651, -86.791061  } ,
		  wiki_link: "https://en.wikipedia.org/wiki/Sloss_Furnaces"
		},
		{ name: "McWane Science Center",
		  latlng: { 33.514785, -86.808295} ,
		  wiki_link: "https://en.wikipedia.org/wiki/McWane_Science_Center"
		},
		{ name: "Railroad Park",
		  latlng: { 33.508301, -86.811972 } ,
		  wiki_link: "https://en.wikipedia.org/wiki/Railroad_Park"
		},
	]
};
// then save to localstorage  