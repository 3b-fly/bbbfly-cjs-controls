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
bbbfly.button._setAlt = function(alt,update){
  if(!String.isString(alt) && (alt !== null)){return;}

  if(alt !== this.Alt){
    this.Alt = alt;

    if(!Boolean.isBoolean(update) || update){
      this.Update();
    }
  }
};

/** @ignore */
bbbfly.button._setText = function(text,update){
  if(!String.isString(text) && (text !== null)){return;}

  if(text !== this.Text){
    this.Text = text;

    if(!Boolean.isBoolean(update) || update){
      this.Update();
    }
  }
};

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
    case bbbfly.Button.iconalign.left:
      pos.L = Number.isInteger(indent.L) ? indent.L : 0;
      margin.T = Math.floor(height/2);
      pos.T = '50%';
    break;
    case bbbfly.Button.iconalign.top:
      pos.T = Number.isInteger(indent.T) ? indent.T : 0;
      margin.L = Math.floor(width/2);
      pos.L = '50%';
    break;
    case bbbfly.Button.iconalign.right:
      pos.R = Number.isInteger(indent.R) ? indent.R : 0;
      margin.T = Math.floor(height/2);
      pos.T = '50%';
    break;
    case bbbfly.Button.iconalign.bottom:
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

  holder.style.zIndex = 300;
  holder.style.display = 'block';
  holder.style.position = 'absolute';
  holder.style.overflow = 'hidden';
  node.appendChild(holder);

  if(!this.GetIcon()){return;}

  var icon = document.createElement('DIV');
  icon.id = this.ID+'_I';

  icon.style.zIndex = 300;
  icon.style.visibility = 'hidden';
  node.appendChild(icon);
};

