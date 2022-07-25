
var map;
var overlayTree; // tree structure of historic overlayTree
var overlay; //current historic overlay node
var overlayOldName; // former historic overlay name
var overlayLayers;
var overlaySelected;
var baseLayers; // base layers include Google, Bing and OS maps, and OpenStreetMap
var initialisation = true; // initialisation mode
var args;
var urlLayerName;
var baseLayerName;
var overlaygroupno;
var vectorSource;
var vectorSourceCounty;
var vectorSourceParish;
var DEFAULT_LAT = 56.80962;
var DEFAULT_LON = -5.06476;
var DEFAULT_ZOOM = 13;
var opacity = 1;
var pointClicked;
var noOverlaySelected;
var selectedFeatures = [];
var results = "";
var colorhex;
var rgb_r = 43;
var rgb_g = 55;
var rgb_b = 119;
var getCoordinates;
var addMarker;
var opacityvalue;

var inScotland;

var wfsOFF = true;
var wfsparishOFF = true;

var userInput = document.getElementById("searchtrenchmap");
var currentConversion = {name:userInput,sheet:'',quadrant:'',letter:'',number:0,grid:'',xOrdinate:0,yOrdinate:0,easting:0,northing:0,bonneX:0,bonneY:0,latitude:0,longitude:0,bound:'',uLHSbonneX:0,uLHSbonneY:0,uRHSbonneX:0,uRHSbonneY:0,lRHSbonneX:0,lRHSbonneY:0,lLHSbonneX:0,lLHSbonneY:0,description:'',preferredNLS:0}; 


proj4.defs("EPSG:27700", "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs");


var BingapiKey = "AgS4SIQqnI-GRV-wKAQLwnRJVcCXvDKiOzf9I1QpUQfFcnuV82wf1Aw6uw5GJPRz";


const apiKey = '7Y0Q1ck46BnB8cXXXg8X';

// var BingapiKey = "AuYEqWbz68YDIF-vezpAjVmKys4NULAlcJRxFVL4C_bLYw95RGrgC33Nw6UgTCxy";

var MapQuestKey = "H1O1fTnoHXxeehojtMyNwlPGqotj0L2O";

var getCoordinates = false;

var addMarker = false;

Number.prototype.toRad = function() {
               return this * Math.PI / 180;
}

var wgs84Sphere = new ol.Sphere(6378137);


var WFS_Feature = '{  "type": "FeatureCollection",  "features": [{ "type": "Feature","properties": {"Id": 0, "WFS_TITLE": null, "IMAGEURL": null,"IMAGETHUMB": null,"YEAR": null,' +
        ' "SHEET": null, "DATES": null, "COUNTY": null, "PARISH": null, "TYPE": null }, "geometry": { "type": "MultiPolygon","coordinates": [[[[-12.704210882880956,61.51873181105528],' +
         ' [ 8.706908308318583, 61.542540788079656],[ 5.62111828557728, 48.08588819669735], [-9.557925722928896,48.11387771177014],[-12.704210882880956,61.51873181105528]]]]}}]}';

function isNum(val){
  return !isNaN(val)
}

function zoomtoextent() {
	var overlay = getOverlay(urlLayerName);
        var extent = [overlay.get('minx'), overlay.get('miny'), overlay.get('maxx'), overlay.get('maxy')];
        extent = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
        map.getView().fit(extent, map.getSize());
}


function getOverlay(mosaic_id) {
    var layers = overlayLayers.slice();
    for (var x = 0; x < layers.length; x++) {
        if (layers[x].get('mosaic_id') == mosaic_id) return layers[x];
    }
}



function getColorLayers() {
 var layers = map.getLayers().getArray().slice();	
	for (var x = 0; x < layers.length; x++) {
         if (layers[x].get('title') == 'vectorcolor') return layers[x];
		    }
}

function getbaseLayer(mosaic_id) {
    var layers = baseLayers.slice();
    for (var x = 0; x < layers.length; x++) {
        if (layers[x].get('mosaic_id') == mosaic_id) return layers[x];
    }
}

function findByName(mosaic_id) {
		var layers = overlayLayers.slice();
		for (var i = 0; i < layers.length; i++) {
			if (mosaic_id == layers.item(i).get('mosaic_id')) {
			return layers.item(i);
			}
		}
	return null;
}


if ($("#layersSideBarOutlines").length > 0 )

	{

	// Make the DIV element draggable:
	 dragElement(document.getElementById("layersSideBarOutlines"));
	 dragElement(document.getElementById("searchSideBar"));

}


function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}


jQuery("#searchSideBar").on("mouseenter", function(event) {
 		document.getElementById('searchSideBar').style.zIndex = 2002;
	}); 

jQuery("#searchSideBar").on("mouseleave", function(event) {
 		document.getElementById('searchSideBar').style.zIndex = 2000;
	}); 


jQuery("#layersSideBarOutlines").on("mouseenter", function(event) {
 		document.getElementById('layersSideBarOutlines').style.zIndex = 2002;
	}); 


jQuery("#layersSideBarOutlines").on("mouseleave", function(event) {
 		document.getElementById('layersSideBarOutlines').style.zIndex = 2001;
	}); 


function setURL() {

	var zoom = map.getView().getZoom();
	var centre = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");
	var mapgroupno = map.getLayers().getArray()[2].get('group_no');
     	if (mapgroupno == 8) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=22&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
     	else if (mapgroupno == 9) { window.location = "https://maps.nls.uk/openlayers/?id=11&zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4); }
//     	else if (mapgroupno == 9) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4)  + "&layers=103&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
     	else if (mapgroupno == 18) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4)  + "&layers=24&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 31) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=11&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 32) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=14&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 34) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=101&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 35) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom="  + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=102&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 36) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=102&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 39) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=103&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }	
	else if (mapgroupno == 40) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=103&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 43) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=32&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 45) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom="  + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=34&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 50) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom="  + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=34&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 55) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=103&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 56) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=103&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 57) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=38&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 58) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=103&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 59) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=102&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 60) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=60&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 61) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=61&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 64) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=101&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 65) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=65&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 66) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=66&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 67) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom="  + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=28&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 69) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=69&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 70) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=70&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 79) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=79&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 80) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=34&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 82) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=77&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 84) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=80&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 85) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=34&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 93) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=83&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 95) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=14&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 96) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=83&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 98) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=103&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 100) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=103&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 107) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=80&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 108) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=80&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 109) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=103&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 116) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=84&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 208) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=118&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 209) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=118&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 210) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=118&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else if (mapgroupno == 211) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4) + "&layers=118&b=1&point=" + centre[1].toFixed(4) + "," +  centre[0].toFixed(4); }
	else { 	window.location = "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4); }


}

function sidebysideURL() {
   var centre = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");
   var urlLayerno = map.getLayers().getArray()[2].get('mosaic_id');
   window.location = "https://" + window.location.hostname + "/geo/explore/side-by-side/#zoom=" + map.getView().getZoom()  + "&lat=" + centre[1].toFixed(4)  + "&lon=" + centre[0].toFixed(4) +  "&layers=" + urlLayerno + "&right=ESRIWorld";
}

function printURL() {
   // var permalink =  new OpenLayers.Control.Permalink({div: document.getElementById("permalink"), anchor: true});   
   // map.addControl(permalink);
   var a = document.createElement('a');
   a = window.location.hash;
   window.location = "/geo/explore/print/" + a ;
}

function spyURL() {
   // var permalink =  new OpenLayers.Control.Permalink({div: document.getElementById("permalink"), anchor: true});   
   // map.addControl(permalink);
   var a = document.createElement('a');
   a = window.location.hash;
   window.location = "spy/" + a ;
}

function cesiumURL() { 
   var resolution = map.getView().getResolution();
   var distance = (Math.round(resolution)) * 800;
   var centre = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");
   var urlLayerno = map.getLayers().getArray()[2].get('mosaic_id');
   window.location = "3d/#distance=" + distance + "&tilt=1.10&heading=0&lat=" + centre[1].toFixed(4)  + "&lon=" + centre[0].toFixed(4) + "&layers=" + urlLayerno ; 
}

function printURLback() {
   // var zoom = map.getZoom();
   // var longlat = map.getCenter().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")); 
   var a = document.createElement('a');
   a = window.location.hash;
   window.location = "/geo/explore/" + a ;
}




function loadOptions()
{
	args = [];
	var hash = window.location.hash;
	if (hash.length > 0)
	{
		var elements = hash.split('&');
		elements[0] = elements[0].substring(1); /* Remove the # */

		for(var i = 0; i < elements.length; i++)
		{
			var pair = elements[i].split('=');
			args[pair[0]] = pair[1];
		}
	}
}


function checkwfsResults()

	{


	setTimeout( function(){

		if ((map.getView().getZoom() > 10) && (document.getElementById('wfsResults').innerHTML.length < 50))
	
			{
			document.getElementById('wfsResults').innerHTML = '&nbsp;<a href="javascript:setZoomLimit();" alt="View map details" title="View map details" >View map details?</a>&nbsp;';
			}

	}, 1500); // delay 50 ms
}


function switchparishWFSON()

	{
	wfsparishOFF = false;
	var parishinfo = document.getElementById('wfsParishCountyResults');
	parishinfo.innerHTML =  '&nbsp;Move mouse to show parish details under cursor&nbsp;';
	checkparishWFS();
	}


function switchparishWFSOFF()

	{
	wfsparishOFF = true;
		if (map.getLayers().getArray()[5].get('name') == 'vectorParish') {  
	
			map.getLayers().removeAt(5);
		}

	checkparishWFS();
	}


function checkparishWFS() 

	{

	var center = [];
	center = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:27700");

	if ((Math.round(center[0])  < 0) || (Math.round(center[0]) > 700000 ) || (Math.round(center[1]) < 0) || (Math.round(center[1]) > 1300000 )) 
		{ return; }


	var mapZoom = map.getView().getZoom();
	var parishinfo = document.getElementById('wfsParishCountyResults');

	if (mapZoom  < 13) 
		
		{

		parishinfo.innerHTML =  '';

		}

	else if  ((mapZoom  > 12) && (wfsparishOFF))

	{

	parishinfo.innerHTML =  '&nbsp;<a href="javascript:switchparishWFSON();" alt="Show specific parishes under mouse cursor" title="Show specific parishes under mouse cursor">Show parish details?</a>&nbsp;';
	}

	else if ((mapZoom  > 12) && (!wfsparishOFF))

	{

	getParish();
	}

}


function getParish()   

	{


//	console.log ("getParish_initiated");

//	document.getElementById('wfsParishCountyResults').innerHTML = '';

	var mapZoom = map.getView().getZoom();

	if (map.getLayers().getArray().length > 5)

	if (map.getLayers().getArray()[5].get('name') == 'vectorParish') {  

		map.getLayers().removeAt(5);

	}

	var extent = map.getView().calculateExtent(map.getSize());

	if (mapZoom > 12)


		{

	           var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSourceParish = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=nls:Scot_Eng_Wales_1950s_parish' +
			        '&PropertyName=(the_geom,COUNTY,PARISH,TYPE)&outputFormat=text/javascript&format_options=callback:loadFeaturesParish' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeaturesParish = function(response) {
			     vectorSourceParish.addFeatures(geojsonFormat.readFeatures(response));
			};


		}

	else if (mapZoom < 13)

		{

			vectorSourceParish = new ol.source.Vector();


 	  		var geojsonFormat = new ol.format.GeoJSON();

			  var loadFeaturesParish = function(WFS_Feature) {
			     vectorSourceParish.addFeatures(geojsonFormat.readFeatures(WFS_Feature));
			};

		}



			var vectorParish = new ol.layer.Vector({
			  name: 'vectorParish',
			  source: vectorSourceParish,
			  style: new ol.style.Style({
			    stroke: new ol.style.Stroke({
			      color: 'rgba(0, 0, 0, 0)',
			      width: 0
			    })
			  })
			});

		if (map.getLayers().getArray()[5].get('name') !== 'vectorParish')
		
			{

			map.getLayers().insertAt(5,vectorParish);

			}

			var displayFeatureInfoParish = function(pixel) {

				selectedFeatures = [];

			
				  var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
				        // return feature;

					selectedFeatures.push(feature);
				    }, {
				        layerFilter: function(layer) {
				            return layer === vectorParish;
				        }
				
				    });


				  var infoCounty = document.getElementById('wfsParishCountyResults');

				  var selectedFeaturesLength = selectedFeatures.length;




			          if (selectedFeaturesLength > 0)

				  {

				  if (selectedFeatures[0].get('COUNTY').length > 0) 
					{infoCounty.innerHTML = '&nbsp;' + selectedFeatures[0].get('PARISH') + '&nbsp;parish, '  + selectedFeatures[0].get('COUNTY') + ' (1950s)&nbsp;<a href="javascript:switchparishWFSOFF();" alt="Turn off parish details" title="Turn off parish details"><span class="WFSclose">&times;</span></a>&nbsp;';   } 
				  if (selectedFeatures[0].get('TYPE').length > 0) 
//					if (inScotland = true)
					{infoCounty.innerHTML = '&nbsp;' + selectedFeatures[0].get('PARISH') + '&nbsp;parish, '  + selectedFeatures[0].get('COUNTY') + ' (1950s) - <a href="javascript:showthisparish();" alt="View this parish in Boundaries Viewer" title="View this parish in Boundaries Viewer" >View parish</a> &nbsp; (1950s)&nbsp;<a href="javascript:switchparishWFSOFF();" alt="Turn off parish details" title="Turn off parish details"><span class="WFSclose">&times;</span></a>&nbsp;';    } 
						
				  }
				};




				map.on('pointermove', function(evt) {
				  var center = [];
				  center = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:27700");



				  if ((document.getElementById('type').value != 'none') || (map.getView().getZoom() < 11)) 
					{  document.getElementById('wfsParishCountyResults').innerHTML = ''; return; }


				  var pixel = map.getEventPixel(evt.originalEvent);

				  displayFeatureInfoParish(pixel);
				});


}


function switchWFSON()

	{
	wfsOFF = false;
	var info = document.getElementById('wfsResults');
	info.innerHTML =  '&nbsp;Move mouse to display map details under cursor&nbsp;';
	checkWFS();
	}


function switchWFSOFF()

	{
	wfsOFF = true;
	if (map.getLayers().getArray()[4].get('name') == 'vector') {  

			vectorSource = new ol.source.Vector();

			map.getLayers().removeAt(4); 

	}

	checkWFS();
	}


function checkWFS() 

	{

	var mapZoom = map.getView().getZoom();
	var info = document.getElementById('wfsResults');
	var map_group_no = map.getLayers().getArray()[2].get('group_no');
	var map_mosaic_id = map.getLayers().getArray()[2].get('mosaic_id');

	var centre = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");

	if (mapZoom  < 13) 
		
		{

		info.innerHTML =  '';

		}

	else if  ((mapZoom  > 12) && (wfsOFF))

		{
//		alert("wfsOFF1: " + wfsOFF);

		if (map_group_no == 1 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 32 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 34 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 35 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 36 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 38 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 39 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 40 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 43 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 50 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 55 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 56 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 57 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 58 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 59 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 61 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 64 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 65 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 66 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 70 ) 
		    { if ( map_mosaic_id == 117746211 )
			  {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
			else if (( map_mosaic_id == 117746212 ) && ( centre[1].toFixed(0) < 53 ))
			 {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		    }
		else if (map_group_no == 85 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 93 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 95 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 98 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 100 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 101 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 106 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 116 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 148 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 150 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 152 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 155 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 178 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 180 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 194 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 196 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 206 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 208 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 209 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 210 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
		else if (map_group_no == 211 ) {info.innerHTML =  '&nbsp;<a href="javascript:switchWFSON();" alt="Show specific details of map under mouse cursor" title="Show specific details of map under mouse cursor">Display map details? / View or order this map?</a>&nbsp;';}
//		else 
//			{
//			info.innerHTML =  '';
//			return;
//			}
		}

	        else if  ((mapZoom  > 12) && (!wfsOFF))
			{
//		alert("wfsOFF2: " + wfsOFF);
			setZoomLimit();

			}

		
	}



function setZoomLimit()

	{ 

	var mapZoom = map.getView().getZoom();

	var extent = map.getView().calculateExtent(map.getSize());

	if (map.getLayers().getArray().length > 4)

	if (map.getLayers().getArray()[4].get('name') == 'vector') {  

			vectorSource = new ol.source.Vector();

			map.getLayers().removeAt(4); 

//	console.log("removing vector layer 4");

	}


// console.log("Afterclear onmove length: " + map.getLayers().getArray()[4].getSource().getFeatures().length);


// setTimeout( function(){


	if (mapZoom  < 13)

		{

//	console.log("less than 13");

			vectorSource = new ol.source.Vector();

	  		var geojsonFormat = new ol.format.GeoJSON();
		
			loadFeatures = function(WFS_Feature) {
  			     vectorSource.addFeatures(geojsonFormat.readFeatures(WFS_Feature));
			};


		}



     else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '148')) // OS Quarter-Inch First Outline

		{
		
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
		
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

			

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '150')) // OS Quarter-Inch First Hills

		{
		
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
		
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

			

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '43')) // OS Quarter-Inch Third col

		{
		
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
		
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

			

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '152')) // OS Quarter-Inch Third Civil Air

		{
		
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
		
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

			

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '155')) // OS Quarter-Inch Fourth

		{
		
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
		
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

			

		}


    else if  ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '39'))

		{
			
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

	
			
		}


	else if     ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '58')) // One-Inch Hills

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=nls:OS_One_Inch_GB_Hills_WFS' +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};


		}


	else if     ((mapZoom  > 12) &&  (map.getLayers().getArray()[2].get('group_no') == '196')) // One-Inch Geological

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=nls:OS_One_Inch_GB_Hills_WFS' +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '66')) // One-Inch Soils

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '38')) // One-Inch 1st ed colour

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=nls:OS_Scotland_one-inch_1st_col_WFS' +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}


	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '208')) // Survey of India half-inch

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '209')) // Survey of India half-inch second

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '210')) // Survey of India one-inch first

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '211')) // Survey of India one-inch second

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}


	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '50')) // Bartholomew half-inch

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}


	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '85')) // Bartholomew half-inch 1940s

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '65')) // Land utilisation

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '40')) // OS Popular

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '98')) // OS Popular outline

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '101')) // OS Popular Nat Grid outline

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '1')) // Historic Maps API

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '56')) // OS New Pop England and Wales

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

        else if  ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '55'))
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}



	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '32')) // OS 1:25K Great Britain
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '106')) // OS 1:25K Outline edition
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '95')) // GSGS 3906
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '36')) // OS Six-inch, 1888-1910
	

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '35')) // OS Six-inch, Scotland 1st ed
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
	
		}


	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '59')) // OS Six-inch, 1888-1910
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '93')) // Geological Six-inch
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}



	else if     ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '100')) // One-Inch GSGS 3908

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}
			
	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '34'))    // OS 25 inch Scotland
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geoserver3.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '178'))    // OS 25 inch SW England 1st

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geoserver.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}
			
	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '64'))    // OS 25 inch England and Wales

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geoserver3.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '206'))    // OS 25 inch Gloucester 3rd ed

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '180'))    // OS 25 inch Blue and Blacks

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '61'))    // OS National Grid - London/Edinburgh

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
		}

	else  if     ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '57'))    // OS London 1890s

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));

			};
		}


	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '116'))    // Goad plans

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};


		}

	
	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '70'))    // OS town plans - Eng/Wal

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};


		}


			var vector = new ol.layer.Vector({
			  name: 'vector',
			  source: vectorSource,
			  style: new ol.style.Style({
			    stroke: new ol.style.Stroke({
			      color: 'rgba(0, 0, 0, 0)',
			      width: 0
			    })
			  })
			});

		// if (map.getLayers().getLength() > 3) 

		if (map.getLayers().getArray()[4].get('name') !== 'vector')
		
			{

			map.getLayers().insertAt(4,vector);
//			console.log("adding vector layer 4");

			}




//		setTimeout( function(){
//			window_width_centre = Math.round($(window).width() / 2);
//			window_height_centre = Math.round($(window).height() / 2);

//			displayFeatureInfo([window_width_centre,window_height_centre]);
//		}, 1000); // delay 50 ms


//   }, 2000); // delay 50 ms
			
				var displayFeatureInfo = function(pixel) {

				selectedFeatures = [];
				
				  var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
				        // return feature;

					selectedFeatures.push(feature);
				    }, {
				        layerFilter: function(layer) {
				            return layer === vector;
				        }
				
				    });

				  var info = document.getElementById('wfsResults');

//			selectedFeatures.sort(function(a, b){
//					   var nameA=a.id, nameB=b.id
//					   if (nameA < nameB) //sort string ascending
//					       return -1 
//					   if (nameA > nameB)
//					       return 1
//					   return 0 //default return value (no sorting)
//			
//					})

				  var selectedFeaturesLength = selectedFeatures.length;
				  var selectedFeaturesLengthMinusOne = (selectedFeatures.length - 1);
			
			          if (selectedFeaturesLength > 0)

				  {


			           if (selectedFeaturesLength == '1') 

				  {
					if (selectedFeatures[0].get('WFS_TITLE').length < 2) { return; }
					else
					{
					info.innerHTML = '&nbsp;' + selectedFeatures[0].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[0].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<a href="javascript:switchWFSOFF();" alt="Turn off specific map details" title="Turn off specific map details"><span class="WFSclose">&times;</span></a>&nbsp;';  
					}
				  }

			          else if (selectedFeaturesLength == '2')

				  {

					info.innerHTML = '&nbsp;' + selectedFeatures[0].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[0].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<a href="javascript:switchWFSOFF();" alt="Turn off specific map details" title="Turn off specific map details"><span class="WFSclose">&times;</span></a>&nbsp;<br/>' +
					'&nbsp;' + selectedFeatures[1].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[1].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<br/>';  
              				 
				  }

			          else if (selectedFeaturesLength == '3')

				  {

					info.innerHTML = '&nbsp;' + selectedFeatures[0].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[0].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<a href="javascript:switchWFSOFF();" alt="Turn off specific map details" title="Turn off specific map details"><span class="WFSclose">&times;</span></a>&nbsp;<br/>' +
					'&nbsp;' + selectedFeatures[1].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[1].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<br/>';  
              				'&nbsp;' + selectedFeatures[2].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[2].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<br/>';  
   
				  }

			          else if (selectedFeaturesLength == '4')

				  {

					info.innerHTML = '&nbsp;' + selectedFeatures[0].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[0].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<a href="javascript:switchWFSOFF();" alt="Turn off specific map details" title="Turn off specific map details"><span class="WFSclose">&times;</span></a>&nbsp;<br/>' +
					'&nbsp;' + selectedFeatures[1].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[1].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<br/>';  
              				'&nbsp;' + selectedFeatures[2].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[2].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<br/>';  
                 			'&nbsp;' + selectedFeatures[3].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[3].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;';  
   
				  }

				}
			
				};


				map.on('pointermove', function(evt) {
				  var center = [];
				  center = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:27700");

//				  if ((Math.round(center[0])  < 0) || (Math.round(center[0]) > 700000 ) || (Math.round(center[1]) < 0) || (Math.round(center[1]) > 1300000 )) 
//					{ return; }

				  if ((document.getElementById('type').value != 'none') || (map.getView().getZoom() < 11)) 
					{ document.getElementById('wfsResults').innerHTML = ''; return; }
				  var pixel = map.getEventPixel(evt.originalEvent);
				  displayFeatureInfo(pixel);



				});



}


// checkwfsResults();

function updateUrl()
{

		noOverlaySelected = false;

	 if (urlLayerName == undefined)
	 {

		noOverlaySelected = true;
		urlLayerName = '1';

	 }

	 else 
	{
	 if (overlay) urlLayerName = overlay.layer.get('mosaic_id');
	 }

 	if (baseLayerName == undefined) 
			 {
				baseLayerName = '1';

			 }

	 else 
			{

			 baseLayerName = map.getLayers().getArray()[0].get('mosaic_id');
			 }

	if (pointClicked == undefined)
			{
			pointClicked = '0,0';
			}

	var centre = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");

	if (pointClicked == '0,0')
	{
	window.location.hash = "zoom=" + map.getView().getZoom()  + "&lat=" + centre[1].toFixed(5)  + "&lon=" + centre[0].toFixed(5) +  "&layers=" + urlLayerName + "&b=" + baseLayerName; 
	}
	else
	{
	window.location.hash = "zoom=" + map.getView().getZoom()  + "&lat=" + centre[1].toFixed(5)  + "&lon=" + centre[0].toFixed(5) +  "&layers=" + urlLayerName + "&b=" + baseLayerName + "&marker=" + pointClicked ; 
	}

	if ($("#layerfilterzoom").length > 0 )

	{

	layerfilterzoom.innerHTML = "Only show maps with more detail <br/>than the current zoom level - <strong>(" + Math.round(map.getView().getZoom()) + ")</strong>";

	}

}



function getmapkey() {

	if (map.getLayers().getArray()[2].get('group_no') == '66') // Soil Survey - special function to return specific sheet popup

		{

			var coordinate = map.getView().getCenter();
			var pixel = map.getPixelFromCoordinate(coordinate);
			var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
   				 return feature;
				 }, {
				     layerFilter: function(layer) {
				         return layer === vector;
				 }
				});
				  if (feature) {

					var keytext = feature.get('IMAGEURL');
					var keytext1 = keytext.replace('view','view-sp');
    					newwindow= window.open(keytext1, "popup", "height=650,width=500,status=no,toolbar=no,scrollbars=yes,menubar=no,location=no,fullscreen=no");
				  } else {	    
					newwindow= window.open("https://maps.nls.uk/view-sp/107394481", "popup", "height=500,width=850,status=no,toolbar=no,scrollbars=yes,menubar=no,location=no,fullscreen=no");
				  }


		}

	else if (map.getLayers().getArray()[2].get('group_no') == '93') // Geological Survey - special function to return specific sheet popup

		{


			var coordinate = map.getView().getCenter();
			var pixel = map.getPixelFromCoordinate(coordinate);
			var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
   				 return feature;
				 }, {
				     layerFilter: function(layer) {
				         return layer === vector;
				 }
				});
				  if (feature) {

					var keytext = feature.get('IMAGEURL');
					var keytext1 = keytext.replace('view','view-sp');
//					console.log(keytext);
    					newwindow= window.open(keytext1, "popup", "height=650,width=500,status=no,toolbar=no,scrollbars=yes,menubar=no,location=no,fullscreen=no");
				  } else {	    
					newwindow= window.open("https://maps.nls.uk/view-sp/91541629", "popup", "height=500,width=850,status=no,toolbar=no,scrollbars=yes,menubar=no,location=no,fullscreen=no");
				  }


		}
	else if (map.getLayers().getArray()[2].get('group_no') == '96')

		{



			var coordinate = map.getView().getCenter();
			var pixel = map.getPixelFromCoordinate(coordinate);
			var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
 				 return feature;
				 }, {
				     layerFilter: function(layer) {
				         return layer === vector;
				 }
				});
				  if (feature) {

					var keytext = feature.get('IMAGEURL');
					var keytext1 = keytext.replace('view','view-sp');
    					newwindow= window.open(keytext1, "popup", "height=650,width=500,status=no,toolbar=no,scrollbars=yes,menubar=no,location=no,fullscreen=no");
				  } else {	    
					newwindow= window.open("https://maps.nls.uk/view-sp/91541629", "popup", "height=500,width=850,status=no,toolbar=no,scrollbars=yes,menubar=no,location=no,fullscreen=no");
				  }


		}

	else
		{
    		var keytext = map.getLayers().getArray()[2].get('key');
    		newwindow= window.open("https://"+keytext, "popup", "height=500,width=850,status=no,toolbar=no,scrollbars=yes,menubar=no,location=no,fullscreen=no");
		}


}


