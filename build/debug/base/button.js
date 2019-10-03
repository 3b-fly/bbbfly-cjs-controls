/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.button = {};
bbbfly.button._getAlt = function(){
  if(String.isString(this.AltRes)){
    return ngTxt(this.AltRes);
  }
  else if(String.isString(this.Alt)){
    return this.Alt;
  }
  return null;
};
bbbfly.button._getText = function(){
  if(String.isString(this.TextRes)){
    return ngTxt(this.TextRes);
  }
  else if(String.isString(this.Text)){
    return this.Text;
  }
  return null;
};
bbbfly.button._getIcon = function(){
  return (Object.isObject(this.Icon) ? this.Icon : {});
};
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

  this.DoUpdate.callParent(node);
};
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
bbbfly.button._doUpdateImages = function(){
  var proxy = this._IconProxy;
  var state = this.GetState();

  bbbfly.Renderer.UpdateImageProxy(proxy,state);
  bbbfly.Renderer.UpdateImageHTML(proxy,state);

  this.DoUpdateImages.callParent();
};
bbbfly.button._doMouseEnter = function(event,options){
  var state = this.DoMouseEnter.callParent(event,options);
  var proxy = this._IconProxy;

  bbbfly.Renderer.UpdateImageHTML(proxy,state);
  return state;
};
bbbfly.button._doMouseLeave = function(event,options){
  var state = this.DoMouseLeave.callParent(event,options);
  var proxy = this._IconProxy;

  bbbfly.Renderer.UpdateImageHTML(proxy,state);
  return state;
};
bbbfly.button._doAcceptCPGestures = function(elm, gestures){
  gestures.drag = false;
};
bbbfly.button._doAcceptGestures = function(elm, gestures){
  gestures.doubletap = true;
  gestures.tap = true;
};
bbbfly.button._doPtrClick = function(ptrInfo){
  if(ptrInfo.EventID !== 'control'){return;}
  this.Click(ptrInfo.Event);
};
bbbfly.button._doPtrDblClick = function(ptrInfo){
  if(ptrInfo.EventID !== 'control'){return;}
  this.DblClick(ptrInfo.Event);
};
bbbfly.button._click = function(event){
  if(!this.Enabled || this.ReadOnly){return;}

  if(Function.isFunction(this.OnClick)){
    this.OnClick(event);
  }
};
bbbfly.button._dblClick = function(event){
  if(!this.Enabled || this.ReadOnly){return;}

  if(Function.isFunction(this.OnDblClick)){
    this.OnDblClick(event);
  }
};
bbbfly.button._onClick = function(){
  if(this.SelectType & bbbfly.Btn.selecttype.click){
    this.SetSelected(!this.Selected);
  }
};
bbbfly.button._onDblClick = function(){
  if(this.SelectType & bbbfly.Btn.selecttype.dblclick){
    this.SetSelected(!this.Selected);
  }
};
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
bbbfly.button._ngDoUpdate = function(node){
  this.DoUpdate.callParent(node);

  var textNode = document.getElementById(this.ID+'_T');
  bbbfly.Renderer.UpdateHTMLState(textNode,this.GetState());
  return true;
};
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
      OnClick: bbbfly.button._onClick,
      OnDblClick: bbbfly.button._onDblClick
    },
    Methods: {
      DoCreate: bbbfly.button._doCreate,
      DoUpdate: bbbfly.button._doUpdate,
      DoUpdateHolder: bbbfly.button._doUpdateHolder,
      DoUpdateImages: bbbfly.button._doUpdateImages,
      DoMouseEnter: bbbfly.button._doMouseEnter,
      DoMouseLeave: bbbfly.button._doMouseLeave,
      DoAcceptGestures: bbbfly.button._doAcceptGestures,
      DoPtrClick: bbbfly.button._doPtrClick,
      DoPtrDblClick: bbbfly.button._doPtrDblClick,
      GetAlt: bbbfly.button._getAlt,
      GetText: bbbfly.button._getText,
      GetIcon: bbbfly.button._getIcon,
      Click: bbbfly.button._click,
      DblClick: bbbfly.button._dblClick
    }
  });

  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};
bbbfly.Btn.textalign = {
  left: 1,
  center: 2,
  right: 3
};
bbbfly.Btn.iconalign = {
  left: 1,
  top: 2,
  right: 3,
  bottom: 4
};
bbbfly.Btn.autosize = {
  none: 0,
  horizontal: 1,
  vertical: 2,
  both: 3
};
bbbfly.Btn.selecttype = {
  none: 0,
  click: 1,
  dblclick: 2,
  both: 3
};
bbbfly.Button = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngButton',ref,parent);
};
bbbfly.CheckBox = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngCheckBox',ref,parent);
};
bbbfly.RadioButton = function(def,ref,parent){
  def = bbbfly.button.NormalizeDef(def);
  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'ngRadioButton',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_strl_button'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Btn',bbbfly.Btn);
    ngRegisterControlType('bbbfly.Button',bbbfly.Button);
    ngRegisterControlType('bbbfly.CheckBox',bbbfly.CheckBox);
    ngRegisterControlType('bbbfly.RadioButton',bbbfly.RadioButton);
  }
};