/** @ignore */
bbbfly.button._doUpdate = function(node){
  if(!node){return;}

  this.DoUpdate.callParent(node);

  var alt = this.GetAlt();
  var hasAlt = !!(String.isString(alt) && alt);

  if(hasAlt){
    if(this.HTMLEncode){alt = ng_htmlEncode(alt,false);}
    node.title = alt;
  }
  else{
    node.title = '';
  }

  node.style.cursor = (this.HasClick() || this.HasDblClick())
    ? 'pointer' : 'default';

  this.DoUpdateHolder();
  this.DoAutoSize();
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
    W: (Number.isInteger(iProxy.W) && iProxy.Visible) ? iProxy.W : 0,
    H: (Number.isInteger(iProxy.H) && iProxy.Visible) ? iProxy.H : 0
  };

  var minHDim = {W:0,H:0};

  switch(this.IconAlign){
    case bbbfly.Button.iconalign.left:
      if(iSize.W){
        hPosSet = true;
        hPosition.L = 0;
        iIndent.L += hPadding.L;
        hPadding.L += iSize.W + indent.I;
      }
      minHDim.H = iSize.H;
    break;
    case bbbfly.Button.iconalign.top:
      if(iSize.H){
        hPosSet = true;
        hPosition.T = 0;
        iIndent.T += hPadding.T;
        hPadding.T += iSize.H + indent.I;
      }
      minHDim.H = iSize.W;
    break;
    case bbbfly.Button.iconalign.right:
      if(iSize.W){
        hPosSet = true;
        hPosition.R = 0;
        iIndent.R += hPadding.R;
        hPadding.R += iSize.W + indent.I;
      }
      minHDim.H = iSize.H;
    break;
    case bbbfly.Button.iconalign.bottom:
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
    var style = ['word-wrap: normal'];

    switch(this.TextAlign){
      case bbbfly.Button.textalign.right:
        style.push('float: right');
        style.push('text-align: right');
        if(!hPosSet){hPosition.R = 0;}
      break;
      case bbbfly.Button.textalign.center:
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

    if(!this.MultiLine){
      style.push('white-space: nowrap');
    }

    style = style.join(';');

    html += '<div id="'+this.ID+'_TH">'
      +'<div id="'+this.ID+'_T" class="Text"'
        +(style ? ' style="'+style+'"' : '')
        +' unselectable="on">'+text+'</div>'
      +'</div>';
  }

  switch(this.AutoSize){
    case bbbfly.Button.autosize.both:
      //let stretch
    break;
    case bbbfly.Button.autosize.horizontal:
      hPosition.T = 0;
      hPosition.B = 0;
    break;
    case bbbfly.Button.autosize.vertical:
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
  else{
    var thNode = document.getElementById(this.ID+'_TH');

    if(thNode){
      thNode.style.paddingLeft = bbbfly.Renderer.StyleDim(0);
      thNode.style.paddingTop = bbbfly.Renderer.StyleDim(0);
      thNode.style.paddingRight = bbbfly.Renderer.StyleDim(0);
      thNode.style.paddingBottom = bbbfly.Renderer.StyleDim(0);
    }
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

/** @ignore */
bbbfly.button._doAutoSize = function(){
  var hNode = document.getElementById(this.ID+'_H');
  if(!hNode){return;}

  ng_BeginMeasureElement(hNode);
  var hoWidth = ng_OuterWidth(hNode);
  var hoHeight = ng_OuterHeight(hNode);
  var hcHeight = ng_ClientHeight(hNode);
  ng_EndMeasureElement(hNode);

  var valign = true;

  if(this.AutoSize){
    var bounds = {};

    if(this.AutoSize & bbbfly.Button.autosize.horizontal){
      bounds.W = hoWidth;
    }
    if(this.AutoSize & bbbfly.Button.autosize.vertical){
      bounds.H = hoHeight;
      valign = false;
    }

    this.SetBounds(bounds);
  }

  if(valign){
    var tNode = document.getElementById(this.ID+'_T');
    var thNode = document.getElementById(this.ID+'_TH');
    if(!tNode || !thNode){return;}

    var tcHeight = ng_OuterHeight(tNode);

    thNode.style.paddingTop = bbbfly.Renderer.StyleDim(
      (tcHeight < hcHeight) ? Math.floor((hcHeight-tcHeight)/2) : 0
    );
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
  if(this.HasClick){this.OnClick(event);}
};

/** @ignore */
bbbfly.button._dblClick = function(event){
  if(this.HasDblClick){this.OnDblClick(event);}
};

/** @ignore */
bbbfly.button._hasClick = function(){
  if(!this.Enabled || this.ReadOnly){return false;}
  return Function.isFunction(this.OnClick);
};

/** @ignore */
bbbfly.button._hasDblClick = function(){
  if(!this.Enabled || this.ReadOnly){return false;}
  return Function.isFunction(this.OnDblClick);
};

/** @ignore */
bbbfly.button._onClick = function(){
  if(this.SelectType & bbbfly.Button.selecttype.click){
    this.SetSelected(!this.Selected);
  }
};

/** @ignore */
bbbfly.button._onDblClick = function(){
  if(this.SelectType & bbbfly.Button.selecttype.dblclick){
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
 * @param {bbbfly.Button.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [Alt=null] - Alt string
 * @property {string} [AltRes=null] - Alt  resource ID
 *
 * @property {string} [Text=null] - Text string
 * @property {string} [TextRes=null] - Text resource ID
 * @property {bbbfly.Button.textalign} [TextAlign=left]
 *
 * @property {boolean|bbbfly.Renderer.image} [Icon=null] - Icon definition
 *   Define define or set it to true before button creation to support icon
 * @property {bbbfly.Button.iconalign} [IconAlign=left]
 *
 * @property {bbbfly.Button.indent} [Indent=null]
 *
 * @property {bbbfly.Button.autosize} [AutoSize=none]
 * @property {bbbfly.Button.selecttype} [SelectType=none]
 *
 * @property {boolean} [MultiLine=false]
 * @property {boolean} [HTMLEncode=true]
 */
bbbfly.Button = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Alt: null,
      AltRes: null,

      Text: null,
      TextRes: null,
      TextAlign: bbbfly.Button.textalign.left,

      Icon: null,
      IconAlign: bbbfly.Button.iconalign.left,

      Indent: null,

      AutoSize: bbbfly.Button.autosize.none,
      SelectType: bbbfly.Button.selecttype.none,

      MultiLine: false,
      HTMLEncode: true,

      /** @private */
      _IconProxy: null,
      /** @private */
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
       * @memberof bbbfly.Button#
       *
       * @param {MouseEvent} event
       * @return {boolean} Return false to suppress event
       *
       * @see {@link bbbfly.Button#Click|Click()}
       * @see {@link bbbfly.Button#event:OnDblClick|OnDblClick}
       */
      OnClick: bbbfly.button._onClick,
      /**
       * @event
       * @name OnDblClick
       * @memberof bbbfly.Button#
       *
       * @param {MouseEvent} event
       * @return {boolean} Return false to suppress event
       *
       * @see {@link bbbfly.Button#DblClick|DblClick()}
       * @see {@link bbbfly.Button#event:OnClick|OnClick}
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
       * @name SetAlt
       * @memberof bbbfly.Button#
       *
       * @param {string|null} alt
       * @param {boolean} [update=true]
       */
      SetAlt: bbbfly.button._setAlt,
      /**
       * @function
       * @name SetText
       * @memberof bbbfly.Button#
       *
       * @param {string|null} text
       * @param {boolean} [update=true]
       */
      SetText: bbbfly.button._setText,

      /**
       * @function
       * @name GetAlt
       * @memberof bbbfly.Button#
       *
       * @return {string|null}
       */
      GetAlt: bbbfly.button._getAlt,
      /**
       * @function
       * @name GetText
       * @memberof bbbfly.Button#
       *
       * @return {string|null}
       */
      GetText: bbbfly.button._getText,
      /**
       * @function
       * @name GetIcon
       * @memberof bbbfly.Button#
       *
       * @return {bbbfly.Renderer.image} Icon definition
       */
      GetIcon: bbbfly.button._getIcon,
      /**
       * @function
       * @name Click
       * @memberof bbbfly.Button#
       *
       * @param {MouseEvent} event
       *
       * @see {@link bbbfly.Button#DblClick|DblClick()}
       * @see {@link bbbfly.Button#event:OnClick|OnClick}
       */
      Click: bbbfly.button._click,
      /**
       * @function
       * @name DblClick
       * @memberof bbbfly.Button#
       *
       * @param {MouseEvent} event
       *
       * @see {@link bbbfly.Button#Click|Click()}
       * @see {@link bbbfly.Button#event:OnDblClick|OnDblClick}
       */
      DblClick: bbbfly.button._dblClick,
      /**
       * @function
       * @name HasClick
       * @memberof bbbfly.Button#
       *
       * @return {boolean} If has active click action
       *
       * @see {@link bbbfly.Button#Click|Click()}
       * @see {@link bbbfly.Button#event:OnClick|OnClick}
       */
      HasClick: bbbfly.button._hasClick,
      /**
       * @function
       * @name HasDblClick
       * @memberof bbbfly.Button#
       *
       * @return {boolean} If has active double click action
       *
       * @see {@link bbbfly.Button#DblClick|DblClick()}
       * @see {@link bbbfly.Button#event:OnDblClick|OnDblClick}
       */
      HasDblClick: bbbfly.button._hasDblClick
    }
  });

  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.Button|bbbfly.Button.TextAlign}
 */
bbbfly.Button.textalign = {
  left: 1,
  center: 2,
  right: 3
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.Button|bbbfly.Button.IconAlign}
 */
bbbfly.Button.iconalign = {
  left: 1,
  top: 2,
  right: 3,
  bottom: 4
};

/**
 * @enum {bitmask}
 * @description
 *   Possible values for {@link bbbfly.Button|bbbfly.Button.AutoSize}
 */
bbbfly.Button.autosize = {
  none: 0,
  horizontal: 1,
  vertical: 2,
  both: 3
};

/**
 * @enum {bitmask}
 * @description
 *   Possible values for {@link bbbfly.Button|bbbfly.Button.SelectType}
 */
bbbfly.Button.selecttype = {
  none: 0,
  click: 1,
  dblclick: 2,
  both: 3
};

/**
 * @typedef {object} indent
 * @memberOf bbbfly.Button
 *
 * @description
 *   Possible values for {@link bbbfly.Button|bbbfly.Button.Indent}
 *
 * @property {px} [L] - Gap between left frame and content
 * @property {px} [T] - Gap between top frame and content
 * @property {px} [R] - Gap between right frame and content
 * @property {px} [B] - Gap between bottom frame and content
 * @property {px} [I=undefined] - Gap between icon and text
 */

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_button'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Button',bbbfly.Button);
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.Button
 * @extends bbbfly.Frame.Definition
 *
 * @description Button control definition
 */