function showthismap(imageurl) {


//			console.log("imageurl" + imageurl);

			 if (imageurl.length > 0)
	
				{ 

				window.location = imageurl; 

				}
	
			else {	    
				// setURL();
				document.getElementById('wfsResults').innerHTML = "Sorry, couldn't find this map";
			}

}

function showthisparish() {

		var coordinate = map.getView().getCenter();

		var pixel = map.getPixelFromCoordinate(coordinate);

			var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
				        return feature;
				 }, {
				     layerFilter: function(layer) {
				         return layer === vectorParish;
				 }
				
			});

		if (feature) 
				{

				var extent = feature.getGeometry().getExtent();
				}
			else
				{
        			var extent = map.getView().calculateExtent(map.getSize());
				}

		  	 var resolution = map.getView().getResolutionForExtent(extent, map.getSize());
	 		 var zoom1 = map.getView().getZoomForResolution(resolution);

		  	 var resolution = map.getView().getResolutionForExtent(extent, map.getSize());
	 		 var zoom1 = map.getView().getZoomForResolution(resolution);

			 var y = extent[1] + (extent[3] - extent[1]) / 2; 

		
			 if (map.getSize()[0] < 600 ) 
								
					{
			 		var x1 = extent[0] + (extent[2] - extent[0]) / 2; 
			 		var x = extent[2] + (x1 - extent[0] ) / 2; 
					var zoom = Math.round(zoom1 - 2);
					}
				else
					{
					var zoom = Math.round(zoom1 - 1);
			 		var x = extent[0] + (extent[2] - extent[0]) / 2; 
					}

		var newCentre = [];
		var newCentre = ol.proj.transform([x,y], "EPSG:3857", "EPSG:4326");
		window.location = "https://maps.nls.uk/geo/boundaries/#zoom=" + zoom + "&lat=" + newCentre[1].toFixed(4) + "&lon=" + newCentre[0].toFixed(4) + "&dates=1950" + "&point=" + newCentre[1].toFixed(4) + "," + newCentre[0].toFixed(4);

}

function showmymap(image) {



				  if (image) {

//  console.log("https://maps.nls.uk/view/" + image);


						window.location = "https://maps.nls.uk/view/" + image; 

						}
	
					   else {	    
						// setURL();
						document.getElementById('wfsResults').innerHTML = "Sorry, couldn't find this map";
					  }
						

}

      var container = document.getElementById('popup');
      var content = document.getElementById('popup-content');
      var closer = document.getElementById('popup-closer');

      var overlaylayer = new ol.Overlay(({
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }
      }));
       
      closer.onclick = function() {
        overlaylayer.setPosition(undefined);
	remove_getCoordinates();
        closer.blur();
        return false;
      };




// From https://www.movable-type.co.uk/scripts/latlong-gridref.html NT261732
    function gridrefNumToLet(e, n, digits) {
        // get the 100km-grid indices
        var e100k = Math.floor(e / 100000),
        n100k = Math.floor(n / 100000);

        if (e100k < 0 || e100k > 6 || n100k < 0 || n100k > 12) return '';

        // translate those into numeric equivalents of the grid letters
        var l1 = (19 - n100k) - (19 - n100k) % 5 + Math.floor((e100k + 10) / 5);
        var l2 = (19 - n100k) * 5 % 25 + e100k % 5;

        // compensate for skipped 'I' and build grid letter-pairs
        if (l1 > 7) l1++;
        if (l2 > 7) l2++;
        var letPair = String.fromCharCode(l1 + 'A'.charCodeAt(0), l2 + 'A'.charCodeAt(0));

        // strip 100km-grid indices from easting & northing, and reduce precision
        e = Math.floor((e % 100000) / Math.pow(10, 5 - digits / 2));
        n = Math.floor((n % 100000) / Math.pow(10, 5 - digits / 2));

        Number.prototype.padLZ = function(w) {
            var n = this.toString();
            while (n.length < w) n = '0' + n;
            return n;
        }

        var gridRef = letPair + " " + e.padLZ(digits / 2) + " " + n.padLZ(digits / 2);

        return gridRef;
    }
	function gridrefLetToNum(gridref) {
	  // get numeric values of letter references, mapping A->0, B->1, C->2, etc:
	  var l1 = gridref.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
	  var l2 = gridref.toUpperCase().charCodeAt(1) - 'A'.charCodeAt(0);
	  // shuffle down letters after 'I' since 'I' is not used in grid:
	  if (l1 > 7) l1--;
	  if (l2 > 7) l2--;

	  // convert grid letters into 100km-square indexes from false origin (grid square SV):
	  var e = ((l1-2)%5)*5 + (l2%5);
	  var n = (19-Math.floor(l1/5)*5) - Math.floor(l2/5);

	  // skip grid letters to get numeric part of ref, stripping any spaces:
	  gridref = gridref.slice(2).replace(/ /g,'');

	  // append numeric part of references to grid index:
	  e += gridref.slice(0, gridref.length/2);
	  n += gridref.slice(gridref.length/2);

	  // normalise to 1m grid, rounding up to centre of grid square:
	  switch (gridref.length) {
		case 2: e += '5000'; n += '5000'; break;
	    case 4: e += '500'; n += '500'; break;
	    case 6: e += '50'; n += '50'; break;
	    case 8: e += '5'; n += '5'; break;
	    // 10-digit refs are already 1m
	  }

	  return [e, n];
	}


if (document.getElementById('Modal') !== null) {

	// Get the modal
	var modal = document.getElementById('Modal');
	
	
	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("modal-close")[0];
	
	
	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	    modal.style.display = "none";
	}
	
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}

}


/**
 * Parses Grid Reference to OsGridRef object.
 *
 * Accepts standard Grid References (eg 'SU 387 148'), with or without whitespace separators, from
 * two-digit references up to 10-digit references (1m × 1m square), or fully numeric comma-separated
 * references in metres (eg '438700,114800').
 *
 * @param   {string}    gridref - Standard format OS Grid Reference.
 * @returns {OsGridRef} Numeric version of Grid Reference in metres from false origin (SW corner of
 *   supplied grid square).
 * @throws Error on Invalid Grid Reference.
 *
 * @example
 *   var grid = OsGridRef.parse('TG 51409 13177'); // grid: { easting: 651409, northing: 313177 }
 */

function gridreferror() {

		modal.style.display = "block";

		document.getElementById('modal-text').innerHTML = 'Sorry - could not interpret this Grid Reference.<br/>' +
					'Please type a standard National Grid Reference (eg. "NT 263 721", "NT263721" ), ' +
					'with or without whitespace separators, from two-digit references (eg. "NT26" - 10km x 10km square) ' +
					'up to 10-digit references (eg. "NT2637572134" - 1m × 1m square), ' +
					'or a fully numeric comma-separated reference in metres (eg "326375,672134").<br/><br/>' +
					'Click on the cross (top right) or outside this box to close it.';

	}


function gridreference (gridref) {
    gridref = String(gridref).trim();

// console.log("gridreflength: " + gridref.length);

    // check for fully numeric comma-separated gridref format
    var match = gridref.match(/^(\d+),\s*(\d+)$/);
    if (match) return [match[1], match[2]];

    // validate format
    match = gridref.match(/^[A-Z]{2}\s*[0-9]+\s*[0-9]+$/i);
    if (!match) { gridreferror(); return; }

    // get numeric values of letter references, mapping A->0, B->1, C->2, etc:
    var l1 = gridref.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    var l2 = gridref.toUpperCase().charCodeAt(1) - 'A'.charCodeAt(0);
    // shuffle down letters after 'I' since 'I' is not used in grid:
    if (l1 > 7) l1--;
    if (l2 > 7) l2--;

    // convert grid letters into 100km-square indexes from false origin (grid square SV):
    var e100km = ((l1-2)%5)*5 + (l2%5);
    var n100km = (19-Math.floor(l1/5)*5) - Math.floor(l2/5);

    // skip grid letters to get numeric (easting/northing) part of ref
    var en = gridref.slice(2).trim().split(/\s+/);
    // if e/n not whitespace separated, split half way
    if (en.length == 1) en = [ en[0].slice(0, en[0].length/2), en[0].slice(en[0].length/2) ];

    // validation
    if (e100km<0 || e100km>6 || n100km<0 || n100km>12) {  gridreferror(); return; }
    if (en.length != 2) { gridreferror();  return; }
    if (en[0].length != en[1].length) { gridreferror();  return; }

    // standardise to 10-digit refs (metres)

// console.log("en[0]: " + en[0]);
// console.log("en[1]: " + en[1]);

    if (gridref.length == 2)
	{en[0] = (en[0]+'50000').slice(0, 5); en[1] = (en[1]+'500000').slice(0, 5);  }
    if (gridref.length == 3)
	{en[0] = (en[0]+'50000').slice(0, 5); en[1] = (en[1]+'500000').slice(0, 5);  }
    else if (gridref.length == 4)
	{en[0] = (en[0]+'50000').slice(0, 5); en[1] = (en[1]+'50000').slice(0, 5);  }
    else if (gridref.length == 5)
	{en[0] = (en[0]+'50000').slice(0, 5); en[1] = (en[1]+'50000').slice(0, 5);  }
    else if (gridref.length == 6)
	{en[0] = (en[0]+'5000').slice(0, 5); en[1] = (en[1]+'5000').slice(0, 5);  }
    else if (gridref.length == 7)
	{en[0] = (en[0]+'5000').slice(0, 5); en[1] = (en[1]+'5000').slice(0, 5);  }
    else if (gridref.length == 8)
	{en[0] = (en[0]+'500').slice(0, 5); en[1] = (en[1]+'500').slice(0, 5);  }
    else if (gridref.length == 9)
	{en[0] = (en[0]+'500').slice(0, 5); en[1] = (en[1]+'500').slice(0, 5);  }
    else if (gridref.length == 10)
	{en[0] = (en[0]+'50').slice(0, 5); en[1] = (en[1]+'50').slice(0, 5);  }
    else if (gridref.length == 11)
	{en[0] = (en[0]+'5').slice(0, 5); en[1] = (en[1]+'5').slice(0, 5);  }
    else if (gridref.length == 12)
	{en[0] = (en[0]+'5').slice(0, 5); en[1] = (en[1]+'5').slice(0, 5);  }

// console.log("en2[0]: " + en[0]);
// console.log("en2[1]: " + en[1]);


    var e = e100km + en[0];
    var n = n100km + en[1];

// console.log("e: " + e);
// console.log("n: " + n);

    return [e, n];


};




 

function setZoomLayers() {


	var mapZoom = map.getView().getZoom();

	if ((map.getLayers().getArray()[2].get('group_no') == '82') && (mapZoom < 4)) 


                     {
                           tsa_layer_01.setVisible(false);
                           tsa_layer_02.setVisible(false);
                           tsa_layer_03.setVisible(false);
                           tsa_layer_04.setVisible(false);
                           tsa_layer_05.setVisible(false);
                           document.getElementById('wfsResults').innerHTML = "Around 1:80 million scale map. Zoom in for more detailed scales.&nbsp;";
                     }
       
       else if ((map.getLayers().getArray()[2].get('group_no') == '82') && ((mapZoom > 3) && (mapZoom < 5))) 

                     {
                           tsa_layer_01.setVisible(true);
                           tsa_layer_02.setVisible(false);
                           tsa_layer_03.setVisible(false);
                           tsa_layer_04.setVisible(false);
                            tsa_layer_05.setVisible(false);
                           document.getElementById('wfsResults').innerHTML = "&nbsp;Around 1:14 million scale maps. Zoom in for more detailed scales.&nbsp;";
                     }

       else if ((map.getLayers().getArray()[2].get('group_no') == '82') && ((mapZoom > 4) && (mapZoom < 6))) 

                     {
                           tsa_layer_01.setVisible(true);
                           tsa_layer_02.setVisible(false);
                           tsa_layer_03.setVisible(false);
                           tsa_layer_04.setVisible(false);
                           tsa_layer_05.setVisible(false);
                           document.getElementById('wfsResults').innerHTML = "&nbsp;Around 1:14 million scale maps. Zoom in for more detailed scales.&nbsp;";
                     }

       else if ((map.getLayers().getArray()[2].get('group_no') == '82') && ((mapZoom > 5) && (mapZoom < 7))) 

                     {
                           tsa_layer_01.setVisible(true);
                           tsa_layer_02.setVisible(true);
                           tsa_layer_03.setVisible(false);
                           tsa_layer_04.setVisible(false);
                           tsa_layer_05.setVisible(false);
                           document.getElementById('wfsResults').innerHTML = "&nbsp;Around 1:12 million scale maps. Zoom in for more detailed scales.&nbsp;";
                     }

       else if ((map.getLayers().getArray()[2].get('group_no') == '82') && ((mapZoom > 6) && (mapZoom < 8))) 

                     {
                           tsa_layer_01.setVisible(true);
                           tsa_layer_02.setVisible(true);
                           tsa_layer_03.setVisible(true);
                           tsa_layer_04.setVisible(false);
                           tsa_layer_05.setVisible(false);
                           document.getElementById('wfsResults').innerHTML = "&nbsp;Around 1:5 million scale maps. Zoom in for more detailed scales.&nbsp;";
                     }

       else if ((map.getLayers().getArray()[2].get('group_no') == '82') && ((mapZoom > 7) && (mapZoom < 9))) 

                     {
                           tsa_layer_01.setVisible(true);
                           tsa_layer_02.setVisible(true);
                           tsa_layer_03.setVisible(true);
                           tsa_layer_04.setVisible(true);
                           tsa_layer_05.setVisible(false);
                           document.getElementById('wfsResults').innerHTML = "&nbsp;Around 1:2 million scale maps. Zoom in for more detailed scales.&nbsp;";
                     }

       else if ((map.getLayers().getArray()[2].get('group_no') == '82') && (mapZoom > 9)) 

                     {
                           tsa_layer_01.setVisible(true);
                           tsa_layer_02.setVisible(true);
                           tsa_layer_03.setVisible(true);
                           tsa_layer_04.setVisible(true);
                           tsa_layer_05.setVisible(true);
                           document.getElementById('wfsResults').innerHTML = "&nbsp;Around 1:1 million scale maps. Zoom out for less detailed scales.&nbsp;";
                     }

       if ((map.getLayers().getArray()[2].get('group_no') == '225') && (mapZoom < 17)) 

		     {
			OS1900sGB_layer.setVisible(true);
			OStwentyfiveinchnewcastleadds.setVisible(false);
			 OStwentyfiveinchholes.setVisible(false);
			 OStwentyfiveinchbedfordshire.setVisible(false);
			 OStwentyfiveinchberkshire.setVisible(false);
			 OStwentyfiveinchcambridge.setVisible(false);
			  OStwentyfiveinchcheshire.setVisible(false);
			 OStwentyfiveinchcornwall.setVisible(false);
			 OStwentyfiveinchcumberland.setVisible(false);
			 OStwentyfiveinchdevon.setVisible(false);
			 OStwentyfiveinchdorset.setVisible(false);
			  OStwentyfiveinchdurham.setVisible(false);
			 OStwentyfiveinchhampshire.setVisible(false);
			 OStwentyfiveinchbuckingham.setVisible(false);
			 OStwentyfiveinchessex.setVisible(false);
			 OStwentyfiveinch_raywilson.setVisible(false);
			 OStwentyfiveinchgloucestershire.setVisible(false);
			 OStwentyfiveinchherefordshire.setVisible(false);
			 OStwentyfiveinchhuntingdon.setVisible(false);
			 OStwentyfiveinchlancashire.setVisible(false);
			 OStwentyfiveinchleicestershire.setVisible(false);
			 OStwentyfiveinchlincolnshire.setVisible(false);
			 OStwentyfiveinchmiddlesex.setVisible(false);
			 OStwentyfiveinchnorfolk.setVisible(false);
			 OStwentyfiveinchnorthampton.setVisible(false);
			 OStwentyfiveinchnorthumberland.setVisible(false);
			 OStwentyfiveinchnottinghamshire.setVisible(false);
			 OStwentyfiveinchkent.setVisible(false);
			 OStwentyfiveinchrutland.setVisible(false);
			 OStwentyfiveinchshropshire_derby.setVisible(false);
			 OStwentyfiveinchstaffordshire.setVisible(false);
			 OStwentyfiveinchsurrey.setVisible(false);
			 OStwentyfiveinchsussex.setVisible(false);
			 OStwentyfiveinchlondon.setVisible(false);
			 OStwentyfiveinchhertfordshire.setVisible(false);
			 OStwentyfiveinchoxford.setVisible(false);
			 OStwentyfiveinchsomerset.setVisible(false);
			 OStwentyfiveinchsuffolk.setVisible(false);
			 OStwentyfiveinchwarwick.setVisible(false);
			 OStwentyfiveinchwestmorland.setVisible(false);
			 OStwentyfiveinchwiltshire.setVisible(false);
			 OStwentyfiveinchworcestershire.setVisible(false);
			 OStwentyfiveinchyorkshire.setVisible(false);
			 OStwentyfiveinchwales.setVisible(false);
			 os25scotland.setVisible(false);
			 os25scotland2.setVisible(false);
			 os25scotland2_lauder.setVisible(false);


		     }
	else if ((map.getLayers().getArray()[2].get('group_no') == '225') && (mapZoom > 16)) 
		     {
			OS1900sGB_layer.setVisible(false);
			OStwentyfiveinchnewcastleadds.setVisible(true);
			 OStwentyfiveinchholes.setVisible(true);
			 OStwentyfiveinchbedfordshire.setVisible(true);
			 OStwentyfiveinchberkshire.setVisible(true);
			 OStwentyfiveinchcambridge.setVisible(true);
			  OStwentyfiveinchcheshire.setVisible(true);
			 OStwentyfiveinchcornwall.setVisible(true);
			 OStwentyfiveinchcumberland.setVisible(true);
			 OStwentyfiveinchdevon.setVisible(true);
			 OStwentyfiveinchdorset.setVisible(true);
			  OStwentyfiveinchdurham.setVisible(true);
			 OStwentyfiveinchhampshire.setVisible(true);
			 OStwentyfiveinchbuckingham.setVisible(true);
			 OStwentyfiveinchessex.setVisible(true);
			 OStwentyfiveinch_raywilson.setVisible(true);
			 OStwentyfiveinchgloucestershire.setVisible(true);
			 OStwentyfiveinchherefordshire.setVisible(true);
			 OStwentyfiveinchhuntingdon.setVisible(true);
			 OStwentyfiveinchlancashire.setVisible(true);
			 OStwentyfiveinchleicestershire.setVisible(true);
			 OStwentyfiveinchlincolnshire.setVisible(true);
			 OStwentyfiveinchmiddlesex.setVisible(true);
			 OStwentyfiveinchnorfolk.setVisible(true);
			 OStwentyfiveinchnorthampton.setVisible(true);
			 OStwentyfiveinchnorthumberland.setVisible(true);
			 OStwentyfiveinchnottinghamshire.setVisible(true);
			 OStwentyfiveinchkent.setVisible(true);
			 OStwentyfiveinchrutland.setVisible(true);
			 OStwentyfiveinchshropshire_derby.setVisible(true);
			 OStwentyfiveinchstaffordshire.setVisible(true);
			 OStwentyfiveinchsurrey.setVisible(true);
			 OStwentyfiveinchsussex.setVisible(true);
			 OStwentyfiveinchlondon.setVisible(true);
			 OStwentyfiveinchhertfordshire.setVisible(true);
			 OStwentyfiveinchoxford.setVisible(true);
			 OStwentyfiveinchsomerset.setVisible(true);
			 OStwentyfiveinchsuffolk.setVisible(true);
			 OStwentyfiveinchwarwick.setVisible(true);
			 OStwentyfiveinchwestmorland.setVisible(true);
			 OStwentyfiveinchwiltshire.setVisible(true);
			 OStwentyfiveinchworcestershire.setVisible(true);
			 OStwentyfiveinchyorkshire.setVisible(true);
			 OStwentyfiveinchwales.setVisible(true);
			 os25scotland.setVisible(true);
			 os25scotland2.setVisible(true);
			 os25scotland2_lauder.setVisible(true);


		     }

    if ((map.getLayers().getArray()[2].get('group_no') == '175') && (mapZoom < 15)) 

		     {
			OS1900sGB_layer.setVisible(true);
			sixinch2scot_api_layer.setVisible(false);
			sixinch2scot_76411765.setVisible(false);
			sixinch2scot_loch_resort.setVisible(false);

		     }
	else if ((map.getLayers().getArray()[2].get('group_no') == '175') && (mapZoom > 14)) 
		     {
			OS1900sGB_layer.setVisible(false);
			sixinch2scot_api_layer.setVisible(true);
			sixinch2scot_76411765.setVisible(true);
			sixinch2scot_loch_resort.setVisible(true);
		     }

       }



	var esri_world_imagery = new ol.layer.Tile({
		preload: Infinity,
		title: 'Change background map - ESRI World Image',
	        mosaic_id: '1',
		type: 'base', 
		    source: new ol.source.XYZ({
			          attributions: [
			            new ol.Attribution({ html: 'Tiles &copy; <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">ArcGIS</a>. '})
			          ],
			              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
			                  'World_Imagery/MapServer/tile/{z}/{y}/{x}'
	      	})
	    });

	var esri_world_topo = new ol.layer.Tile({
		preload: Infinity,
		title: 'Background map - ESRI World Topo',
	        mosaic_id: '2',
		type: 'base', 
		    source: new ol.source.XYZ({
			          attributions: [
			            new ol.Attribution({        html: 'Tiles &copy; <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>. '})
			          ],
			              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
			                  'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
	      	})
	    });

	var BingSatellite =   new ol.layer.Tile({
                preload: Infinity,
		title: 'Background map - Bing Satellite',
		mosaic_id: '4',
		type: 'base', 
	        source: new ol.source.BingMaps({
			key: BingapiKey,
			imagerySet: 'Aerial',
			maxZoom: 19
		    })
	});

	var BingRoad = new ol.layer.Tile({
                 preload: Infinity,
	         title: 'Background map - Bing Road',
		 mosaic_id: '5',
	         type: 'base',
	         source: new ol.source.BingMaps({
		      key: BingapiKey,
		      imagerySet: 'RoadOnDemand'
		    })
	});

	var BingAerialWithLabels = new ol.layer.Tile({
                  preload: Infinity,
	          title: 'Background map - Bing Hybrid',
		  mosaic_id: '3',
	          type: 'base',
	          source: new ol.source.BingMaps({
			key: BingapiKey,
			imagerySet: 'AerialWithLabels',
			maxZoom: 19
		})
	});





	var maptiler_basic =  new ol.layer.Tile({
		title: 'Background map - MapTiler Streets',
	        mosaic_id: '6',
            	source: new ol.source.TileJSON({
     		url: 'https://api.maptiler.com/maps/streets/256/tiles.json?key=7Y0Q1ck46BnB8cXXXg8X',
	      	attributions: [
	            new ol.Attribution({ html: '<a href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap contributors</a>'})
	          ],
              crossOrigin: 'anonymous'
            })
          });

	var maptiler_elevation =  new ol.layer.Tile({
		title: 'Background map - MapTiler Elevation',
	        mosaic_id: '6',
            	source: new ol.source.TileJSON({
     		url: 'https://api.maptiler.com/maps/outdoor/256/tiles.json?key=7Y0Q1ck46BnB8cXXXg8X',
	      	attributions: [
	            new ol.Attribution({ html: '<a href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap contributors</a>'})
	          ],
              crossOrigin: 'anonymous'
            })
          });


	// OpenStreetMap
	var osm = new ol.layer.Tile({
                 preload: Infinity,
	         title: 'Background map - OpenStreetMap',
	         mosaic_id: '7',
	              source: new ol.source.OSM({
	              // attributions: [ol.source.OSM.DATA_ATTRIBUTION],
	              url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
	          })/*,
	      opacity: 0.7*/
	});

	var OSOpendata = new ol.layer.Tile({
	              title: 'Background map - OS Opendata',
	              mosaic_id: '8',
	              type: 'base',
		      source: new ol.source.XYZ({
				    attributions: [
			            	new ol.Attribution({html: '<a href="https://www.ordnancesurvey.co.uk/oswebsite/opendata/">Ordnance Survey OpenData</a>. Contains OS data © Crown copyright and database right (2010)'})
			            ],
				    url: 'https://mapseries-tilesets.s3.amazonaws.com/opendata/{z}/{x}/{y}.png',
				    // minZoom: 10,
				    maxZoom: 17,
				    tilePixelRatio: 1
				  })
	                    });

	var OSMapsAPI = new ol.layer.Tile({
		      preload: Infinity,
	              title: 'Background map - OS Maps API',
	              mosaic_id: '8',
	              type: 'base',
    			visible: false,	
		      source: new ol.source.XYZ({
				    attributions: [
			            	new ol.Attribution({html: 'Contains OS data © Crown copyright and database right 2021'})
			            ],
				    url: 'https://api.os.uk/maps/raster/v1/zxy/Outdoor_3857/{z}/{x}/{y}.png?key=' + 'Rt69sv62Dv1JNAvlJAcM0upXIaIcpua8',
				    minZoom: 7
				  })
	                    });


	var OS1920s =  	new ol.layer.Tile({
	            title: 'Background map - OS 1920s',
	            mosaic_id: '9',
	            type: 'base',
		    source: new ol.source.XYZ({
			          attributions: [
			            new ol.Attribution({html: '<a href=\'https://maps.nls.uk/projects/api/\'>NLS Historic Maps API</a>'})
			          ],
				url: 'https://mapseries-tilesets.s3.amazonaws.com/api/nls/{z}/{x}/{y}.jpg',
				// minZoom: 10,
				maxZoom: 13,
				tilePixelRatio: 1
		})
          });


	var OS1900sGBback =  new ol.layer.Tile({
	            title: 'Background map - OS 1900s',
		        group_no: '',
		        mosaic_id: '10',
			typename: 'nls:WFS',
			source: new ol.source.TileJSON({
			          attributions: [
				            new ol.Attribution({html: '<a href=\'https://maps.nls.uk/projects/subscription-api/\'>NLS Historic Maps Subscription API layer</a>'})
			          ],
			        url: 'https://api.maptiler.com/tiles/uk-osgb1888/tiles.json?key=7Y0Q1ck46BnB8cXXXg8X',
			        tileSize: 256,
			        crossOrigin: 'anonymous'
				}),
			        type: 'overlay', 
			        visible: false,
			        minx: -8.8, 
				miny: 49.8,
			        maxx: 1.77, 
			        maxy: 60.9
          });

	var stamenterrain = new ol.layer.Tile({
          preload: Infinity,
	  title: 'Background map - Stamen Terrain',
	       mosaic_id: '11',
	        visible: true,
	       source: new ol.source.Stamen({
	       layer: 'terrain'
	     })
	   });

	var opentopomap = new ol.layer.Tile({
                preload: Infinity,
		title: 'Background map - OpenTopoMap',
	        mosaic_id: '12',
		type: 'base', 
		    source: new ol.source.XYZ({
			          attributions: [
			            new ol.Attribution({html: 'Map tiles under <a href=\'https://creativecommons.org/licenses/by/3.0/\'>CC BY SA</a> from <a href=\'https://opentopomap.org/\'>OpenTopoMap</a>'})
			          ],
			          urls:[
			            'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
			            'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
			            'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
			          ],
	      	})
	    });



	var LIDAR_PhaseIDSM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR - Scotland LiDAR DSM 1m',
        	      mosaic_id: 'LIDAR_1m',
		        minx: -6.018560765016743, 
			miny: 54.7202519250655257,
		        maxx: -1.7394074862220423,
		        maxy: 59.16548440533408,
			extent: ol.proj.transformExtent([-6.018560765016743,54.7202519250655257,-1.7394074862220423,59.16548440533408], 'EPSG:4326', 'EPSG:3857'),
		          source: new ol.source.TileWMS({
				    attributions: '<a href="https://www.spatialdata.gov.scot/geonetwork/srv/eng/catalog.search#/metadata/92367c84-74d3-4426-8b0f-6f4a8096f593">Crown copyright Scottish Government, SEPA and Scottish Water (2012).</a>',
		           url: 'https://srsp-ows.jncc.gov.uk/ows?service=wms',
		           params: {'LAYERS': 'scotland-lidar-1-dsm', 'TILED': true},
		           serverType: 'geoserver',
		            // Countries have transparency, so do not fade tiles:
		            transition: 0
		          })
	        });



	var LIDAR_PhaseIIDSM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR - Scotland LiDAR DSM 1m',
		        minx: -6.707079677043194, 
			miny: 55.39718748727408,
		        maxx: -1.1045617513147379,
		        maxy: 60.214145102884835,
			extent: ol.proj.transformExtent([-6.707079677043194,55.39718748727408,-1.1045617513147379,60.214145102884835], 'EPSG:4326', 'EPSG:3857'),
		          source: new ol.source.TileWMS({
				    attributions: '<a href="https://www.spatialdata.gov.scot/geonetwork/srv/eng/catalog.search#/metadata/92367c84-74d3-4426-8b0f-6f4a8096f593">Crown copyright Scottish Government, SEPA and Scottish Water (2012).</a>',
		           url: 'https://srsp-ows.jncc.gov.uk/ows?service=wms',
		           params: {'LAYERS': 'scotland-lidar-2-dsm', 'TILED': true},
		           serverType: 'geoserver',
		            // Countries have transparency, so do not fade tiles:
		            transition: 0
		          })
	        });

	var LIDAR_PhaseIIIDSM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR - Scotland LiDAR DSM 1m',
		        minx: -5.301796092147682, 
			miny: 54.57852588884711,
		        maxx: -1.7598842659693053,
		        maxy: 56.192386501638076,
			extent: ol.proj.transformExtent([-5.301796092147682,54.57852588884711,-1.7598842659693053,56.192386501638076], 'EPSG:4326', 'EPSG:3857'),
		          source: new ol.source.TileWMS({
				    attributions: '<a href="https://www.spatialdata.gov.scot/geonetwork/srv/eng/catalog.search#/metadata/92367c84-74d3-4426-8b0f-6f4a8096f593">Crown copyright Scottish Government, SEPA and Scottish Water (2012).</a>',
		           url: 'https://srsp-ows.jncc.gov.uk/ows?service=wms',
		           params: {'LAYERS': 'scotland-lidar-3-dsm', 'TILED': true},
		           serverType: 'geoserver',
		            // Countries have transparency, so do not fade tiles:
		            transition: 0
		          })
	        });

	var LIDAR_PhaseIVDSM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR - Scotland LiDAR DSM 1m',
		        minx: -5.167737424724375, 
			miny: 55.03117291033663,
		        maxx: -2.0485138495768784,
		        maxy: 56.51603850769755,

			extent: ol.proj.transformExtent([-5.167737424724375,55.03117291033663,-2.0485138495768784,56.51603850769755], 'EPSG:4326', 'EPSG:3857'),
		          source: new ol.source.TileWMS({
				    attributions: '<a href="https://www.spatialdata.gov.scot/geonetwork/srv/eng/catalog.search#/metadata/92367c84-74d3-4426-8b0f-6f4a8096f593">Crown copyright Scottish Government, SEPA and Scottish Water (2012).</a>',
		           url: 'https://srsp-ows.jncc.gov.uk/ows?service=wms',
		           params: {'LAYERS': 'scotland-lidar-4-dsm', 'TILED': true},
		           serverType: 'geoserver',
		            // Countries have transparency, so do not fade tiles:
		            transition: 0
		          })
	        });



   var LIDAR_Comp_DSM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR - LiDAR DSM 1m',
        	      mosaic_id: 'LIDAR_1m',
		      minx: -7.09, 
			miny: 49.814, 
		        maxx: 2.1452, 
		        maxy: 55.8332,
			extent: ol.proj.transformExtent([-7.0980160000000003,49.8141069999999999,2.1452689999999999,55.8332639999999998], 'EPSG:4326', 'EPSG:3857'),
		          source: new ol.source.TileWMS({
				attributions: '<a href="https://environment.data.gov.uk/dataset/6f51a299-351f-4e30-a5a3-2511da9688f7">&copy; Environment Agency copyright 2019.</a>',
		            url: 'https://environment.data.gov.uk/spatialdata/lidar-composite-digital-surface-model-dsm-1m/wms',
		           params: {'LAYERS': 'LIDAR_Composite_DSM_1m', 'TILED': true},
		            serverType: 'geoserver',
		            // Countries have transparency, so do not fade tiles:
		            transition: 0,
		          minResolution: 2445
		          })
	        });

