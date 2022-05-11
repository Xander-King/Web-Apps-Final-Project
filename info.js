var getLatLonURL = "https://api.tomtom.com/search/2/search/";
var routeURL = "https://api.tomtom.com/routing/1/calculateRoute/";
var mapURL = "https://api.tomtom.com/map/1/staticimage?layer=basic&style=main&format=jpg&zoom=12&center=";
var key = '54rGfSO9hzSSq6GiK994AYweJnvWAkNG'
var mapThumbnails = [];
var route = {
    distances: [],
    times: [],
    instructions: [],
    maps: [],
    formData: {},
};

var latLon = {
    lat: [],
    lon: []
};



function buttonClicked() {
    //Clear objects
    route.distances = [];
    route.times = [];
    route.instructions = [];
    latLon.lat = [];
    latLon.lon = [];
    route.maps = [];
    //Rebuild objects
    getRoute();
    getMap();

    //Display objects
    displayObjects();

    saveData();
}

function saveData() {
    var val = encodeURIComponent(JSON.stringify(route));
    a=$.ajax({
		url:   `/final.php?method=setLookup&location=45056&sensor=web&value=${val}`,
		method: "GET",
        async: false
    });
}

//606%20Tucker%20Dr
function getLatLon(add) {
	var address = replaceSpace(add);
    var location;
    a=$.ajax({
		url: (getLatLonURL + address + `.json?minFuzzyLevel=1&maxFuzzyLevel=2&view=Unified&relatedPois=off&key=${key}`),
		method: "GET",
        async: false
	}).done(function(data) {   
        var lat = data.results[0].position.lat;
        var lon = data.results[0].position.lon;
        location = (lat + '%2C' + lon);
    });
    return location;
}

function getRoute() {
    var locations = getLocations();
    var routeType = $('#routeType').val();
    var travelMode = $('#modeOfTravel').val();
    var hilliness = $('#hilliness').val();
    var fullRouteURL = makeRouteURL(locations, routeType, travelMode, hilliness);
    route.formData.routeType = routeType;
    route.formData.travelMode = travelMode;
    route.formData.hilliness = hilliness;
    route.requestTime = Date.now();

    a=$.ajax({
        url: fullRouteURL,
        method: "GET",
        async: false
    }).done(function(data) {  
        console.log('you are here');
        for(i = 0; i < data.routes[0].legs.length; i++) {
            route.distances.push(data.routes[0].legs[i].summary.lengthInMeters);
            route.times.push(data.routes[0].legs[i].summary.travelTimeInSeconds);
        }

        for(i = 1; i < data.routes[0].guidance.instructions.length; i += 2) {
            route.instructions.push(data.routes[0].guidance.instructions[i].message);
        }

        for(i = 0; i < data.routes[0].guidance.instructions.length; i += 2) {
            latLon.lat.push(data.routes[0].guidance.instructions[i].point.latitude);
            latLon.lon.push(data.routes[0].guidance.instructions[i].point.longitude);
        }
        
    }); 

}

function getMap() {
    for(i = 0; i < latLon.lat.length; i++) {
           var mapUrl = mapURL + latLon.lon[i] + '%2c' + latLon.lat[i] + `&width=512&height=512&view=Unified&key=${key}`;
            route.maps.push(mapUrl);
    }
}



function makeRouteURL(locations, routeType, travelMode, hilliness) {
    var URL;
    if(travelMode == 'thrilling') {
        URL = (routeURL + locations + '/json?instructionsType=text&routeType=thrilling&travelMode=' + travelMode + '&hilliness=' + hilliness + `&key=${key}`)
    }
    else {
        URL = (routeURL + locations + '/json?instructionsType=text&routeType=' + routeType + '&travelMode=' + travelMode + `&key=${key}`)
    }
    return URL;
}

//Helper Method to retrieve and get the starting and ending 
//locations in lat and lon and url ready.
function getLocations() {
    var startAdd = $('#startingAddress').val();
    var startLatLon = getLatLon(startAdd);
    var endAdd = $('#endingAddress').val();
    var endLatLong = getLatLon(endAdd);
    console.log(startLatLon);
    return (startLatLon + '%3A' + endLatLong);
       
}


//Helper method to get rid of space in given addresses
function replaceSpace(add) {
    var address = add.replaceAll(' ', '%20');
    return address;
}

function drawMap(i) {
    $('#maps').append('<img class="image img-fluid" src="' + route.maps[i] + '">');
    
    if(i + 1 < route.maps.length) {
        setTimeout(drawMap, 250, i+1);
    }
}

function displayObjects() {
    $('#times').html('<h2 class="desc">Times:</h2><br>');
    for(i = 0; i < route.times.length; i++) {
        $('#times').append('<p class="desc">Leg ' + i + ': ' + route.times[i] + '</p><br>');
    }
    $('#times').append('<br><br>');

    $('#lengths').html('<h2 class="desc">Lengths:</h2><br>');
    for(i = 0; i < route.distances.length; i++) {
        $('#lengths').append('<p class="desc">Leg ' + i + ': ' + route.distances[i] + '</p><br>');
    }
    $('#lengths').append('<br><br>');


    $('#instruction').html('<h2 class="desc">Directions:</h2><br>')
    for(i = 0; i < route.instructions.length; i++) {
        $('#instruction').append('<p class="desc">' + route.instructions[i] + '</p><br>');
    }
    $('#instruction').append('<br><br>');


    $('#maps').html('<h2 class="desc">Maps:</h2>')
    drawMap(0);
}
