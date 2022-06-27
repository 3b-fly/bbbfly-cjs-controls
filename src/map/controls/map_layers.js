/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage map_layers
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.map = bbbfly.map || {};
/** @ignore */
bbbfly.map.control = bbbfly.map.control || {};
/** @ignore */
bbbfly.map.control.layers = {
  control_type: 'layers'
};

/** @ignore */
bbbfly.map.control.layers._onLinkedToMap = function(map){
  if(map && !this.IsApplying()){this.FillList();}
};

/** @ignore */
bbbfly.map.control.layers._createListener = function(){
  return {
    Listen: ['OnLayersChanged'],
    OnLayersChanged: bbbfly.map.control.layers._onLayersChanged
  };
};

/** @ignore */
bbbfly.map.control.layers._onLayersChanged = function(){
  if(!this.Owner.IsApplying()){this.Owner.FillList();}
};

/** @ignore */
bbbfly.map.control.layers._getLayers = function(){
  var map = this.GetMap();
  return map ? map.GetLayers() : {};
};

/** @ignore */
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

/** @ignore */
bbbfly.map.control.layers._isFilling = function(){
  return !!this._Filling;
};

/** @ignore */
bbbfly.map.control.layers._isApplying = function(){
  return !!this._Applying;
};

/** @ignore */
bbbfly.map.control.layers._onGetListText = function(list,item){
  var map = list.Owner.Owner.GetMap();
  var text = map.GetLayerName(item.ID);
  return String.isString(text) ? text : item.Text;
};

/** @ignore */
bbbfly.map.control.layers._onItemCheckChanged = function(list,item){
  var map = list.Owner.Owner.GetMap();
  map.SetLayerVisible(item.ID,!!item.Checked);
};

/** @ignore */
bbbfly.map.control.layers._refresh = function(){
  var ctrl = this.ParentControl.Owner.Owner;
  ctrl.FillList();
};

/** @ignore */
bbbfly.map.control.layers._close = function(){
  var ctrl = this.ParentControl.Owner.Owner;
  ctrl.SetVisible(false);
};

/** @ignore */
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

/**
 * @class
 * @type control
 * @extends bbbfly.MapControl
 *
 * @inpackage map_layers
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [ControlType=bbbfly.map.control.layers.control_type]
 */
bbbfly.MapLayers = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      ControlType: bbbfly.map.control.layers.control_type,

      /** @private */
      _Filling: false,
      /** @private */
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
      /** @private */
      OnLinkedToMap: bbbfly.map.control.layers._onLinkedToMap,
      /**
       * @event
       * @name OnFilled
       * @memberof bbbfly.MapLayers#
       */
      OnFilled: null
    },
    Methods: {
      /** @private */
      CreateListener: bbbfly.map.control.layers._createListener,
      /**
       * @function
       * @name GetLayers
       * @memberof bbbfly.MapLayers#
       * @description Get actual map layers.
       */
      GetLayers: bbbfly.map.control.layers._getLayers,
      /**
       * @function
       * @name FillList
       * @memberof bbbfly.MapLayers#
       * @description Show actual map layers.
       */
      FillList: bbbfly.map.control.layers._fillList,
      /**
       * @function
       * @name IsFilling
       * @memberof bbbfly.MapLayers#
       *
       * @returns {boolean}
       */
      IsFilling: bbbfly.map.control.layers._isFilling,
      /**
       * @function
       * @name IsApplying
       * @memberof bbbfly.MapLayers#
       *
       * @returns {boolean}
       */
      IsApplying: bbbfly.map.control.layers._isApplying,

      /**
       * @function
       * @name ApplyLayers
       * @memberof bbbfly.MapLayers#
       */
      ApplyLayers: bbbfly.map.control.layers._applyLayers
    }
  });

  return ngCreateControlAsType(def,'bbbfly.MapControl',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control_layers'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapLayers',bbbfly.MapLayers
    );
  }
};
