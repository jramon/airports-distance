var App = (function () {
  var exports = {};
  /**
  * @public
  * Bootstraps this example by making the aiport API request and binding the
  * events to our DOM nodes.
  */
  exports.init = function () {
    getAirports();
    bindEvents();
  };
  /**
  * @public
  * This public method takes two strings for starting and end points and returns
  * the distance between them in nautical miles.
  * @param from String starting point
  * @param to String end point
  * @return distance Number distance betweeen the input points
  */
  exports.calculateDistance = function (from, to) {
    var start = new google.maps.LatLng(airports[from].latitude, airports[from].longitude),
        finish = new google.maps.LatLng(airports[to].latitude, airports[to].longitude),
        distance;

    distance = (google.maps.geometry.spherical.computeDistanceBetween(start, finish) / 1852).toFixed(4);

    return distance;
  };
  /**
  * This is the place to bind events to our DOM nodes
  */
  function bindEvents () {
    var goBtn = document.getElementsByTagName('button')[0];

    goBtn.addEventListener('click', handleSearch);
  };
  /**
  * Event handler for the Go! button
  * Checks for an input valid and if that's the case, will call the
  * calculateDistance() and the drapMap() methods
  */
  function handleSearch (e) {
    var input = document.querySelectorAll('input[type="text"]');

    if (validate(input)) {
      var from = input[0].value,
          to = input[1].value,
          resultNode = document.getElementsByClassName('result')[0];

      resultNode.parentNode.classList.remove("hidden");
      resultNode.textContent = exports.calculateDistance(from, to) + " nautical miles";

      //draw map
      drawMap(from, to);
    }
  };
  /**
  * Creates a map from two locations using the Googla Maps API
  * @param from String starting point
  * @param to String destination point
  */
  function drawMap (from, to) {
    var options = {
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        center: new google.maps.LatLng((airports[from].latitude + airports[to].latitude) / 2, (airports[from].longitude + airports[to].longitude) / 2 )
    },
        map = new google.maps.Map(document.getElementById('map-container'), options),
        path;

    path = new google.maps.Polyline({
      path: [new google.maps.LatLng(airports[from].latitude, airports[from].longitude), new google.maps.LatLng(airports[to].latitude, airports[to].longitude)],
      geodesic: true,
      strokeColor: '#000',
      strokeWeight: 5
    });

    path.setMap(map);
  }
  /**
  * Validates the value of both inputs against the lookup table of airport codes
  * @return Boolean whether the input is valid or not
  */
  function validate (input) {
    var messageClasses = document.getElementsByClassName('message')[0].classList,
        isValid = true;

    for (var i = 0, length = input.length; i < length; i++) {
      var classes = input[i].classList;

      if (this.codes.indexOf(input[i].value.toUpperCase()) === -1) {
        isValid = false;
      }

      classes.toggle('error', !isValid);
      messageClasses.toggle('shown', !isValid);
    }

    return isValid
  }
  /**
  * Sets the JSONP request up to Airport API to get all airports list.
  */
  function getAirports() {
    var script =  document.createElement('script');

    script.type = "text/javascript";
    script.src = "https://airport.api.aero/airport?user_key=e9a0eb3946efd4d1fdde15b587210d3e";

    document.getElementsByTagName('head')[0].appendChild(script);

    window.callback = parseAirportData;
  }
  /**
  * Callback to handle JSONP request
  * creates Array List of massaged airport data eg, [{ SFO: {lat":45.499722, "lng":-73.566111}  ]
  * we also create an array of airport codes to use as lookup table for validation
  */
  function parseAirportData(data) {
    var airports = {};

    var codes = data.airports.map(function(airport) {
      //use this loop to create another object with the airport info and use it as a lookup
      airports[airport.code] = { latitude: airport.lat, longitude: airport.lng };

      return airport.code;
    });

    this.codes = codes;
    this.airports = airports;
  };

  return exports;

}());

App.init();
