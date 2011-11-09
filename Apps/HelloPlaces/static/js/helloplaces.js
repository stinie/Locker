/* Generic log function for debugging. */
var log = function(msg) { if (console && console.log) console.debug(msg); }
window.onload = loadScript;

var markers = [];
var map;

function initializeMap() {
    var myOptions = {
        zoom: 12,
        center: new google.maps.LatLng(37.759, -122.410),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('mapcanvas'), myOptions);
    
    addMarker(37.759, -122.410, "Singly HQ");
}

function loadPlaceslist(offset, limit) {
    // set the params if not specified
    var offset = offset || 0;
    var limit = limit || 100;
    var useJSON = useJSON || false;

    var getPlacesCB = function(places) {
        places = places.sort(function(lh, rh) {
            var rhc = parseInt(rh.timestamp);
            var lhc = parseInt(lh.timestamp);
            if (rhc > (Date.now() / 1000)) rhc = rhc / 1000;
            if (lhc > (Date.now() / 1000)) lhc = lhc / 1000;
            return rhc - lhc;
        });
        // find the unordered list in our document to append to
        var $placeslist = $("#placeslist");
        $placeslist.html('');

        if (places.length === 0) $placeslist.append("<li>Sorry, no places found!</li>");
        for (var i in places) {
            place = places[i];
            $placeslist.append('<li class="place"><a class="placelink" href="#" data-id="' + place._id + '" data-me="' + place.me + '" data-network="' + place.network + '" data-stream="' + place.stream + '" data-lat="' + place.lat + '" data-lng="' + place.lng + '" data-title="' + place.title + '"><div class="filler"><img class="network" src="/Me/useui/img/icons/' + place.network + '.png" /><div class="title">' + place.title + '</div><div class="date">' + moment(place.at).format('h:mma') + ' on ' + moment(place.at).format('M/D/YYYY') + '</div></div></a></li>');
        }
    };

    $.getJSON(
        '/Me/places',
        {'offset':offset, 'limit':limit},
        getPlacesCB
    );
}

function addMarker(lat, lng, title) {
    markers.push(new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng), 
        map: map,
        draggable: false,
        animation: google.maps.Animation.DROP,
        title:title
    }));
}

function clearOverlays() {
  if (markers) {
    for (var i in markers) {
      markers[i].setMap(null);
    }
    markers.length = 0;
  }
}


function loadScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://maps.googleapis.com/maps/api/js?sensor=false&callback=initializeMap';
    document.body.appendChild(script);
}


$(function() {
    loadPlaceslist(0, 100);
    
    $(".placelink").live('click', function(e) {
        e.preventDefault();
        clearOverlays();
        var lat = $(this).attr('data-lat');
        var lng = $(this).attr('data-lng');
        addMarker(lat, lng, $(this).attr('data-title'));
        map.setCenter(new google.maps.LatLng(lat, lng));
    });
});