// LIDAR_PhaseIIDSM_1m, LIDAR_PhaseIIIDSM_1m, LIDAR_PhaseIVDSM_1m, 

	    var LIDAR_1m = new ol.layer.Group({
	  	extent: ol.proj.transformExtent([-8.8, 49.8, 1.8, 60.9], 'EPSG:4326', 'EPSG:3857'),
	        preload: Infinity,
		title: "Background map - LiDAR DSM 1m", 	
		mosaic_id: '15',
		layers: [ LIDAR_PhaseIVDSM_1m, LIDAR_PhaseIIIDSM_1m, LIDAR_PhaseIIDSM_1m,  LIDAR_PhaseIDSM_1m, LIDAR_Comp_DSM_1m, LIDAR_Wales_1m ],
	        tileOptions: {crossOriginKeyword: null},      
	        minx: -8.8, 
		miny: 49.8,
	        maxx: 1.8, 
	        maxy: 60.9
	    });



	var LIDAR_PhaseIDSM_DTM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR  - LiDAR DTM 1m (Scotland) Ph 1',
        		preload: Infinity,
        	      mosaic_id: 'LIDAR_1m_dtm1',
		        minx: -5.64082049, 
			miny: 54.75447998,
		        maxx: -1.75109870,
		        maxy: 59.16445469,
			extent: ol.proj.transformExtent([-5.64082049, 54.75447998, -1.75109870, 59.16445469], 'EPSG:4326', 'EPSG:3857'),
		       source: new ol.source.XYZ({
			          attributions: [
				    new ol.Attribution({html:'<a href="https://www.spatialdata.gov.scot/geonetwork/srv/eng/catalog.search#/metadata/92367c84-74d3-4426-8b0f-6f4a8096f593">Crown copyright Scottish Government, SEPA, Fugro and Scottish Water (2012-2021).</a> With thanks to Richard Pearson for processing using <a href="https://plugins.qgis.org/plugins/rvt-qgis/">RVT</a>.'})
			          ],
				url: 'https://geo.nls.uk/mapdata3/lidar/rgb/phase1/{z}/{x}/{y}.png',
				maxZoom: 16,
				tilePixelRatio: 1
		          })
	        });


	var LIDAR_PhaseIIDSM_DTM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR  - LiDAR DTM 1m (Scotland) Ph 2',
        		preload: Infinity,
        	      mosaic_id: 'LIDAR_1m_dtm2',
		        minx: -6.45731344, 
			miny: 55.42393632, 
		        maxx: -1.10455815, 
		        maxy: 60.21362318,
			extent: ol.proj.transformExtent([-6.45731344, 55.42393632, -1.10455815, 60.21362318], 'EPSG:4326', 'EPSG:3857'),
		       source: new ol.source.XYZ({
			          attributions: [
				    new ol.Attribution({html:'<a href="https://www.spatialdata.gov.scot/geonetwork/srv/eng/catalog.search#/metadata/92367c84-74d3-4426-8b0f-6f4a8096f593">Crown copyright Scottish Government, SEPA, Fugro and Scottish Water (2012-2021).</a> With thanks to Richard Pearson for processing using <a href="https://plugins.qgis.org/plugins/rvt-qgis/">RVT</a>.'})
			          ],
				url: 'https://geo.nls.uk/mapdata3/lidar/rgb/phase2/{z}/{x}/{y}.png',
				maxZoom: 16,
				tilePixelRatio: 1
		          })
	        });


	var LIDAR_PhaseIIIDSM_DTM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR  - LiDAR DTM 1m (Scotland) Ph 3',
        		preload: Infinity,
        	      mosaic_id: 'LIDAR_1m_dtm3',
		        minx: -5.20888029, 
			miny: 54.58438826, 
		        maxx: -1.76291556, 
		        maxy: 56.16226120,
			extent: ol.proj.transformExtent([-5.20888029, 54.58438826, -1.76291556, 56.16226120], 'EPSG:4326', 'EPSG:3857'),
		       source: new ol.source.XYZ({
			          attributions: [
				    new ol.Attribution({html:'<a href="https://www.spatialdata.gov.scot/geonetwork/srv/eng/catalog.search#/metadata/92367c84-74d3-4426-8b0f-6f4a8096f593">Crown copyright Scottish Government, SEPA, Fugro and Scottish Water (2012-2021).</a> With thanks to Richard Pearson for processing using <a href="https://plugins.qgis.org/plugins/rvt-qgis/">RVT</a>.'})
			          ],
				url: 'https://geo.nls.uk/mapdata3/lidar/rgb/phase3/{z}/{x}/{y}.png',
				maxZoom: 17,
				tilePixelRatio: 1
		          })
	        });



	var LIDAR_PhaseIVDSM_DTM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR  - LiDAR DTM 1m (Scotland) Ph 4',
        		preload: Infinity,
        	      mosaic_id: 'LIDAR_1m_dtm4',
		        minx: -5.06296279, 
			miny: 55.03117110, 
		        maxx: -2.00156025, 
		        maxy: 56.54875244,
			extent: ol.proj.transformExtent([-5.06296279, 55.03117110, -2.00156025, 56.54875244], 'EPSG:4326', 'EPSG:3857'),
		       source: new ol.source.XYZ({
			          attributions: [
				    new ol.Attribution({html:'<a href="https://www.spatialdata.gov.scot/geonetwork/srv/eng/catalog.search#/metadata/92367c84-74d3-4426-8b0f-6f4a8096f593">Crown copyright Scottish Government, SEPA, Fugro and Scottish Water (2012-2021).</a> With thanks to Richard Pearson for processing using <a href="https://plugins.qgis.org/plugins/rvt-qgis/">RVT</a>.'})
			          ],
				url: 'https://geo.nls.uk/mapdata3/lidar/rgb/phase4/{z}/{x}/{y}.png',
				maxZoom: 17,
				tilePixelRatio: 1
		          })
	        });

	var LIDAR_PhaseVDSM_DTM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR  - LiDAR DTM 50cm (Scotland) Ph 5',
        		preload: Infinity,
        	      mosaic_id: 'LIDAR_50cm_dtm5',
		        minx: -5.06296279, 
			miny: 55.03117110, 
		        maxx: -2.00156025, 
		        maxy: 56.54875244,
			extent: ol.proj.transformExtent([-4.72643490, 55.67676503, -2.48441827, 56.50383840], 'EPSG:4326', 'EPSG:3857'),
		       source: new ol.source.XYZ({
			          attributions: [
				    new ol.Attribution({html:'<a href="https://www.spatialdata.gov.scot/geonetwork/srv/eng/catalog.search#/metadata/92367c84-74d3-4426-8b0f-6f4a8096f593">Crown copyright Scottish Government, SEPA, Fugro and Scottish Water (2012-2021).</a> With thanks to Richard Pearson for processing using <a href="https://plugins.qgis.org/plugins/rvt-qgis/">RVT</a>.'})
			          ],
				url: 'https://geo.nls.uk/mapdata3/lidar/rgb/phase5/{z}/{x}/{y}.png',
				maxZoom: 17,
				tilePixelRatio: 1
		          }),
			maxZoom: 17
	        });

	var LIDAR_Hebrides_DTM_1m = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR  - LiDAR DTM 1m (Hebrides)',
        		preload: Infinity,
        	      mosaic_id: 'LIDAR_1m_dtm_hebrides',
		        minx: -7.47930274, 
			miny: 57.04121284, 
		        maxx: -6.12453882, 
		        maxy: 58.52140630,
			extent: ol.proj.transformExtent([-7.47930274, 57.04121284, -6.12453882, 58.52140630], 'EPSG:4326', 'EPSG:3857'),
		       source: new ol.source.XYZ({
			          attributions: [
				    new ol.Attribution({html:'<a href="https://www.spatialdata.gov.scot/geonetwork/srv/eng/catalog.search#/metadata/92367c84-74d3-4426-8b0f-6f4a8096f593">Crown copyright Scottish Government, SEPA, Fugro and Scottish Water (2012-2021).</a> With thanks to Richard Pearson for processing using <a href="https://plugins.qgis.org/plugins/rvt-qgis/">RVT</a>.'})
			          ],
				url: 'https://geo.nls.uk/mapdata3/lidar/rgb/hebrides/{z}/{x}/{y}.png',
				maxZoom: 17,
				tilePixelRatio: 1
		          })
	        });



   var LIDAR_DTM_1m_2017 = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR  - LiDAR DTM 1m - England 2017',
        	      mosaic_id: 'LIDAR_1m_2017',
		      minx: -7.09, 
			miny: 49.814, 
		        maxx: 2.1452, 
		        maxy: 55.8332,
			extent: ol.proj.transformExtent([-7.0980160000000003,49.8141069999999999,2.1452689999999999,55.8332639999999998], 'EPSG:4326', 'EPSG:3857'),
		          source: new ol.source.TileWMS({
				attributions: '<a href="https://environment.data.gov.uk/dataset/aace5ed3-2580-4c2e-bdd8-69b3d473d99d">&copy; Environment Agency copyright 2019.</a>',
		            url: 'https://environment.data.gov.uk/spatialdata/lidar-composite-digital-surface-model-dtm-1m/wms',
		           params: {'LAYERS': 'LIDAR_Composite_DTM_1m', 'TILED': true},
		            serverType: 'geoserver',
		            // Countries have transparency, so do not fade tiles:
		            transition: 0,
		       //   minResolution: 2445
		          })
	        });

   var LIDAR_Comp_DTM_1m_2020 = new ol.layer.Tile({
	              title: 'Bing / ESRI / OSM / LiDAR  - LiDAR DTM 1m (2019)',
        	      mosaic_id: 'LIDAR_1m',
		      minx: -7.09, 
			miny: 49.814, 
		        maxx: 2.1452, 
		        maxy: 55.8332,
			extent: ol.proj.transformExtent([-7.0980160000000003,49.8141069999999999,2.1452689999999999,55.8332639999999998], 'EPSG:4326', 'EPSG:3857'),
		          source: new ol.source.TileWMS({
				attributions: '<a href="https://environment.data.gov.uk/dataset/aace5ed3-2580-4c2e-bdd8-69b3d473d99d">&copy; Environment Agency copyright 2019.</a>',
		       //     url: 'https://environment.data.gov.uk/spatialdata/lidar-composite-digital-surface-model-dtm-1m/wms',
		            url: 'https://environment.data.gov.uk/spatialdata/lidar-composite-digital-terrain-model-dtm-1m-2020/wms',
		           params: {'LAYERS': '1', 'TILED': true},
		            serverType: 'geoserver',
		            // Countries have transparency, so do not fade tiles:
		            transition: 0,
		       //   minResolution: 2445
		          }),
			maxZoom: 15
	        });

   var LIDAR_Comp_DTM_1m = new ol.layer.Group ({
  	extent: ol.proj.transformExtent([-8.8, 49.8, 1.8, 60.9], 'EPSG:4326', 'EPSG:3857'),
        preload: Infinity,
	              title: 'Background map - LiDAR DTM 50cm-1m (2017)',
        	      mosaic_id: '14',
		group_no: '14',	
		layers: [  LIDAR_Hebrides_DTM_1m, LIDAR_PhaseIIDSM_DTM_1m, LIDAR_PhaseIDSM_DTM_1m,  LIDAR_PhaseIVDSM_DTM_1m, LIDAR_PhaseIIIDSM_DTM_1m,  LIDAR_PhaseVDSM_DTM_1m, LIDAR_DTM_1m_2017, LIDAR_Wales_DTM_1m ],
	        tileOptions: {crossOriginKeyword: null},      
	        minx: -8.8, 
		miny: 49.8,
	        maxx: 1.8, 
	        maxy: 60.9
	        });


      var LIDAR_1m_DTM = new ol.layer.Group({
  	extent: ol.proj.transformExtent([-8.8, 49.8, 1.8, 60.9], 'EPSG:4326', 'EPSG:3857'),
        preload: Infinity,
	title: "Background map - LiDAR DTM 50cm-1m (2019-2021)", 	
	mosaic_id: '13',
	group_no: '13',	
	layers: [ LIDAR_Hebrides_DTM_1m, LIDAR_PhaseIIDSM_DTM_1m, LIDAR_PhaseIDSM_DTM_1m, LIDAR_PhaseIVDSM_DTM_1m, LIDAR_PhaseIIIDSM_DTM_1m,  LIDAR_PhaseVDSM_DTM_1m, LIDAR_Comp_DTM_1m_2020, LIDAR_Wales_DTM_1m ],
        tileOptions: {crossOriginKeyword: null},      
        minx: -8.8, 
	miny: 49.8,
        maxx: 1.8, 
        maxy: 60.9
    });




	    var LIDAR_2m_DTM = new ol.layer.Group({
	  	extent: ol.proj.transformExtent([-8.8, 49.8, 1.8, 60.9], 'EPSG:4326', 'EPSG:3857'),
	        preload: Infinity,
		title: "Background map - LiDAR DTM 2m (Eng, Wales)", 
		mosaic_id: '14',	
		layers: [ LIDAR_Comp_DTM_2m, LIDAR_Wales__DTM_2m ],
	        tileOptions: {crossOriginKeyword: null},      
	        minx: -8.8, 
		miny: 49.8,
	        maxx: 1.8, 
	        maxy: 60.9
	    });



	    var LIDAR_2m = new ol.layer.Group({
	  	extent: ol.proj.transformExtent([-8.8, 49.8, 1.8, 60.9], 'EPSG:4326', 'EPSG:3857'),
	        preload: Infinity,
		title: "Background map - LiDAR DSM 2m (Eng, Wales)", 
		mosaic_id: '16',	
		layers: [ LIDAR_Comp_DSM_2m, LIDAR_Wales_2m ],
	        tileOptions: {crossOriginKeyword: null},      
	        minx: -8.8, 
		miny: 49.8,
	        maxx: 1.8, 
	        maxy: 60.9
	    });

	var baseLayers = [  esri_world_imagery, esri_world_topo,  BingAerialWithLabels, BingSatellite, BingRoad, maptiler_elevation, osm, OSMapsAPI, OS1920s, OS1900sGBback, stamenterrain, opentopomap, LIDAR_1m_DTM, LIDAR_2m_DTM, LIDAR_1m,  LIDAR_2m ];


	// Load overlay layers of current node

$(document).ready(function() {

 function checkWidth() {
    var windowWidth = $(window).width();
	var hasFocus = $('#nlsgaz').is(':focus');
	var hasFocus1 = $('#ngrgaz').is(':focus');
	var hasFocus2 = $('#searchgb1900').is(':focus');

    if ((((windowWidth >= 500) || (hasFocus) || (hasFocus1) || (hasFocus2)))) {
         if ($("#searchSideBar") != null )  { jQuery("#searchSideBar").show(); }
         if ($("#layersSideBarOutlines") != null )  { jQuery("#layersSideBarOutlines").show(); }
         if ($("#trackgeolocation") != null )  {jQuery("#trackgeolocation").show(); }
         if ($("#show") != null ) { jQuery("#show").hide(); }
         if ($("#showlayersOutlinesExplore") != null ) { jQuery("#showlayersOutlinesExplore").hide(); }
         if ($("#exploreslideroverlay") != null ) { jQuery("#exploreslideroverlay").show(); }
         if ($("#exploreslideroverlaymobile") != null ) { jQuery("#exploreslideroverlaymobile").hide(); }

    } else {
	  $("#footer").click(function() {
   		 window.location = "https://maps.nls.uk";
	});
         if ($("#searchSideBar") != null )  { jQuery("#searchSideBar").hide(); }
         if ($("#layersSideBarOutlines") != null )  { jQuery("#layersSideBarOutlines").hide(); }
         if ($("#trackgeolocation") != null )  {jQuery("#trackgeolocation").show(); }
         if ($("#show") != null ) { jQuery("#show").show(); }
         if ($("#showlayersOutlinesExplore") != null ) { jQuery("#showlayersOutlinesExplore").show(); }
         if ($("#exploreslideroverlay") != null ) { jQuery("#exploreslideroverlay").show(); }
         if ($("#exploreslideroverlaymobile") != null ) { jQuery("#exploreslideroverlaymobile").show(); }
    }
 }
 checkWidth();

 $(window).resize(checkWidth);
});



	loadOptions();

		var currentZoom = DEFAULT_ZOOM;
		var currentLat = DEFAULT_LAT;
		var currentLon = DEFAULT_LON;
		if (args['zoom'])
		{
			currentZoom = args['zoom'];
		}
		if (args['lat'] && args['lon'])
		{
			currentLat = parseFloat(args['lat']); /* Necessary for lat (only) for some reason, otherwise was going to 90-val. Very odd... */
			currentLon = parseFloat(args['lon']);		
		}
		if (args['zoom'] && args['lat'] && args['lon'])
		{
			defaultLLZ = false;	
		}
		if (args['layers'])
		{
			urlLayerName = args['layers'];
		}
		if (args['b'])
		{
			baseLayerName = args['b'];
		}
		if (args['marker'])
		{
		pointClicked = args['marker'];
		}

	      var attribution = new ol.control.Attribution({
	        collapsible: false
	      });


		var map = new ol.Map({
		  target: document.getElementById('map'),
		  renderer: 'canvas',
		  layers: [],
		  controls: ol.control.defaults({attribution: false}).extend([attribution]),
		  logo: false,
		  overlays: [overlaylayer],
		  loadTilesWhileAnimating: true,
		  view: new ol.View({
		    center: ol.proj.transform([currentLon, currentLat], 'EPSG:4326', 'EPSG:3857'),
		    zoom: currentZoom,
		    constrainRotation: false
		  })
		});


	      function checkSize() {
	        var small = map.getSize()[0] < 800;
	        attribution.setCollapsible(small);
	        attribution.setCollapsed(small);
	      }
	
	      window.addEventListener('resize', checkSize);
	      checkSize();


	    var layerSelect = document.getElementById('layerSelect');
	    for (var x = 0; x < baseLayers.length; x++) {
	        // if (!baseLayers[x].displayInLayerSwitcher) continue;
	        var option = document.createElement('option');
		option.appendChild(document.createTextNode(baseLayers[x].get('title')));
	        option.setAttribute('value', x);
	        option.setAttribute('id', 'baseOption' + baseLayers[x].get('title'));
	        layerSelect.appendChild(option);
	    }

	if (baseLayerName == undefined) {
			var baseSelected = baseLayers[0];
		}

	else    {
			var baseSelected = getbaseLayer(baseLayerName);
		}


	if (map.getLayers().getLength() < 1) { 	map.getLayers().insertAt(0,baseSelected); }

	var baseLayerName = map.getLayers().getArray()[0].get('mosaic_id');

	document.getElementById("layerSelect").selectedIndex = baseLayerName - 1;
	getbaseLayer(baseLayerName).setVisible(true);



	map.getLayers().insertAt(1,trench_maps); 




	// map.on("moveend", setPanEnd);

	// Change historical map
	var changemap = function(index) {
	  map.getLayers().removeAt(0);
	  map.getLayers().insertAt(0,baseLayers[index]);
	  // map.getLayers().getArray()[1].setOpacity(opacity);
	  updateUrl();
	  getbaseLayer(baseLayerName).setVisible(true);
	}


//    var zoomslider = new ol.control.ZoomSlider();
//    map.addControl(zoomslider);
    map.addControl(new ol.control.ScaleLine());

    var mouseposition = new ol.control.MousePosition({
            projection: 'EPSG:4326',
            coordinateFormat: function(coordinate) {
	    // BNG: ol.extent.applyTransform([x, y], ol.proj.getTransform("EPSG:4326", "EPSG:27700"), 

		var str = map.getLayers().getArray()[2].get('group_no');

		var coord27700 = ol.proj.transform(coordinate, 'EPSG:4326', 'EPSG:27700');
		var templatex = '{x}';
		var outx = ol.coordinate.format(coord27700, templatex, 0);
		var templatey = '{y}';
		var outy = ol.coordinate.format(coord27700, templatey, 0);
		NGR = gridrefNumToLet(outx, outy, 10);
		var trench = forwardProject2(coordinate[0], coordinate[1]);
		var trench2 = forwardConvertMapSheet();
		var hdms = ol.coordinate.toStringHDMS(coordinate);
		if ((outx  < 0) || (outx > 700000 ) || (outy < 0) || (outy > 1300000 )) {
			if ((trench2 !== 'error') && (str == 60))
			{
		        return '<strong>' + ol.coordinate.format(coordinate, '{y}, {x}', 5) + '&nbsp; <br/>&nbsp;' + hdms + ' &nbsp;<br/>&nbsp;Trench Map Coordinates: '  + trench2 + ' &nbsp;'; 
			}
			else
			{
		        return '<strong>' + ol.coordinate.format(coordinate, '{y}, {x}', 5) + '&nbsp; <br/>&nbsp;' + hdms + ' &nbsp;'; 
			}
		}
		else 
                { return '<strong>' + NGR + '</strong>&nbsp; <br/>' + ol.coordinate.format(coord27700, '{x}, {y}', 0) + 
			'&nbsp; <br/>' + ol.coordinate.format(coordinate, '{y}, {x}', 5) + '&nbsp; <br/>&nbsp;' + hdms + ' &nbsp;'; }
            	}
    });

    map.addControl(mouseposition);

	updateUrl();

	if (getOverlay(urlLayerName) == undefined) {


		overlaySelected = overlayLayers[0];
	}
	else
	{
	var overlaySelected = getOverlay(urlLayerName);
	}

	if ((!map.getView().getCenter()) && (overlaySelected)) {
		var extent = [overlaySelected.get('minx'), overlaySelected.get('miny'), overlaySelected.get('maxx'), overlaySelected.get('maxy')];
	        extent = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
	        map.getView().fit(extent, map.getSize());
	  }



	updateOverlaySwitcher();
        loadOverlayNode();


	overlayOldName = overlaySelected.get('title');
        overlayLayersInitial = [];
        overlayLayers = [];
        // var extent = map.getExtent();     map.getView().calculateExtent(map.getSize());
        var extent = map.getView().calculateExtent(map.getSize());
      	var bounds = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:3857" , "EPSG:4326"));
	for (var i = 0; i < overlayLayersAll.length; i++) {
	  var layerOL = overlayLayersAll[i];
          var overlayBounds = [layerOL.get('minx'), layerOL.get('miny'), layerOL.get('maxx'), layerOL.get('maxy')];
	   // if(overlayBounds.intersectsExtent(bounds)) overlayLayers.push(layerOL);  (ol.extent.containsExtent(overlayBounds, bounds)
	  if(ol.extent.intersects(overlayBounds, bounds)) overlayLayers.push(layerOL);  
	}

 	
	updateOverlaySwitcher();
        loadOverlayNode();
	switchOverlayinitial();

