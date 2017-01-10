var Waypoint = Class({
  /*

    wptJson: {
            distances: {
              kmFromStart: FLOAT,
              kmFromPrev: FLOAT,
            },
            angles: {
              heading: INTEGER,
              relativeAngle: INTEGER.
            },
            tulipJson: OBJECT,
            notes: {
              glyphs:[],
              text: STRING,
            },
    }
  */
  create: function(roadbook, wptJson){
    this.kmFromStart  = ko.observable(wptJson.distances.kmFromStart);
    this.kmFromPrev   = ko.observable(wptJson.distances.kmFromPrev);
    this.exactHeading = ko.observable(wptJson.angles.heading);
    this.lat = ko.observable(wptJson.lat);
    this.lng = ko.observable(wptJson.lng);

    this.distFromPrev   = ko.computed(this.computedDistanceFromPrev, this);
    this.totalDistance  = ko.computed(this.computedTotalDistance, this);
    this.heading        = ko.computed(this.computedHeading, this);

    this.entryTrackType = wptJson.entryTrackType == undefined ? 'track' : wptJson.entryTrackType;
    this.exitTrackType = wptJson.exitTrackType == undefined ? 'track' : wptJson.exitTrackType;

    // waypoints don't get any note info when they are added via UI so intialize them to blank
    var text = wptJson.notes == undefined ? '' : wptJson.notes.text;
    this.noteHTML = ko.observable(text);

    this.roadbook = roadbook;
    this.routePointIndex = wptJson.routePointIndex == undefined ? null : wptJson.routePointIndex;

    // TODO refactor to make this one line
    this.notification = wptJson.notification;
    if(this.notification){
      app.mapEditor.addWaypointBubble(this.routePointIndex, this.notification.bubble, this.notification.fill)
    }

    var _this = this;
    var angle = wptJson.angles.relativeAngle;
    var json = wptJson.tulipJson;
    var trackTypes = {entryTrackType: this.entryTrackType, exitTrackType: this.exitTrackType};
    ko.bindingHandlers.waypointCanvasRendered = {
      init: function(element){
        _this.initTulip(element, angle, trackTypes, json);
        _this.initWaypointListeners($(element).parents('.waypoint'));
        _this.element = $(element).parents('.waypoint');
      }
    };
  },

  manageNotifications(glyphs){
    if(this.notification == null){
      // create a new notification
      for(i=0;i<glyphs.length;i++){
        // grab the glyph name from the file name, agnostic to the path.
        this.notification = new Notification(glyphs[i]);
        if(this.notification.type == null){
          this.notification = null
        }else {
          app.mapEditor.addWaypointBubble(this.routePointIndex, this.notification.bubble, this.notification.fill)
        }

      }
    }else{
      // see if we need to set a speed zone limit
      if(this.notification.type == "dsz"){
        var speed = glyphs.join(' ').match(/speed-([0-9]{2,3})/)[1]
        this.notification.modifier = speed;
      }
      // see if we need to remove the notification using the notification class
      var _this = this;
      var contains = glyphs.map(function(g){return Notification.nameMatchesClass(g,_this.notification.type)})
      // if the glyphs array contains our notification keep it
      //otherwise nullify our current notification
      if(!contains.includes(true) || (glyphs.length < 1)){
        this.notification = null;
        app.mapEditor.deleteWaypointBubble(this.routePointIndex);
      }

    }
  },

  changeAddedTrackType(type){
    this.tulip.changeAddedTrackType(type)
  },

  changeEntryTrackType(type){
    this.entryTrackType = type;
    this.tulip.changeEntryTrackType(type)
  },

  changeExitTrackType(type){
    this.exitTrackType = type;
    this.tulip.changeExitTrackType(type)
  },

  initTulip: function(element, angle, trackTypes, json){
    this.tulip = new Tulip(element, angle, trackTypes, json);
  },

  updateWaypoint: function (geoData,routePointIndex){
    if(geoData.distances){
      this.kmFromStart(geoData.distances.kmFromStart);
      this.kmFromPrev(geoData.distances.kmFromPrev);
    }
    if(geoData.angles){
      this.exactHeading(geoData.angles.heading);
      this.tulip.changeExitAngle(geoData.angles.relativeAngle, this.exitTrackType);
    }
    if(geoData.lat && geoData.lng){
      this.lat(geoData.lat);
      this.lng(geoData.lng);
    }
    if(routePointIndex) {
      this.routePointIndex = routePointIndex
    }
  },

  computedDistanceFromPrev: function(){
    if(this.kmFromPrev() && this.kmFromPrev() > 0){
      return this.kmFromPrev().toFixed(2);
    } else {
      return '0.00'
    }
  },

  computedTotalDistance: function(){
    return this.kmFromStart().toFixed(2);
  },

  computedHeading: function(){
    var heading = Math.round(this.exactHeading());
    //round the exaxt heading and zero pad it
    return Array(Math.max(3 - String(heading).length + 1, 0)).join(0) + heading + '\xB0';
  },

  initWaypointListeners: function(element){
    var _this = this;
    $(element).click(function(e){
      if(_this.roadbook.requestWaypointEdit(_this)){
        _this.tulip.beginEdit();
      }
    });
  },

  serializeTulip: function() {
    return this.tulip.serialize();
  },

  tulipPNG: function(){
    return this.tulip.toPNG();
  },
});
