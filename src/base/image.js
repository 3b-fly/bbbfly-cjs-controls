/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage image
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.image = {};
/** @ignore */
bbbfly.imagepreview = {};

/** @ignore */
bbbfly.image._doCreate = function(def,ref,node){
  this.DoCreate.callParent(def,ref,node);

  var icon = document.createElement('DIV');
  icon.id = this.ID+'_I';

  icon.style.zIndex = 3;
  icon.style.visibility = 'hidden';
  node.appendChild(icon);
};

/** @ignore */
bbbfly.image._getImage = function(){
  return (Object.isObject(this.Image) ? this.Image : {});
};

/** @ignore */
bbbfly.image._doUpdate = function(node){
  if(!node){return;}

  this.DoUpdateImage();

  this.DoUpdate.callParent(node);
};

/** @ignore */
bbbfly.image._doUpdateImage = function(){
  var iNode = document.getElementById(this.ID+'_I');

  var image = this.GetImage();
  var state = this.GetState();

  var over = state.mouseover;
  state.mouseover = false;

  var proxy = bbbfly.Renderer.ImageProxy(
    image,state,this.ID+'_I'
  );

  var indent = this.GetFrameDims();
  var iWidth = Number.isInteger(proxy.W) ? proxy.W : 0;
  var iHeight = Number.isInteger(proxy.H) ? proxy.H : 0;

  if(iNode){
    bbbfly.Renderer.SetImage(
      iNode,proxy,
      indent.L,indent.T,
      indent.R,indent.B,
      state,'Image'
    );

    iNode.style.visibility = (iWidth && iHeight)
      ? 'visible' : 'hidden';
  }

  this._ImageProxy = proxy;
  state.mouseover = over;

  if(over){bbbfly.Renderer.UpdateImageHTML(proxy,state);}

  var cWidth = iWidth+indent.L+indent.R;
  var cHeight = iHeight+indent.T+indent.B;
  this.SetBounds({ W:cWidth,H:cHeight});
};

/** @ignore */
bbbfly.image._doMouseEnter = function(event,options){
  var state = this.DoMouseEnter.callParent(event,options);
  var proxy = this._ImageProxy;

  bbbfly.Renderer.UpdateImageHTML(proxy,state);
  return state;
};

/** @ignore */
bbbfly.image._doMouseLeave = function(event,options){
  var state = this.DoMouseLeave.callParent(event,options);
  var proxy = this._ImageProxy;

  bbbfly.Renderer.UpdateImageHTML(proxy,state);
  return state;
};

/** @ignore */
bbbfly.imagepreview._getImgHolder = function(){
  var imgCtrl = this.Controls.Image;
  return imgCtrl.GetControlsHolder();
};

/** @ignore */
bbbfly.imagepreview._getImgNode = function(){
  var holder = this.GetImgHolder();
  if(!holder || !String.isString(holder.ID)){return null;}

  var imgId = holder.ID+'_IMG';
  var imgNode = document.getElementById(imgId);

  if(!imgNode){
    var holderNode = holder.Elm();
    if(!holderNode){return null;}

    ng_SetInnerHTML(holderNode,
      '<img id="'+imgId+'" style="'
        +'position:absolute;left:50%;top:50%;'
        +'max-width:100%;max-height:100%;'
        +'background-color:transparent"'
      +'/>'
    );

    imgNode = document.getElementById(imgId);
    if(imgNode){
      imgNode.onload = function() {
        this.style.marginLeft = Number.isNumber(this.width)
          ? -(this.width/2)+'px' : '0px';
        this.style.marginTop = Number.isNumber(this.height)
          ? -(this.height/2)+'px' : '0px';
      };
    }
  }
  return imgNode;
};

/** @ignore */
bbbfly.imagepreview._setImage = function(url){
  var imgNode = this.GetImgNode();
  if(imgNode){
    imgNode.src = '';
    if(String.isString(url)){
      imgNode.src = url;
    }
  }
};

/** @ignore */
bbbfly.imagepreview._onCreated = function(ctrl){
  if(String.isString(ctrl.ImgUrl)){
    ctrl.SetImage(ctrl.ImgUrl);
  }
  return true;
};

/**
 * @class
 * @type control
 * @extends bbbfly.Frame
 *
 * @inpackage image
 *
 * @param {bbbfly.Edit.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {bbbfly.Renderer.image} [Icon=null] - Image definition
 */
bbbfly.Image = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Image: null,

      /** @private */
      _ImageProxy: null
    },
    Methods: {
      /** @private */
      DoCreate: bbbfly.image._doCreate,
      /** @private */
      DoUpdate: bbbfly.image._doUpdate,
      /** @private */
      DoUpdateImage: bbbfly.image._doUpdateImage,
      /** @private */
      DoMouseEnter: bbbfly.image._doMouseEnter,
      /** @private */
      DoMouseLeave: bbbfly.image._doMouseLeave,

      /**
       * @function
       * @name GetImage
       * @memberof bbbfly.Btn#
       *
       * @return {bbbfly.Renderer.image} Image definition
       */
      GetImage: bbbfly.image._getImage
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};

/**
 * @class
 * @type control
 * @extends bbbfly.Frame
 *
 * @description
 *   Displays image of any dimensions.
 *
 * @inpackage image
 *
 * @param {bbbfly.Frame.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {url} [ImgUrl=null] - Image url
 */
bbbfly.ImagePreview = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    ParentReferences: false,
    Data: { ImgUrl: null },
    OnCreated: bbbfly.imagepreview._onCreated,
    Controls: {
      Image: {
        Type: 'bbbfly.Panel',
        L:0,R:0,T:0,B:0
      }
    },
    Methods: {
      /** @ignore */
      GetImgHolder: bbbfly.imagepreview._getImgHolder,
      /** @ignore */
      GetImgNode: bbbfly.imagepreview._getImgNode,
      /**
       * @function
       * @name SetImage
       * @memberof bbbfly.ImagePreview#
       *
       * @param {url} url - Image url
       */
      SetImage: bbbfly.imagepreview._setImage
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_image'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Image',bbbfly.Image);
    ngRegisterControlType('bbbfly.ImagePreview',bbbfly.ImagePreview);
  }
};