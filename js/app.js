/* === GLOBAL DECLARATIONS === */
var map, vm;
var self = this;

// --- ARRAY OF GAMING LOCATIONS ---
var locations = [{
	title: 'Games Workshop',
	location: {
		lat: 34.823393,
		lng: -82.284911
	},
	venueFoursquareID: '532b16ca498e231f8899cc31'
},
{
	title: 'Cornermagic Gaming Center',
	location: {
		lat: 34.770675,
		lng: -82.46131
	},
	venueFoursquareID: '4e9e05fe9a52db291015680f'
},
{
	title: 'Boardwalk',
	location: {
		lat: 34.84954,
		lng: -82.3297
	},
	venueFoursquareID: '4e3ecc0218a83d5b28567645'
},
{
	title: 'Borderlands',
	location: {
		lat: 34.843697,
		lng: -82.364306
	},
	venueFoursquareID: '4b58dcbaf964a520686f28e3'
},
{
	title: 'NextGen Trading',
	location: {
		lat: 34.784927,
		lng: -82.313561
	},
	venueFoursquareID: '4e6e6f978877d6d0b13776ec'
},
{
	title: 'Video Game Cavern',
	location: {
		lat: 34.908524,
		lng: -82.327027
	},
	venueFoursquareID: '4c17b7ead4d9c9286f5aee29'
}
];

// Populates markers with info regarding location.
function populateInfoWindow(marker, infowindow) {
	// Check to make sure infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		// Clears infowindow
		infowindow.setContent('');
		infowindow.marker = marker;
		infowindow.setContent('<div>' + marker.title + '</div>');
		infowindow.open(map, marker);
		marker.setAnimation(google.maps.Animation.BOUNCE);

		setTimeout(function() {
			marker.setAnimation(null);
		}, 1400);

		// Makes sure marker property is cleared if infowindow is closed.
		infowindow.addListener('closeclick', function() {
			infowindow.marker = null;
		});
	}
}

// Takes in a color and then creates a new marker icon based on the color scheme.
function makeMarkerIcon(markerColor) {
	var markerImage = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21, 34));
	return markerImage;
}

// ***************************
// * - FOURSQUARE API DATA - *
// ***************************

var fsrequest = function (marker, infowindow) {
	var apiURL = 'https://api.foursquare.com/v2/venues/';
	var foursquareClientID = '4VTAHD05VR3MNY01EETUDFB4XZLF2EIULNAERXXB1GWUEHSD';
	var foursquareSecret ='DFGEXFK1B40GMC0TIEYNGARJQIISGNJ0YMY42IXHSOA0XRE1';
	var foursquareVersion = '20170115';
	var venueFoursquareID = marker.id;

	var foursquareURL = apiURL + venueFoursquareID + '?client_id=' + foursquareClientID +  '&client_secret=' + foursquareSecret +'&v=' + foursquareVersion;

	$.ajax({
		url: foursquareURL,
		success: function(data) {
			console.log(data);
	    // var rating = data.response.venue.rating;
	    var name = data.response.venue.name;
	    var location = data.response.venue.location.address || ' No location provided';

	    infowindow.setContent(name + "," + location);
	    infowindow.open(map, marker);
	},
	error: function(error) {
		alert("Error, Four Square api data could not display");
	}
});
};

// *************************
// * - KO Data Structure - *
// *************************

var ViewModel = function() {
	var self = this;

	self.filterKeyword = ko.observable("");

	self.locationsArray = ko.observableArray([]);

	self.filteredList = self.locationsArray;



	self.filteredLocations = ko.computed(function() {
		var filter = self.filterKeyword().toLowerCase();
		if (!filter) {
			self.filteredList().forEach(function(item){
				item.setVisible(true);
			});
			return self.filteredList();
		} else {
			return ko.utils.arrayFilter(self.filteredList(), function(item) {
				var string = item.title.toLowerCase().indexOf(filter) >= 0;
				item.setVisible(string);
				return string;
			});
		}
	}, self);

	self.showMe = function(locale) {
		google.maps.event.trigger(marker[i], 'click');
	};
};

// **************************
// * - MAP INITIALIZATION - *
// **************************
function initMap() {

	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 34.852618, lng: -82.39401}, // Greenville
		zoom: 13,
		styles: styles,
		mapTypeControl: false
	});

	var infowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();

	// This will be the default marker color.
	var defaultIcon = makeMarkerIcon('0091FF');

	function clickMarker(){
		fsrequest(this, infowindow);
		populateInfoWindow(this, infowindow);
	}

	// Iterates through the locations array and places the markers.
	for (var i = 0; i < locations.length; i++) {
		var position = locations[i].location;
		var title = locations[i].title;
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			icon: defaultIcon,
			animation: google.maps.Animation.DROP,
			id: locations[i].venueFoursquareID
		});

		// Push marker to our array of markers.
		vm.locationsArray.push(marker);

		// Create onClick event to open an infowindow for each marker.
		marker.addListener('click', clickMarker);

		bounds.extend(vm.locationsArray()[i].position);
	}
	google.maps.event.addDomListener(window, 'resize', function() {
		map.fitBounds(bounds);
	});
}

vm = new ViewModel();
ko.applyBindings(vm);

function errorHandling() {
	alert("Google Maps has failed to load. Please try again in a moment.");
}