/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.imagepreview = {};
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
bbbfly.imagepreview._setImage = function(url){
  var imgCtrl = this.Controls.Image;

  var imgNode = bbbfly.imagepreview._getImageNode(imgCtrl);
  if(!imgNode){return;}

  imgNode.src = '';
  if(typeof url === 'string'){
    imgNode.src = url;
  }
};
bbbfly.imagepreview._onCreated = function(preview){
  if(typeof preview.ImgUrl === 'string'){
    preview.SetImage(preview.ImgUrl);
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
        Type: 'ngPanel',
        L:0,R:0,T:0,B:0
      }
    },
    Methods: {
      SetImage: bbbfly.imagepreview._setImage
    }
  });

  return ngCreateControlAsType(def,'ngGroup',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_image'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.ImagePreview',bbbfly.ImagePreview);
  }
};