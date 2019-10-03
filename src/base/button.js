/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage button
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.button = {};

/** @ignore */
bbbfly.button._getAlt = function(){
  if(String.isString(this.AltRes)){
    return ngTxt(this.AltRes);
  }
  else if(String.isString(this.Alt)){
    return this.Alt;
  }
  return null;
};

/** @ignore */
bbbfly.button._getText = function(){
  if(String.isString(this.Text)){
    return this.Text;
  }
  else if(String.isString(this.TextRes)){
    return ngTxt(this.TextRes);
  }
  return null;
};

/** @ignore */
bbbfly.button._getIcon = function(){
  return (Object.isObject(this.Icon) ? this.Icon : {});
};

/** @ignore */
bbbfly.button._setIcon = function(node,proxy,indent,align,state){
  if(!node || !proxy || !indent){return;}

  var width = Number.isInteger(proxy.W) ? proxy.W : 0;
  var height = Number.isInteger(proxy.H) ? proxy.H : 0;

  var pos = {L:null,T:null,R:null,B:null};
  var margin = {L:null,T:null};

  switch(align){
    case bbbfly.Btn.iconalign.left:
      pos.L = Number.isInteger(indent.L) ? indent.L : 0;
      margin.T = Math.floor(height/2);
      pos.T = '50%';
    break;
    case bbbfly.Btn.iconalign.top:
      pos.T = Number.isInteger(indent.T) ? indent.T : 0;
      margin.L = Math.floor(width/2);
      pos.L = '50%';
    break;
    case bbbfly.Btn.iconalign.right:
      pos.R = Number.isInteger(indent.R) ? indent.R : 0;
      margin.T = Math.floor(height/2);
      pos.T = '50%';
    break;
    case bbbfly.Btn.iconalign.bottom:
      pos.B = Number.isInteger(indent.B) ? indent.B : 0;
      margin.L = Math.floor(width/2);
      pos.L = '50%';
    break;
  }

  var style = {};
  if(margin.L){
    margin.L = bbbfly.Renderer.StyleDim(margin.L,true);
    style['margin-left'] = margin.L;
  }
  if(margin.T){
    margin.T = bbbfly.Renderer.StyleDim(margin.T,true);
    style['margin-top'] = margin.T;
  }

  node.style.visibility = (width && height) ? 'visible' : 'hidden';

  return bbbfly.Renderer.SetImage(
    node,proxy,pos.L,pos.T,pos.R,pos.B,state,'Icon',style
  );
};

/** @ignore */
bbbfly.button._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);

  var holder = document.createElement('DIV');
  holder.id = this.ID+'_H';

  holder.style.zIndex = 3;
  holder.style.display = 'block';
  holder.style.position = 'absolute';
  holder.style.overflow = 'hidden';
  node.appendChild(holder);

  if(!this.Icon){return;}

  var icon = document.createElement('DIV');
  icon.id = this.ID+'_I';

  icon.style.zIndex = 3;
  icon.style.visibility = 'hidden';
  node.appendChild(icon);
};

/** @ignore */
bbbfly.button._doUpdate = function(node){
  if(!node){return;}

  var alt = this.GetAlt();
  var hasAlt = !!(String.isString(alt) && alt);
  var hasClick = !!(this.Enabled && !this.ReadOnly && this.OnClick);
  var hasDblClick = !!(this.Enabled && !this.ReadOnly && this.OnDblClick);

  if(hasAlt){
    if(this.HTMLEncode){alt = ng_htmlEncode(alt,false);}
    node.title = alt;
  }
  else{
    node.title = '';
  }

  var cursor = ((hasClick || hasDblClick) ? 'pointer' : 'default');
  node.style.cursor = cursor;

  this.DoUpdateHolder();
  this.DoUpdate.callParent(node);
};