//        map.getView().on('change:resolution', setZoomLimitCounty);
//        map.getView().on('change:resolution', setZoomLimit);

        map.getView().on('change:resolution', setZoomLayers);


//	setTimeout( function(){
//		setZoomLimit();
//	}, 250); // delay 50 ms

	checktrenchmap();
	checkgb();

   jQuery( document ).ready(function() {
	jQuery('#mapslider').slider({
	  formater: function(value) {
	    opacity = value / 100;
	    map.getLayers().getArray()[2].setOpacity(opacity);
	    // overlay.layer.setOpacity(opacity);

	    return 'Opacity: ' + value + '%';

	  }
	});

	$( "#mapslider" ).on( "slideStop", function( event, ui ) 
		{ 	
		checkreuse();
		} 
	);

	checkreuse();



    	});




   jQuery( document ).ready(function() {
	jQuery('#mapslidermobile').slider({
	  formater: function(value) {
	    opacity = value / 100;
	    map.getLayers().getArray()[2].setOpacity(opacity);
	    // overlay.layer.setOpacity(opacity);

	    return 'Opacity: ' + value + '%';

	  }
	});

	$( "#mapslidermobile" ).on( "slideStop", function( event, ui ) 
		{ 	
		checkreuse();
		} 
	);

	checkreuse();


    	});


	if ($("#layerfiltercheckbox").length > 0 )

	{

		document.getElementById('layerfiltercheckbox').addEventListener('change', function(){
		        checkWFS();
			overlayOldName = map.getLayers().getArray()[2].get('title');
			urlLayerName = map.getLayers().getArray()[2].get('mosaic_id');
		        overlayLayersInitial = [];
		        overlayLayers = [];
		        var extent = map.getView().calculateExtent(map.getSize());
		      	var bounds = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:3857" , "EPSG:4326"));
			for (var i = 0; i < overlayLayersAll.length; i++) {
			  var layerOL = overlayLayersAll[i];
		          var overlayBounds = [layerOL.get('minx'), layerOL.get('miny'), layerOL.get('maxx'), layerOL.get('maxy')];
			  // if (ol.extent.intersects(overlayBounds, bounds)) overlayLayers.push(layerOL); 
			  if(ol.extent.intersects(overlayBounds, bounds)) overlayLayersInitial.push(layerOL);  
			}
		
			if ($('#layerfiltercheckbox').is(":checked")) {
		
				var zoom = map.getView().getZoom();
			        if (zoom > 17) { zoom = 17; }
	
				for (var i = 0; i < overlayLayersInitial.length; i++) {
				    var layerInitial = overlayLayersInitial[i];
				  if (layerInitial.get('maxZoom') > zoom) overlayLayers.push(layerInitial);
			
				}
	
				if (overlayLayers.length < 1 )
				{
				var overlaySelected = getOverlay(urlLayerName);
					overlayLayers.push(overlaySelected);
	
	
				}
		
			}
			else
			{
			overlayLayers = overlayLayersInitial;
			}
	
			
			var overlayLayersLength = overlayLayers.length;
				
			var layers = "";
	
	
			if (jQuery('#layerfiltercheckbox').is(":checked")) 
	
				{
	
					if (overlayLayersLength == 1) 
					{
						layers += '<div id="layerinfo">&nbsp;1 detailed map layer covers this area</div>';
					}
		
					else 
					{
						layers += '<div id="layerinfo">&nbsp;' + overlayLayersLength + ' more detailed map layers cover this area</div>';
					}
	
				}
	
			else 
				{
	
					if (overlayLayersLength == 1) 
					{
					layers += '<div id="layerinfo">&nbsp;1 map layer covers this area</div>';
					}
	
					else 
					{
						layers += '<div id="layerinfo">&nbsp;' + overlayLayersLength + ' map layers cover this area</div>';
					}
	
				}
				
			setLayers(layers);
	
	
	
				overlaySelected = overlayLayers[0];
				
				if (map.getLayers().getArray()[2].get('title') == null)
					{
						map.getLayers().insertAt(2,overlaySelected);
					}
	
				if (overlaySelected) { overlaySelected.setVisible(true); }
				overlayOldName = map.getLayers().getArray()[2].get('title');
	
	//			if (overlayLayersLength > 1)
	//			{
					updateOverlaySwitcher();
					loadOverlayNode();
					switchOverlayUpdateMode();
					// getWFS();
					// setHeader();
	//			}
		

	setTimeout( function(){
		
			if (map.getLayers().getArray()[7].getSource().getFeatures().length > 0)
			{
		
				var centre = map.getView().getCenter();
				var scotlandgeom = map.getLayers().getArray()[7].getSource().getFeatures()[0].getGeometry();
			
				if (scotlandgeom.intersectsCoordinate(centre))
				{
				inScotland = true;
				}
				else
				{
				inScotland = false;
				}
			}
			checkreuse();


	}, 2500); // delay 50 ms


		});

	}



    function onMoveEnd(evt) {

	updateUrl();
//	setZoomLimitCounty();

	checkWFS();

	checkparishWFS();

	checktrenchmap();
	checkgb();

        var map = evt.map; 
	urlLayerName = map.getLayers().getArray()[2].get('mosaic_id');
	overlayOldName = map.getLayers().getArray()[2].get('title');
        overlayLayersInitial = [];
        overlayLayers = [];
        var extent = map.getView().calculateExtent(map.getSize());
      	var bounds = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:3857" , "EPSG:4326"));
	for (var i = 0; i < overlayLayersAll.length; i++) {
	  var layerOL = overlayLayersAll[i];
          var overlayBounds = [layerOL.get('minx'), layerOL.get('miny'), layerOL.get('maxx'), layerOL.get('maxy')];
	  // if (ol.extent.intersects(overlayBounds, bounds)) overlayLayers.push(layerOL); 
	  if(ol.extent.intersects(overlayBounds, bounds)) overlayLayersInitial.push(layerOL);  
	}

//	if ($("#layerfiltercheckbox").length > 0 )

	if ($('#layerfiltercheckbox').is(":checked")) {

		var zoom = map.getView().getZoom();

		if (zoom > 17) { zoom = 17; }

		for (var i = 0; i < overlayLayersInitial.length; i++) {
		    var layerInitial = overlayLayersInitial[i];
		  if (layerInitial.get('maxZoom') > zoom) overlayLayers.push(layerInitial);
	
		}

		if (overlayLayers.length < 1 )
		{
				var overlaySelected = getOverlay(urlLayerName);
					overlayLayers.push(overlaySelected);
	
		}

	}
	else
	{
	overlayLayers = overlayLayersInitial;
	}
	
	var overlayLayersLength = overlayLayers.length;

	var layers = "";

		if (jQuery('#layerfiltercheckbox').is(":checked")) 

			{

				if (overlayLayersLength == 1) 
				{
					layers += '<div id="layerinfo">&nbsp;1 detailed map layer covers this area</div>';
				}
	
				else 
				{
					layers += '<div id="layerinfo">&nbsp;' + overlayLayersLength + ' more detailed layers cover this area</div>';
				}

			}

		else 
			{

				if (overlayLayersLength == 1) 
				{
				layers += '<div id="layerinfo">&nbsp;1 map layer covers this area</div>';
				}

				else 
				{
					layers += '<div id="layerinfo">&nbsp;' + overlayLayersLength + ' map layers cover this area</div>';
				}

			}

	setLayers(layers);



			overlaySelected = overlayLayers[0];
	
			if (map.getLayers().getArray()[2].get('title') == null)
				{
					map.getLayers().insertAt(2,overlaySelected);
				}
			if (overlaySelected) { overlaySelected.setVisible(true); }
			overlayOldName = map.getLayers().getArray()[2].get('title');
	
	
				
//			if (overlayLayersLength > 1)
//			{
				updateOverlaySwitcher();
				loadOverlayNode();
				switchOverlayUpdateMode();
				// getWFS();
				// setHeader();
//			}


	setTimeout( function(){


			if (map.getLayers().getArray()[7].getSource().getFeatures().length > 0)
			{
		
				var centre = map.getView().getCenter();
				var scotlandgeom = map.getLayers().getArray()[7].getSource().getFeatures()[0].getGeometry();
			
				if (scotlandgeom.intersectsCoordinate(centre))
				{
				inScotland = true;
				}
				else
				{
				inScotland = false;
				}
			}
			checkreuse();
		
	}, 2500); // delay 50 ms


     } 



    map.on('moveend', onMoveEnd);


function setLayers(str) {
    if (!str) str = "";
    if (document.getElementById('layerinfo') != null)
   {
    document.getElementById('layerinfo').innerHTML = str;

   }
}


// function to unselect previous selected features

            function unselectPreviousFeatures() {

		
                selectedFeatures = [];

            }


	var overlaySelectedBounds = [overlayLayers[0].get('minx'), overlayLayers[0].get('miny'), overlayLayers[0].get('maxx'), overlayLayers[0].get('maxy')];

	if ((noOverlaySelected) && (urlLayerName !== '1'))	

	{
         overlaySelectedBounds = ol.extent.applyTransform(overlaySelectedBounds, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));

		// map.getView().fit(overlaySelectedBounds, map.getSize());
		zoomtofeatureextent(overlaySelectedBounds);
	}	



	colorsource = new ol.source.Vector();

	vectorcolor = new ol.layer.Vector({
	  title: "vectorcolor",
	  source: colorsource,
	  style: new ol.style.Style({
	    fill: new ol.style.Fill({
	      color: 'rgba(255, 255, 255, 0.6)'
	    }),
	    stroke: new ol.style.Stroke({
	      width: 2,
	      color: 'rgba(' + rgb_r + ', ' + rgb_g + ', ' + rgb_b + ', 0.9)',
	    }),
	    image: new ol.style.Circle({
	      radius: 3,
	      fill: new ol.style.Fill({
	      color: 'rgba(' + rgb_r + ', ' + rgb_g + ', ' + rgb_b + ', 0.9)',
	      })

	    })
	  })
	});

 var dragAndDropInteraction = new ol.interaction.DragAndDrop({
        formatConstructors: [
            ol.format.GPX,
            ol.format.GeoJSON,
            ol.format.IGC,
            ol.format.KML,
            ol.format.TopoJSON
        ]
    });




 map.addInteraction(dragAndDropInteraction);

    dragAndDropInteraction.on('addfeatures', function (event) {
 //       console.log("interaction")
          colorsource = new ol.source.Vector({
            features: event.features
        });
        window.dragSource = colorsource;

	vectorcolor = new ol.layer.Vector({
	  title: "vectorcolor",
	  source: colorsource,
	  style: new ol.style.Style({
	    fill: new ol.style.Fill({
	      color: 'rgba(255, 255, 255, 0.6)'
	    }),
	    stroke: new ol.style.Stroke({
	      width: 4,
	      color: 'rgba(' + rgb_r + ', ' + rgb_g + ', ' + rgb_b + ', 0.9)',
	    }),
	    image: new ol.style.Circle({
	      radius: 6,
	      fill: new ol.style.Fill({
	      color: 'rgba(' + rgb_r + ', ' + rgb_g + ', ' + rgb_b + ', 0.9)',
	      })

	    })
	  })
	});


        window.dragLayer=vectorcolor;
 //       console.log(dragLayer);

        map.getLayers().push(vectorcolor);
        vectorcolor.setVisible(true);
    });



		// jQuery(map.getViewport()).on('mousemove', mouseMoveHandler);


   var vectorSource_new = new ol.source.Vector();
   var vectorLayer_new = new ol.layer.Vector({
      name: "vectorLayer_new",
      source: vectorSource_new
    });

//	var maplayerlength = map.getLayers().getLength();

//	if (map.getLayers().getArray()[(maplayerlength - 1)].get("name") !== "vectorLayer_new")

//	{

	map.getLayers().insertAt(3,vectorLayer_new);

//	}

	var iconStyle = new ol.style.Style({
	    image: new ol.style.Icon({
	        anchor: [0.5, 40],
	        anchorXUnits: 'fraction',
	        anchorYUnits: 'pixels',
	        opacity: 0.75,
	        src: 'https://geo.nls.uk/maps/dev/img/marker-icon.png'
	    }),
//	    text: new ol.style.Text({
//	        font: '12px Calibri,sans-serif',
//	        fill: new ol.style.Fill({ color: '#000' }),
//	        stroke: new ol.style.Stroke({
//	            color: '#fff', width: 2
//	        }),
//	        text: 'Some text'
//	    })
	});


function geolinks()

	{

	var zoom = map.getView().getZoom();
	var centre = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");
//     	else if (mapgroupno == 9) { window.location = "https://" + window.location.hostname + "/geo/find/#zoom=" + zoom + "&lat=" + centre[1].toFixed(4) + "&lon=" + centre[0].toFixed(4)

			jQuery('#showCoordinatesinfo').show();

       			document.getElementById('showCoordinatesinfo').innerHTML = '<button type="button" id="hideshowcoordinatesinfo" class="close"  aria-label="Close"><span aria-hidden="true" >&times;</span></button><p style="margin-bottom:18px;"></p>' +
				'<p style="white-space: nowrap;" ><strong>Link to external map services&nbsp;&nbsp;&nbsp;&nbsp;<br/> from this location:</strong></p>' +
				'<a href="https://www.google.com/maps/@?api=1&map_action=map&center=' + centre[1].toFixed(6) + ',' + centre[0].toFixed(6) + '&zoom=' + zoom + '">Google Maps</a><br/>' +
				'<a href="https://www.google.com/maps/@?api=1&map_action=map&center=' + centre[1].toFixed(6) + ',' + centre[0].toFixed(6) + '&zoom=' + zoom + '&basemap=satellite">Google Satellite</a><br/>' +
				'<a href="https://bing.com/maps/default.aspx?cp=' + centre[1].toFixed(6) + '~' + centre[0].toFixed(6) + '&lvl=' + zoom + '&style=r">Bing Maps</a><br/>' +
				'<a href="https://bing.com/maps/default.aspx?cp=' + centre[1].toFixed(6) + '~' + centre[0].toFixed(6) + '&lvl=' + zoom + '&style=a">Bing Satellite</a><br/>' +
				'<a href="https://www.openstreetmap.org/#map='+ zoom + '/' + centre[1].toFixed(6) + '/' + centre[0].toFixed(6) + '">OpenStreetMap</a><br/>' +
				'<a href="https://wego.here.com/?map=' + centre[1].toFixed(6) + ',' + centre[0].toFixed(6) + ',' + zoom + '">HERE Maps</a><br/>';

	    jQuery("#hideshowcoordinatesinfo").click(function(){
			jQuery('#showCoordinatesinfo').hide();
	    });
	}


function copyURL() {
  /* Get the text field */
  var copyText = document.getElementById("url");

  /* Select the text field */
//  copyText.select();
//  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  navigator.clipboard.writeText(copyText.innerHTML);
  
  /* Alert the copied text */
//  alert("Copied to clipboard - Layer URL: " + copyText.innerHTML);

   jQuery("#clipboard-response").show();
   document.getElementById('clipboard-response').innerHTML = 'Tileset URL copied to clipboard!';

	setTimeout( function(){
		jQuery('#clipboard-response').hide();
	}, 5000); // delay 50 ms
   
}


function showoverlay()

	{


	var overlayTitle = map.getLayers().getArray()[2].get('title');

	var reusetext = document.getElementById('re-use').innerHTML;

	if (overlayTitle.includes("OS 1:500/1:528 Towns"))

	{

		var overlayline = 'The town plans are available for specific towns in England and Wales:<br/>' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Alnwick/index.html">Alnwick</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Ashby/index.html">Ashby de la Zouch</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Barnard-Castle/index.html">Barnard Castle</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Bishop-Auckland/index.html">Bishop Auckland</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Chelmsford/index.html">Chelmsford</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Guildford/index.html">Guildford</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Hitchin/index.html">Hitchin</a>, ' + 
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Newcastle/index.html">Newcastle</a> (1890s), ' + 
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Newcastle-1900s/index.html">Newcastle</a> (1900s), ' + 
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Sheerness/index.html">Sheerness</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Stockton-upon-Tees/index.html">Stockton-on-Tees</a> (1855), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Stockton-upon-Tees-1890s/index.html">Stockton-on-Tees</a> (1895), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Sunderland/index.html">Sunderland</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Tyneside1855/index.html">Tynemouth</a> (1855-57), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Tyneside1896/index.html">Tyneside</a> (1896), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Uxbridge/index.html">Uxbridge</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Wallsend/index.html">Wallsend</a>, <br/>' +
		'The town plans are also available across regions of England and Wales:<br/><a href="https://geo.nls.uk/mapdata3/os/town_england/Cornwall/index.html">Cornwall</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/town_england/devon_towns/index.html">Devon</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/IsleofMan/index.html">Isle of Man</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Midlands_East/index.html">Midlands - East</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Midlands_West/index.html">Midlands - West</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/North/index.html">Northern England</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/South/index.html">South-Eastern England</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Wales/index.html">Wales</a>,<br/>' +
			'<strong>Minimum Zoom:</strong> 1, <strong>Maximum Zoom:</strong> 21 <br/>' +
				reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use these layers</a>.</p>';
	
	}

	else if (overlayTitle.includes("OS 1:1,056 Towns"))

	{
		var overlayline = 'This layer is "in process" and available under specific towns:<br/><a href="https://mapseries-tilesets.s3.amazonaws.com/town_england/Accrington/index.html">Accrington</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Ashton/index.html">Ashton under Lyne</a> (1849-50), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Ashton2/index.html">Ashton under Lyne</a> (1891-92), ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/town_england/Bacup/index.html">Bacup</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Barnsley/index.html">Barnsley</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Beverley/index.html">Beverley</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Bingley/index.html">Bingley</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Blackburn/index.html">Blackburn</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Blyth/index.html">Blyth</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Bolton/index.html">Bolton</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Bradford/index.html">Bradford</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Bridlington/index.html">Bridlington</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Burnley/index.html">Burnley</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Bury/index.html">Bury</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Chorley/index.html">Chorley</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Clitheroe/index.html">Clitheroe</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Colne/index.html">Colne</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Darlington/index.html">Darlington</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Dewsbury/index.html">Dewsbury</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Doncaster/index.html">Doncaster</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Fleetwood/index.html">Fleetwood</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Halifax/index.html">Halifax</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Haslingden/index.html">Haslingden</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Heywood/index.html">Heywood</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Howden/index.html">Howden</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Huddersfield/index.html">Huddersfield</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Kingston-upon-Hull/index.html">Kingston upon Hull</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Kingston-upon-Thames/index.html">Kingston upon Thames</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Knaresborough/index.html">Knaresborough</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Lancaster-1056/index.html">Lancaster</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Leeds_1056/index.html">Leeds</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Liverpool-1056/index.html">Liverpool</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/london_1890s/index.html">London</a> (1890s), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Malton/index.html">Malton</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Manchester/index.html">Manchester</a> (1848-50), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Middlesbrough/index.html">Middlesbrough</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Middleton/index.html">Middleton</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Nantwich/index.html">Nantwich</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Ormskirk/index.html">Ormskirk</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Pontefract/index.html">Pontefract</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Prescot/index.html">Prescot</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Preston/index.html">Preston</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Richmond/index.html">Richmond</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Ripon/index.html">Ripon</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Rochdale/index.html">Rochdale</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Scarborough/index.html">Scarborough</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Selby/index.html">Selby</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Sheffield/index.html">Sheffield</a> (1849-51), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Skipton/index.html">Skipton</a> (1850), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/St_Helens/index.html">St Helens</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Stockport-1873/index.html">Stockport</a> (1873), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Stockport-1895/index.html">Stockport</a> (1895), ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Todmorden/index.html">Todmorden</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Ulverston/index.html">Ulverston</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Wakefield/index.html">Wakefield</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Warrington/index.html">Warrington</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Whitby/index.html">Whitby</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Wigan/index.html">Wigan</a>, ' +
		'<a href="https://geo.nls.uk/mapdata3/os/town_england/Windsor/index.html">Windsor</a>, ' +

			'<br/><strong>Minimum Zoom:</strong> 1, <strong>Maximum Zoom:</strong> 20 <br/>' +
				reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use these layers</a>.</p>';

	}

	else if (overlayTitle.includes("OS 25 Inch, 1873"))
	{
		var overlayline = 'This layer is available under specific counties:<br/><a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/devon/index.html">Devon</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/gloucester/index.html">Gloucester</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/somerset1/index.html">Somerset</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/wiltshire/index.html">Wiltshire</a>,<br/>' +
			'<strong>Minimum Zoom:</strong> 1, <strong>Maximum Zoom:</strong> 18 <br/>' +
				reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use these layers</a>.</p>';
	}

	else if (overlayTitle.includes("OS 25 Inch, 1892"))
	{
		var overlayline = 'This layer is available under specific counties:<br/><a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/scotland_1/index.html">Scotland - South</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/scotland_2/index.html">Scotland - North</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/bedfordshire/index.html">Bedfordshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/berkshire/index.html">Berkshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/buckingham/index.html">Buckinghamshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/cambridge/index.html">Cambridgeshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/cheshire/index.html">Cheshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/cornwall/index.html">Cornwall</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/cumberland/index.html">Cumberland</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/devon2nd/index.html">Devon</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/dorset/index.html">Dorset</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/durham/index.html">Durham</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/essex/index.html">Essex</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/gloucester2nd/index.html">Gloucestershire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/hampshire/index.html">Hampshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/herefordshire/index.html">Herefordshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/hertfordshire/index.html">Hertfordshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/huntingdon/index.html">Huntingdon</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/kent/index.html">Kent</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/lancashire/index.html">Lancashire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/leicestershire/index.html">Leicestershire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/lincolnshire/index.html">Lincolnshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/london/index.html">London</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/middlesex/index.html">Middlesex</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/norfolk/index.html">Norfolk</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/northampton/index.html">Northamptonshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/northumberland/index.html">Northumberland</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/nottinghamshire/index.html">Nottinghamshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/oxford/index.html">Oxford</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/rutland/index.html">Rutland</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/Shrop_Derby/index.html">Shropshire / Derbyshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/somerset/index.html">Somerset</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/stafford/index.html">Stafford</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/suffolk/index.html">Suffolk</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/surrey/index.html">Surrey</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/sussex/index.html">Sussex</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/wales/index.html">Wales</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/warwick/index.html">Warwick</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/westmorland/index.html">Westmorland</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/wiltshire2nd/index.html">Wiltshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/Worcestershire/index.html">Worcestershire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/yorkshire/index.html">Yorkshire</a>.<br/>' +
		'We also have a layer which fills gaps in coverage using later 25 inch maps: "<a href="https://geo.nls.uk/mapdata3/os/25_inch_holes_england/index.html">Holes</a>".<br/>' +
			'<strong>Minimum Zoom:</strong> 1, <strong>Maximum Zoom:</strong> 18 <br/>' +
			'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use these layers</a>.</p>';
	}

	else if (overlayTitle.includes("OS Six Inch, 1888-1913"))
	{

		var overlayline = 'The OS Six Inch, 1888-1913 layer is available on <a href="https://cloud.maptiler.com/tiles/uk-osgb10k1888/">MapTiler Cloud</a>.<br/>' +
				'<strong>This layer is only available for private, non-commercial purposes only.</strong><br/>' +
				'Read further details on our <a href="https://maps.nls.uk/projects/subscription-api/index.html">Historic Maps Subscription API</a> page.<br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';
	}

	else if (overlayTitle.includes("OS 1:1 million-1:10K, 1900s"))
	{
		var overlayline = '1:1 million to 1:10,560 is available on <a href="https://cloud.maptiler.com/tiles/uk-osgb1888/">MapTiler Cloud</a>.<br/>' +
		'<strong>This layer is only available for private, non-commercial purposes only.</strong><br/>' +
				'Read further details on our <a href="https://maps.nls.uk/projects/subscription-api/index.html">Historic Maps Subscription API</a> page.<br/>'
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';

	}

	else if (overlayTitle.includes("OS One-Inch, 1885-1903 - Hills"))
	{
		var overlayline = 'The OS One-Inch, 1885-1903 "Hills" layer is available on <a href="https://cloud.maptiler.com/tiles/uk-osgb63k1885/">MapTiler Cloud</a>.<br/>' +
				'Read further details on our <a href="https://maps.nls.uk/projects/subscription-api/index.html">Historic Maps Subscription API</a> page.<br/>'
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';

	}

	else if (overlayTitle.includes("OS 1:25,000, 1937-61"))
	{
		var overlayline = 'The OS 1:25,000, 1937-61 layer is available on <a href="https://cloud.maptiler.com/tiles/uk-osgb25k1937/">MapTiler Cloud</a>.<br/>' +
		'<strong>This layer is only available for private, non-commercial purposes only.</strong><br/>' +
				'Read further details on our <a href="https://maps.nls.uk/projects/subscription-api/index.html">Historic Maps Subscription API</a> page.<br/>'
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';

	}
	else if (overlayTitle.includes("OS One Inch 7th series, 1955-61"))
	{
		var overlayline = 'The OS One Inch 7th series, 1955-61 layer is available on <a href="https://cloud.maptiler.com/tiles/uk-osgb63k1955/">MapTiler Cloud</a>.<br/>' +
		'<strong>This layer is only available for private, non-commercial purposes only.</strong><br/>' +
				'Read further details on our <a href="https://maps.nls.uk/projects/subscription-api/index.html">Historic Maps Subscription API</a> page.<br/>'
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';

	}



	else if (overlayTitle.includes("OS 1:1 million-1:2.5K, 1900s"))
	{
		var overlayline = '1:1 million to 1:10,560 is available at <a href="https://cloud.maptiler.com/tiles/uk-osgb1888/">Great Britain - 1:1 million to 1:10,560</a>.<br/>' +
		'The largest scale 25 inch / 1:2,500 layers are available under specific counties:<br/>' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/scotland_2/index.html">Scotland - North</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/bedfordshire/index.html">Bedfordshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/berkshire/index.html">Berkshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/buckingham/index.html">Buckinghamshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/cambridge/index.html">Cambridgeshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/cheshire/index.html">Cheshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/cornwall/index.html">Cornwall</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/cumberland/index.html">Cumberland</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/devon2nd/index.html">Devon</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/dorset/index.html">Dorset</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/durham/index.html">Durham</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/essex/index.html">Essex</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/gloucester2nd/index.html">Gloucestershire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/hampshire/index.html">Hampshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/herefordshire/index.html">Herefordshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/hertfordshire/index.html">Hertfordshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/huntingdon/index.html">Huntingdon</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/kent/index.html">Kent</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/lancashire/index.html">Lancashire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/leicestershire/index.html">Leicestershire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/lincolnshire/index.html">Lincolnshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/london/index.html">London</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/middlesex/index.html">Middlesex</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/norfolk/index.html">Norfolk</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/northampton/index.html">Northamptonshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/northumberland/index.html">Northumberland</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/nottinghamshire/index.html">Nottinghamshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/oxford/index.html">Oxford</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/rutland/index.html">Rutland</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/Shrop_Derby/index.html">Shropshire / Derbyshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/somerset/index.html">Somerset</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/stafford/index.html">Stafford</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/suffolk/index.html">Suffolk</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/surrey/index.html">Surrey</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/sussex/index.html">Sussex</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/wales/index.html">Wales</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/warwick/index.html">Warwick</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/westmorland/index.html">Westmorland</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/wiltshire2nd/index.html">Wiltshire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/Worcestershire/index.html">Worcestershire</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/25_inch/yorkshire/index.html">Yorkshire</a>.<br/>' +
			'<strong>Minimum Zoom:</strong> 1, <strong>Maximum Zoom:</strong> 18 <br/>' +
					reusetext + '</p>';
	}
	else if (overlayTitle.includes("OS 25 Inch drawings, 1890s-1940s"))
	{
		var overlayline = '<a href="https://geo.nls.uk/mapdata3/os/25_inch/blue-and-blacks/">' + map.getLayers().getArray()[2].get("title") + '</a>.<br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';
	}
	else if (overlayTitle.includes("OS 1:10,560, 1949-1971"))
	{
		var overlayline = '<a href="https://mapseries-tilesets.s3.amazonaws.com/os/britain10knatgrid/index.html">' + map.getLayers().getArray()[2].get("title") + '</a>.<br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';
	}
	else if (overlayTitle.includes("OS 1:1,250/1:2,500, 1944-1971"))
	{
		var overlayline = '<a href="https://mapseries-tilesets.s3.amazonaws.com/os/scotland_1250_country/index.html">OS 1:1,250, 1944-1966</a>.<br/>' +
				'<a href="https://mapseries-tilesets.s3.amazonaws.com/scotland_2500_singles/index.html">OS 1:2,500, 1944-1966 (1 x 1 km sheets)</a>.<br/>' +
			'<a href="https://mapseries-tilesets.s3.amazonaws.com/scotland_2500_doubles/index.html">OS 1:2,500, 1944-1966 (1 x 2 km sheets)</a>.<br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';
	}
	else if (overlayTitle.includes("Times Survey"))

	{
		var overlayline = '<strong>Times Survey Atlas</strong> is available as separate layers for particular zoom levels:</p>' +

		'<a href="https://mapseries-tilesets.s3.amazonaws.com/tsa/layer_01/index.html">Times Survey Atlas - Layer 1</a>. <strong>Minimum Zoom:</strong> 1, <strong>Maximum Zoom:</strong> 7 <br/>' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/tsa/layer_02/index.html">Times Survey Atlas - Layer 2</a>. <strong>Minimum Zoom:</strong> 2, <strong>Maximum Zoom:</strong> 8 <br/>' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/tsa/layer_03/index.html">Times Survey Atlas - Layer 3</a>. <strong>Minimum Zoom:</strong> 3, <strong>Maximum Zoom:</strong> 9 <br/>' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/tsa/layer_04/index.html">Times Survey Atlas - Layer 4</a>. <strong>Minimum Zoom:</strong> 4, <strong>Maximum Zoom:</strong> 10 <br/>' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/tsa/layer_05/index.html">Times Survey Atlas - Layer 5</a>. <strong>Minimum Zoom:</strong> 5, <strong>Maximum Zoom:</strong> 12 <br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use these layers</a>.</p>';
	}
	else if (overlayTitle.includes("Trench"))

	{

		var overlaySource = map.getLayers().getArray()[2].getSource().urls[0];
		var overlayminZoom = map.getLayers().getArray()[2].getSource().getTileGrid().minZoom;
		var overlaymaxZoom = map.getLayers().getArray()[2].getSource().getTileGrid().maxZoom;

		var overlayline = '<strong>Trench maps</strong><br/>The <strong>' + map.getLayers().getArray()[2].get("title") + '</strong> layer<br/> is only available as an XYZ/TMS layer:<br/>' +
			'<div id="url">' +  overlaySource + '</div>&nbsp;&nbsp;<button id="copytilesetbutton" onclick="copyURL()">Copy</button>&nbsp;&nbsp;<div id="clipboard-response"></div><br/>'+
			'<strong>Minimum Zoom:</strong> ' + overlayminZoom  + ', <strong>Maximum Zoom:</strong> ' + overlaymaxZoom  + '<br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';

	}

	else if (overlayTitle.includes("India"))

	{
		var overlayline = '<strong>Survey of India maps</strong><br/>' +

		'<a href="https://mapseries-tilesets.s3.amazonaws.com/india/half1/index.html">Half-inch, 1st edition, west</a> ,' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/india/half1_new/index.html">Half-inch, 1st edition, east</a><br/>' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/india/half2/index.html">Half-inch, 2nd edition, west</a> , ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/india/half2_new/index.html">Half-inch, 2nd edition, east</a><br/>' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/india/one1/index.html">One-inch, 1st edition, west</a> , ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/india/one1_new/index.html">One-inch, 1st edition, east</a><br/> ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/india/one2/index.html">One-inch, 2nd edition, west</a>, ' +
		'<a href="https://mapseries-tilesets.s3.amazonaws.com/india/one2_new/">One-inch, 2nd edition, east</a>.<br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use these layers</a>.</p>';
	}

	else

	{

		var overlaySource = map.getLayers().getArray()[2].getSource().urls[0];
		var UrlEncodeOverlaySource = decodeURI(overlaySource);
		var overlayminZoom = map.getLayers().getArray()[2].getSource().getTileGrid().minZoom;
		var overlaymaxZoom = map.getLayers().getArray()[2].getSource().getTileGrid().maxZoom;
	
		if (overlaySource.includes(".jpg") && !overlaySource.includes("tileserver"))
		{
		var file = overlaySource.replace('{z}/{x}/{y}.jpg','index.html');
		var overlayline = '<a href="' + file + '">' + map.getLayers().getArray()[2].get("title") + '</a><br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';
		}

		else if (overlaySource.includes("allmaps") && overlaySource.includes("{y}.png"))
		{
		var overlayline = 'The <strong>' + map.getLayers().getArray()[2].get("title") + '</strong> layer<br/> is only available as an XYZ/TMS layer:<br/>' +
			'<div id="url">' +  overlaySource + '</div>&nbsp;&nbsp;<button id="copytilesetbutton" onclick="copyURL()">Copy</button>&nbsp;&nbsp;<div id="clipboard-response"></div><br/>'+
			'<strong>Minimum Zoom:</strong> ' + overlayminZoom  + ', <strong>Maximum Zoom:</strong> ' + overlaymaxZoom  + '<br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';



		}
	
		else if (overlaySource.includes("{y}.png") &&    !overlaySource.includes("tileserver"))
	
		{
		var file = overlaySource.replace('{z}/{x}/{y}.png','index.html');
		var overlayline = '<a href="' + file + '">' + map.getLayers().getArray()[2].get("title") + '</a><br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';
		}
	
		else if ( overlaySource.includes("tileserver") &&  overlaySource.includes("{y}.png"))
	
		{
		var file = overlaySource.replace('{z}/{x}/{y}.png','');
		var overlayline = '<a href="' + file + '">' + map.getLayers().getArray()[2].get("title") + '</a><br/>' +
				'<strong>This layer is only available for private, non-commercial purposes only.</strong><br/>' +
				'Read about other availability through our <a href="https://maps.nls.uk/projects/subscription-api/index.html">Historic Maps Subscription API</a>.<br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';
		}


	
		else if ( overlaySource.includes("tileserver") &&  overlaySource.includes("{y}.jpg"))
	
		{
		var file = overlaySource.replace('{z}/{x}/{y}.jpg','');
		var overlayline = '<a href="' + file + '">' + map.getLayers().getArray()[2].get("title") + '</a><br/>' +
				'<strong>This layer is only available for non-commercial purposes only.</strong><br/>' +
				'Read about other availability through our <a href="https://maps.nls.uk/projects/subscription-api/index.html">Historic Maps Subscription API</a>.<br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';
		}



	
		else if (overlaySource.includes("{-y}.png"))
		{
		var overlayline = 'The <strong>' + map.getLayers().getArray()[2].get("title") + '</strong> layer<br/> is only available as an XYZ/TMS layer:<br/>' +
			'<div id="url">' +  overlaySource + '</div>&nbsp;&nbsp;<button id="copytilesetbutton" onclick="copyURL()">Copy</button>&nbsp;&nbsp;<div id="clipboard-response"></div><br/>'+
			'<strong>Minimum Zoom:</strong> ' + overlayminZoom  + ', <strong>Maximum Zoom:</strong> ' + overlaymaxZoom  + '<br/>' +
					reusetext + '<br/>' +
			'<a href="https://maps.nls.uk/guides/georeferencing/">Help on how to use this layer</a>.</p>';



		}

	}


			jQuery('#showCoordinatesinfo').show();

       			document.getElementById('showCoordinatesinfo').innerHTML = '<button type="button" id="hideshowcoordinatesinfo" class="close"  aria-label="Close"><span aria-hidden="true" >&times;</span></button><p style="margin-bottom:18px;"></p>' +
				'<p><strong>Current map overlay</strong><br/>' +


			overlayline;

	    jQuery("#hideshowcoordinatesinfo").click(function(){
			jQuery('#showCoordinatesinfo').hide();
	    });
	}

