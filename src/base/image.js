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

  icon.style.zIndex = 300;
  icon.style.visibility = 'hidden';
  node.appendChild(icon);
};

/** @ignore */
bbbfly.image._setAlt = function(alt,update){
  if(!String.isString(alt) && (alt !== null)){return;}

  if(alt !== this.Alt){
    this.Alt = alt;

    if(!Boolean.isBoolean(update) || update){
      this.Update();
    }
  }
};

/** @ignore */
bbbfly.image._setImage = function(img,update){
  if(!Object.isObject(img) && (img !== null)){return;}

  if(img !== this.Image){
    this.Image = img;

    if(!Boolean.isBoolean(update) || update){
      this.Update();
    }
  }
};

/** @ignore */
bbbfly.image._getAlt = function(){
  if(String.isString(this.AltRes)){
    return ngTxt(this.AltRes);
  }
  else if(String.isString(this.Alt)){
    return this.Alt;
  }
  return null;
};

/** @ignore */
bbbfly.image._getImage = function(){
  return (Object.isObject(this.Image) ? this.Image : null);
};

/** @ignore */
bbbfly.image._doUpdate = function(node){
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

  this.DoUpdateImage();
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
  this.SetBounds({W:cWidth,H:cHeight});
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
 * @param {bbbfly.Image.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [Alt=null] - Alt string
 * @property {string} [AltRes=null] - Alt  resource ID
 *
 * @property {bbbfly.Renderer.image} [Image=null] - Image definition
 * @property {boolean} [HTMLEncode=true]
 */
bbbfly.Image = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      Alt: null,
      AltRes: null,

      Image: null,
      HTMLEncode: true,

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
       * @name SetAlt
       * @memberof bbbfly.Image#
       *
       * @param {string|null} alt
       * @param {boolean} [update=true]
       */
      SetAlt: bbbfly.image._setAlt,
      /**
       * @function
       * @name SetImage
       * @memberof bbbfly.Image#
       *
       * @param {bbbfly.Renderer.image|null} img
       * @param {boolean} [update=true]
       */
      SetImage: bbbfly.image._setImage,

      /**
       * @function
       * @name GetAlt
       * @memberof bbbfly.Image#
       *
       * @return {string|null}
       */
      GetAlt: bbbfly.image._getAlt,

      /**
       * @function
       * @name GetImage
       * @memberof bbbfly.Image#
       *
       * @return {bbbfly.Renderer.image|null} Image definition
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
 * @param {bbbfly.ImagePreview.Definition} [def=undefined] - Descendant definition
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

/**
 * @interface Definition
 * @memberOf bbbfly.Image
 * @extends bbbfly.Frame.Definition
 *
 * @description Image control definition
 */

/**
 * @interface Definition
 * @memberOf bbbfly.ImagePreview
 * @extends bbbfly.Frame.Definition
 *
 * @description ImagePreview control definition
 */