/** @ignore */
bbbfly.button._doUpdateHolder = function(){
  var hNode = document.getElementById(this.ID+'_H');
  var iNode = document.getElementById(this.ID+'_I');

  var text = this.GetText();
  var icon = this.GetIcon();
  var state = this.GetState();

  var hasIcon = !!(Object.isObject(icon));
  var hasText = !!(String.isString(text) && text);

  var over = state.mouseover;
  state.mouseover = false;

  var hPadding = this.GetFrameDims();
  var hPosition = {L:null,T:null,R:null,B:null};
  var hPosSet = false;

  var iProxy = bbbfly.Renderer.ImageProxy(icon,state,this.ID+'_I');
  var indent = {L:0,T:0,R:0,B:0,I:0};

  if(Object.isObject(this.Indent)){
    if(Number.isInteger(this.Indent.L)){indent.L = this.Indent.L;}
    if(Number.isInteger(this.Indent.T)){indent.T = this.Indent.T;}
    if(Number.isInteger(this.Indent.R)){indent.R = this.Indent.R;}
    if(Number.isInteger(this.Indent.B)){indent.B = this.Indent.B;}
    if(Number.isInteger(this.Indent.I)){indent.I = this.Indent.I;}

    if(!hasText || !hasIcon){indent.I = 0;}
  }

  var iIndent = {
    L:indent.L,
    T:indent.T,
    R:indent.R,
    B:indent.B
  };

  var iSize = {
    W: Number.isInteger(iProxy.W) ? iProxy.W : 0,
    H: Number.isInteger(iProxy.H) ? iProxy.H : 0
  };

  var minHDim = {W:0,H:0};

  switch(this.IconAlign){
    case bbbfly.Btn.iconalign.left:
      if(iSize.W){
        hPosSet = true;
        hPosition.L = 0;
        iIndent.L += hPadding.L;
        hPadding.L += iSize.W + indent.I;
      }
      minHDim.H = iSize.H;
    break;
    case bbbfly.Btn.iconalign.top:
      if(iSize.H){
        hPosSet = true;
        hPosition.T = 0;
        iIndent.T += hPadding.T;
        hPadding.T += iSize.H + indent.I;
      }
      minHDim.H = iSize.W;
    break;
    case bbbfly.Btn.iconalign.right:
      if(iSize.W){
        hPosSet = true;
        hPosition.R = 0;
        iIndent.R += hPadding.R;
        hPadding.R += iSize.W + indent.I;
      }
      minHDim.H = iSize.H;
    break;
    case bbbfly.Btn.iconalign.bottom:
      if(iSize.H){
        hPosSet = true;
        hPosition.B = 0;
        iIndent.B += hPadding.B;
        hPadding.B += iSize.H + indent.I;
      }
      minHDim.H = iSize.W;
    break;
  }

  if(iNode){
    bbbfly.button._setIcon(
      iNode,iProxy,iIndent,this.IconAlign,state
    );
  }

  var html = '';

  if(hasText){
    if(this.HTMLEncode){text = ng_htmlEncode(text,true);}
    var style = [];

    switch(this.TextAlign){
      case bbbfly.Btn.textalign.right:
        style.push('float: right');
        style.push('text-align: right');
        if(!hPosSet){hPosition.R = 0;}
      break;
      case bbbfly.Btn.textalign.center:
        style.push('float: none');
        style.push('text-align: center');
        if(!hPosSet){hPosition.L = 0;}
      break;
      default:
        style.push('float: left');
        style.push('text-align: left');
        if(!hPosSet){hPosition.L = 0;}
      break;
    }

    if(!this.Multiline){
      style.push('white-space: nowrap');
    }

    style = style.join(';');

    html += '<div id="'+this.ID+'_T" class="Text"'
      +(style ? ' style="'+style+'"' : '')
      +' unselectable="on">'+text+'</div>';
  }

  switch(this.AutoSize){
    case bbbfly.Btn.autosize.both:
      //let stretch
    break;
    case bbbfly.Btn.autosize.horizontal:
      hPosition.T = 0;
      hPosition.B = 0;
    break;
    case bbbfly.Btn.autosize.vertical:
      hPosition.L = 0;
      hPosition.R = 0;
    break;
    default:
      hPosition.L = 0;
      hPosition.T = 0;
      hPosition.R = 0;
      hPosition.B = 0;
    break;
  }

  if(hNode){
    hNode.style.minWidth = bbbfly.Renderer.StyleDim(minHDim.W);
    hNode.style.minHeight = bbbfly.Renderer.StyleDim(minHDim.H);
    hNode.style.marginLeft = bbbfly.Renderer.StyleDim(hPadding.L + indent.L);
    hNode.style.marginTop = bbbfly.Renderer.StyleDim(hPadding.T + indent.T);
    hNode.style.marginRight = bbbfly.Renderer.StyleDim(hPadding.R + indent.R);
    hNode.style.marginBottom = bbbfly.Renderer.StyleDim(hPadding.B + indent.B);
    hNode.style.left = bbbfly.Renderer.StyleDim(hPosition.L);
    hNode.style.top = bbbfly.Renderer.StyleDim(hPosition.T);
    hNode.style.right = bbbfly.Renderer.StyleDim(hPosition.R);
    hNode.style.bottom = bbbfly.Renderer.StyleDim(hPosition.B);
  }

  this._IconProxy = iProxy;
  state.mouseover = over;

  if(html !== this._HolderHtml){
    this._HolderHtml = html;

    if(hNode){hNode.innerHTML = html;}
    if(over){bbbfly.Renderer.UpdateImageHTML(iProxy,state);}
  }
};