function addmarker() 

	{
	addMarker = true;

			jQuery('#showCoordinatesinfo').show();
       			document.getElementById('showCoordinatesinfo').innerHTML = 'Click/tap on the map to add a Marker';
	
		setTimeout( function(){
       			document.getElementById('showCoordinatesinfo').innerHTML = '';
			jQuery('#showCoordinatesinfo').hide();
			}, 3000); // delay 50 ms

	}


function remove_marker()
	{
	    if (map.getLayers().getArray()[3].getSource().getFeatures().length > 0)
			{map.getLayers().getArray()[3].getSource().clear(); }
	    pointClicked = '0,0';
	    updateUrl();
            document.getElementById('stopmeasuringmessage').innerHTML = '';
	}

	map.on('click', function(evt){
	if ((evt.originalEvent.shiftKey == true) || (addMarker))

	{

	if (addMarker)
	{
          document.getElementById('stopmeasuringmessage').innerHTML = 'Click/tap on map to move marker, or <a href="javascript:remove_marker()">Remove Marker</a>';
	}
	else
	{
          document.getElementById('stopmeasuringmessage').innerHTML = 'SHIFT+click/tap on map to move marker, or <a href="javascript:remove_marker()">Remove Marker</a>';
	}
	    if (map.getLayers().getArray()[3].getSource().getFeatures().length > 0)
			{map.getLayers().getArray()[3].getSource().clear(); }
	    var feature = new ol.Feature(
	        new ol.geom.Point(evt.coordinate)
	    );
	    feature.setStyle(iconStyle);

		var coords = feature.getGeometry().getCoordinates();
		
	        var coordinate = evt.coordinate;

		espg3587 = [];
		espg3587 = ol.proj.transform(coordinate,"EPSG:3857", "EPSG:4326");
		
	//	console.log(coordinate);
		
		pointClicked = [];
		pointClicked.push(espg3587[1].toFixed(6), espg3587[0].toFixed(6));
		updateUrl();

	    vectorSource_new.addFeature(feature);

	}
	else
	{
	
	var windowWidth = $(window).width();
	if (windowWidth <= 500) 
		{
	        jQuery("#searchSideBar").hide();
		jQuery("#layersSideBarOutlines").hide();
		jQuery("#show").show();
		jQuery("#showlayersOutlinesExplore").show();
		jQuery("#exploreslideroverlay").show();
		jQuery("#exploreslideroverlaymobile").show();
		}

	}
	});



function zoomtofeatureextent(extent) {

//		if ((urlLayerName == 24) ||  (urlLayerName == 68) ||  (urlLayerName == 77) ||  (urlLayerName == 78) ||  (urlLayerName == 82) )  { return; } 

//       map.getView().fit(extent, map.getSize());


	 var y = extent[1] + (extent[3] - extent[1]) / 2; 
         var x = extent[0] + (extent[2] - extent[0]) / 2; 

	
  	 var resolution = map.getView().getResolutionForExtent(extent, map.getSize());
	 var zoom1 = map.getView().getZoomForResolution(resolution);

	 if (map.getSize()[0] < 600 ) 

	{
	 var zoom = Math.round(zoom1 - 2);
	}
	else
	{
	 var zoom = Math.round(zoom1 - 1);
	}

     
	 if ((zoom > 16 ) || (zoom < 3) || (isNaN(zoom)))
		{ zoom = 16; }


	      function flyTo(location, done) {
	        var duration = 3000;
	      //  var zoom = map.getView().getZoom();
	        var parts = 2;
	        var called = false;
	        function callback(complete) {
	          --parts;
	          if (called) {
	            return;
	          }
	          if (parts === 0 || !complete) {
	            called = true;
	            done(complete);
	          }
	        }
	        map.getView().animate({
	          center: location,
	          duration: duration
	        }, callback);
	        map.getView().animate({
	          zoom: zoom - 1,
	          duration: duration / 2
	        }, {
	          zoom: zoom,
	          duration: duration / 2
	        }, callback);
	      }

		map.getView().animate({
			center: [x , y ],
			zoom: zoom,
			duration: 1000
		});

}



