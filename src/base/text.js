/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage text
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.text = {};

bbbfly.text._setText = function(text,update){
  if(!String.isString(text) && (text !== null)){return;}

  if(text !== this.Text){
    this.Text = text;

    if(!Boolean.isBoolean(update) || update){
      this.Update();
    }
  }
};

/** @ignore */
bbbfly.text._getText = function(){
  if(String.isString(this.Text)){
    return this.Text;
  }
  else if(String.isString(this.TextRes)){
    return ngTxt(this.TextRes);
  }
  return null;
};

/** @ignore */
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

/** @ignore */
bbbfly.text._doUpdate = function(node){
  if(!this.DoUpdate.callParent(node)){return false;}

  this.DoUpdateText();
  this.DoAutoSize();
  return true;
};

/** @ignore */
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
      //let stretch
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

/** @ignore */
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

/**
 * @class
 * @type control
 * @extends bbbfly.Frame
 * @implements bbbfly.hint.Hintified
 *
 * @description
 *   Basic text Control.
 *   Implements {@link bbbfly.hint.Hintified|Hintified} interface
 *   if {@link package:hint|hint} package is inluded.
 *
 * @inpackage text
 *
 * @param {bbbfly.Text.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [Text=null] - Text string
 * @property {string} [TextRes=null] - Text resource ID
 * @property {bbbfly.Text.textalign} [TextAlign=left]

 * @property {bbbfly.Text.autosize} [AutoSize=none]
 *
 * @property {boolean} [MultiLine=false]
 * @property {boolean} [Selectable=true]
 */
bbbfly.Text = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Text: null,
      TextRes: null,
      TextAlign: bbbfly.Text.textalign.left,

      AutoSize: bbbfly.Text.autosize.none,

      MultiLine: false,
      Selectable: true
    },
    Methods: {
      /** @private */
      DoCreate: bbbfly.text._doCreate,
      /** @private */
      DoUpdate: bbbfly.text._doUpdate,
      /** @private */
      DoUpdateText: bbbfly.text._doUpdateText,
      /** @private */
      DoAutoSize: bbbfly.text._doAutoSize,

      /**
       * @function
       * @name SetText
       * @memberof bbbfly.Text#
       *
       * @param {string|null} text
       * @param {boolean} [update=true]
       */
      SetText: bbbfly.text._setText,

      /**
       * @function
       * @name GetText
       * @memberof bbbfly.Text#
       *
       * @return {string|null}
       */
      GetText: bbbfly.text._getText
    }
  });

  if(bbbfly.hint){bbbfly.hint.Hintify(def);}
  return ngCreateControlAsType(def,'bbbfly.Panel',ref,parent);
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.Text|bbbfly.Text.TextAlign}
 */
bbbfly.Text.textalign = {
  left: 1,
  center: 2,
  right: 3
};

/**
 * @enum {bitmask}
 * @description
 *   Possible values for {@link bbbfly.Text|bbbfly.Text.AutoSize}
 */
bbbfly.Text.autosize = {
  none: 0,
  horizontal: 1,
  vertical: 2,
  both: 3
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_text'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Text',bbbfly.Text);
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.Text
 * @extends bbbfly.Frame.Definition
 *
 * @description Text control definition
 */
