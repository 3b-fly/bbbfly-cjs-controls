/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.map = bbbfly.map || {};
bbbfly.map.tooltip = {
  _leafletPrefix: 'bbbfly_map_tooltip_lf-',
  _packagePrefix: 'bbbfly_map_tooltip-',

  _lastId: 0,
  _styles: {},

  utils: {}
};
bbbfly.map.drawing.utils.LeafletId = function(obj){
  var id = Object.isObject(obj) ? L.stamp(obj) : null;
  return Number.isInteger(id) ? bbbfly.map.tooltip._leafletPrefix+id : id;
};
bbbfly.map.tooltip.utils.TooltipId = function(options){
  var id = (options) ? options.ID : null;
  if(String.isString(id)){return id;}

  id = bbbfly.map.tooltip._packagePrefix;
  return id+(++bbbfly.map.tooltip._lastId);
};
bbbfly.map.tooltip.utils.ObjDim = function(props,propName){
  if(!Object.isObject(props)){return 0;}
  var propVal = props[propName];

  return Number.isInteger(propVal) ? propVal : 0;
};
bbbfly.map.tooltip.utils.AnchorProps = function(id,anchor,type,state){
  var props = {
    L: null, T: null, R: null, B: null,
    OX:null, OXL:null, OXR:null,
    OY:null, OYT:null, OYB:null,
    Style: {display: 'none'},
    ImgProxy: null
  };

  if(!Object.isObject(anchor)){return props;}

  var iProxy = bbbfly.Renderer.ImageProxy(anchor.Img,state,id+'_'+type);
  var iAnchor = iProxy.Anchor || {L:0,T:0};
  props.ImgProxy = iProxy;

  if(!iProxy.Visible || !iProxy.W || !iProxy.H){return props;}

  switch(type){
    case 'AL':
      props.L = Number.isInteger(anchor.L) ? anchor.L : 0;
      props.OX = (iAnchor.L - props.L);
    break;
    case 'AT':
      props.T = Number.isInteger(anchor.T) ? anchor.T : 0;
      props.OY = (iAnchor.T - props.T);
    break;
    case 'AR':
      props.R = Number.isInteger(anchor.R) ? anchor.R : 0;
      props.OX = (props.R + iAnchor.L -  iProxy.W);
    break;
    case 'AB':
      props.B = Number.isInteger(anchor.B) ? anchor.B : 0;
      props.OY = (props.B + iAnchor.T -  iProxy.H);
    break;
  }

  switch(type){
    case 'AL': case 'AR':
      if(Number.isInteger(anchor.T)){
        props.T = anchor.T;
        props.OYT = (anchor.T + iAnchor.T);
      }
      else if(Number.isInteger(anchor.B)){
        props.B = anchor.B;
        props.OYB = (anchor.B + iProxy.H - iAnchor.T);
      }
      else if(Number.isInteger(iProxy.H)){
        props.T = '50%';
        props.OY = (Math.round(iProxy.H / 2) - iAnchor.T);

        props.Style['margin-top'] = bbbfly.Renderer.StyleDim(
          Math.round(iProxy.H / -2)
        );
      }
    break;
    case 'AT': case 'AB':
      if(Number.isInteger(anchor.L)){
        props.L = anchor.L;
        props.OXL = (anchor.L + iAnchor.L);
      }
      else if(Number.isInteger(anchor.R)){
        props.R = anchor.R;
        props.OXR = (anchor.R + iProxy.W - iAnchor.L);
      }
      else if(Number.isInteger(iProxy.W)){
        props.L = '50%';
        props.OX = (Math.round(iProxy.W / 2) - iAnchor.L);

        props.Style['margin-left'] = bbbfly.Renderer.StyleDim(
          Math.round(iProxy.W / -2)
        );
      }
    break;
  }

  return props;
};
bbbfly.map.tooltip.utils.AnchorsProps = function(id,anchors,state){
  var props = { AL:null, AT:null, AR:null, AB:null };

  if(!String.isString(id)){return props;}
  if(!Object.isObject(anchors)){return props;}

  var utils = bbbfly.map.tooltip.utils;

  if(anchors.Left){
    props.AL = utils.AnchorProps(id,anchors.Left,'AL',state);
  }
  if(anchors.Top){
    props.AT = utils.AnchorProps(id,anchors.Top,'AT',state);
  }
  if(anchors.Right){
    props.AR = utils.AnchorProps(id,anchors.Right,'AR',state);
  }
  if(anchors.Bottom){
    props.AB = utils.AnchorProps(id,anchors.Bottom,'AB',state);
  }

  return props;
};
bbbfly.map.tooltip.utils.AnchorHTML = function(props,state){
  if(!props){return '';}

  return bbbfly.Renderer.ImageHTML(
    props.ImgProxy,props.L,props.T,props.R,props.B,
    state,null,props.Style
  );
};
bbbfly.map.tooltip.utils.AnchorsHTML = function(props,state){
  var html = '';
  if(Object.isObject(props)){
    html += bbbfly.map.tooltip.utils.AnchorHTML(props.AL,state);
    html += bbbfly.map.tooltip.utils.AnchorHTML(props.AT,state);
    html += bbbfly.map.tooltip.utils.AnchorHTML(props.AR,state);
    html += bbbfly.map.tooltip.utils.AnchorHTML(props.AB,state);
  }
  return html;
};
bbbfly.map.tooltip._getText = function(){
  if(String.isString(this.Options.Text)){
    return this.Options.Text;
  }
  else if(String.isString(this.Options.TextRes)){
    return ngTxt(this.Options.TextRes);
  }
  return null;
};
bbbfly.map.tooltip._getStyle = function(){
  var type = bbbfly.MapTooltip.Style;

  var style = this.Options.Style;
  if(style instanceof type){return style;}

  if(String.isString(style)){
    style = bbbfly.MapTooltip.Style.Get(style);
  }

  return (style instanceof type) ? style : new type();
};
bbbfly.map.tooltip._getHTML = function(frame,innerHtml){
  if(String.isString(innerHtml)){
    innerHtml = '<span class="frameContent">'+innerHtml+'</span>';
  }

  var proxy = bbbfly.Renderer.FrameProxy(frame,null,this.ID);
  var html = bbbfly.Renderer.DynamicFrameHTML(proxy,null,null,innerHtml);
  html += bbbfly.map.tooltip.utils.AnchorsHTML(this._AnchorProps,null);

  return html;
};
bbbfly.map.tooltip._create = function(){
  if(!this._ParentLayer){return null;}

  var style = this.GetStyle();

  if(!this._Tooltip){
    var tooltip = new L.Tooltip({
      permanent: true,
      opacity: style.opacity,
      className: style.className
    });

    tooltip.Owner = this;

    ng_OverrideMethod(
      tooltip,'_setPosition',
      bbbfly.map.tooltip._setPosition
    );

    this._Tooltip = tooltip;
  }

  if(!this._AnchorProps){
    this._AnchorProps = bbbfly.map.tooltip.utils.AnchorsProps(
      this.ID,style.anchors,null
    );
  }

  return this._Tooltip;
};
bbbfly.map.tooltip._dispose = function(){
  this.Hide();

  this._Tooltip = null;
  this._AnchorProps = null;
};
bbbfly.map.tooltip._show = function(layer){
  if(!(layer instanceof L.Layer)){return false;}

  if(this._ParentLayer && (this._ParentLayer !== layer)){
    this.Dispose();
  }

  this._ParentLayer = layer;

  var tooltip = this.Create();
  if(!tooltip){return false;}

  var text = this.GetText();
  var html = '';

  if(String.isString(text) && (text !== '')){
    var style = this.GetStyle();

    var encode = this.Options.HTMLEncode;
    if(!Boolean.isBoolean(encode)){encode = true;}

    if(encode){text = ng_htmlEncode(text,true);}
    html = this.GetHTML(style.frame,text);
  }

  if(html !== this._Html){
    tooltip.setContent(html);
    this._Html = html;
  }

  if(this._ParentLayer.getTooltip() !== tooltip){
    layer.bindTooltip(tooltip);
  }

  layer.openTooltip();
  return true;
};
bbbfly.map.tooltip._hide = function(){
  if(!this._ParentLayer || !this._Tooltip){return false;}

  if(this._ParentLayer.getTooltip() === this._Tooltip){
    this._ParentLayer.closeTooltip();
    this._ParentLayer.unbindTooltip();
  }
  return true;
};
bbbfly.map.tooltip._isShown = function(){
  if(!this._ParentLayer || !this._Tooltip){return false;}

  return (this._ParentLayer.getTooltip() === this._Tooltip);
};
bbbfly.map.tooltip._setPosition = function(position){
  this._setPosition.callParent(position);

  var container = this._container;
  var anchorProps = this.Owner._AnchorProps;
  if(!container || !anchorProps){return;}

  var toShow = null;
  var cn = L.DomUtil.getClass(container);

  if(String.isString(cn)){
    if(cn.indexOf('leaflet-tooltip-left') > -1){toShow = 'AR';}
    else if(cn.indexOf('leaflet-tooltip-top') > -1){toShow = 'AB';}
    else if(cn.indexOf('leaflet-tooltip-right') > -1){toShow = 'AL';}
    else if(cn.indexOf('leaflet-tooltip-bottom') > -1){toShow = 'AT';}
  }

  for(var type in anchorProps){
    var aProps = anchorProps[type];
    if(!aProps){continue;}

    var iProxy = aProps.ImgProxy;
    if(!iProxy){continue;}

    var node = document.getElementById(iProxy.Id);
    if(!node){continue;}

    var show = (type === toShow);
    node.style.display = show ? 'block' : 'none';

    if(show){
      var oh = Math.round(container.offsetHeight/2);
      var ow = Math.round(container.offsetWidth/2);
      var pos = L.DomUtil.getPosition(container);

      switch(type){
        case 'AL': case 'AR':
          pos.x += aProps.OX;
          if(aProps.OYT){pos.y += (oh - aProps.OYT);}
          else if(aProps.OYB){pos.y += (aProps.OYB - oh);}
          else if(aProps.OY){pos.y += aProps.OY;}
        break;
        case 'AT': case 'AB':
          pos.y += aProps.OY;
          if(aProps.OXL){pos.x += (ow - aProps.OXL);}
          else if(aProps.OXR){pos.x += (aProps.OXR - ow);}
          else if(aProps.OX){pos.x += aProps.OX;}
        break;
      }

      L.DomUtil.setPosition(container,pos);
    }
  }
};
bbbfly.MapTooltip = function(options){
  if(!Object.isObject(options)){options = {};}

  this.ID = bbbfly.map.tooltip.utils.TooltipId(options);
  this.Options = options;
  this._Html = '';
  this._Tooltip = null;
  this._AnchorProps = null;
  this._ParentLayer = null;
  this.GetText = bbbfly.map.tooltip._getText;
  this.GetStyle = bbbfly.map.tooltip._getStyle;
  this.GetHTML = bbbfly.map.tooltip._getHTML;
  this.Create = bbbfly.map.tooltip._create;
  this.Dispose = bbbfly.map.tooltip._dispose;
  this.Show = bbbfly.map.tooltip._show;
  this.Hide = bbbfly.map.tooltip._hide;
  this.IsShown = bbbfly.map.tooltip._isShown;
};
bbbfly.MapTooltip.Style = function(options){

  this.frame = null;
  this.anchors = null;

  this.opacity = 1;
  this.className = '';

  if(!Object.isObject(options)){return;}

  if(Object.isObject(options.frame)){this.frame = options.frame;}
  if(Object.isObject(options.anchors)){this.anchors = options.anchors;}

  if(Number.isNumber(options.opacity)){this.opacity = options.opacity;}
  if(String.isString(options.className)){this.className = options.className;}
};
bbbfly.MapTooltip.Style.Get = function(id){
  if(String.isString(id)){
    var style = bbbfly.map.tooltip._styles[id];
    if(style instanceof bbbfly.MapTooltip.Style){
      return style;
    }
  }
  return null;
};
bbbfly.MapTooltip.Style.Define = function(id,style){
  if(!(style instanceof bbbfly.MapTooltip.Style)){return false;}
  if(!String.isString(id)){return false;}

  var stack = bbbfly.map.tooltip._styles;
  if((typeof stack[id] !== 'undefined')){
    return false;
  }

  stack[id] = style;
  return true;
};
