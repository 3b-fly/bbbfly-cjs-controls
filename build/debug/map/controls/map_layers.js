/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.control = bbbfly.map.control || {};
bbbfly.map.control.layers = {
  control_type: 'layers'
};
bbbfly.map.control.layers._onLinkedToMap = function(map){
  if(map && !this.IsApplying()){this.FillList();}
};
bbbfly.map.control.layers._createListener = function(){
  return {
    Listen: ['OnLayersChanged'],
    OnLayersChanged: bbbfly.map.control.layers._onLayersChanged
  };
};
bbbfly.map.control.layers._onLayersChanged = function(){
  if(!this.Owner.IsApplying()){this.Owner.FillList();}
};
bbbfly.map.control.layers._getLayers = function(){
  var map = this.GetMap();
  return map ? map.GetLayers() : {};
};
bbbfly.map.control.layers._fillList = function(){
  var list = this.Controls.List;
  if(!list){return;}

  this._Filling = true;

  var items = [];
  var layers = this.GetLayers();

  for(var id in layers){
    var layer = layers[id];

    items.push({
      ID: layer.Id,
      Text: layer.Id,
      Data: layer,

      Checked: !!layer.Visible,
      Enabled: (layer.Display !== bbbfly.Map.Layer.display.fixed)
    });
  }

  list.SetItems(items);

  this._Filling = false;
  if(Function.isFunction(this.OnFilled)){this.OnFilled();}
};
bbbfly.map.control.layers._isFilling = function(){
  return !!this._Filling;
};
bbbfly.map.control.layers._isApplying = function(){
  return !!this._Applying;
};
bbbfly.map.control.layers._onGetListText = function(list,item){
  var map = list.Owner.Owner.GetMap();
  var text = map.GetLayerName(item.ID);
  return String.isString(text) ? text : item.Text;
};
bbbfly.map.control.layers._onItemCheckChanged = function(list,item){
  var map = list.Owner.Owner.GetMap();
  map.SetLayerVisible(item.ID,!!item.Checked);
};
bbbfly.map.control.layers._refresh = function(){
  var ctrl = this.ParentControl.Owner.Owner;
  ctrl.FillList();
};
bbbfly.map.control.layers._close = function(){
  var ctrl = this.ParentControl.Owner.Owner;
  ctrl.SetVisible(false);
};
bbbfly.map.control.layers._applyLayers = function(){
  var list = this.Controls.List;
  var map = this.GetMap();

  if(!list || !map){return;}

  this._Applying = true;

  list.Scan(function(list,item){
    map.SetLayerVisible(item.ID,!!item.Checked);
    return true;
  });

  this._Applying = false;
  this.FillList();
};
bbbfly.MapLayers = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      ControlType: bbbfly.map.control.layers.control_type,
      _Filling: false,
      _Applying: false
    },
    Controls: {
      TitlePanel: {
        Type: 'bbbfly.Panel',
        ParentReferences: false,
        Controls: {
          Refresh: {
            Type: 'bbbfly.Button',
            Data: { AltRes: 'bbbfly_map_control_layers_refresh' },
            Events: { OnClick: bbbfly.map.control.layers._refresh }
          },
          Title: {
            Type: 'bbbfly.Text',
            Data: { TextRes: 'bbbfly_map_control_layers_title' }
          },
          Close: {
            Type: 'bbbfly.Button',
            Data: { AltRes: 'bbbfly_map_control_layers_close' },
            Events: { OnClick: bbbfly.map.control.layers._close }
          }
        }
      },
      List: {
        Type: 'bbbfly.List',
        Events: {
          OnItemCheckChanged: bbbfly.map.control.layers._onItemCheckChanged
        },
        OverrideEvents: {
          OnGetText: bbbfly.map.control.layers._onGetListText
        }
      }
    },
    Events: {
      OnLinkedToMap: bbbfly.map.control.layers._onLinkedToMap,
      OnFilled: null
    },
    Methods: {
      CreateListener: bbbfly.map.control.layers._createListener,
      GetLayers: bbbfly.map.control.layers._getLayers,
      FillList: bbbfly.map.control.layers._fillList,
      IsFilling: bbbfly.map.control.layers._isFilling,
      IsApplying: bbbfly.map.control.layers._isApplying,
      ApplyLayers: bbbfly.map.control.layers._applyLayers
    }
  });

  return ngCreateControlAsType(def,'bbbfly.MapControl',ref,parent);
};
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control_layers'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapLayers',bbbfly.MapLayers
    );
  }
};
