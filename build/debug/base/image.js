/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.imagepreview = {};
bbbfly.imagepreview._getImgHolder = function(){
  var imgCtrl = this.Controls.Image;

  if(imgCtrl && Function.isFunction('GetControlsHolder')){
    return imgCtrl.GetControlsHolder();
  }
  return imgCtrl;
};
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
bbbfly.imagepreview._setImage = function(url){
  var imgNode = this.GetImgNode();
  if(imgNode){
    imgNode.src = '';
    if(String.isString(url)){
      imgNode.src = url;
    }
  }
};
bbbfly.imagepreview._onCreated = function(ctrl){
  if(String.isString(ctrl.ImgUrl)){
    ctrl.SetImage(ctrl.ImgUrl);
  }
  return true;
};
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
      GetImgHolder: bbbfly.imagepreview._getImgHolder,
      GetImgNode: bbbfly.imagepreview._getImgNode,
      SetImage: bbbfly.imagepreview._setImage
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Panel',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_image'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.ImagePreview',bbbfly.ImagePreview);
  }
};