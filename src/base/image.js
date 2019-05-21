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
bbbfly.imagepreview = {};

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
 * @description
 *   Displays image of any dimensions.
 *
 * @inpackage image
 *
 * @param {object} [def=undefined] - Descendant definition
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
    ngRegisterControlType('bbbfly.ImagePreview',bbbfly.ImagePreview);
  }
};