/** @ignore */
bbbfly.button._doUpdateImages = function(){
  var proxy = this._IconProxy;
  var state = this.GetState();

  bbbfly.Renderer.UpdateImageProxy(proxy,state);
  bbbfly.Renderer.UpdateImageHTML(proxy,state);

  this.DoUpdateImages.callParent();
};

bbbfly.button._doAutoSize = function(){
  var hNode = document.getElementById(this.ID+'_H');

  if(this.AutoSize && hNode){
    var bounds = {};
    ng_BeginMeasureElement(hNode);

    if(this.AutoSize & bbbfly.Btn.autosize.horizontal){
      bounds.W = ng_OuterWidth(hNode);
    }
    if(this.AutoSize & bbbfly.Btn.autosize.vertical){
      bounds.H = ng_OuterHeight(hNode);
    }

    ng_EndMeasureElement(hNode);
    this.SetBounds(bounds);
  }
};

/** @ignore */
bbbfly.button._doMouseEnter = function(event,options){
  var state = this.DoMouseEnter.callParent(event,options);
  var proxy = this._IconProxy;

  bbbfly.Renderer.UpdateImageHTML(proxy,state);
  return state;
};

/** @ignore */
bbbfly.button._doMouseLeave = function(event,options){
  var state = this.DoMouseLeave.callParent(event,options);
  var proxy = this._IconProxy;

  bbbfly.Renderer.UpdateImageHTML(proxy,state);
  return state;
};

/** @ignore */
bbbfly.button._doAcceptCPGestures = function(elm, gestures){
  gestures.drag = false;
};

/** @ignore */
bbbfly.button._doAcceptGestures = function(elm, gestures){
  gestures.doubletap = true;
  gestures.tap = true;
};

/** @ignore */
bbbfly.button._doPtrClick = function(ptrInfo){
  if(ptrInfo.EventID !== 'control'){return;}
  this.Click(ptrInfo.Event);
};

/** @ignore */
bbbfly.button._doPtrDblClick = function(ptrInfo){
  if(ptrInfo.EventID !== 'control'){return;}
  this.DblClick(ptrInfo.Event);
};

/** @ignore */
bbbfly.button._click = function(event){
  if(!this.Enabled || this.ReadOnly){return;}

  if(Function.isFunction(this.OnClick)){
    this.OnClick(event);
  }
};

/** @ignore */
bbbfly.button._dblClick = function(event){
  if(!this.Enabled || this.ReadOnly){return;}

  if(Function.isFunction(this.OnDblClick)){
    this.OnDblClick(event);
  }
};

/** @ignore */
bbbfly.button._onClick = function(){
  if(this.SelectType & bbbfly.Btn.selecttype.click){
    this.SetSelected(!this.Selected);
  }
};

