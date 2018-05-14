"use strict";(function(){Polymer({is:"dashboard-view",properties:{},ready:function ready(){//this.$.previewMWO.opened = true;
//this.$.previewMWO.opened = false;
},attached:function attached(){this.$.previewMWO.querySelector(".modal__triggers").style.display="none"},_showMwoModel:function _showMwoModel(){this.$.previewMWO.opened=true},_closeMwoModal:function _closeMwoModal(evt){this.$.previewMWO.opened=false}})})();
//# sourceMappingURL=dashboard-view.js.map
