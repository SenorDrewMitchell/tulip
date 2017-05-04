'use strict';
// TODO refactor this to use MVC pattern and act as a model for the roadbook all UI interaction should be moved to an application controller, also change to ES6 syntax
class RoadbookController{
  constructor(model){
    this.model = model
    this.bindToWaypointDescriptionInput();
    this.bindToNameDescEditButtons();
    this.bindToPaletteControls();
    this.bindToTrackGrid();
    this.bindToEntryTrackSelector();
    this.bindToExitTrackSelector();
    this.bindToAddedTrackSelector();
  }

  /*
    initialize rich text editor for the roadbook description
  */
  bindToWaypointDescriptionInput(){
    var _this = this;
    this.descriptionTextEditor = new Quill('#description-editor');
    this.descriptionTextEditor.addModule('toolbar', {
      container: '#description-toolbar'     // Selector for toolbar container
    });
    this.descriptionTextEditor.on('text-change', function(delta, source) {
      var newValue = _this.descriptionTextEditor.getHTML()
      _this.model.desc(newValue);
    });
  }

  bindToNameDescEditButtons(){
    var _this = this;
    $('#roadbook-desc, #roadbook-name').find('a.show-editor').click(function(){
      $(this).hide();
      $(this).siblings('.hide-editor').show();
      $(this).siblings('.roadbook-header-input-container').slideDown('fast');
      if($(this).hasClass('rb-name')){
        $(this).parent('div').find(':input').focus();
      }
      if($(this).hasClass('rb-desc')){
        $('#roadbook-desc p').slideUp('fast');
        _this.descriptionTextEditor.focus();
      }
      $('#save-roadbook').removeClass('secondary');
      // TODO should we track this here?
      _this.model.editingNameDesc = true;
    });

    $('#roadbook-desc, #roadbook-name').find('a.hide-editor').click(function(){
      $(this).hide();
      $(this).siblings('.show-editor').show();
      $(this).siblings('.roadbook-header-input-container').slideUp('fast');
      if($(this).hasClass('rb-desc')){
        $('#roadbook-desc p').slideDown('fast');
      }
    });
  }

  bindToPaletteControls(){
    var _this = this;
    $('#hide-palette').click(function(){
      _this.model.finishWaypointEdit();
    });

    $('#toggle-heading').change(function(){
      $('#note-editor-container').toggleClass('hideCap',!_this.model.waypointShowHeading())
      _this.model.currentlyEditingWaypoint.showHeading(_this.model.waypointShowHeading());
    });
  }

  bindToTrackGrid(){
    var _this = this;
    $('.track-grid').click(function(e){
      if($(this).hasClass('undo')){
        if(e.shiftKey){
          _this.model.currentlyEditingWaypoint.tulip.beginRemoveTrack();
        }else{
          _this.model.currentlyEditingWaypoint.tulip.removeLastTrack();
        }
        return
      }
      var angle = $(this).data('angle');
      _this.model.currentlyEditingWaypoint.tulip.addTrack(angle);
    });
  }

  bindToEntryTrackSelector(){
    var _this = this;
    $('.entry-track-selector').click(function(e) {
      e.preventDefault();
      _this.model.changeEditingWaypointEntry($(this).data('track'));
    });
  }

  bindToExitTrackSelector(){
    var _this = this;
    $('.exit-track-selector').click(function(e) {
      e.preventDefault();
      _this.model.changeEditingWaypointExit($(this).data('track'));
    });
  }

  bindToAddedTrackSelector(){
    var _this = this;
    $('.added-track-selector').click(function(e) {
      e.preventDefault();
      _this.model.changeEditingWaypointAdded($(this).data('track'));

      $('.added-track-selector').removeClass('active');
      $(this).addClass('active');
    });
  }
}