/** @ignore */
bbbfly.button._onDblClick = function(){
  if(this.SelectType & bbbfly.Btn.selecttype.dblclick){
    this.SetSelected(!this.Selected);
  }
};

/** @ignore */
bbbfly.button.NormalizeDef = function(def){
  def = def || {};

  ng_MergeDef(def,{
    Methods: {
      GetState: bbbfly.button._ngGetState,
      DoUpdate: bbbfly.button._ngDoUpdate
    }
  });
  return def;
};

/** @ignore */
bbbfly.button._ngDoUpdate = function(node){
  this.DoUpdate.callParent(node);

  var textNode = document.getElementById(this.ID+'_T');
  bbbfly.Renderer.UpdateHTMLState(textNode,this.GetState());
  return true;
};

/** @ignore */
bbbfly.button._ngGetState = function(){
  return {
    disabled: !this.Enabled,
    readonly: !!this.ReadOnly,
    invalid: !!this.Invalid,

    mouseover: !!(
      this.Enabled && !this.ReadOnly
      && ngMouseInControls[this.ID]
    )
  };
};

/**
 * @class
 * @type control
 * @extends bbbfly.Frame
 * @implements bbbfly.hint.Hintified
 *
 * @description
 *   Basic button Control.
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is inluded.
 *
 * @inpackage button
 *
 * @param {ngControl.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [Alt=null] - Alt string
 * @property {string} [AltRes=null] - Alt  resource ID
 *
 * @property {string} [Text=null] - Text string
 * @property {string} [TextRes=null] - Text resource ID
 * @property {bbbfly.Btn.textalign} [TextAlign=left]
 *
 * @property {booleanbbbfly.Renderer.image} [Icon=null] - Icon definition
 *   Define define or set it to true before button creation to support icon
 * @property {bbbfly.Btn.iconalign} [IconAlign=left]
 *
 * @property {bbbfly.Btn.indent} [Indent=null]
 *
 * @property {bbbfly.Btn.autosize} [AutoSize=none]
 * @property {bbbfly.Btn.selecttype} [SelectType=none]
 *
 * @property {boolean} [Multiline=false]
 * @property {boolean} [HTMLEncode=true]
 */
bbbfly.Btn = function(def,ref,parent){
  ng_MergeDef(def,{
    Data: {
      Alt: null,
      AltRes: null,

      Text: null,
      TextRes: null,
      TextAlign: bbbfly.Btn.textalign.left,

      Icon: null,
      IconAlign: bbbfly.Btn.iconalign.left,

      Indent: null,

      AutoSize: bbbfly.Btn.autosize.none,
      SelectType: bbbfly.Btn.selecttype.none,

      Multiline: false,
      HTMLEncode: true,

      _IconProxy: null,
      _HolderHtml: ''
    },
    ControlsPanel: {
      Methods: {
        DoAcceptGestures: bbbfly.button._doAcceptCPGestures
      }
    },
    Events: {
      /**
       * @event
       * @name OnClick
       * @memberof bbbfly.Btn#
       *
       * @param {MouseEvent} event
       * @return {boolean} Return false to suppress event
       *
       * @see {@link bbbfly.Btn#Click|Click()}
       * @see {@link bbbfly.Btn#event:OnDblClick|OnDblClick}
       */
      OnClick: bbbfly.button._onClick,
      /**
       * @event
       * @name OnDblClick
       * @memberof bbbfly.Btn#
       *
       * @param {MouseEvent} event
       * @return {boolean} Return false to suppress event
       *
       * @see {@link bbbfly.Btn#DblClick|DblClick()}
       * @see {@link bbbfly.Btn#event:OnClick|OnClick}
       */
      OnDblClick: bbbfly.button._onDblClick
    },
    Methods: {
      /** @private */
      DoCreate: bbbfly.button._doCreate,
      /** @private */
      DoUpdate: bbbfly.button._doUpdate,
      /** @private */
      DoUpdateHolder: bbbfly.button._doUpdateHolder,
      /** @private */
      DoUpdateImages: bbbfly.button._doUpdateImages,
      /** @private */
      DoAutoSize: bbbfly.button._doAutoSize,
      /** @private */
      DoMouseEnter: bbbfly.button._doMouseEnter,
      /** @private */
      DoMouseLeave: bbbfly.button._doMouseLeave,
      /** @private */
      DoAcceptGestures: bbbfly.button._doAcceptGestures,
      /** @private */
      DoPtrClick: bbbfly.button._doPtrClick,
      /** @private */
      DoPtrDblClick: bbbfly.button._doPtrDblClick,

      /**
       * @function
       * @name GetAlt
       * @memberof bbbfly.Btn#
       *
       * @return {string|null}
       */
      GetAlt: bbbfly.button._getAlt,
      /**
       * @function
       * @name GetText
       * @memberof bbbfly.Btn#
       *
       * @return {string|null}
       */
      GetText: bbbfly.button._getText,
      /**
       * @function
       * @name GetIcon
       * @memberof bbbfly.Btn#
       *
       * @return {bbbfly.Renderer.image} Icon definition
       */
      GetIcon: bbbfly.button._getIcon,
      /**
       * @function
       * @name Click
       * @memberof bbbfly.Btn#
       *
       * @param {MouseEvent} event
       *
       * @see {@link bbbfly.Btn#DblClick|DblClick()}
       * @see {@link bbbfly.Btn#event:OnClick|OnClick}
       */
      Click: bbbfly.button._click,
      /**
       * @function
       * @name DblClick
       * @memberof bbbfly.Btn#
       *
       * @param {MouseEvent} event
       *
       * @see {@link bbbfly.Btn#Click|Click()}
       * @see {@link bbbfly.Btn#event:OnDblClick|OnDblClick}
       */
      DblClick: bbbfly.button._dblClick
    }
  });

  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.Btn.TextAlign}
 */