function pointClick(pointClicked)  {
		pointClicked2 = pointClicked.split(",");
		        pointClicked4 = [];
		pointClicked4.push(parseFloat(pointClicked2[1]),parseFloat(pointClicked2[0]));
		
		coordinate_new = [];
		coordinate_new = ol.proj.transform(pointClicked4,"EPSG:4326", "EPSG:3857");

		coordinate_parsed = [];

		coordinate_parsed.push(parseFloat(coordinate_new[0]),parseFloat(coordinate_new[1]));
//		console.log(coordinate_parsed);

	    var feature = new ol.Feature(
	        new ol.geom.Point(coordinate_parsed)
	    );
	    feature.setStyle(iconStyle);
	    vectorSource_new.addFeature(feature);
          document.getElementById('stopmeasuringmessage').innerHTML = 'SHIFT+click on map to move marker, or <a href="javascript:remove_marker()">Remove Marker</a>';
}



	/**
	 * Currently drawn feature.
	 * @type {ol.Feature}
	 */
	var sketch;
	
	
	/**
	 * The help tooltip element.
	 * @type {Element}
	 */
	var helpTooltipElement;
	
	
	/**
	 * Overlay to show the help messages.
	 * @type {ol.Overlay}
	 */
	var helpTooltip;
	
	
	/**
	 * The measure tooltip element.
	 * @type {Element}
	 */
	var measureTooltipElement;
	
	
	/**
	 * Overlay to show the measurement.
	 * @type {ol.Overlay}
	 */
	var measureTooltip;
	
	
	/**
	 * Message to show when the user is drawing a polygon.
	 * @type {string}
	 */
	var continuePolygonMsg = 'Single-click to continue drawing the polygon.<br/> Double-click to stop';
	
	
	/**
	 * Message to show when the user is drawing a line.
	 * @type {string}
	 */
	var continueLineMsg = 'Single-click to continue drawing the line.<br/> Double-click to stop';



 if (document.getElementById('drawtype'))  {



	/**
	 * Handle pointer move.
	 * @param {ol.MapBrowserEvent} evt
	 */
	var pointerMoveHandlerDraw = function(evt) {
	  if (evt.dragging) {
	    return;
	  }
	  /** @type {string} */
          var value = typeSel.value;
	   if (value == 'Off')
		{
		var helpMsg = '';
	        return;
		}
	        else if (value == 'Point')
		{
		var helpMsg = 'Click to add point to the map.';
		}
		else if	(value == 'Circle')
		{
		var helpMsg = 'Click on the centre of the circle,<br/>move the mouse, and then <br/>Click to add the perimeter of the circle.';
		}
		else if (value == 'LineString')
		{
	  	var helpMsg = 'Click to start drawing.<br/>Click to change direction.<br/>Double-click to stop.';
		}
		else if (value == 'Polygon') 
		{
	  	var helpMsg = 'Click to start drawing.<br/>Click to change direction.<br/>Double-click on penultimate point to close polygon.';
		}
	  /** @type {ol.Coordinate|undefined} */
	  var tooltipCoord = evt.coordinate;
	
	  if (sketch) {
	    var output;
	    var geom = (sketch.getGeometry());
	    if (geom instanceof ol.geom.Polygon) {
	      output = formatArea(/** @type {ol.geom.Polygon} */ (geom));
//	      helpMsg = continuePolygonMsg;
	      tooltipCoord = geom.getInteriorPoint().getCoordinates();
	    } else if (geom instanceof ol.geom.LineString) {
	      output = formatLength( /** @type {ol.geom.LineString} */ (geom));
//	      helpMsg = continueLineMsg;
	      tooltipCoord = geom.getLastCoordinate();
	    }
	  }
		  if (helpTooltipElement) 
	  helpTooltipElement.innerHTML = helpMsg;
	  helpTooltip.setPosition(evt.coordinate);
	
	};

	/**
	 * Creates a new help tooltip
	 */
	function createHelpTooltipDraw() {
	  if (helpTooltipElement) {
	    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
	  }
	  helpTooltipElement = document.createElement('div');
	  helpTooltipElement.className = 'tooltip1';
	  helpTooltip = new ol.Overlay({
	    element: helpTooltipElement,
	    offset: [45, 20],
	    positioning: 'center-left'
	  });
	  map.addOverlay(helpTooltip);
	}
	
	


      var typeSel = document.getElementById('drawtype');

      var draw, snap; // global so we can remove it later
      function addInteraction() {


	colorsource = new ol.source.Vector();

	vectorcolor = new ol.layer.Vector({
	  title: "vectorcolor",
	  source: colorsource,
	  style: new ol.style.Style({
	    fill: new ol.style.Fill({
	      color: 'rgba(255, 255, 255, 0.3)'
	    }),
	    stroke: new ol.style.Stroke({
	      width: 4,
	      color: 'rgba(' + rgb_r + ', ' + rgb_g + ', ' + rgb_b + ', 0.9)',
	    }),
	    image: new ol.style.Circle({
	      radius: 6,
	      fill: new ol.style.Fill({
	      color: 'rgba(' + rgb_r + ', ' + rgb_g + ', ' + rgb_b + ', 0.9)',
	      })

	    })
	  })
	});


	var maplayerlength = map.getLayers().getLength();

	map.getLayers().insertAt(maplayerlength,vectorcolor);



      var modify = new ol.interaction.Modify({source: colorsource});
      map.addInteraction(modify);

        var value = typeSel.value;
        if ((value == 'Polygon') || (value == 'LineString')) {
          draw = new ol.interaction.Draw({
            source: colorsource,
            type: /** @type {ol.geom.GeometryType} */ (typeSel.value)
	  });
          map.addInteraction(draw);

	createHelpTooltipDraw();
	map.on('pointermove', pointerMoveHandlerDraw);

	  draw.on('drawstart',
	      function(evt) {
	        // set sketch
	        sketch = evt.feature;
	      }, this);
 
	  draw.on('drawend',
	      function(evt) {
         	document.getElementById('stopmeasuringmessage').innerHTML = 'Click and drag on drawn features if you would like to move them.';
         	 document.getElementById('measuremessage').innerHTML = 'To save, Right-click and choose "Save image as..." or "Export GeoJSON"';
	        jQuery("#removelastfeaturebutton").show();
	        jQuery("#exportbutton").show();
	        jQuery("#export27700button").show();
	      }, this);

        snap = new ol.interaction.Snap({source: colorsource});
        map.addInteraction(snap);

        }
        else if ((value == 'Point')  || (value == 'Circle')) {
          draw = new ol.interaction.Draw({
            source: colorsource,
            type: /** @type {ol.geom.GeometryType} */ (typeSel.value)
	  });
          map.addInteraction(draw);

	createHelpTooltipDraw();
	map.on('pointermove', pointerMoveHandlerDraw);

	  draw.on('drawstart',
	      function(evt) {
	        // set sketch
	        sketch = evt.feature;

	      }, this);
 
	  draw.on('drawend',
	      function(evt) {
         	document.getElementById('stopmeasuringmessage').innerHTML = 'Click and drag on drawn features if you would like to move them.';
         	 document.getElementById('measuremessage').innerHTML = 'To save, Right-click and choose "Save image as..." or "Export GeoJSON"';
	        jQuery("#removelastfeaturebutton").show();
	        jQuery("#exportbutton").show();
	        jQuery("#export27700button").show();
	      }, this);


        snap = new ol.interaction.Snap({source: colorsource});
        map.addInteraction(snap);

        }
	else
	{
	stopmeasuring();
	}
      }





      /**
       * Handle change event.
       */
      typeSel.onchange = function() {
	var overlayslength = map.getOverlays().getLength();
	if (overlayslength > 0) {map.getOverlays().clear();}
        map.removeInteraction(draw);
 	map.removeInteraction(snap);

        addInteraction();

      };


	

   }

	    jQuery("#removelastfeaturebutton").click(function(){
//		alert("removing!");

		var maplayerlength = map.getLayers().getLength();
		var toplayer = parseInt(maplayerlength - 1);
		var lastlayerfeatures = map.getLayers().getArray()[parseInt(toplayer)].getSource().getFeatures();
		var lastlayerfeatureslength = map.getLayers().getArray()[parseInt(toplayer)].getSource().getFeatures().length;
		if (parseInt(lastlayerfeatureslength) == 1)
			{ 
			map.getLayers().removeAt(parseInt(toplayer)); 
			document.getElementById('drawtype').selectedIndex = 0;
			map.removeInteraction(draw);
 			map.removeInteraction(snap);
         		document.getElementById('stopmeasuringmessage').innerHTML = '';
			var overlayslength = map.getOverlays().getLength();
			if (overlayslength > 0) {map.getOverlays().clear();}
			}
		else if (parseInt(lastlayerfeatureslength) > 1)
			{

			var lastlayerfeatures = map.getLayers().getArray()[parseInt(toplayer)].getSource().getFeatures();
			var lastFeature = lastlayerfeatures[lastlayerfeatures.length - 1];
			map.getLayers().getArray()[parseInt(toplayer)].getSource().removeFeature(lastFeature);
			}
		else
			{
			return;
			}
	    });




  jQuery("#exportbutton").click(function(){


	colorsourceALL = new ol.source.Vector();

	vectorcolorALL = new ol.layer.Vector({
	  title: "vectorcolorALL",
	  source: colorsourceALL,
	 
	});

	var maplayerlength = map.getLayers().getLength();
	map.getLayers().insertAt(maplayerlength,vectorcolorALL);

		var maplayerlength = map.getLayers().getLength();
		var toplayer = parseInt(maplayerlength - 1);

	        var layers = map.getLayers().getArray().slice();
		    for (var x = 0; x < layers.length; x++) {
		        if (layers[x].get('title') == 'vectorcolor') 
			map.getLayers().getArray()[parseInt(toplayer)].getSource().addFeatures(layers[x].getSource().getFeatures());

		    }



		var lastlayerfeatures = map.getLayers().getArray()[parseInt(toplayer)].getSource().getFeatures();


//		var lastlayerfeatures = [];
//		lastlayerfeatures.push(map.getLayers().getArray()[parseInt(toplayer)].getSource().getFeatures());

		var geojsonFormat = new ol.format.GeoJSON({featureProjection: 'EPSG:3857', extractGeometryName: true});

		var file_original = geojsonFormat.writeFeatures(lastlayerfeatures, { decimals: 7 });

		var file = file_original.replace(/"properties":null/g,'"properties":[]');

//		var kmlFormat = new ol.format.kml({featureProjection: 'EPSG:3857'});
//		var file = kmlFormat.writeFeatures(lastlayerfeatures);

  		var filename = 'data:text/json;charset=utf-8,' + file;


			function download(filename, text) {
			
			  var element = document.createElement('a');
			  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + file);
			  element.setAttribute('download', filename);
			
			  element.style.display = 'none';
			  document.body.appendChild(element);
			
			  element.click();
			
			  document.body.removeChild(element);
			
			}

 		download("file.geojson",filename);

		var maplayerlength = map.getLayers().getLength();
		var toplayer = parseInt(maplayerlength - 1);
		map.getLayers().removeAt(parseInt(toplayer));

	    });

 jQuery("#export27700button").click(function(){


	colorsourceALL = new ol.source.Vector();

	vectorcolorALL = new ol.layer.Vector({
	  title: "vectorcolorALL",
	  source: colorsourceALL,
	 
	});

	var maplayerlength = map.getLayers().getLength();
	map.getLayers().insertAt(maplayerlength,vectorcolorALL);

		var maplayerlength = map.getLayers().getLength();
		var toplayer = parseInt(maplayerlength - 1);

	        var layers = map.getLayers().getArray().slice();
		    for (var x = 0; x < layers.length; x++) {
		        if (layers[x].get('title') == 'vectorcolor') 
			map.getLayers().getArray()[parseInt(toplayer)].getSource().addFeatures(layers[x].getSource().getFeatures());

		    }



		var lastlayerfeatures = map.getLayers().getArray()[parseInt(toplayer)].getSource().getFeatures();


//		var lastlayerfeatures = [];
//		lastlayerfeatures.push(map.getLayers().getArray()[parseInt(toplayer)].getSource().getFeatures());

		var geojsonFormat = new ol.format.GeoJSON({ extractGeometryName: true});
		var file_original = geojsonFormat.writeFeatures(lastlayerfeatures, {featureProjection: 'EPSG:3857', dataProjection: 'EPSG:27700',  decimals:0 });

		var file = file_original.replace(/"properties":null/g,'"properties":[]');

//		var kmlFormat = new ol.format.kml({featureProjection: 'EPSG:3857'});
//		var file = kmlFormat.writeFeatures(lastlayerfeatures);

  		var filename = 'data:text/json;charset=utf-8,' + file;


			function download(filename, text) {
			
			  var element = document.createElement('a');
			  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + file);
			  element.setAttribute('download', filename);
			
			  element.style.display = 'none';
			  document.body.appendChild(element);
			
			  element.click();
			
			  document.body.removeChild(element);
			
			}

 		download("file.geojson",filename);

		var maplayerlength = map.getLayers().getLength();
		var toplayer = parseInt(maplayerlength - 1);
		map.getLayers().removeAt(parseInt(toplayer));

	    });




	/**
	 * Handle pointer move.
	 * @param {ol.MapBrowserEvent} evt
	 */
	var pointerMoveHandler = function(evt) {
	  if (evt.dragging) {
	    return;
	  }
	  /** @type {string} */
	  var helpMsg = 'Click to start drawing. Double-click to stop.';
	  /** @type {ol.Coordinate|undefined} */
	  var tooltipCoord = evt.coordinate;
	
	  if (sketch) {
	    var output;
	    var geom = (sketch.getGeometry());
	    if (geom instanceof ol.geom.Polygon) {
	      output = formatArea(/** @type {ol.geom.Polygon} */ (geom));
	      helpMsg = continuePolygonMsg;
	      tooltipCoord = geom.getInteriorPoint().getCoordinates();
	    } else if (geom instanceof ol.geom.LineString) {
	      output = formatLength( /** @type {ol.geom.LineString} */ (geom));
	      helpMsg = continueLineMsg;
	      tooltipCoord = geom.getLastCoordinate();
	    }
	    measureTooltipElement.innerHTML = output;
	    measureTooltip.setPosition(tooltipCoord);
	  }
		  if (helpTooltipElement) 
	  helpTooltipElement.innerHTML = helpMsg;
	  helpTooltip.setPosition(evt.coordinate);
	
	};

	/**
	 * Creates a new help tooltip
	 */
	function createHelpTooltip() {
	  if (helpTooltipElement) {
	    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
	  }
	  helpTooltipElement = document.createElement('div');
	  helpTooltipElement.className = 'tooltip1';
	  helpTooltip = new ol.Overlay({
	    element: helpTooltipElement,
	    offset: [120, -20],
	    positioning: 'right-top'
	  });
	  map.addOverlay(helpTooltip);
	}


	
	
	/**
	 * Creates a new measure tooltip
	 */
	function createMeasureTooltip() {
	  if (measureTooltipElement) {
	    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
	  }
	  measureTooltipElement = document.createElement('div');
	  measureTooltipElement.className = 'tooltip1 tooltip-measure';
	  measureTooltip = new ol.Overlay({
	    element: measureTooltipElement,
	    offset: [150, 65],
	    positioning: 'right-bottom'
	  });
	  map.addOverlay(measureTooltip);
	}

	var typeSelect = document.getElementById('type');
	
	var draw; // global so we can remove it later
	function addInteraction() {

	var type = (typeSelect.value == 'area' ? 'Polygon' : 'LineString');

	  draw = new ol.interaction.Draw({

	    source: measuresource,
	    type: /** @type {ol.geom.GeometryType} */ (type),
	    style: new ol.style.Style({
	      fill: new ol.style.Fill({
	        color: 'rgba(255, 255, 255, 0.2)'
	      }),
	      stroke: new ol.style.Stroke({
	        color: 'rgba(0, 0, 0, 0.5)',
	        lineDash: [10, 10],
	        width: 2
	      }),
	      image: new ol.style.Circle({
	        radius: 5,
	        stroke: new ol.style.Stroke({
	          color: 'rgba(0, 0, 0, 0.7)'
	        }),
	        fill: new ol.style.Fill({
	          color: 'rgba(255, 255, 255, 0.2)'
	        })
	      })
	    })
	  });
	 map.addInteraction(draw);


	

	
	  draw.on('drawstart',
	      function(evt) {
	        // set sketch
	        sketch = evt.feature;
	      }, this);
	
	  draw.on('drawend',
	      function(evt) {
	        measureTooltipElement.className = 'tooltip1 tooltip-static';
	        measureTooltip.setOffset([20, -45]);
	        // unset sketch
	        sketch = null;
	        // unset tooltip so that a new one can be created
	        measureTooltipElement = null;
	        createMeasureTooltip();
	      }, this);
	}
	



	
	
	/**
	 * Let user change the geometry type.
	 * @param {Event} e Change event.
	*/

	function toggleControl() { 
	  var measurecontrol = document.getElementById('type').value;
		 if (measurecontrol == "none")
		{
		  map.removeInteraction(draw);
		  document.getElementById('stopmeasuringmessage').innerHTML = '';
		  var overlayslength = map.getOverlays().getLength();
		  if (overlayslength > 0) {map.getOverlays().clear();}
//		var maplayerlength = map.getLayers().getLength();
//		var toplayer = (parseInt(maplayerlength) - 1)
//		if (map.getLayers().getArray()[toplayer].get("title") = "vectormeasures")
//		{ map.getLayers().removeAt([toplayer]); }
		 map.getLayers().getArray()[6].getSource().clear();
		}
		 else if (measurecontrol != "none")
		 {
		  map.removeInteraction(draw);
		  addInteraction();
		  document.getElementById('stopmeasuringmessage').innerHTML = '<a href="javascript:stopmeasuring()">Turn off measurement tools</a>';
		  createMeasureTooltip();
		  createHelpTooltip();
		  map.on('pointermove', pointerMoveHandler);
		 }
		};


	function stopmeasuring() {
		document.getElementById('type').selectedIndex = 0;
		map.removeInteraction(draw);
 		map.removeInteraction(snap);
		var overlayslength = map.getOverlays().getLength();
		if (overlayslength > 0) {map.getOverlays().clear();}

//		var maplayerlength = map.getLayers().getLength();
//		var toplayer = (parseInt(maplayerlength) - 1)
//		if (map.getLayers().getArray()[toplayer].get("title") == "vectormeasures")
//		{ map.getLayers().removeAt([toplayer]); }
		 map.getLayers().getArray()[6].getSource().clear();
		document.getElementById('stopmeasuringmessage').innerHTML = '';
		} 

	function stopmeasuringElevation() {

		map.removeInteraction(drawE);
 		map.removeInteraction(snapE);
		var overlayslength = map.getOverlays().getLength();
		if (overlayslength > 0) {map.getOverlays().clear();}

//		var maplayerlength = map.getLayers().getLength();
//		var toplayer = (parseInt(maplayerlength) - 1)
//		if (map.getLayers().getArray()[toplayer].get("title") == "vectormeasures")
//		{ map.getLayers().removeAt([toplayer]); }
		 map.getLayers().getArray()[6].getSource().clear();
		document.getElementById('stopmeasuringmessage').innerHTML = '';
		} 




	/**
	 * format length output
	 * @param {ol.geom.LineString} line
	 * @return {string}
	 */
	  var formatLength = function(line) {
	  var length;
	{
	    var coordinates = line.getCoordinates();
	    length = 0;
	    var sourceProj = map.getView().getProjection();
	    for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
	      var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
	      var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
	      length += wgs84Sphere.haversineDistance(c1, c2);
	    }
	  } 
	  var output;
	if (length > 1000) {
	    output = ' ' + (parseFloat(length / 1000 * 100) / 100).toFixed(3) +
	        ' ' + 'kilometres / ' +  (parseFloat(length / 1000 * 62.1371192) / 100).toFixed(3) + ' ' + 'miles &nbsp;';
	  } else {
	    output = ' ' + (parseFloat(length * 100) / 100).toFixed(3) +
	        ' ' + 'metres / ' +  (parseFloat(length * 100 / 100 * 3.2808399)).toFixed(3) + ' ' + 'feet &nbsp;';
	  }
	  return output ;
	};
	



	/**
	 * format length output
	 * @param {ol.geom.Polygon} polygon
	 * @return {string}
	 */
	var formatArea = function(polygon) {
	  var area;
		 {
	    var sourceProj = map.getView().getProjection();
	    var geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(
	        sourceProj, 'EPSG:4326'));
	    var coordinates = geom.getLinearRing(0).getCoordinates();
	    area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
	  } 
	  var output;
	  if (area > 10000) {
	    output = (parseFloat(area / 1000000 * 100) / 100).toFixed(3) +
	        ' ' + 'square kilometres / '  +  (parseFloat(area / 1000000 * 38.610) / 100).toFixed(3) + ' ' + 'square miles &nbsp;';
	  } else {
	    output = (parseFloat(area * 100) / 100).toFixed(3) +
	        ' ' + 'square metres / '  +  (parseFloat(area / 100 * 107639.104) / 100).toFixed(3) + ' ' + 'square feet &nbsp;';
	  }
	  return output;
	};
	
	var measurecontrol = document.getElementById('type').value;
	if (measurecontrol != "none") {
	addInteraction();
	}





	/**
	 * Handle pointer move.
	 * @param {ol.MapBrowserEvent} evt
	 */
	var pointerMoveHandlerElevation = function(evt) {
	  if (evt.dragging) {
	    return;
	  }
	  /** @type {string} */
	  var helpMsg = 'Click to start drawing. Click to change direction. Double-click to stop.';
	  /** @type {ol.Coordinate|undefined} */
	  var tooltipCoord = evt.coordinate;
	
	  if (sketch) {
	    var output;
	    var geom = (sketch.getGeometry());
	    if (geom instanceof ol.geom.Polygon) {
	      output = formatArea(/** @type {ol.geom.Polygon} */ (geom));
	      helpMsg = continuePolygonMsg;
	      tooltipCoord = geom.getInteriorPoint().getCoordinates();
	    } else if (geom instanceof ol.geom.LineString) {
	      output = formatLength( /** @type {ol.geom.LineString} */ (geom));
	      helpMsg = continueLineMsg;
	      tooltipCoord = geom.getLastCoordinate();
	    }
//	    measureTooltipElement.innerHTML = output;
//	    measureTooltip.setPosition(tooltipCoord);
	  }
		  if (helpTooltipElement) 
	  helpTooltipElement.innerHTML = helpMsg;
	  helpTooltip.setPosition(evt.coordinate);
	
	};

	/**
	 * Creates a new help tooltip
	 */
	function createHelpTooltipDraw() {
	  if (helpTooltipElement) {
	    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
	  }
	  helpTooltipElement = document.createElement('div');
	  helpTooltipElement.className = 'tooltip1';
	  helpTooltip = new ol.Overlay({
	    element: helpTooltipElement,
	    offset: [45, 20],
	    positioning: 'center-left'
	  });
	  map.addOverlay(helpTooltip);
	}


	var drawE, snapE;

      function addInteractionE() {

	colorsource = new ol.source.Vector();

	vectorcolor = new ol.layer.Vector({
	  title: "vectorcolor",
	  source: colorsource,
	   style: new ol.style.Style({
	      fill: new ol.style.Fill({
	        color: 'rgba(255, 255, 255, 0.1)'
	      }),
	      stroke: new ol.style.Stroke({
	        color: 'rgba(30,144,255, 0.9)',
	        lineDash: [4, 4],
	        width: 3
	      }),
	      image: new ol.style.Circle({
	        radius: 5,
	        stroke: new ol.style.Stroke({
	          color: 'rgba(0, 0, 0, 0.7)'
	        }),
	        fill: new ol.style.Fill({
	          color: 'rgba(255, 255, 255, 0.2)'
	        })
	      })
	     })
	   });

	var maplayerlength = map.getLayers().getLength();

	map.getLayers().insertAt(maplayerlength,vectorcolor);


	function splitArrayIntoChunksOfLen(arr, len) {
	  var chunks = [], i = 0, n = arr.length;
	  while (i < n) {
	    chunks.push(arr.slice(i, i += len));
	  }
	  return chunks;
	}



  function  sampleProfileLine(coordinates) {

console.log("sampleProfileLinecoordinates : " + coordinates );

        const options = {units: 'meters'};

//        const line = turf.lineString(coordinates);

        const line = JSON.parse(coordinates);

		console.log("line: " + JSON.stringify(line));

		document.getElementById('chart').innerHTML = "explore.js line 5450 - const line = " + JSON.stringify(line);

        const lineLength = turf.length(line, options);

		console.log("lineLength: " + lineLength);

//	var coordinates2 = JSON.parse(coordinates.getGeometry().getCoordinates());


//	console.log("coordinates2: " + coordinates2);

        let numSamples = 200;
 //       const metersPerPx = getZoomLevelResolution(coords[0][1], 12);

        const metersPerPx = 10.468007531300044

	console.log("metersPerPx: " + metersPerPx);

        const stepSize = Math.max(metersPerPx, lineLength / numSamples);
        numSamples = lineLength / stepSize;

        const samples = [];
        for (let i = 0; i <= numSamples; i++) {
            const along = turf.along(line, i * stepSize, options);
            const coords = along.geometry.coordinates;
            samples.push(coords);
        }

        return samples;


    }

	function transform(geometry) {
	    geometry.transform('EPSG:3857', 'EPSG:4326'); // <-- this removes my drawn feature from the map. If I remove this line, the drawn LineString remains.
	
	}



        function drawElevation()	{

		// extracts the path coordinates from the top layer as GeoJSON 


		var maplayerlength = map.getLayers().getLength();
		var toplayer = parseInt(maplayerlength - 1);
		var lastlayerfeatures = map.getLayers().getArray()[parseInt(toplayer)].getSource().getFeatures();
		var lastlayerfeatureslength = map.getLayers().getArray()[parseInt(toplayer)].getSource().getFeatures().length;

		console.log("lastlayerfeatureslength : " + lastlayerfeatureslength );

		var geojsonFormat = new ol.format.GeoJSON({ extractGeometryName: true});

		var file_original = geojsonFormat.writeFeatures(lastlayerfeatures, { dataProjection: 'EPSG:4326',  decimals:8 });

		var file1 = file_original.replace('{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[','{"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":');

		var file2 = file1.replace(']},"properties":null}]', '}');



		if (file2)

			{

			drawElevationProfile(file2);

			}

	}




    function drawElevationProfile(coordinates) {


//		console.log("drawElevationProfilecoordinates : " + coordinates );


//		console.log("drawElevationProfilecoordinates : " + JSON.parse(JSON.stringify(coordinates)));


        const samples = sampleProfileLine(coordinates);


	console.log("Samples: " + samples);

        const elevationProfile = [];
        for (const c of samples) {
            const elevation = this.elevationProvider.getElevation(c[1], c[0]);
            elevationProfile.push(elevation);
        }

        const minElevation = Math.min(...elevationProfile);

        this.chart = new Chartist.Line('#chart', {
            series: [elevationProfile]
        }, {
            low: minElevation - 100,
            showArea: true,
            showPoint: false,
            fullWidth: true,
            lineSmooth: Chartist.Interpolation.cardinal({
                tension: 4,
                fillHoles: false
            })
        });
    }


   function getZoomLevelResolution(latitude, zoom) {
        const metersPerPx = (Math.cos(latitude * Math.PI/180.0) * 2 * Math.PI * 6378137) / (512 * 2**zoom);
        return metersPerPx;
    }



      var modify = new ol.interaction.Modify({source: colorsource});
      map.addInteraction(modify);

        var value = 'LineString';
        if ((((value == 'Polygon') || (value == 'LineString') || (value == 'MultiLineString') || (value == 'MultiPolygon')))) {
          drawE = new ol.interaction.Draw({
            source: colorsource,
            type: /** @type {ol.geom.GeometryType} */ ('MultiLineString')
	  });
          map.addInteraction(drawE);

	createHelpTooltipDraw();
	map.on('pointermove', pointerMoveHandlerElevation);

	  drawE.on('drawstart',
	      function(evt) {
	        // set sketch
	        sketch = evt.feature;
	      }, this);
 
	  drawE.on('drawend',
	      function(evt) {

		coordinates = [];
		coordinates.push(evt.feature.getGeometry().transform('EPSG:3857', 'EPSG:4326').getCoordinates());

		console.log("coordinates: " + coordinates);

		setTimeout(function () {

			drawElevation();

		}, 1300)

 		jQuery("#chart").show();

//		map.removeInteraction(drawE);


	      }, this);

        snapE = new ol.interaction.Snap({source: colorsource});
        map.addInteraction(snapE);

        }
	else
	{
	stopmeasuringElevation();
	}

      }

      /**
       * Handle change event.
       */

	$(".onoffswitch-checkbox").on('change',  function (event) {

	if ($(".onoffswitch-checkbox").prop('checked')== false)


		{

        	var value = 'Off';

		if (value == 'Off')

		var helpMsg = '';
		map.removeOverlay(helpTooltip);
		if (overlaylayer.getPosition() !== undefined)
		{ overlaylayer.setPosition(undefined); }

		document.getElementById('stopmeasuringmessage').innerHTML = '';
		document.getElementById('chart').innerHTML = '';
		jQuery("#chart").hide();

         	map.removeInteraction(drawE);
 		map.removeInteraction(snapE);

	        return;
		}

	else

	{

		// check to see if MapTiler Elevation is base layer and if not, change the base layer to MapTiler Elevation

		var baseLayerName = map.getLayers().getArray()[0].get('mosaic_id');
	
		if ( baseLayerName !== '6')
	
			{
	
		  	map.getLayers().removeAt(0);
		  	map.getLayers().insertAt(0,baseLayers[5]);
			document.getElementById("layerSelect").selectedIndex = baseLayerName - 1;
	
			}

		var value = 'LineString';
	  	var helpMsg = 'Click to start tracing a path.<br/>Click to change direction.<br/>Double-click to stop.<br/>Zoom in to trace small changes of direction.';

		  document.getElementById('stopmeasuringmessage').innerHTML = 'Trace a route on the map to see the elevation profile';

//		if ((map.getLayers().getLength() > 3) && (map.getLayers().getArray()[3].get("title") == "vectors - paths")) map.getLayers().removeAt(3); 


		map.removeInteraction(drawE);
		map.removeInteraction(snapE);
        	addInteractionE();

	}

      });





      var view = new ol.View({
		    center: ol.proj.transform([currentLon, currentLat], 'EPSG:4326', 'EPSG:3857'),
		    zoom: currentZoom
      });


	map.on('postrender', function() {


//		map.getLayers().getArray()[2].getSource().on('tileloadend', function() {
		
				if (pointClicked)
				if ((pointClicked !== null) && (pointClicked.length > 5) && (map.getLayers().getArray()[3].getSource().getFeatures().length < 1) )

			
				{
		
//				console.log("initiating pointclick");
		
				// timedText(pointClicked);
				pointClick(pointClicked);
				}
		
//			     });

		});

function ngrgaz(value) {

         var osgbnum = gridreference(value);
         // var osgb = new OpenLayers.LonLat(osgbnum[0], osgbnum[1]);
	if ((osgbnum) && (osgbnum != 'undefined'))
	{
	 point27700 = [];
	 point27700.push(parseFloat(osgbnum[0]), parseFloat(osgbnum[1]));

	outx = osgbnum[0];
	outy = osgbnum[1];

	if ((outx  < 0) || (outx > 700000 ) || (outy < 0) || (outy > 1300000 ))

	{ 
	// console.log('out of range');
	return; 
	}

	 // console.log(point27700);
	 point3857 = [];
	 point3857 = ol.proj.transform(point27700,"EPSG:27700", "EPSG:3857");
	 var a = map.getView().setCenter(point3857);
    	 var b = map.getView().setZoom(10+value.length);
	 var zoom1 = (10+value.length);
	// return b;
	 var zoom = Math.round(zoom1);

	if (zoom > 16 ) zoom = 16; 

	var x = point3857[0].toFixed(0);
	var y = point3857[1].toFixed(0);

        map.getView().animate({
	  center: [x, y],
	  zoom: zoom,
          duration: 1500
        });

		setTimeout( function(){

			var centre = [];
			var centre = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");
			pointClicked = centre[1].toFixed(5) + ',' + centre[0].toFixed(5);
			pointClick(pointClicked);

			}, 600); // delay 50 ms


	var windowWidth = $(window).width();
    	if (windowWidth <= 600) {
        jQuery("#searchSideBar").hide();
	jQuery("#layersSideBarOutlines").hide();
	jQuery("#show").show();
	jQuery("#showlayersOutlinesExplore").show();
	jQuery("#exploreslideroverlay").show();
	jQuery("#exploreslideroverlaymobile").show();
	}


}
else
{ return; }




      }


if (document.getElementById("ngrgaz") != null) {

	document.getElementById("ngrgaz")
	    .addEventListener("keyup", function(event) {
	    event.preventDefault();
		document.getElementById('search-button-ngrgaz').style.color = 'blue';
	    if (event.keyCode === 13) {
	       // document.getElementById("ngrgaz").click();
		ngrgaz(document.getElementById("ngrgaz").value);

	    }
	});

}


if (document.getElementById("nlsgaz") != null) {

         // Initialize the Gazetteer with autocomplete and County+Parish selector
     nlsgaz(function(minx,miny,maxx,maxy){
      // alert(minx + ' ' + miny + ' ' + maxx + ' ' + maxy);

      // zoom to gridref

      // zoom to bbox

	 var currentZoom = map.getView().getZoom();
         var extent = [minx, miny, maxx, maxy];



         extent = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));

//       map.getView().fit(extent, map.getSize());

	 var y = extent[1] + (extent[3] - extent[1]) / 2; 
         var x = extent[0] + (extent[2] - extent[0]) / 2; 
	
  	 var resolution = map.getView().getResolutionForExtent(extent, map.getSize());
	 var zoom1 = map.getView().getZoomForResolution(resolution);

	 if (map.getSize()[0] < 600 ) 

	{
	 var zoom = Math.round(zoom1 - 2);
	}
	else
	{
	 var zoom = Math.round(zoom1 - 1);
	}

	if (map.getLayers().getArray()[2].get("maxZoom") !== null)
	{
	var overlayMaxZoom = map.getLayers().getArray()[2].get("maxZoom");
	var MaxZoom = Math.round(overlayMaxZoom - 1);
	}

	var windowWidth = $(window).width();
    	if ((windowWidth <= 600) && (document.getElementById("parish").selectedIndex != 0)) {
        jQuery("#searchSideBar").hide();
	jQuery("#layersSideBarOutlines").hide();
	jQuery("#show").show();
	jQuery("#showlayersOutlinesExplore").show();
	jQuery("#exploreslideroverlay").show();
	jQuery("#exploreslideroverlaymobile").show();
	}

     
	 if ((zoom < 3) || (isNaN(zoom)) || (zoom > MaxZoom))
		{ zoom = MaxZoom; }

	 if ((map.getLayers().getLength() > 4) && (map.getLayers().getArray()[4].getSource() != null)) {map.getLayers().getArray()[4].getSource().clear();  document.getElementById('wfsResults').innerHTML = ""; }
	 if ((map.getLayers().getLength() > 5) && (map.getLayers().getArray()[5].getSource() != null)) {map.getLayers().getArray()[5].getSource().clear();  document.getElementById('wfsParishCountyResults').innerHTML = ""; }


	      function flyTo(location, done) {
	        var duration = 3000;
	      //  var zoom = map.getView().getZoom();
	        var parts = 2;
	        var called = false;
	        function callback(complete) {
	          --parts;
	          if (called) {
	            return;
	          }
	          if (parts === 0 || !complete) {
	            called = true;
	            done(complete);
	          }
	        }
	        map.getView().animate({
	          center: location,
	          duration: duration
	        }, callback);
	        map.getView().animate({
	          zoom: zoom - 1,
	          duration: duration / 2
	        }, {
	          zoom: zoom,
	          duration: duration / 2
	        }, callback);
	      }

	if (parseInt(currentZoom) > 8)
		{
		flyTo([x, y], function() {});
		}
	else
		{

		//	 alert("x: " + x + ", y: " + y + ", res: " + resolution + ", zoom: " + zoom);
			
			map.getView().animate({
				center: [x , y ],
				zoom: zoom,
			        duration: 1000
			});




		}

	}




    );

}


if (document.getElementById("nlsgaz") != null) {

      var autocomplete = new kt.OsmNamesAutocomplete('searchgb1900', 'https://nlsgb1900.klokantech.com/');
      autocomplete.registerCallback(function(item) {
       (JSON.stringify(item, ' ', 2));


		if (jQuery('#layerfiltercheckbox').is(":checked")) 

		{
			$( "#layerfiltercheckbox" ).prop( "checked", false );
		}

		var mapgroupno = map.getLayers().getArray()[2].get('group_no');
	
		if (mapgroupno !== '36')
		
		{ 
	
		map.getLayers().removeAt(2);
		overlaySelected = getOverlay(6);
	        switchOverlayinitial();
	
		}


	lonlat_3857 = [];
	lonlat_3857 = ol.proj.transform([item.lat, item.lon], 'EPSG:4326','EPSG:3857');

	zoom = 16;

        // alert(lonlat_3857[0] + ' ' + lonlat_3857[1] + ' ');

	if ((map.getLayers().getLength() > 4) && (map.getLayers().getArray()[4].getSource() != null)) {map.getLayers().getArray()[4].getSource().clear(); document.getElementById('wfsResults').innerHTML = "";}
	 if ((map.getLayers().getLength() > 5) && (map.getLayers().getArray()[5].getSource() != null)) {map.getLayers().getArray()[5].getSource().clear();  document.getElementById('wfsParishCountyResults').innerHTML = ""; }



	function flyTo(location, done) {
	        var duration = 3000;
	      //  var zoom = map.getView().getZoom();
	        var parts = 2;
	        var called = false;
	        function callback(complete) {
	          --parts;
	          if (called) {
	            return;
	          }
	          if (parts === 0 || !complete) {
	            called = true;
	            done(complete);
	          }
	        }
	        map.getView().animate({
	          center: location,
	          duration: duration
	        }, callback);
	        map.getView().animate({
	          zoom: zoom - 1,
	          duration: duration / 2
	        }, {
	          zoom: zoom,
	          duration: duration / 2
	        }, callback);
	      }

	if (parseInt(currentZoom) > 8)
		{

		flyTo([lonlat_3857[0], lonlat_3857[1]], function() {});

		}
	else
		{

		//	 alert("x: " + x + ", y: " + y + ", res: " + resolution + ", zoom: " + zoom);

			map.getView().animate({
				center: [lonlat_3857[0] , lonlat_3857[1]],
				zoom: zoom,
			        duration: 1500
			});
		}

	var windowWidth = $(window).width();
    	if (windowWidth <= 600) {
        jQuery("#searchSideBar").hide();
	jQuery("#layersSideBarOutlines").hide();
	jQuery("#show").show();
	jQuery("#showlayersOutlinesExplore").show();
	jQuery("#exploreslideroverlay").show();
	jQuery("#exploreslideroverlaymobile").show();
	}

	}

    );


}

