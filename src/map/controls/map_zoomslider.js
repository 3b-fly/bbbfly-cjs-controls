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
bbbfly.map.control.zoomslider = {
  control_type: 'zoomSlider'
};

/** @ignore */
bbbfly.map.control.zoomslider._onLinkedToMap = function(){
  this.ShowMapZoom();
};

/** @ignore */
bbbfly.map.control.zoomslider._createListener = function(){
  return {
    Listen: ['OnZoomChanged'],
    OnZoomChanged: bbbfly.map.control.zoomslider._onZoomChanged
  };
};

/** @ignore */
bbbfly.map.control.zoomslider._onZoomChanged = function(){
  this.Owner.ShowMapZoom();
};

/** @ignore */
bbbfly.map.control.zoomslider._showZoom = function(zoom,minZoom,maxZoom){
  if(typeof zoom !== 'number'){return;}
  if(typeof minZoom !== 'undefined'){this._minZoom = minZoom;}
  if(typeof maxZoom !== 'undefined'){this._maxZoom = maxZoom;}

  this._zoom = zoom;

  this.Controls.ZoomIn.SetEnabled(
    (typeof this._maxZoom !== 'number') || (this._maxZoom > zoom)
  );
  this.Controls.ZoomOut.SetEnabled(
    (typeof this._minZoom !== 'number') || (this._minZoom < zoom)
  );
  this.Controls.Slider.Update();
};

/** @ignore */
bbbfly.map.control.zoomslider._showMapZoom = function(){
  var map = this.GetMap();
  if(!map){return;}

  this.ShowZoom(
    map.GetZoom(),
    map.GetMinZoom(),
    map.GetMaxZoom()
  );
};

/** @ignore */
bbbfly.map.control.zoomslider._zoomIn = function(){
  var map = this.Owner.Owner.GetMap();
  return map ? map.ZoomIn(1) : flase;
};

/** @ignore */
bbbfly.map.control.zoomslider._zoomOut = function(){
  var map = this.Owner.Owner.GetMap();
  return map ? map.ZoomOut(1) : false;
};

/** @ignore */
bbbfly.map.control.zoomslider._onSliderCatcherCreated = function(panel){
  ngc_PtrEvents(panel,'zoomSlider','drag tap');

  panel.GetPointerPos = ngc_GetPointerPos;
  panel.OnPtrDrag = bbbfly.map.control.zoomslider._onSliderPtrDrag;
  panel.OnPtrEnd = bbbfly.map.control.zoomslider._onSliderPtrEnd;

  return true;
};

/** @ignore */
bbbfly.map.control.zoomslider._onSliderUpdate = function(){
  var zoomSlider = this.Owner.Owner;
  var handle = this.Controls.Handle;

  var contentNode = (this.ControlsPanel)
    ? this.ControlsPanel.Elm() : this.Elm();

  ng_BeginMeasureElement(contentNode);
  var contentSize = (this.Vertical)
    ? ng_ClientHeight(contentNode) : ng_ClientWidth(contentNode);
  ng_EndMeasureElement(contentNode);

  var indent = (typeof this.HandleIndent === 'number') ? this.HandleIndent : 0;
  contentSize -= (indent * 2);

  var stepSize = contentSize / (zoomSlider._maxZoom - zoomSlider._minZoom);
  var handlePos = Math.floor(
    ((zoomSlider._maxZoom - zoomSlider._zoom) * stepSize) + indent
  );
  handle.SetBounds(this.Vertical ? { T: handlePos } : { L: handlePos });
};

/** @ignore */
bbbfly.map.control.zoomslider._onSliderPtrDrag = function(ptrCatcher,event){
  var slider = ptrCatcher.Owner.Owner;
  slider.OnSelected(ptrCatcher,event,false);
  return true;
};

/** @ignore */
bbbfly.map.control.zoomslider._onSliderPtrEnd = function(ptrCatcher,event){
  var slider = ptrCatcher.Owner.Owner;
  var map = slider.Owner.Owner.GetMap();

  if(map){
    var zoom = slider.OnSelected(ptrCatcher,event,true);
    map.SetZoom(zoom);
  }
  return true;
};

