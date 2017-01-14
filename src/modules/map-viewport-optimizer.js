/*
  The problem is google maps performance becomes a major issue once there are more than about 5000 markers on a app.map.
  Loading past 15000 markers from a GPX file makes the app almost unuseable.
  This module alleviates that by implmenting viewport rendering of the markers on the map.
  At lower zoom levels only waypoint markers will be rendered
  At higher zoom levels only point and waypoint markers within the viewport will be rendered
*/
class MapOptimizer{
  constructor(){
    var _this = this;
    function showMarkers(){
      _this.showMarkers();
    }

    google.maps.event.addListener(app.map, 'zoom_changed', showMarkers);
  }

  showMarkers(){
    if(app.map.getZoom() >= 14){
      this.showMarkersInViewport();
    }else{
      this.showOnlyWaypointsAtZoom();
    }
  }

  showMarkersInViewport() {
    var bounds = app.map.getBounds();
    var markers = app.mapEditor.routeMarkers;
    var map = app.map;
    for(var i=0;i<markers.length;i++){
      if(bounds.contains(markers[i].getPosition())){
        markers[i].setMap(map);
      }else {
        markers[i].setMap(null);
      }
    }
  }

  showOnlyWaypointsAtZoom(){
    var markers = app.mapEditor.routeMarkers;
    var map = app.map;

    for(var i=0;i<markers.length;i++){
      if(markers[i].waypoint){
        markers[i].setMap(map);
      }else{
        markers[i].setMap(null);
      }
    }
  }

}