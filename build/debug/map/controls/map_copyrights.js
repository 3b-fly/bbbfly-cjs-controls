/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.control = bbbfly.map.control || {};
bbbfly.map.control.copyrights = {
  control_type: 'copyrights'
};
bbbfly.map.control.copyrights._onLinkedToMap = function(map){
  if(map){this.FillCopyrights();}
};
bbbfly.map.control.copyrights._createListener = function(){
  return {
    Listen: ['OnLayersChanged'],
    OnLayersChanged: bbbfly.map.control.copyrights._onLayersChanged
  };
};
bbbfly.map.control.copyrights._onLayersChanged = function(){
  this.Owner.FillCopyrights();
};
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
bbbfly.map.control.copyrights._refresh = function(){
  var ctrl = this.ParentControl.Owner.Owner;
  ctrl.FillCopyrights();
};
bbbfly.map.control.copyrights._close = function(){
  var ctrl = this.ParentControl.Owner.Owner;
  ctrl.SetVisible(false);
};
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
      OnLinkedToMap: bbbfly.map.control.copyrights._onLinkedToMap
    },
    Methods: {
      CreateListener: bbbfly.map.control.copyrights._createListener,
      FillCopyrights: bbbfly.map.control.copyrights._fillCopyrights,
      NormalizeCopyrights: bbbfly.map.control.copyrights._normalizeCopyrights
    }
  });

  return ngCreateControlAsType(def,'bbbfly.MapControl',ref,parent);
};
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control_copyrights'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapCopyrights',bbbfly.MapCopyrights
    );
  }
};