if (document.getElementById("nlsgaz") != null) {


	userInput.addEventListener('input', function(event) {

	   if (this.value.length > 2)

		{

		currentConversion.name = userInput.value;
		  if (tokeniseConversion(currentConversion)) {
//		    document.getElementById("parse").innerHTML = `&bull; Parsed ${currentConversion.name} to&emsp;${currentConversion.sheet}&emsp;|&emsp;${currentConversion.letter}&emsp;|&emsp;${currentConversion.number}&emsp;|&emsp;${currentConversion.grid}&emsp;|&emsp;${Math.round(100 * currentConversion.xOrdinate)}&emsp;|&emsp;${(Math.round(100 * currentConversion.yOrdinate))}`;
		    setEastingNorthing(currentConversion);
//		    document.getElementById("distance").innerHTML = `&bull; Determined ${currentConversion.name} to be x: ${currentConversion.easting.toFixed(0)},  y: ${currentConversion.northing.toFixed(0)} metres from Bonne origin`;
		    inverseProject(currentConversion);
//		    document.getElementById("conversion").innerHTML = `&bull; Converted [${currentConversion.easting.toFixed(0)}, ${currentConversion.northing.toFixed(0)}] to ${currentConversion.latitude.toFixed(6)}, ${currentConversion.longitude.toFixed(6)}`;
//		    document.getElementById("quadrant").innerHTML = `&bull; Identified the quadrant as ${currentConversion.quadrant}`;
//		    forwardConvertMapSheet();
//		    document.getElementById("forward").innerHTML = `&bull; Forward projected ${currentConversion.latitude.toFixed(6)}, ${currentConversion.longitude.toFixed(6)} to ${currentConversion.easting.toFixed(0)}, ${currentConversion.northing.toFixed(0)}`;

//		    document.getElementById("forlat").innerHTML = `&bull; Converted [${currentConversion.easting.toFixed(0)}, ${currentConversion.northing.toFixed(0)}] to <strong>${currentConversion.name}</strong>`;
//		    document.getElementById("header").innerText += ` for Sheet ${userInput.value}`;
//		    updateMap(currentConversion.latitude, currentConversion.longitude);

//			console.log("forward: " + forwardConvertMapSheet());

			if (isNum(currentConversion.latitude)) {
	
			    lonlat_3857 = [];
			    lonlat_3857 = ol.proj.transform([currentConversion.longitude, currentConversion.latitude], 'EPSG:4326','EPSG:3857');
	
//			    console.log("currentConversion.latitude, etc : " +  currentConversion.latitude + " , " + currentConversion.longitude);
	
//			    console.log("lonlat : " +  lonlat_3857[0] + " , " +  lonlat_3857[1]);


	
					map.getView().animate({
						center: [lonlat_3857[0] , lonlat_3857[1] ],
						zoom: 16,
						duration: 1000
					});

			}

		  }

		}

	});

}
	var mapZoom = map.getView().getZoom();

		if (mapZoom > 12)


		{



	           var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSourceParish = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=nls:Scot_Eng_Wales_1950s_parish' +
			        '&PropertyName=(the_geom,COUNTY,PARISH,TYPE)&outputFormat=text/javascript&format_options=callback:loadFeaturesParish' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeaturesParish = function(response) {
			     vectorSourceParish.addFeatures(geojsonFormat.readFeatures(response));
			};


		}

	else  if (mapZoom < 13)

		{

			vectorSourceParish = new ol.source.Vector();


 	  		var geojsonFormat = new ol.format.GeoJSON();

			var loadFeaturesParish = function(WFS_Feature) {
			     vectorSourceParish.addFeatures(geojsonFormat.readFeatures(WFS_Feature));
			};


		}


	if (mapZoom  < 13)

		{

			vectorSource = new ol.source.Vector();

	  		var geojsonFormat = new ol.format.GeoJSON();
		
			var loadFeatures = function(WFS_Feature) {
  			     vectorSource.addFeatures(geojsonFormat.readFeatures(WFS_Feature));
			};

		}



	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '150')) // OS Quarter-Inch First Hills

		{
		
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
		
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

			

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '43')) // OS Quarter-Inch Third col

		{
		
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
		
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

			

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '152')) // OS Quarter-Inch Third Civil Air

		{
		
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
		
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

			

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '155')) // OS Quarter-Inch Fourth

		{
		
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
		
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

			

		}


    else if  ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '39'))

		{
			
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

	
			
		}


	else if     ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '58')) // One-Inch Hills

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=nls:OS_One_Inch_GB_Hills_WFS' +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};


		}


	else if     ((mapZoom  > 12) &&  (map.getLayers().getArray()[2].get('group_no') == '196')) // One-Inch Geological

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=nls:OS_One_Inch_GB_Hills_WFS' +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '66')) // One-Inch Soils

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '38')) // One-Inch 1st ed colour

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=nls:OS_Scotland_one-inch_1st_col_WFS' +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}


	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '208')) // Survey of India half-inch

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '209')) // Survey of India half-inch second

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '210')) // Survey of India one-inch first

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '211')) // Survey of India one-inch second

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}


	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '50')) // Bartholomew half-inch

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}


	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '85')) // Bartholomew half-inch 1940s

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '65')) // Land utilisation

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '40')) // OS Popular

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '98')) // OS Popular outline

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '101')) // OS Popular Nat Grid outline

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '1')) // Historic Maps API

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '56')) // OS New Pop England and Wales

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

        else if  ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '55'))
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}



	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '32')) // OS 1:25K Great Britain
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '106')) // OS 1:25K Outline edition
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '95')) // GSGS 3906
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '36')) // OS Six-inch, 1888-1910
	

		{	

// console.log("OS Six-inch, 1888-1910 - 2");

			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '35')) // OS Six-inch, Scotland 1st ed
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geoserver.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
	
		}


	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '59')) // OS Six-inch, 1888-1910
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '93')) // Geological Six-inch
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}



	else if     ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '100')) // One-Inch GSGS 3908

		{	


			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			


			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}
			
	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '34'))    // OS 25 inch Scotland
	

		{	
			var geojsonFormat = new ol.format.GeoJSON();
			
			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geoserver3.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
			
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '178'))    // OS 25 inch SW England 1st

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geoserver.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}
			
	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '64'))    // OS 25 inch England and Wales

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geoserver3.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '206'))    // OS 25 inch Gloucester 3rd ed

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '180'))    // OS 25 inch Blue and Blacks

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};

		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '61'))    // OS National Grid - London/Edinburgh

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};
		}

	else  if     ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '57'))    // OS London 1890s

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));

			};
		}


	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '116'))    // Goad plans

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};


		}

	else if      ((mapZoom  > 12) && (map.getLayers().getArray()[2].get('group_no') == '70'))    // OS town plans - Eng/Wal

		{

			var geojsonFormat = new ol.format.GeoJSON();

			vectorSource = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
			    var url = 'https://geo-server.nls.uk/geoserver/wfs?service=WFS&' +
			        'version=1.1.0&request=GetFeature&typename=' + map.getLayers().getArray()[2].get('typename') +
			        '&PropertyName=(the_geom,IMAGEURL,WFS_TITLE)&outputFormat=text/javascript&format_options=callback:loadFeatures' +
			        '&srsname=EPSG:3857&bbox=' + extent + ',EPSG:3857';
			    // use jsonp: false to prevent jQuery from adding the "callback"
			    // parameter to the URL
			    jQuery.ajax({url: url, dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false});
			  },
			  strategy: ol.loadingstrategy.tile(new ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});
			
			
			// the global function whose name is specified in the URL of JSONP WFS
			// GetFeature requests

			  var loadFeatures = function(response) {
			     vectorSource.addFeatures(geojsonFormat.readFeatures(response));
			};


		}



		// if (map.getLayers().getArray()[2].get('typename') != "none")
	 	// if (vectorSource != null)
			


			var vector = new ol.layer.Vector({
			  name: 'vector',
			  source: vectorSource,
			  style: new ol.style.Style({
			    stroke: new ol.style.Stroke({
			      color: 'rgba(0, 0, 0, 0)',
			      width: 0
			    })
			  })
			});

		// if (map.getLayers().getLength() > 3) 
		map.getLayers().insertAt(4,vector);


//		setTimeout( function(){
//			window_width_centre = Math.round($(window).width() / 2);
//			window_height_centre = Math.round($(window).height() / 2);

//			displayFeatureInfo([window_width_centre,window_height_centre]);

//		    }, 500); // delay 50 ms

			
				var displayFeatureInfo = function(pixel) {

				selectedFeatures = [];
				
				  var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
				        // return feature;

					selectedFeatures.push(feature);
				    }, {
				        layerFilter: function(layer) {
				            return layer === vector;
				        }
				
				    });

				  var info = document.getElementById('wfsResults');

//			selectedFeatures.sort(function(a, b){
//					   var nameA=a.id, nameB=b.id
//					   if (nameA < nameB) //sort string ascending
//					       return -1 
//					   if (nameA > nameB)
//					       return 1
//					   return 0 //default return value (no sorting)
//			
//					})

				  var selectedFeaturesLength = selectedFeatures.length;
				  var selectedFeaturesLengthMinusOne = (selectedFeatures.length - 1);
			
			          if (selectedFeaturesLength > 0)

				  {


			          if (selectedFeaturesLength == '1') 

				  {

					if (selectedFeatures[0].get('WFS_TITLE').length < 2) { return; }
					else
					{
					info.innerHTML = '&nbsp;' + selectedFeatures[0].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[0].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<a href="javascript:switchWFSOFF();"><span class="WFSclose">&times;</span></a>&nbsp;';  
					}
				  }

			          else if (selectedFeaturesLength == '2')

				  {

					info.innerHTML = '&nbsp;' + selectedFeatures[0].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[0].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<a href="javascript:switchWFSOFF();"><span class="WFSclose">&times;</span></a>&nbsp;<br/>' +
					'&nbsp;' + selectedFeatures[1].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[1].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<br/>';  
              				 
				  }

			          else if (selectedFeaturesLength == '3')

				  {

					info.innerHTML = '&nbsp;' + selectedFeatures[0].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[0].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<a href="javascript:switchWFSOFF();"><span class="WFSclose">&times;</span></a>&nbsp;<br/>' +
					'&nbsp;' + selectedFeatures[1].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[1].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<br/>';  
              				'&nbsp;' + selectedFeatures[2].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[2].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<br/>';  
   
				  }

			          else if (selectedFeaturesLength == '4')

				  {

					info.innerHTML = '&nbsp;' + selectedFeatures[0].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[0].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<a href="javascript:switchWFSOFF();"><span class="WFSclose">&times;</span></a>&nbsp;<br/>' +
					'&nbsp;' + selectedFeatures[1].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[1].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<br/>';  
              				'&nbsp;' + selectedFeatures[2].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[2].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;<br/>';  
                 			'&nbsp;' + selectedFeatures[3].get('WFS_TITLE') + '&nbsp; - <a href="' + selectedFeatures[3].get('IMAGEURL') + '" alt="View specific map listed"  title="View specific map listed">View or order this map</a>&nbsp;';  
   
				  }

				  }
			
				};





			var vectorParish = new ol.layer.Vector({
			  name: 'vectorParish',
			  source: vectorSourceParish,
			  style: new ol.style.Style({
			    stroke: new ol.style.Stroke({
			      color: 'rgba(0, 0, 0, 0)',
			      width: 0
			    })
			  })
			});

			map.getLayers().insertAt(5,vectorParish);

// setTimeout( function(){
//	console.log("vectorsource_length: " + map.getLayers().getArray()[5].getSource().getFeatures().length );
//    }, 2500); // delay 50 ms
	
			
				var displayFeatureInfoParish = function(pixel) {

				selectedFeatures = [];
				
				  var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
				        // return feature;

					selectedFeatures.push(feature);
				    }, {
				        layerFilter: function(layer) {
				            return layer === vectorParish;
				        }
				
				    });


				  var infoCounty = document.getElementById('wfsParishCountyResults');

				  var selectedFeaturesLength = selectedFeatures.length;


//				  if ((map.getView().getZoom() > 12) && (selectedFeaturesLength == '0'))

//				  {
//				    infoCounty.innerHTML = '&nbsp;<a href="javascript:checkparishWFS();" alt="View parish" title="View parish" >Show parish?</a>';
//				  }


			          if (selectedFeaturesLength > 0)

				  {

				  if (selectedFeatures[0].get('COUNTY').length > 0) 
					{infoCounty.innerHTML = '&nbsp;' + selectedFeatures[0].get('PARISH') + '&nbsp;parish, '  + selectedFeatures[0].get('COUNTY') + ' (1950s)&nbsp;<a href="javascript:switchparishWFSOFF();" alt="Turn off parish details" title="Turn off parish details"><span class="WFSclose">&times;</span></a>&nbsp;';   } 
				  if (selectedFeatures[0].get('TYPE').length > 0) 
//					if (inScotland = true)
					{infoCounty.innerHTML = '&nbsp;' + selectedFeatures[0].get('PARISH') + '&nbsp;parish, '  + selectedFeatures[0].get('COUNTY') + ' (1950s) - <a href="javascript:showthisparish();" alt="View this parish in Boundaries Viewer" title="View this parish in Boundaries Viewer" >View parish</a> &nbsp; (1950s)&nbsp;<a href="javascript:switchparishWFSOFF();" alt="Turn off parish details" title="Turn off parish details"><span class="WFSclose">&times;</span></a>&nbsp;';    } 
						
				  }
				};


/*
				map.on('pointermove', function(evt) {
				  var center = [];
				  center = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:27700");

//				  if ((Math.round(center[0])  < 0) || (Math.round(center[0]) > 700000 ) || (Math.round(center[1]) < 0) || (Math.round(center[1]) > 1300000 )) 
//					{ return; }

				  if ((document.getElementById('type').value != 'none') || (map.getView().getZoom() < 11)) 
					{ document.getElementById('wfsResults').innerHTML = ''; return; }
				  var pixel = map.getEventPixel(evt.originalEvent);
				  displayFeatureInfo(pixel);

				  displayFeatureInfoParish(pixel);
				});
				
*/








	function selectText(containerid) {
	    if (document.selection) {
	        var range = document.body.createTextRange();
	        range.moveToElementText(document.getElementById(containerid));
	        range.select();
	    } else if (window.getSelection) {
	        var range = document.createRange();
	        range.selectNode(document.getElementById(containerid));
	        window.getSelection().addRange(range);
	    }
	}


	function clearSelection()
	{
	 if (window.getSelection) {window.getSelection().removeAllRanges();}
	 else if (document.selection) {document.selection.empty();}
	}

	function getcoordinates()
	{
		getCoordinates = true;
			jQuery('#showCoordinatesinfo').show();
       			document.getElementById('showCoordinatesinfo').innerHTML = 'Click/tap on the map to show <br/>coordinates for that location.';
	
		setTimeout( function(){
       			document.getElementById('showCoordinatesinfo').innerHTML = '';
			jQuery('#showCoordinatesinfo').hide();
			}, 3000); // delay 50 ms


	
		/**
		 * Handle pointer move.
		 * @param {ol.MapBrowserEvent} evt
		 */
		var pointerMoveHandlerCoord = function(evt) {
		  if (evt.dragging) {
		    return;
		  }
		 
		var helpMsg = 'Click/tap on the map to show <br/>coordinates for that location.';
	
		  /** @type {ol.Coordinate|undefined} */
		  var tooltipCoord = evt.coordinate;
		
		 		  if (helpTooltipElement) 
		  helpTooltipElement.innerHTML = helpMsg;
		  helpTooltip.setPosition(evt.coordinate);
		
		};

			/**
			 * Creates a new help tooltip for getCoord
			 */
			function createHelpTooltipCoord() {
			  if (helpTooltipElement) {
			    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
			  }
			  helpTooltipElement = document.createElement('div');
			  helpTooltipElement.className = 'tooltip1';
			  helpTooltip = new ol.Overlay({
			    element: helpTooltipElement,
			    offset: [35, 0],
			    positioning: 'center-left'
			  });
			  map.addOverlay(helpTooltip);
			}
			

		createHelpTooltipCoord();
		map.on('pointermove', pointerMoveHandlerCoord);

	}

	function remove_getCoordinates()
	
	{
	getCoordinates = false;
	map.removeOverlay(helpTooltip);
//	var overlayslength = map.getOverlays().getLength();
//	if (overlayslength > 0) {map.getOverlays().clear();}

	if (overlaylayer.getPosition() !== undefined)
	{ overlaylayer.setPosition(undefined); }

        document.getElementById('showCoordinatesinfo').innerHTML = '';
	jQuery('#showCoordinatesinfo').show();
	}


	window.onkeydown = function( event ) {
	    if ( event.keyCode == 27 ) {
		if (overlaylayer.getPosition() !== undefined)

		{ overlaylayer.setPosition(undefined); }
	    }
	};


            map.on('click', function(event) {
                var coordinate = event.coordinate;

		if (overlaylayer.getPosition() !== undefined)

		{ overlaylayer.setPosition(undefined); }

		if ((event.originalEvent.altKey == true) || (getCoordinates)) {

		clearSelection();

		// alert(coordinate);
        	var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));

		var coord27700 = ol.coordinate.toStringXY(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:27700'), 0);
		pointClicked2 = coord27700.split(",");
		var outx = pointClicked2[0];
		var outy = pointClicked2[1];
		var NGR = gridrefNumToLet(outx, outy, 10);
		var latlon = ol.coordinate.toStringXY(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'), 6);
		latlon2 = latlon.split(",");
		var lat = latlon2[1];
		var lon = latlon2[0];

		var str = "";

        	str += 'You have clicked on: <br/> <div id = "popup-copy" contenteditable="true">';

		var center = [];
		center = ol.proj.transform(coordinate, "EPSG:3857", "EPSG:27700");

		var trench = forwardProject2(lon, lat);
		var trench2 = forwardConvertMapSheet();


		if ((Math.round(center[0])  < 0) || (Math.round(center[0]) > 700000 ) || (Math.round(center[1]) < 0) || (Math.round(center[1]) > 1300000 )) 

			{

			if (trench2 !== 'error')

				{
				str +=	'<strong>Trench map coordinate:  </strong> ' + trench2;
				str +=	'<br/><strong>Latitude, Longitude:  </strong>  ' + lat + ', ' + lon;
				str +=	'</div>Click text above to select, or<br/> <button class="js-emailcopybtn">Copy to Clipboard</button><br/><div id = "popup-result"></div>';
	
				}
				else	
	
				{
				str +=	'<strong>Latitude, Longitude:  </strong>  ' + lat + ', ' + lon;
				str +=	'</div>Click text above to select, or<br/> <button class="js-emailcopybtn">Copy to Clipboard</button><br/><div id = "popup-result"></div>';
	
				}

			}
		else
		{
        	str += '<strong>Brit Nat Grid Ref: </strong>   ' + NGR + '<br/><strong>' + 'BNG Eastings, Northings:  </strong>  ' + ol.coordinate.toStringXY(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:27700'), 0); 
		str +=	'<br/><strong>Latitude, Longitude:  </strong>  ' + lat + ', ' + lon;
		str +=	'</div>Click text above to select, or<br/> <button class="js-emailcopybtn">Copy to Clipboard</button><br/><div id = "popup-result"></div>';
		}


	//	 alert(content.innerHTML);

		content.innerHTML = str;

        	overlaylayer.setPosition(coordinate);



			var copyEmailBtn = document.querySelector('.js-emailcopybtn');  

			copyEmailBtn.disabled = !document.queryCommandSupported('copy');

			copyEmailBtn.addEventListener('click', function(event) {  
			  // Select the email link anchor text  
			  var emailLink = document.getElementById('popup-content');  
			  var range = document.createRange();  
			  range.selectNode(emailLink);  
			  window.getSelection().addRange(range);
			
/*

if (window.getSelection) {
        try {
            var ta = emailLink;
            return ta.value.substring(ta.selectionStart, ta.selectionEnd);
        } catch (e) {
            console.log('Cant get selection text')
        }
    } 
			  window.getSelection().selRange;

*/

			  try {  
			    // Now that we've selected the anchor text, execute the copy command  
			    var successful = document.execCommand('copy');  
			    var msg = successful ? 'successful.' : 'unsuccessful.';  
			    // console.log('Copy command was ' + msg);  
			    document.getElementById("popup-result").innerHTML = 'Copy command was ' + msg;
			  } catch(err) {  
			    // console.log('Oops, unable to copy');  
			    document.getElementById("popup-result").innerHTML = 'Sorry, unable to copy';
			  }
			
			  // Remove the selections - NOTE: Should use
			  // removeRange(range) when it is supported  
			  window.getSelection().removeAllRanges();  



			});


		 }


		$(document).ready(function () {
	 		$("#popup-copy").attr('onclick', 'selectText("popup-copy")');
		});


		if (getCoordinates)
		{
		jQuery('#showCoordinatesinfo').show();
          	document.getElementById('showCoordinatesinfo').innerHTML = 'Stop showing coordinates and <br/><a href="javascript:remove_getCoordinates()">return to normal mouse navigation</a>';
		}


            });


	var measuresource = new ol.source.Vector();

	var vectormeasure = new ol.layer.Vector({
	  name: "vectormeasure",
	  source: measuresource,
	  style: new ol.style.Style({
	    fill: new ol.style.Fill({
	      color: 'rgba(255, 255, 255, 0.6)'
	    }),
	    stroke: new ol.style.Stroke({
	      color: '#2b3777',
	      width: 4
	    }),
	    image: new ol.style.Circle({
	      radius: 6,
	      fill: new ol.style.Fill({
	        color: '#2b3777'
	      })
	    })
	  })
	});




	map.getLayers().insertAt(6,vectormeasure);


	setTimeout( function(){


	var scotland_geojson = 'https://maps.nls.uk/geo/scripts/scotland.js';

	var scotland_source = new ol.source.Vector({
		    url:  scotland_geojson,
    		    format: new ol.format.GeoJSON(),
		  });

	var scotland_layer = new ol.layer.Vector({
		  name: "Scotland",
		  source: scotland_source,
		  style: new ol.style.Style({}),
	      });

	map.getLayers().insertAt(7,scotland_layer);

//	console.log("addingscotlandgeom");


	setTimeout( function(){

//		console.log("abouttorun-runningscotlandgeom");

	if (map.getLayers().getArray()[7].getSource().getFeatures().length > 0)
	{

//		console.log("runningscotlandgeom");

		var centre = map.getView().getCenter();
		var scotlandgeom = map.getLayers().getArray()[7].getSource().getFeatures()[0].getGeometry();
	
		if (scotlandgeom.intersectsCoordinate(centre))
		{
		inScotland = true;
		}
		else
		{
		inScotland = false;
		}
	}
	checkreuse();

	}, 500); // delay 50 ms


}, 500); // delay 50 ms
			
// geolocation scripts


if (document.getElementById("trackgeolocation") != null) {


		var view = map.getView();
	
		var geolocation = new ol.Geolocation({
	        projection: view.getProjection()
	      });
	
	
	
	      function el(id) {
	        return document.getElementById(id);
	      }
	
	     el('track').addEventListener('change', function() {

		if (this.checked) 
		{
		geolocation.setTracking(true);

			var coordinates = geolocation.getPosition();
	        	positionFeature.setGeometry(coordinates ?
	            	new ol.geom.Point(coordinates) : null);

			var windowWidth = $(window).width();

			//if (windowWidth => 1000) 
			//{
		    	//view.setCenter(coordinates);
			//}

				if (windowWidth <= 500) 
					{
				        jQuery("#searchSideBar").hide();
					jQuery("#show").show();
					}

		   if ( map.getLayers().getArray()[8].getSource().getFeatures().length < 1)
			{ map.getLayers().getArray()[8].getSource().addFeatures([accuracyFeature, positionFeature]); }
		}
		else
		{ 
		geolocation.setTracking(false);
		if (map.getLayers().getArray()[8].get("title") == "geolocation_vector")
			{  
			map.getLayers().getArray()[8].getSource().clear();

				var windowWidth = $(window).width();
				if (windowWidth <= 500) 
					{
				        jQuery("#searchSideBar").hide();
					jQuery("#show").show();
					}

			}  
		}

	      });
	
	      // handle geolocation error.
	      geolocation.on('error', function(error) {
	        var info = document.getElementById('info');
	        info.innerHTML = error.message;
	        info.style.display = '';
	      });
	
	      var accuracyFeature = new ol.Feature();
	      geolocation.on('change:accuracyGeometry', function() {
	        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
	      });
	
	
	      var positionFeature = new ol.Feature();
	      positionFeature.setStyle(new ol.style.Style({
	        image: new ol.style.Circle({
	          radius: 6,
	          fill: new ol.style.Fill({
	            color: '#3399CC'
	          }),
	          stroke: new ol.style.Stroke({
	            color: '#fff',
	            width: 2
	          })
	        })
	      }));
	
	
	      geolocation.on('change:position', function() {
	        var coordinates = geolocation.getPosition();
	        positionFeature.setGeometry(coordinates ?
	            new ol.geom.Point(coordinates) : null);
		    view.setCenter(coordinates);
	      });
	
		var geolocationVector = new ol.layer.Vector({
			  title: "geolocation_vector",
			  source: new ol.source.Vector({
	          features: [accuracyFeature, positionFeature]
	        })
	      });

	
		map.getLayers().insertAt(8, geolocationVector);
		
}





function updateOverlaySwitcher() {
  // Initialize tree overlay switcher
  overlayTree = {title: 'Historic Overlays', layer: null, subnodes: []};
  for (var x = 0; x < overlayLayers.length; x++) {
      // if (!overlayLayers[x].displayInLayerSwitcher) continue;
      //historical overlayTree
      var titleArray = overlayLayers[x].get('title').split('-');
      var title1 = jQuery.trim(titleArray.shift());
      var title2 = jQuery.trim(titleArray.join('-'));
      var node = {title: title1, subnodes: [{title: title2, layer: overlayLayers[x]}]};
      addNode(overlayTree, node);
      var overlayNodePath = [];
      var node1 = getNode(overlayTree, title1);
      overlayNodePath.push(indexOf(overlayTree.subnodes, node1));
      var node2 = getNode(node1, title2);
      overlayNodePath.push(indexOf(node1.subnodes, node2));
      overlayLayers[x].overlayNodePath = overlayNodePath;
  }

 // Initialize overlay switcher

 var overlaySelectNode = document.getElementById('overlaySelectNode');
  if (!initialisation) {
    while (overlaySelectNode.hasChildNodes()) {
      overlaySelectNode.removeChild(overlaySelectNode.lastChild);
    }
  } else {
    initialisation = false;
  }
  
  for(var i1 = 0; i1 < overlayTree.subnodes.length; i1++) {
    var node1 = overlayTree.subnodes[i1];
    var option = document.createElement('option');
    option.appendChild(document.createTextNode(node1.title));
    option.setAttribute('value', i1);
    option.setAttribute('id', 'overlayOption' + node1.title);
    overlaySelectNode.appendChild(option);
  }

}

function checktrenchmap()  {

	var str = map.getLayers().getArray()[2].get('group_no');
	if (str == 60)

	{
             jQuery("#trenchmapsearch").show();

	}

	else
	{
             jQuery("#trenchmapsearch").hide();

	}

}

function checkgb()  {

	var center = [];
	center = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:27700");

	if ((Math.round(center[0])  < 0) || (Math.round(center[0]) > 700000 ) || (Math.round(center[1]) < 0) || (Math.round(center[1]) > 1300000 )) 

		{
	             jQuery("#gb1900search").hide();
             	     jQuery("#ngrsearch").hide();
             	     jQuery("#countysearch").hide();
		     $("input[name=nlsgazarea][value='']").prop("checked",true);
		}

	else
		{
	             jQuery("#gb1900search").show();
                     jQuery("#ngrsearch").show();
             	     jQuery("#countysearch").show();
		     $("input[name=nlsgazarea][value='uk']").prop("checked",true);
		}

}


function checkreuse() {
	document.getElementById('re-use').innerHTML = '';

	if ($("#mapslider") != null ) 
		{
		var opacityvalue = jQuery('#mapslider').slider('getValue');
		}
	var centre = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");
	var str = map.getLayers().getArray()[2].get('group_no');
	var mosaic_id = map.getLayers().getArray()[2].get('mosaic_id');

	if (opacityvalue < 50)
	{
        document.getElementById('re-use').innerHTML = '';
	}
	else if ((opacityvalue > 49 ) && (str == 32))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if (((opacityvalue > 49 ) && (str == 34) && (inScotland == false)))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if (((opacityvalue > 49 ) && (str == 34) && (inScotland == true)))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#noncommercial">CC-BY</a> (NLS).';
	}

	else if (((opacityvalue > 49 ) && (str == 36) && (inScotland == false)))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if (((opacityvalue > 49 ) && (str == 36) && (inScotland == true)))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#noncommercial">CC-BY</a> (NLS).';
	}
	else if ((opacityvalue > 49 ) && (str == 37))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if (((opacityvalue > 49 ) && (str == 39) && ((inScotland == true))))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if (((opacityvalue > 49 ) && (str == 39) && (inScotland == false)))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#noncommercial">CC-BY</a> (NLS).';
	}

	else if ((opacityvalue > 49 ) && (str == 44))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if ((opacityvalue > 49 ) && (str == 47))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-roy">CC-BY </a> (BL).';
	}
	else if ((opacityvalue > 49 ) && (str == 52))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if ((opacityvalue > 49 ) && (str == 55))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if ((opacityvalue > 49 ) && (str == 59))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if ((((opacityvalue > 49 ) && (str == 61) && (mosaic_id == 170) && (centre[1].toFixed(4) < 52))))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if ((opacityvalue > 49 ) && (str == 62))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-damp">CC-BY</a> (DAMP).';
	}
	else if ((opacityvalue > 49 ) && (str == 64))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA </a>.';
	}
	else if ((opacityvalue > 49 ) && (str == 65))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-lus">CC-BY-NC-SA</a> (LUS).';
	}
	else if ((opacityvalue > 49 ) && (str == 66))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-hutton">CC-BY-NC-SA</a> (Hutton).';
	}
	else if ((opacityvalue > 49 ) && (str == 67))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-damp">CC-BY</a> (DAMP).';
	}
	else if ((opacityvalue > 49 ) && (str == 99))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA</a>.';
	}
	else if ((opacityvalue > 49 ) && (str == 175))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA</a>.';
	}
	else if ((opacityvalue > 49 ) && (str == 225))
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#exceptions-os">CC-BY-NC-SA</a>.';
	}
	else 
	{
        document.getElementById('re-use').innerHTML = 'Re-use: <a href="/copyright.html#noncommercial">CC-BY</a> (NLS).';
	}
}




