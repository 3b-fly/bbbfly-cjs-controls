/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.text = {};

bbbfly.text._setAlt = function(alt,update){
  if(!String.isString(alt) && (alt !== null)){return;}

  if(alt !== this.Alt){
    this.Alt = alt;

    if(!Boolean.isBoolean(update) || update){
      this.Update();
    }
  }
};

bbbfly.text._setText = function(text,update){
  if(!String.isString(text) && (text !== null)){return;}

  if(text !== this.Text){
    this.Text = text;

    if(!Boolean.isBoolean(update) || update){
      this.Update();
    }
  }
};
bbbfly.text._getAlt = function(){
  if(String.isString(this.AltRes)){
    return ngTxt(this.AltRes);
  }
  else if(String.isString(this.Alt)){
    return this.Alt;
  }
  return null;
};
bbbfly.text._getText = function(){
  if(String.isString(this.Text)){
    return this.Text;
  }
  else if(String.isString(this.TextRes)){
    return ngTxt(this.TextRes);
  }
  return null;
};
bbbfly.text._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);

  var tNode = document.createElement('SPAN');
  tNode.id = this.ID+'_T';
  tNode.className = 'Text';

  tNode.style.display = 'block';
  tNode.style.position = 'absolute';
  tNode.style.wordWrap = 'normal';
  node.appendChild(tNode);
};
bbbfly.text._doUpdate = function(node){
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

  this.DoUpdateText();
  this.DoAutoSize();
};
bbbfly.text._doUpdateText = function(){
  var tNode = document.getElementById(this.ID+'_T');
  if(!tNode){return;}

  var text = this.GetText();
  var hasText = !!(String.isString(text) && text);
  var tPosition = {L:null,T:null,R:null,B:null};

  var float = '';
  var textAlign = 'center';
  var whiteSpace = 'normal';

  if(hasText){
    if(this.HTMLEncode){text = ng_htmlEncode(text,true);}
    if(!this.MultiLine){whiteSpace = 'nowrap';}

    switch(this.TextAlign){
      case bbbfly.Text.textalign.right:
        float = 'right';
        textAlign = 'right';
        tPosition.R = 0;
      break;
      case bbbfly.Text.textalign.center:
        float = 'none';
        textAlign = 'center';
        tPosition.L = 0;
      break;
      default:
        float = 'left';
        textAlign = 'left';
        tPosition.L = 0;
      break;
    }
  }

  switch(this.AutoSize){
    case bbbfly.Text.autosize.both:
    break;
    case bbbfly.Text.autosize.horizontal:
      tPosition.T = 0;
      tPosition.B = 0;
    break;
    case bbbfly.Text.autosize.vertical:
      tPosition.L = 0;
      tPosition.R = 0;
    break;
    default:
      tPosition.L = 0;
      tPosition.T = 0;
      tPosition.R = 0;
      tPosition.B = 0;
    break;
  }

  if(this.Selectable){tNode.removeAttribute('unselectable');}
  else{tNode.setAttribute('unselectable','on');}

  tNode.style.float = float;
  tNode.style.textAlign = textAlign;
  tNode.style.whiteSpace = whiteSpace;

  tNode.style.left = bbbfly.Renderer.StyleDim(tPosition.L);
  tNode.style.top = bbbfly.Renderer.StyleDim(tPosition.T);
  tNode.style.right = bbbfly.Renderer.StyleDim(tPosition.R);
  tNode.style.bottom = bbbfly.Renderer.StyleDim(tPosition.B);

  tNode.innerHTML = (hasText) ? text : '';
};
bbbfly.text._doAutoSize = function(){
  var tNode = document.getElementById(this.ID+'_T');

  if(this.AutoSize && tNode){
    var bounds = {};
    ng_BeginMeasureElement(tNode);

    if(this.AutoSize & bbbfly.Text.autosize.horizontal){
      bounds.W = ng_OuterWidth(tNode);
    }
    if(this.AutoSize & bbbfly.Text.autosize.vertical){
      bounds.H = ng_OuterHeight(tNode);
    }

    ng_EndMeasureElement(tNode);
    this.SetBounds(bounds);
  }
};
bbbfly.Text = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Alt: null,
      AltRes: null,

      Text: null,
      TextRes: null,
      TextAlign: bbbfly.Text.textalign.left,

      AutoSize: bbbfly.Text.autosize.none,

      MultiLine: false,
      HTMLEncode: true,
      Selectable: true
    },
    Methods: {
      DoCreate: bbbfly.text._doCreate,
      DoUpdate: bbbfly.text._doUpdate,
      DoUpdateText: bbbfly.text._doUpdateText,
      DoAutoSize: bbbfly.text._doAutoSize,
      SetAlt: bbbfly.text._setAlt,
      SetText: bbbfly.text._setText,
      GetAlt: bbbfly.text._getAlt,
      GetText: bbbfly.text._getText
    }
  });

  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'bbbfly.Panel',ref,parent);
};
bbbfly.Text.textalign = {
  left: 1,
  center: 2,
  right: 3
};
bbbfly.Text.autosize = {
  none: 0,
  horizontal: 1,
  vertical: 2,
  both: 3
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_text'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Text',bbbfly.Text);
  }
};