/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage mapbox
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.map = bbbfly.map || {};
/** @ignore */
bbbfly.map.control = bbbfly.map.control || {};
/** @ignore */
bbbfly.map.control.copyrights = {
  control_type: 'copyrights'
};

/** @ignore */
bbbfly.map.control.copyrights._onLinkedToMap = function(map){
  if(map){this.FillCopyrights();}
};

/** @ignore */
bbbfly.map.control.copyrights._createListener = function(){
  return {
    Listen: ['OnLayersChanged'],
    OnLayersChanged: bbbfly.map.control.copyrights._onLayersChanged
  };
};

/** @ignore */
bbbfly.map.control.copyrights._onLayersChanged = function(){
  this.Owner.FillCopyrights();
};

/** @ignore */
bbbfly.map.control.copyrights._fillCopyrights = function(){
  var map = this.GetMap();
  var rights = '';

  if(map){
    rights = this.NormalizeCopyrights(
      map.GetAttributions()
    );
  }

  var textCtrl = this.Controls.CopyrightsText;
  textCtrl.SetText(rights);
};

/** @ignore */
bbbfly.map.control.copyrights._normalizeCopyrights = function(attrs){
  if(!Array.isArray(attrs)){return '';}
  var rights = [];
  var others = [];


  for(var i in attrs){
    var attr = attrs[i];
    var name = attr.Name;

    attr = attr.Attributions;
    if(!Array.isArray(attr)){continue;}

    var copy = attr.join('<br/>');
    if(!copy){continue;}

    if(name){
      rights.push('<p><b>'+name+'</b><br/>'+copy+'</p>');}
    else{others.push(copy);}
  }

  if(others.length > 0){
    var oCopy = others.join('<br/>');
    var oName = '';

    if(String.isString(this.OthersTextRes)){
      oName = '<b>'+ngTxt(this.OthersTextRes)+'</b>';
    }

    rights.push('<p>'+oName+'<br/>'+oCopy+'</p>');
  }

  return rights.join('');
};

/** @ignore */
bbbfly.map.control.copyrights._refresh = function(){
  var ctrl = this.ParentControl.Owner.Owner;
  ctrl.FillCopyrights();
};

/** @ignore */
bbbfly.map.control.copyrights._close = function(){
  var ctrl = this.ParentControl.Owner.Owner;
  ctrl.SetVisible(false);
};

/**
 * @class
 * @type control
 * @extends bbbfly.MapControl
 *
 * @inpackage mapbox
 *
 * @param {bbbfly.MapCopyrights.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [ControlType=bbbfly.map.control.copyrights.control_type]
 */
bbbfly.MapCopyrights = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      ControlType: bbbfly.map.control.copyrights.control_type,
      OthersTextRes: 'bbbfly_map_control_copyrights_others'
    },
    Controls: {
      TitlePanel: {
        Type: 'bbbfly.Panel',
        ParentReferences: false,
        Controls: {
          Refresh: {
            Type: 'bbbfly.Button',
            Data: { AltRes: 'bbbfly_map_control_copyrights_refresh' },
            Events: { OnClick: bbbfly.map.control.copyrights._refresh }
          },
          Title: {
            Type: 'bbbfly.Text',
            Data: { TextRes: 'bbbfly_map_control_copyrights_title' }
          },
          Close: {
            Type: 'bbbfly.Button',
            Data: { AltRes: 'bbbfly_map_control_copyrights_close' },
            Events: { OnClick: bbbfly.map.control.copyrights._close }
          }
        }
      },
      CopyrightsPanel: {
        Type: 'bbbfly.Panel',
        Controls: {
          CopyrightsText: {
            Type: 'bbbfly.Text',
            Data: {
              MultiLine: true,
              HTMLEncode: false
            }
          }
        }
      }
    },
    Events: {
      /** @private */
      OnLinkedToMap: bbbfly.map.control.copyrights._onLinkedToMap
    },
    Methods: {
      /** @private */
      CreateListener: bbbfly.map.control.copyrights._createListener,
      /**
       * @function
       * @name FillCopyrights
       * @memberof bbbfly.MapCopyrights#
       * @description Fill in map attributions
       */
      FillCopyrights: bbbfly.map.control.copyrights._fillCopyrights,
      /**
       * @function
       * @name NormalizeCopyrights
       * @memberof bbbfly.MapCopyrights#
       * @description Create map copyrights html
       *
       * @param {string[]} copyrights - Array containing all copyrights
       * @return {string} Copyrights html
       */
      NormalizeCopyrights: bbbfly.map.control.copyrights._normalizeCopyrights
    }
  });

  return ngCreateControlAsType(def,'bbbfly.MapControl',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control_copyrights'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapCopyrights',bbbfly.MapCopyrights
    );
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.MapCopyrights
 * @extends bbbfly.MapControl.Definition
 *
 * @description MapCopyrights control definition
 */