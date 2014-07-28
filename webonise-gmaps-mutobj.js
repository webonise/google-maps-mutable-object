/*
* Provides an object that can be resized, dragged, and rotated.
*
* See http://developers.google.com/maps/documentation/javascript/customoverlays
* and http://github.com/webonise/google-maps-mutable-object
*/

if(typeof(webonise) === 'undefined') webonise = {};
if(!webonise.gmaps) webonise.gmaps = {};

// Constructor
WeboniseGmapsMutableObject.prototype = new google.maps.OverlayView();
function WeboniseGmapsMutableObject(map, html, latLng, changeCallback) {
  if(!map) throw "Please supply a map as the first argument of the MutableObject constructor";
  if(!html) throw "Please supply the HTML content of the mutable object as the second argument of the MutableObject constructor";
  if(!latLng) throw "Please supply the position for the mutable object as the third argument of the MutableObject constructor";
  if(!changeCallback) {
    console.debug("No change callback given on the mutable object; nobody will be notified when something happens");
  }

  console.debug("Instantiating a new mutable object at " + latLng.toString());
  console.dir(html);
  var wrapper = this.wrapper = $("<div></div>").addClass("WeboniseGmapsMutableObjectContent").append(html);
  this.container = $("<div></div>").addClass("WeboniseGmapsMutableObject webonise-gmaps-mutobj").append(wrapper);
  this.position = latLng;
  this.setMap(map);
  this.changeCallback = changeCallback;
};

WeboniseGmapsMutableObject.prototype.onAdd = function() {
  console.debug("Adding a mutable object to the map at " + this.position.toString());
  this.getPanes().overlayMouseTarget.appendChild(this.container.get(0));

  var me = this;

  console.debug("Making the wrapper draggable");
  this.wrapper.draggable({
    stop: function(event,ui) {
      me.updatePosition(ui.position.top, ui.position.left);
    }
  });
};

WeboniseGmapsMutableObject.prototype.onRemove = function() {
  console.debug("Removing a mutable object from the map at " + this.position.toString());
  this.container.remove();
};

WeboniseGmapsMutableObject.prototype.draw = function() {
  console.debug("Drawing (or redrawing) a mutable object on the map at " + this.position.toString());

  // Get a handle on the map, giving meaningful errors if it fails
  var map = this.getMap();
  if(!map) {
    console.dir(this);
    throw "No map found";
  }
  var mapDiv = map.getDiv();
  if(!mapDiv) {
    console.dir(this);
    console.dir(map);
    throw "No div found for map";
  }
  var $map = $(mapDiv);

  // If we can get the map, we can get the projection: no need to be so careful here
  var divPixel = this.getProjection().fromLatLngToDivPixel(this.position);

  this.container.css({
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 0,
    margin: 0,
    width: function() { return $map.width() },
    height: function() { return $map.height() }
  });

  this.wrapper.css({
    position: 'absolute',
    padding: 0,
    margin: 0,
    left: divPixel.x,
    top: divPixel.y
  });

  this.width = this.wrapper.width();
  this.height = this.wrapper.height();
};

WeboniseGmapsMutableObject.prototype.updateSize = function(width,height) {
  this.width = width;
  this.height = height;
};

WeboniseGmapsMutableObject.prototype.updatePosition = function(topPx,leftPx) {
  var point = new google.maps.Point(topPx, leftPx);
  if(!this.getProjection) {
    console.dir(this);
    throw "Could not find projection method";
  }
  var projection = this.getProjection();
  if(!projection) {
    console.dir(this);
    throw "No projection found for map of mutable object";
  }
  this.position = projection.fromDivPixelToLatLng(point);
  this.doChange();
};

WeboniseGmapsMutableObject.prototype.doChange = function() {
  if(!this.changeCallback) return;
  var latLng = this.position;
  var width = this.width;
  var height = this.height;
  this.changeCallback({
    lat: latLng.lat(),
    lng: latLng.lng(),
    width: this.width,
    height: this.height
  });
};

webonise.gmaps.MutableObject = WeboniseGmapsMutableObject;