/** @ignore */
bbbfly.map.control.zoomslider._onSliderSelected = function(ptrCatcher,event,ptrEnd){
  var slider = ptrCatcher.Owner.Owner;
  var zoomSlider = slider.Owner.Owner;
  var handle = slider.Controls.Handle;

  var catcherNode = ptrCatcher.Elm();
  var catcherSize = 0;
  var ptrPos = 0;

  ng_BeginMeasureElement(catcherNode);
  var catcherPos = ng_ParentPosition(catcherNode);
  catcherSize = (slider.Vertical)
    ? ng_ClientHeight(catcherNode) : ng_ClientWidth(catcherNode);
  ptrPos = (slider.Vertical)
    ? (event.Y - catcherPos.y) : (event.X - catcherPos.x);
  ng_EndMeasureElement(catcherNode);

  var indent = (Number.isNumber(slider.HandleIndent))
    ? slider.HandleIndent : 0;
  catcherSize -= (indent * 2);
  ptrPos -= indent;

  var stepsCnt = zoomSlider._maxZoom - zoomSlider._minZoom;
  var stepSize = catcherSize / stepsCnt;
  var currentStep = ptrPos / stepSize;
  var targetStep = Math.floor(currentStep);
  if((currentStep - targetStep) > 0.5){
    targetStep ++;
  }

  if(targetStep < 0){targetStep = 0;}
  else if(targetStep > stepsCnt){targetStep = stepsCnt;}

  var handlePos = Math.floor((targetStep * stepSize) + indent);
  handle.SetBounds(slider.Vertical ? { T: handlePos } : { L: handlePos });

  return zoomSlider._maxZoom - targetStep;
};

/**
 * @class
 * @type control
 * @extends bbbfly.MapControl
 *
 * @inpackage mapbox
 *
 * @param {bbbfly.MapZoomSlider.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [ControlType=bbbfly.map.control.zoomslider.control_type]
 */
bbbfly.MapZoomSlider = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      ControlType: bbbfly.map.control.zoomslider.control_type,

      /** @private */
      _zoom: null,
      /** @private */
      _minZoom: null,
      /** @private */
      _maxZoom: null
    },
    Controls: {
      ZoomIn: {
        Type: 'bbbfly.Button',
        Events: {
          Data: { AltRes: 'bbbfly_map_control_zoomslider_zoomin' },
          OnClick: bbbfly.map.control.zoomslider._zoomIn
        }
      },
      ZoomOut: {
        Type: 'bbbfly.Button',
        Events: {
          Data: { AltRes: 'bbbfly_map_control_zoomslider_zoomout' },
          OnClick: bbbfly.map.control.zoomslider._zoomOut
        }
      },
      Slider: {
        Type: 'bbbfly.Panel',
        ParentReferences: false,
        Data: {
          Vertical: true,
          HandleIndent: 0,
          ChildHandling: ngChildEnabledParentAware
        },
        Controls: {
          Rail: {
            Type: 'bbbfly.Panel',
            style: { zIndex: 1 }
          },
          Handle: {
            Type: 'bbbfly.Panel',
            style: { zIndex: 2 }
          },
          PtrCatcher: {
            Type: 'bbbfly.Panel',
            L:0, R:0, T:0, B:0,
            style: {
              zIndex: 3,
              cursor: 'pointer'
            },
            OnCreated: bbbfly.map.control.zoomslider._onSliderCatcherCreated
          }
        },
        Events: {
          OnUpdated: bbbfly.map.control.zoomslider._onSliderUpdate,
          OnSelected: bbbfly.map.control.zoomslider._onSliderSelected
        }
      }
    },
    Events: {
      /** @private */
      OnLinkedToMap: bbbfly.map.control.zoomslider._onLinkedToMap
    },
    Methods: {
      /** @private */
      CreateListener: bbbfly.map.control.zoomslider._createListener,
      /**
       * @function
       * @name ShowZoom
       * @memberof bbbfly.MapZoomSlider#
       * @description Show zoom level
       *
       * @param {number} zoom - Zoom level
       */
      ShowZoom: bbbfly.map.control.zoomslider._showZoom,
      /**
       * @function
       * @name ShowMapZoom
       * @memberof bbbfly.MapZoomSlider#
       * @description Show linked map zoom level
       */
      ShowMapZoom: bbbfly.map.control.zoomslider._showMapZoom
    }
  });

  return ngCreateControlAsType(def,'bbbfly.MapControl',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || [];
ngUserControls['bbbfly_map_control_zoomslider'] = {
  OnInit: function(){
    ngRegisterControlType(
      'bbbfly.MapZoomSlider',bbbfly.MapZoomSlider
    );
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.MapZoomSlider
 * @extends bbbfly.MapControl.Definition
 *
 * @description MapZoomSlider control definition
 */
