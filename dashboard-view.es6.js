(function(){
  Polymer({
    is: 'dashboard-view',
    properties: {
    },
    ready: function(){
      //this.$.previewMWO.opened = true;
      //this.$.previewMWO.opened = false;
    },
    attached: function() {
      this.$.previewMWO.querySelector(".modal__triggers").style.display = "none";
    },
    _showMwoModel:function(){
        this.$.previewMWO.opened = true;        
    },
    _closeMwoModal: function(evt) {
      this.$.previewMWO.opened = false;
    }
  });
})()