bbbfly.Btn.textalign = {
  left: 1,
  center: 2,
  right: 3
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.Btn.IconAlign}
 */
bbbfly.Btn.iconalign = {
  left: 1,
  top: 2,
  right: 3,
  bottom: 4
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.Btn.AutoSize}
 */
bbbfly.Btn.autosize = {
  none: 0,
  horizontal: 1,
  vertical: 2,
  both: 3
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.Btn.SelectType}
 */
bbbfly.Btn.selecttype = {
  none: 0,
  click: 1,
  dblclick: 2,
  both: 3
};

/**
 * @typedef {object} indent
 * @memberOf bbbfly.Btn
 *
 * @description
 *   Possible values for {@link bbbfly.Btn.Indent|Indent}
 *
 * @property {px} [L] - Gap between left frame and content
 * @property {px} [T] - Gap between top frame and content
 * @property {px} [R] - Gap between right frame and content
 * @property {px} [B] - Gap between bottom frame and content
 * @property {px} [I=undefined] - Gap between icon and text
 */

/**
 * @class
 * @type control
 * @extends ngButton
 * @implements bbbfly.hint.Hintified
 * @deprecated will be replaced by {@link bbbbfly.Btn}
 *
 * @description
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is inluded.
 *
 * @inpackage button
 *
 * @param {ngControl.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.Button = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngButton',ref,parent);
};

/**
 * @class
 * @type control
 * @extends ngCheckBox
 * @implements bbbfly.hint.Hintified
 * @deprecated will be replaced by {@link bbbbfly.Btn}
 *
 * @description
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is inluded.
 *
 * @inpackage button
 *
 * @param {ngControl.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.CheckBox = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngCheckBox',ref,parent);
};

/**
 * @class
 * @type control
 * @extends ngRadioButton
 * @implements bbbfly.hint.Hintified
 * @deprecated will be replaced by {@link bbbbfly.Btn}
 *
 * @description
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is inluded.
 *
 * @inpackage button
 *
 * @param {ngControl.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 */
bbbfly.RadioButton = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngRadioButton',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_strl_button'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Btn',bbbfly.Btn);
    ngRegisterControlType('bbbfly.Button',bbbfly.Button);
    ngRegisterControlType('bbbfly.CheckBox',bbbfly.CheckBox);
    ngRegisterControlType('bbbfly.RadioButton',bbbfly.RadioButton);
  }
};