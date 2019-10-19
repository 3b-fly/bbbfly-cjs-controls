/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage map
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.map = bbbfly.map || {};
/** @ignore */
bbbfly.map.control = {};

/** @ignore */
bbbfly.map.control._onCreated = function(ctrl){
  bbbfly.MapRegistry.RegisterControl(ctrl);
};

/** @ignore */
bbbfly.map.control._getMap = function(){
  return bbbfly.MapRegistry.GetMap(this.MapID);
};

/** @ignore */
bbbfly.map.control._linkToMap = function(map){
  if(
    Function.isFunction(this.OnLinkToMap)
    && !this.OnLinkToMap(map)
  ){return false;}

  if(!Function.isFunction(map.AddListener)){return false;}

  var listener = this.GetListener() || this.CreateListener();
  if(!map.AddListener(listener.Listen,listener)){return false;}

  if(Function.isFunction(this.OnLinkedToMap)){
    this.OnLinkedToMap(map);
  }
  return true;
};

/** @ignore */
bbbfly.map.control._unlinkFromMap = function(map){
  if(
    Function.isFunction(this.OnUnlinkFronMap)
    && !this.OnUnlinkFronMap(map)
  ){return false;}

  if(!Function.isFunction(map.RemoveListener)){return false;}

  var listener = this.GetListener();
  if(!map.RemoveListener(listener.Listen,listener)){return false;}


  if(Function.isFunction(this.OnUnlinkedFromMap)){
    this.OnUnlinkedFromMap(map);
  }
  return true;
};

/** @ignore */
bbbfly.map.control._getListener = function(){
  return Object.isObject(this._Listener) ? this._Listener : null;
};

/** @ignore */
bbbfly.map.control._createListener = function(){
  this._Listener = {
    _byRef: {Owner:true},
    Owner: this,
    Listen: []
  };

  return this.GetListener();
};

/**
 * @class
 * @type control
 * @extends bbbfly.Panel
 *
 * @inpackage map
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} MapID - Target map control ID
 */
bbbfly.MapControl = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    CreteFromType: 'bbbfly.Panel',
    ParentReferences: false,
    Data: {
      MapID: null,

      /** @private */
      _Listener: null
    },
    OnCreated: bbbfly.map.control._onCreated,
    Events: {
      /**
       * @event
       * @name OnLinkToMap
       * @memberof bbbfly.MapControl#
       *
       * @param {bbbfly.Map} map - Map to be linked
       * @return {boolean} Return false to deny linking
       *
       * @see {@link bbbfly.MapControl#LinkToMap|LinkToMap()}
       * @see {@link bbbfly.MapControl#event:OnLinkedToMap|OnLinkedToMap}
       */
      OnLinkToMap: null,
      /**
       * @event
       * @name OnLinkedToMap
       * @memberof bbbfly.MapControl#
       *
       * @param {bbbfly.Map} map - Linked map
       *
       * @see {@link bbbfly.MapControl#LinkToMap|LinkToMap()}
       * @see {@link bbbfly.MapControl#event:OnLinkToMap|OnLinkToMap}
       */
      OnLinkedToMap: null,
      /**
       * @event
       * @name OnUnlinkFromMap
       * @memberof bbbfly.MapControl#
       *
       * @param {bbbfly.Map} map - Map to be linked
       * @return {boolean} Return false to deny linking
       *
       * @see {@link bbbfly.MapControl#UnlinkFromMap|UnlinkFromMap()}
       * @see {@link bbbfly.MapControl#event:OnUnlinkedFromMap|OnUnlinkedFromMap}
       */
      OnUnlinkFromMap: null,
      /**
       * @event
       * @name OnUnlinkedFromMap
       * @memberof bbbfly.MapControl#
       *
       * @param {bbbfly.Map} map - Linked map
       *
       * @see {@link bbbfly.MapControl#UnlinkFromMap|UnlinkFromMap()}
       * @see {@link bbbfly.MapControl#event:OnUnlinkFromMap|OnUnlinkFromMap}
       */
      OnUnlinkedFromMap: null
    },
    Methods: {
      /**
       * @function
       * @name GetMap
       * @memberof bbbfly.MapControl#
       * @description Get map control by MapID
       *
       * @return {bbbfly.Map|null}
       */
      GetMap: bbbfly.map.control._getMap,
      /**
       * @function
       * @name LinkToMap
       * @memberof bbbfly.MapControl#
       *
       * @param {bbbfly.Map} map
       * @return {boolean} If control was linked
       *
       * @see {@link bbbfly.MapControl#UnlinkFromMap|UnlinkFromMap()}
       * @see {@link bbbfly.MapControl#event:OnLinkToMap|OnLinkToMap}
       * @see {@link bbbfly.MapControl#event:OnLinkedToMap|OnLinkedToMap}
       */
      LinkToMap: bbbfly.map.control._linkToMap,
      /**
       * @function
       * @name UnlinkFromMap
       * @memberof bbbfly.MapControl#
       *
       * @param {bbbfly.Map} map
       * @return {boolean} If control was unlinked
       *
       * @see {@link bbbfly.MapControl#LinkToMap|LinkToMap()}
       * @see {@link bbbfly.MapControl#event:OnUnLinkFromMap|OnUnLinkFromMap}
       * @see {@link bbbfly.MapControl#event:OnUnLinkedFromMap|OnUnLinkedFromMap}
       */
      UnlinkFromMap: bbbfly.map.control._unlinkFromMap,
      /**
       * @function
       * @name GetListener
       * @memberof bbbfly.MapControl#
       *
       * @return {object|null}
       */
      GetListener: bbbfly.map.control._getListener,
      /**
       * @function
       * @name CreateListener
       * @memberof bbbfly.MapControl#
       *
       * @return {object}
       */
      CreateListener: bbbfly.map.control._createListener
    }
  });

  return ngCreateControlAsType(def,def.CreteFromType,ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapControl',bbbfly.MapControl
    );
  }
};
