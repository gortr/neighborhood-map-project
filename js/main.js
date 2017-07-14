// Makes sure code within this script is utilized as intended.
'use strict';

// Styling for usage on map.
var styles = [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 13
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#144b53"
            },
            {
                "lightness": 14
            },
            {
                "weight": 1.4
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#08304b"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0c4152"
            },
            {
                "lightness": 5
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b434f"
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b3d51"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "color": "#146474"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#021019"
            }
        ]
    }
];

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
		visible: ko.observable(true)},
	{
		title: 'Cornermagic Gaming Center',
		location: {
			lat: 34.770675,
			lng: -82.46131
		},
		visible: ko.observable(true)},
	{
		title: 'Boardwalk',
		location: {
			lat: 34.84954,
			lng: -82.3297
		},
		visible: ko.observable(true)},
	{
		title: 'Borderlands',
		location: {
			lat: 34.843697,
			lng: -82.364306
		},
		visible: ko.observable(true)},
	{
		title: 'NextGen Trading',
		location: {
			lat: 34.784927,
			lng: -82.313561
		},
		visible: ko.observable(true)},
	{
		title: 'Video Game Cavern',
		location: {
			lat: 34.908524,
			lng: -82.327027
		},
		visible: ko.observable(true)}
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

		/* === MARKER LOCATION STREETVIEW CODE === */
		var streetViewService = new google.maps.StreetViewService();
		var radius = 50;
		// Calculates the panorama for the street view if all checks out.
		function getStreetView(data, status) {
			if (status == google.maps.StreetViewStatus.OK) {
				var nearStreetViewLocation = data.location.latLng;
				var heading = google.maps.geometry.spherical.computeHeading(
					nearStreetViewLocation, marker.position);
					infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
					var panoramaOptions = {
						position: nearStreetViewLocation,
						pov: {
							heading: heading,
							pitch: 15
						}
					};
					var panorama = new google.maps.StreetViewPanorama(
						document.getElementById('pano'), panoramaOptions);
			} else {
				infowindow.setContent('<div>' + marker.title + '</div>' +
					'<div>No Street View Available</div>');
			}
		}
		// Get closest streetview image within 50 meters of marker position.
		streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
		// Open infowindow on correct marker.
		infowindow.open(map, marker);
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

// Takes input from user and locates/zooms into specified area. Allows user to focus on one area of map.
function zoomToArea() {
	// Initialize GeoCoder
	var geocoder = new google.maps.Geocoder();
	// Get address or place that user inputted.
	var address = document.getElementById('zoom-to-area-text').value;
	// Make sure address isn't blank.
	if (address == '') {
		window.alert('You must enter an area or address');
	} else {
		// Geocode address/area inputted to get the center. Then center and zoom in on area.
		geocoder.geocode(
		{ 	address: address,
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
				map.setZoom(20);
			} else {
				window.alert('We could not find that location - please enter more specific details.');
			}
		});
	}
}

// *************************
// * - KO Data Structure - *
// *************************

var ViewModel = function() {
	var self = this;

	self.filterKeyword = ko.observable("");

	self.locationsArray = ko.observableArray([]);

	self.filteredList = self.locationsArray;

	var stringStartsWith = function (string, startsWith) {
	    string = string || "";
	    if (startsWith.length > string.length)
	        return false;
	    return string.substring(0, startsWith.length) === startsWith;
	};

	self.filteredLocations = ko.computed(function() {
		var filter = self.filterKeyword().toLowerCase();
		if (!filter) {
			return self.filteredList();
		} else {
			return ko.utils.arrayFilter(self.filteredList(), function(item) {
				return ko.utils.stringStartsWith(filteredList.title.toLowerCase(), self.filterKeyword);
			});
		}
	}, self);
}

vm = new ViewModel();
ko.applyBindings(vm);

// **************************
// * - MAP INITIALIZATION - *
// **************************
function initMap() {

	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 34.852618, lng: -82.39401}, // New York
		zoom: 13,
		styles: styles,
		mapTypeControl: false
	});

	// This autocomplete is for use in geocoder entry box.
	var zoomAutocomplete = new google.maps.places.Autocomplete(
		document.getElementById('zoom-to-area-text'));
	// Bias boundaries within map for zoom to text area.
	zoomAutocomplete.bindTo('bounds', map);

	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();

	// This will be the default marker color.
	var defaultIcon = makeMarkerIcon('0091FF');

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
			id: i
		});

		// Push marker to our array of markers.
		vm.locationsArray.push(marker);

		// Attaches marker objects to ko array
		//vm.locationsArray()[i].marker = marker;

		// Create onClick event to open an infowindow for each marker.
		marker.addListener('click', function() {
			populateInfoWindow(this, largeInfowindow);
		});

		document.getElementById('zoom-to-area').addEventListener('click', function() {
			zoomToArea();
		});

		bounds.extend(vm.locationsArray()[i].position);
	}
	map.fitBounds(bounds);
}