function switchOverlayinitial() {

    	overlaySelected.setVisible(true);
    	map.getLayers().insertAt(2,overlaySelected);

    	var map_group = overlaySelected.get('group_no');
    		if (document.getElementById('URHere') != null) { setResults1(map_group); }
    		var map_group_keytext = overlaySelected.get('keytext');

	var e1 = document.getElementById('overlaySelectNode');
        var selNode1Index = e1.options[e1.selectedIndex].value;
        var node1 = overlayTree.subnodes[selNode1Index];
        var e2 = document.getElementById('overlaySelectLayer');
        var selNode2Index = e2.options[e2.selectedIndex].value;
        var selOverlay = node1.subnodes[selNode2Index];
            //set switchers to permalink overlay
        if(selOverlay.layer!==overlaySelected) {
                e1.options[overlaySelected.overlayNodePath[0]].selected = true;
                loadOverlayNode();
                e2.options[overlaySelected.overlayNodePath[1]].selected = true;
                // switchOverlay();
        } 

/*
		var mapgroupno = map.getLayers().getArray()[2].get('group_no');
	
		if (mapgroupno !== '36')
	
		{
			jQuery("#gb1900search").hide();
		}

		else 

		{
			jQuery("#gb1900search").show();
		}
*/

}


function switchOverlay() {


	jQuery('#showCoordinatesinfo').hide();
	// if (overlay) overlay.layer.setVisible(false);
	 document.getElementById('wfsResults').innerHTML = "";
	if ((map.getLayers().getLength() > 4) && (map.getLayers().getArray()[4].getSource() != null)) {map.getLayers().getArray()[4].getSource().clear();}
	// if (map.getLayers().getLength() == 4) map.getLayers().removeAt(3);
	map.getLayers().removeAt(2);
	// if (map.getLayers().getLength() == 2) map.getLayers().removeAt(1);


	if (document.getElementById('overlaySelectNode').length !=0) {
    		var e1 = document.getElementById('overlaySelectNode');
    		var selNode1Index = e1.options[e1.selectedIndex].value;
    		var node1 = overlayTree.subnodes[selNode1Index];
    		var e2 = document.getElementById('overlaySelectLayer');
    		var selNode2Index = e2.options[e2.selectedIndex].value;
    		overlay = node1.subnodes[selNode2Index];
    		overlay.layer.setVisible(true);
    // map.getLayers().getArray()[1].setVisible();
    // layers.setAt(index + 1, layer);
    		map.getLayers().insertAt(2,overlay.layer);
		map.getLayers().getArray()[2].setOpacity(opacity);
    		var map_group = overlay.layer.get('group_no');
    			if (document.getElementById('URHere') != null) { setResults1(map_group); }
    			var map_group_keytext = overlay.layer.get('keytext');
			checkreuse();
			checktrenchmap();
			setZoomLayers();
    			updateUrl();

    //	if (map.getLayers().getLength() > 3) 

// console.log("Initial length: " + map.getLayers().getArray()[4].getSource().getFeatures().length);

//    if (map.getLayers().getArray()[4].get('name') == 'vector') { map.getLayers().getArray()[4].getSource().clear(); }

// console.log("After clear length: " + map.getLayers().getArray()[4].getSource().getFeatures().length);

/*
		var mapgroupno = map.getLayers().getArray()[2].get('group_no');
	
		if (mapgroupno !== '36')
	
		{
			jQuery("#gb1900search").hide();
		}

		else 

		{
			jQuery("#gb1900search").show();
		}

*/


// if (map.getLayers().getArray()[4].get('title') == 'vector') { map.getLayers().getArray()[4].getSource().clear; }

//	setTimeout( function(){
		checkWFS();
//	}, 500); // delay 50 ms


	}

// console.log("Final length: " + map.getLayers().getArray()[4].getSource().getFeatures().length);

}




function switchOverlayUpdateMode() { 
  var titleArray = overlayOldName.split('-'); 
  // var titleArray = overlayOldName.get('title').split('-');      
  var title1 = jQuery.trim(titleArray.shift());
  var title2 = jQuery.trim(titleArray.join('-'));
  var layerIsInSelection = false;
  for (var i = 0; i < overlayLayers.length; i++) {
    if (overlayLayers[i].get('title') === overlayOldName) {
      var e1 = document.getElementById('overlaySelectNode');
      for (var ii = 0 ; ii < e1.options.length; ii++) {
        if (e1.options[ii].text === title1) {
          e1.value = ii;
        }
      }
      loadOverlayNode();
      var e2 = document.getElementById('overlaySelectLayer');
      for (var ii = 0 ; ii < e2.options.length; ii++) {
        if (e2.options[ii].text === title2) {
          e2.value = ii;
        }
      }
      layerIsInSelection = true;
    }
  }
  
   if ((!layerIsInSelection) && ($('#layerfiltercheckbox').is(":checked")))
	{

			jQuery('#showCoordinatesinfo').show();
			document.getElementById('showCoordinatesinfo').innerHTML = "Switched to show more detailed overlay layer.<br/>Uncheck 'Only show more detailed maps than the current zoom level' to stop this.";

			setTimeout( function(){
	       			document.getElementById('showCoordinatesinfo').innerHTML = '';
				jQuery('#showCoordinatesinfo').hide();
			}, 1000); // delay 50 ms
	switchOverlay();
	}
   else
	{
	switchOverlay();
	}
}

// Return direct subnode from given tree
function getNode(tree, nodeTitle) {
    if(tree.subnodes) {
        for(var i = 0; i < tree.subnodes.length; i++) {
            if(tree.subnodes[i].title==nodeTitle) {
                return tree.subnodes[i];
            }
        }
    }
    return false;
};

// Add given node to given tree
function addNode(tree, nodeToAdd) {
    var existingNode = getNode(tree, nodeToAdd.title);
    if(existingNode && nodeToAdd.subnodes) {
        for(var i = 0; i < nodeToAdd.subnodes.length; i++) {
            addNode(existingNode, nodeToAdd.subnodes[i]);
        }
    } else {
        tree.subnodes.push(nodeToAdd);
    }
};



// Load overlay layers of current node
function loadOverlayNode() {
    var e1 = document.getElementById('overlaySelectNode');
    var e2 = document.getElementById('overlaySelectLayer');    
    while (e2.hasChildNodes()) {
      e2.removeChild(e2.lastChild);
    }
    if (e1.length != 0) {
      var selNodeIndex = e1.options[e1.selectedIndex].value;
      var node1 = overlayTree.subnodes[selNodeIndex]; 

      for(var i2 = 0; i2 < node1.subnodes.length; i2++) {
        var node2 = node1.subnodes[i2];
        var option = document.createElement('option');
        option.appendChild(document.createTextNode(node2.title));
        option.setAttribute('value', i2);
        option.setAttribute('id', 'overlayOption' + node2.title);
        e2.appendChild(option);
      }
    }
}

// IE7- do not support Array.indexOf
function indexOf(array, item) {
    for(var i=0; i<array.length; i++) {
        if(array[i]==item) {
            return i;
        }
    }
    return null;
}



/*var exportPNGElement = document.getElementById('export-png');
*
*if ('download' in exportPNGElement) {
*  exportPNGElement.addEventListener('click', function(e) {
*    map.once('postcompose', function(event) {
*      var canvas = event.context.canvas;
*      exportPNGElement.href = canvas.toDataURL('image/png');
*    });
*    map.renderSync();
*  }, false);
*} else {
*  var info = document.getElementById('no-download');
*  info.style.display = '';
*}
*/

// setHeader();


function setHeader() {


	        var extent = map.getView().calculateExtent(map.getSize());
	      	var bounds = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:3857" , "EPSG:4326"));
		var great_britain_extent = [-9.0, 49.9, 1.84, 60.9];
		var scotland_extent = [-9.0, 55.0, -1.4, 60.9];
		var england_extent = [-6.5, 49.8, 1.9, 55.0];


		var zoom = map.getView().getZoom();
        	var centre = [];
		centre = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");

		// console.log(centre);

        	// transformed_coordinate27700 = [];
		var transformed_coordinate27700 = ol.proj.transform(centre,"EPSG:4326", "EPSG:27700");

		var transformed_coordinate27700point = transformed_coordinate27700[0] + '%20' + transformed_coordinate27700[1];


	      var invisiblestyle = new ol.style.Style({
		    	fill: new ol.style.Fill({
				color: 'rgba(0, 0, 0, 0)'
	                    }),
	                });

	      var urlgeoservercounty =  'https://geo-server.nls.uk/geoserver/wfs?service=WFS' + 
				'&version=1.1.0&request=GetFeature&typename=nls:Britain_Counties' +
				'&PropertyName=COUNTY&outputFormat=text/javascript&format_options=callback:parish' +
				'&srsname=EPSG:3857&cql_filter=INTERSECTS(the_geom,POINT(' 
				+ transformed_coordinate27700point + '))'; 

	      var urlgeoserverparish =  'https://geo-server.nls.uk/geoserver/wfs?service=WFS' + 
				'&version=1.1.0&request=GetFeature&typename=nls:Scot_Eng_Wales_1950s_parish' +
				'&PropertyName=PARISH&outputFormat=text/javascript&format_options=callback:parish' +
				'&srsname=EPSG:3857&cql_filter=INTERSECTS(the_geom,POINT(' 
				+ transformed_coordinate27700point + '))'; 

		var geojsonFormat = new ol.format.GeoJSON();
		
		if (zoom < 12)
	
		{

			var vectorSource2 = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
				var url = urlgeoservercounty
		    	$.ajax({url: url,  dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false})
			  },
			  strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});

		}
	
		else

		{

			var vectorSource2 = new ol.source.Vector({
			  loader: function(extent, resolution, projection) {
				var url = urlgeoserverparish
		    	$.ajax({url: url,  dataType: 'jsonp', cache: false, timeout: 8000,  jsonp: false})
			  },
			  strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
			    maxZoom: 19
			  }))
			});

		}

		featuresALLheader = [];

		window.parish = function(response) {
		  vectorSource2.addFeatures(geojsonFormat.readFeatures(response));


		featuresALLheader = response.features;


		if ((zoom < 8) && (ol.extent.containsXY(great_britain_extent, centre[0], centre[1])))
			{ placename = "of Great Britain"; }
		else if ((zoom > 7) && (zoom < 10) && (ol.extent.containsXY(scotland_extent, centre[0], centre[1])))
			{ placename = "of Scotland"; }
		else if ((zoom > 7) && (zoom < 10) && (ol.extent.containsXY(england_extent, centre[0], centre[1])))
			{ placename = "of England and Wales"; }
		else if ((zoom > 9) && (zoom < 12) && (featuresALLheader.length > 0))
			{ placename = "of " + featuresALLheader[0].properties.COUNTY; }
		else if ((zoom > 11) && (featuresALLheader.length > 0))
			{ placename = "of " + featuresALLheader[0].properties.PARISH; }
		else 
			{ placename = ""; }
		//	console.log(placename);
		    var str = "Explore georeferenced maps " + placename + " - Map images - National Library of Scotland";
		    document.title = str;

		};


	            var vectorLayer2 = new ol.layer.Vector({
	  		title: "vectors - vectors",
	                source: vectorSource2,
			style: invisiblestyle
	            });

		var maplayerlength = map.getLayers().getLength();
		map.getLayers().insertAt(5,vectorLayer2);


}

jQuery( document ).ready(function() {
	$('#map').focus();
});


function setResults(str) {
    if (!str) str = "<br/><p id=\"noMapsSelected\">None</p>";
    document.getElementById('results').innerHTML = str;
}



function setResults1(str) {  


       if (str == 2)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/towns/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Town Plans \/ Views, 1580-1919</a>";
  }
       else if (str == 3)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/atlas/thomson/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">John Thomson's Atlas of Scotland, 1832</a>";
  }
       else if (str == 4)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/counties/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">County maps, 1580s-1950s</a>";
  }
       else if (str == 5) 
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/scotland/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Maps of Scotland, 1560-1928</a>";
  }
       else if (str == 6)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/atlas/taylor-skinner/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Taylor and Skinner\'s Survey, 1776</a>";
  }
       else if (str == 8)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/atlas/bartholomew/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Bartholomew Survey Atlas of Scotland, 1912</a>";
  }
       else if (str == 12)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/bathymetric/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Bathymetrical Survey of Fresh-Water Lochs, 1897-1909</a>";
  }
       else if (str == 15)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/coasts/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Coasts of Scotland on marine charts, 1580-1850</a>";
  }
       else if (str == 18)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/coasts/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Coastal and Admiralty Charts of Scotland, 1693-1963</a>";
  }

       else if (str == 20)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/atlas/blaeu/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Blaeu Atlas of Scotland, 1654</a>";
  }
       else if (str == 22)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/roy/antiquities/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Roy Military Antiquities of the Romans, 1793</a>";
  }
       else if (str == 23)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/estates/golspie-loth/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Survey of farms in Golspie and Loth, Sutherland, 1772</a>";
  }
       else if (str == 25)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/pont/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Maps by Timothy Pont</a>";
  }
       else if (str == 26)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/mapmakers/gordon.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Maps by Robert &amp; James Gordon, ca.1636-1652</a>";
  }
       else if (str == 27)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/mapmakers/adair.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Maps by John Adair</a>";
  }
       else if (str == 28)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/mapmakers/moll.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Maps by Herman Moll</a>";
  }
       else if (str == 31)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/air-photos/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Air Photo Mosaics of Scotland, 1944-1950</a>";
  }
       else if (str == 32)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/25k-gb-1937-61/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">1:25,000, Great Britain, 1937-1961</a>";
  }
       else if (str == 33)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/25inch/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">25 inch to the mile, 1st edition, 1855-1882</a>";
  }
       else if (str == 34)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/25inch-2nd-and-later/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">25 inch Scotland, 1892-1949</a> <a href=\"/os/25inch-england-and-wales/index.html\"  alt=\"Further information about these maps\" title=\"Further information about these maps\">England and Wales, 1841-1952</a>";
  }
       else if (str == 35)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/6inch/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Six-inch 1st edition, 1843-1882</a>";
  }
       else if (str == 36)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/6inch-2nd-and-later/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Six-inch Scotland 1892-1960;</a> or <a href=\"/os/6inch-england-and-wales/index.html\"  alt=\"Further information about these maps\" title=\"Further information about these maps\">England and Wales, 1842-1952</a>";
  }
       else if (str == 37)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-popular-nat-grid/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-inch Popular with Nat Grid, 1945-1947</a>";
  }
       else if (str == 38)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-1st/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-inch, Scotland, 1st Edition, 1856-1891</a>";
  }
       else if (str == 39)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-2nd/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-inch, Scotland, 1885-1900</a> or <a href=\"/os/one-inch-rev-new-series/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">England and Wales, 1892-1908</a>";
  }
       else if (str == 40)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-popular/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-inch \"Popular\" edition, Scotland, 1921-1930</a>";
  } 
       else if (str == 41)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/townplans/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Large scale Scottish town plans, 1847-1895</a>";
  }
       else if (str == 42)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/county-series/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Indexes to the County Series maps, Scotland, 1854-1886</a>";
  }
       else if (str == 43)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/quarter-inch-third/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Quarter Inch to the Mile, Scotland, 3rd ed., 1921-1923</a>";
  }
       else if (str == 44)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/ten-mile/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Ten-mile Planning Maps of Great Britain, 1944-1960</a>";
  }
       else if (str == 45)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/series/index.html\">Series maps</a> \> <a href=\"/series/bart_scotland_halfinch_list.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Bartholomew\'s \"Half Inch to the Mile Maps\" of Scotland, 1926-1935</a>";
  }
       else if (str == 47)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/military/scotland.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Military Maps of Scotland (18th century)</a>";
  }
       else if (str == 50)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/series/index.html\">Series maps</a> \> <a href=\"/series/bart_half_england.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Bartholomew's Half Inch England and Wales, 1902-1906</a> <a href=\"/series/bart_half_scotland.html\">Scotland, 1899-1905</a> ";
  }
       else if (str == 54)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-rev-new-series/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-Inch, England and Wales, Rev New Series</a>";
  }
       else if (str == 55)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-seventh-series/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-inch, Seventh Series, 1952-1961</a>";
  }
       else if (str == 56)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-new-popular/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-inch England and Wales, New Popular, 1945-1947</a>";
  }

       else if (str == 57)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/london-1890s/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Five feet to the mile, London, 1893-6</a>";
  }
       else if (str == 58)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-2nd-hills/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-inch Scotland, 1885-1903</a> or <a href=\"/os/one-inch-rev-new-series/index.html\"  alt=\"Further information about these maps\" title=\"Further information about these maps\">England and Wales, 1892-1908</a>";
  }

       else if (str == 59)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/6inch-england-and-wales/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">England and Wales, 1842-1952</a> or <a href=\"/os/6inch-2nd-and-later/index.html\"  alt=\"Further information about these maps\" title=\"Further information about these maps\">Six-inch Scotland 1892-1960</a> ";
  }

       else if (str == 60)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/military/index.html\">Military Maps</a> \> <a href=\"/ww1/trenches/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">British First World War Trench Maps, 1915-1918</a>";
  }
       else if (str == 61)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/national-grid/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">National Grid Maps, 1940s-1970s</a>";
  }
       else if (str == 63)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/jamaica/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">James Robertson's Maps of Jamaica, 1804</a>";
  }
       else if (str == 64)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \>  <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/25inch-2nd-and-later/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">25 inch Scotland, 1892-1949</a> <a href=\"/os/25inch-england-and-wales/index.html\"  alt=\"Further information about these maps\" title=\"Further information about these maps\">England and Wales, 1841-1952</a>";
  }
       else if (str == 65)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/series/\">Series maps</a> \> <a href=\"/series/land-utilisation-survey/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Land Utilisation Survey, Scotland, 1931-1935</a>";
  }
       else if (str == 66)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/series/\">Series maps</a> \> <a href=\"/series/soils/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Soil Survey of Scotland, 1950s-1980s</a>";
  }

       else if (str == 67)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/estates/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Estate Maps of Scotland, 1750s-1870s</a>";
  }
       else if (str == 69)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/hongkong/102621568.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Collinson's Maps of Hong Kong, 1846</a>";
  }


       else if (str == 70)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/townplans-england/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Town Plans of England and Wales, 1840s-1890s</a>";
  }
       else if (str == 79)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/cyprus/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Kitchener Survey of Cyprus, 1882</a>";
  }
       else if (str == 80)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \>  <a href=\"/series/index.html\">Series maps</a> \> <a href=\"/series/bart_england_wales_halfinch_list.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Bartholomew, half-inch, England and Wales, 1919-1924</a>";
  }
       else if (str == 82)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/atlas/times-survey/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Times Survey Atlas of the World, 1920</a>";
  }

       else if (str == 84)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/half-inch-mot-roads/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Half-Inch (MOT), 1923</a>";
  }
       else if (str == 85)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \>  <a href=\"/series/index.html\">Series maps</a> \> <a href=\"/series/bart_half_great_britain.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Bartholomew's Revised Half-Inch Map, Great Britain, 1940-47</a>";
  }
       else if (str == 93)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/series/index.html\">Series maps</a> \> <a href=\"/geological/6inch/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Geological Survey, Six-inch Maps, 1850s-1940s</a> ";
  }

       else if (str == 95)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/25k-gb-1940-43/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">War Office, Great Britain 1:25,000. GSGS 3906, 1940-43</a>";
  }

       else if (str == 96)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/series/index.html\">Series maps</a> \> <a href=\"/geological/one-inch/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Geological Survey, One-Inch Maps, 1850s-1940s</a> ";
  }

       else if (str == 98)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-popular-outline/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-Inch Popular (Outline), 1921-1930</a>";
  }

       else if (str == 100)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-popular-3908/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-Inch Popular, GSGS 3908, 1940-43</a>";
  }

       else if (str == 101)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-popular-nat-grid-outline/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-Inch Popular with National Grid (Outline), 1945-47</a>";
  }
       else if (str == 102)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-popular-4639/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">War Office, Scotland One-Inch Popular GSGS 4639, 1947-53</a>";
  }
       else if (str == 106)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \>  <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/25k-gb-outline/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">1:25,000 Outline Series, 1945-1965</a>";
  }
       else if (str == 107)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/half-inch-hills/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Half-Inch (hill-shaded), 1902-18</a>";
  }
       else if (str == 108)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/half-inch-layers/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Half-Inch (layer-coloured), 1902-18</a>";
  }
       else if (str == 109)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/one-inch-3rd-colour/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">One-Inch 3rd ed (col), 1902-1923 </a>";
  }
       else if (str == 147)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/half-inch-outline-blue/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Half-Inch (Outline), 1942</a>";
  }
       else if (str == 148)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/quarter-inch-first-outline/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Quarter-Inch, 1st ed (Outline), 1900-1906</a>";
  }
       else if (str == 150)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/quarter-inch-first-hills/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Quarter-Inch, 1st ed (Hills), 1900-1906</a>";
  }
       else if (str == 152)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/quarter-inch-third-civil-air/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Quarter-Inch, Civil Air ed., 1929-1930</a>";
  }
       else if (str == 155)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/quarter-inch-fourth-colour/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Quarter-Inch, 4th ed., 1935-1937</a>";
  }

       else if (str == 157)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/belgium/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Belgium - Second World War military mapping</a>";
  }
       else if (str == 158)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/belgium/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Belgium - Second World War military mapping</a>";
  }
       else if (str == 159)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/belgium/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Belgium - Second World War military mapping</a>";
  }
       else if (str == 116)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/towns/\">Towns</a> \> <a href=\"/towns/goad/\"  alt=\"Further information about these maps\" title=\"Further information about these maps\">Goad Fire Insurance Plans, 1880s-1940s</a> ";
  }
       else if (str == 172)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/projects/api/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">1:1 million to 1:63K, 1920s-1940s</a>";
  }
       else if (str == 175)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \>  <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/projects/subscription-api/index.html#api\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Ordnance Survey (1:1 million-1:10,560), 1900s</a>";
  }
       else if (str == 177)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/military/index.html\">Military Maps</a> \>  <a href=\"/military/20th-century/\"alt=\"Further information about these maps\" title=\"Further information about these maps\">Scottish military maps, 20th century</a> ";
  }

       else if (str == 178)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/25inch-england-and-wales/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">25 inch England and Wales, 1841-1952</a>";
  }
       else if (str == 180)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/25inch-2nd-and-later/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">25 inch Scotland, 1892-1949</a>  \> <a href=\"/os/25inch-2nd-and-later/drawings/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Drawings</a> ";
  }
       else if (str == 204)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \>  <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/25inch-england-and-wales/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">25 inch England and Wales, 1841-1952</a>";
  }
       else if (str == 208)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/india/survey-of-india/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Survey of India - Half-inch 1st ed., 1916-1925</a> ";
  }
       else if (str == 209)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/india/survey-of-india/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Survey of India - Half-inch 2nd ed., 1942-1945</a> ";
  }
       else if (str == 210)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/india/survey-of-india/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Survey of India - One-inch 1st ed., 1912-1945</a> ";
  }
       else if (str == 211)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/india/survey-of-india/\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Survey of India - One-inch 2nd-5th eds., 1925-1948</a> ";
  }

       else if (str == 226)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> <a href=\"/os/index.html\">Ordnance Survey</a> \>  <a href=\"/os/quarter-inch-admin-1950-52/\"alt=\"Further information about these maps\" title=\"Further information about these maps\">Quarter-Inch, Administrative Areas, 1950-52</a> ";
  }
       else if (str == 227)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> <a href=\"/os/index.html\">Ordnance Survey</a> \>  <a href=\"/os/quarter-inch-admin-1955-66/\"alt=\"Further information about these maps\" title=\"Further information about these maps\">Quarter-Inch, Administrative Areas, 1955-66</a> ";
  }
       else if (str == 240)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \>  <a href=\"/world/rec/5865/\"alt=\"Further information about this map\" title=\"Further information about this map\">Chart of the world on Mercator's projection, 1790</a> ";
  }

       else if (str == 252)
  {
  document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> <a href=\"/os/index.html\">Ordnance Survey</a> \> <a href=\"/os/townplans-england/index.html\" alt=\"Further information about these maps\" title=\"Further information about these maps\">Town Plans of England and Wales, 1840s-1890s</a>";
  }

  else {
    document.getElementById('URHere').innerHTML = "<a href=\"/index.html\">Maps home</a> \> ";
  }
}


if (document.getElementById('colorcontainer') != null)

	{


		var cpFancy = ColorPicker(document.getElementById('fancy'), updateInputs);
		
		var iHex = document.getElementById('hex');
		var iR = document.getElementById('rgb_r');
		var iG = document.getElementById('rgb_g');
		var iB = document.getElementById('rgb_b');
		
		
		function updateInputs(hex) {
		
		    var rgb = ColorPicker.hex2rgb(hex);
		    var hsv = ColorPicker.hex2hsv(hex);
		
		    iHex.value = hex;
		    
		    iR.value = rgb.r;
		    iG.value = rgb.g;
		    iB.value = rgb.b;

			rgb_r = rgb.r.toString();
			      rgb_g = rgb.g.toString();
			      rgb_b = rgb.b.toString();

        		map.removeInteraction(draw);
       			addInteraction();
		
		}
		
		var initialHex = '#2b3777';
		
		function updateColorPickers(hex) {
		    cpFancy.setHex(hex);
		}
		
		updateColorPickers(initialHex);
		
//		ColorPicker(document.getElementById('default')).setHex('#2b3777');



		iHex.onchange = function() { updateColorPickers(iHex.value); };
		
		iR.onchange = function() { updateColorPickers(ColorPicker.rgb2hex({ r: iR.value, g: iG.value, b: iB.value })); }
		iG.onchange = function() { updateColorPickers(ColorPicker.rgb2hex({ r: iR.value, g: iG.value, b: iB.value })); }
		iB.onchange = function() { updateColorPickers(ColorPicker.rgb2hex({ r: iR.value, g: iG.value, b: iB.value })); }

			setTimeout( function(){

		document.getElementById('measuremessage').innerHTML = 'Choose a feature type and colour, then start drawing...';


			}, 5000); // delay 1000 ms



}

jQuery( document ).ready(function() {
    document.getElementById('map').focus();

});


