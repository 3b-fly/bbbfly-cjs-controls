/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.button = {};
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
bbbfly.button._setIcon = function(node,proxy,align,state,indent){
  if(!node || !proxy){return;}

  var width = Number.isInteger(proxy.W) ? proxy.W : 0;
  var height = Number.isInteger(proxy.H) ? proxy.H : 0;
  if(!Number.isInteger(indent)){indent = 0;}

  var pos = {L:null,T:null,R:null,B:null};
  var margin = {L:null,T:null};

  switch(align){
    case bbbfly.Btn.iconalign.left:
      pos.L = indent;
      margin.T = Math.floor(height/2);
      pos.T = '50%';
    break;
    case bbbfly.Btn.iconalign.top:
      pos.T = indent;
      margin.L = Math.floor(width/2);
      pos.L = '50%';
    break;
    case bbbfly.Btn.iconalign.right:
      pos.R = indent;
      margin.T = Math.floor(height/2);
      pos.T = '50%';
    break;
    case bbbfly.Btn.iconalign.bottom:
      pos.B = indent;
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
  ngc_PtrEvents(this,'btn',['tap','doubletap']);

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
  this.DoUpdate.callParent(node);

  var hNode = document.getElementById(this.ID+'_H');
  var iNode = document.getElementById(this.ID+'_I');
  if(!node || !hNode){return;}

  var state = this.GetState();
  var text = this.GetText();
  var icon = this.GetIcon();

  var hasText = !!(String.isString(text) && text);
  var hasClick = !!(this.Enabled && !this.ReadOnly && this.OnClick);
  var hasDblClick = !!(this.Enabled && !this.ReadOnly && this.OnDblClick);

  var over = state.mouseover;
  state.mouseover = false;

  var hPadding = this.GetFrameDims();
  var hPosition = {L:null,T:null,R:null,B:null};
  var hPosSet = false;

  var iProxy = bbbfly.Renderer.ImageProxy(icon,state,this.ID+'_I');
  var indent = Number.isInteger(this.Indent) ? this.Indent : 0;

  var iIndent = indent;
  var tIndent = (hasText ? indent : 0);

  var iSize = {
    W: Number.isInteger(iProxy.W) ? iProxy.W : 0,
    H: Number.isInteger(iProxy.H) ? iProxy.H : 0
  };

  switch(this.IconAlign){
    case bbbfly.Btn.iconalign.left:
      if(iSize.W){
        hPosSet = true;
        hPosition.L = 0;
        iIndent += hPadding.L;
        hPadding.L += iSize.W + tIndent;
      }
    break;
    case bbbfly.Btn.iconalign.top:
      if(iSize.H){
        hPosSet = true;
        hPosition.T = 0;
        iIndent += hPadding.T;
        hPadding.T += iSize.H + tIndent;
      }
    break;
    case bbbfly.Btn.iconalign.right:
      if(iSize.W){
        hPosSet = true;
        hPosition.R = 0;
        iIndent += hPadding.R;
        hPadding.R += iSize.W + tIndent;
      }
    break;
    case bbbfly.Btn.iconalign.bottom:
      if(iSize.H){
        hPosSet = true;
        hPosition.B = 0;
        iIndent += hPadding.B;
        hPadding.B += iSize.H + tIndent;
      }
    break;
  }

  if(iNode){
    bbbfly.button._setIcon(
      iNode,iProxy,this.IconAlign,state,iIndent
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

  switch(this.Autosize){
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

  var cursor = ((hasClick || hasDblClick) ? 'pointer' : 'default');
  node.style.cursor = cursor;

  hNode.style.minWidth = bbbfly.Renderer.StyleDim(iSize.W);
  hNode.style.minHeight = bbbfly.Renderer.StyleDim(iSize.H);
  hNode.style.marginLeft = bbbfly.Renderer.StyleDim(hPadding.L + indent);
  hNode.style.marginTop = bbbfly.Renderer.StyleDim(hPadding.T + indent);
  hNode.style.marginRight = bbbfly.Renderer.StyleDim(hPadding.R + indent);
  hNode.style.marginBottom = bbbfly.Renderer.StyleDim(hPadding.B + indent);
  hNode.style.left = bbbfly.Renderer.StyleDim(hPosition.L);
  hNode.style.top = bbbfly.Renderer.StyleDim(hPosition.T);
  hNode.style.right = bbbfly.Renderer.StyleDim(hPosition.R);
  hNode.style.bottom = bbbfly.Renderer.StyleDim(hPosition.B);

  this._IconProxy = iProxy;
  state.mouseover = over;

  if(html !== this._HolderHtml){
    this._HolderHtml = html;
    hNode.innerHTML = html;

    if(over){
      bbbfly.Renderer.UpdateImageHTML(iProxy,state);
    }
  }

  if(this.Autosize){
    var bounds = {};
    ng_BeginMeasureElement(hNode);

    if(this.Autosize & bbbfly.Btn.autosize.horizontal){
      bounds.W = ng_OuterWidth(hNode);
    }
    if(this.Autosize & bbbfly.Btn.autosize.vertical){
      bounds.H = ng_OuterHeight(hNode);
    }

    ng_EndMeasureElement(hNode);
    this.SetBounds(bounds);
  }
};
bbbfly.button._doUpdateImages = function(){
  var proxy = this._IconProxy;
  var state = this.GetState();

  bbbfly.Renderer.UpdateImageProxy(proxy,state);
  bbbfly.Renderer.UpdateImageHTML(proxy,state);

  this.DoUpdateImages.callParent();
};

bbbfly.button._doPtrClick = function(ptrInfo){
  if(ptrInfo.EventID !== 'btn'){return;}
  this.Click(ptrInfo.Event);
};

bbbfly.button._doPtrDblClick = function(ptrInfo){
  if(ptrInfo.EventID !== 'btn'){return;}
  this.DblClick(ptrInfo.Event);
};

bbbfly.button._click = function(event){
  if(!this.Enabled || this.ReadOnly){return;}

  if(
    Function.isFunction(this.OnClick)
    && !this.OnClick(event)
  ){return;}

  if(this.SelectType & bbbfly.Btn.selecttype.click){
    this.SetSelected(!this.Selected);
  }
};

bbbfly.button._dblClick = function(event){
  if(!this.Enabled || this.ReadOnly){return;}

  if(
    Function.isFunction(this.OnDblClick)
    && !this.OnDblClick(event)
  ){return;}

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
      Text: null,
      TextRes: null,
      TextAlign: bbbfly.Btn.textalign.left,

      Icon: null,
      IconAlign: bbbfly.Btn.iconalign.left,

      Indent: 0,
      Autosize: bbbfly.Btn.autosize.none,
      SelectType: bbbfly.Btn.selecttype.none,

      Multiline: false,
      HTMLEncode: true,

      _IconProxy: null,
      _HolderHtml: ''
    },
    Events: {
      OnClick: null,
      OnDblClick: null
    },
    Methods: {
      DoCreate: bbbfly.button._doCreate,
      DoUpdate: bbbfly.button._doUpdate,
      DoUpdateImages: bbbfly.button._doUpdateImages,
      DoPtrClick: bbbfly.button._doPtrClick,
      DoPtrDblClick: bbbfly.button._doPtrDblClick,
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
