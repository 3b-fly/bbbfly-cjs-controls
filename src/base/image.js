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
bbbfly.imagepreview._getImageNode = function(ctrl){
  if(!ctrl || (typeof ctrl.ID !== 'string')){return null;}
  
  var imgId = ctrl.ID+'_IMG';
  var imgNode = document.getElementById(imgId);

  if(!imgNode){
    var contentNode = ctrl.Elm();
    if(!contentNode){return null;}

    ng_SetInnerHTML(contentNode,
      '<img id="'+imgId+'" style="'
        +'position:absolute;left:50%;top:50%;'
        +'max-width:100%;max-height:100%;'
        +'background-color:transparent"'
      +'/>'
    );

    imgNode = document.getElementById(imgId);
    if(imgNode){
      imgNode.onload = function() {
        this.style.marginLeft = (typeof this.width === 'number')
          ? -(this.width/2)+'px' : '0px';
        this.style.marginTop = (typeof this.height === 'number')
          ? -(this.height/2)+'px' : '0px';
      };
    }
  }
  return imgNode;
};

/** @ignore */
bbbfly.imagepreview._setImage = function(url){
  var imgCtrl = this.Controls.Image;

  var imgNode = bbbfly.imagepreview._getImageNode(imgCtrl);
  if(!imgNode){return;}

  imgNode.src = '';
  if(typeof url === 'string'){
    imgNode.src = url;
  }
};

/** @ignore */
bbbfly.imagepreview._onCreated = function(preview){
  if(typeof preview.ImgUrl === 'string'){
    preview.SetImage(preview.ImgUrl);
  }
  return true;
};

/**
 * @class
 * @type control
 * @extends ngGroup
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
        Type: 'ngPanel',
        L:0,R:0,T:0,B:0
      }
    },
    Methods: {
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

  return ngCreateControlAsType(def,'ngGroup',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_image'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.ImagePreview',bbbfly.ImagePreview);
  }
};