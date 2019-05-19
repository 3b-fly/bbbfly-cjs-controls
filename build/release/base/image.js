/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var bbbfly=bbbfly||{};bbbfly.imagepreview={};bbbfly.imagepreview._getImgHolder=function(){return this.Controls.Image.GetControlsHolder()};
bbbfly.imagepreview._getImgNode=function(){var a=this.GetImgHolder();if(!a||!String.isString(a.ID))return null;var b=a.ID+"_IMG",c=document.getElementById(b);if(!c){a=a.Elm();if(!a)return null;ng_SetInnerHTML(a,'<img id="'+b+'" style="position:absolute;left:50%;top:50%;max-width:100%;max-height:100%;background-color:transparent"/>');if(c=document.getElementById(b))c.onload=function(){this.style.marginLeft=Number.isNumber(this.width)?-(this.width/2)+"px":"0px";this.style.marginTop=Number.isNumber(this.height)?
-(this.height/2)+"px":"0px"}}return c};bbbfly.imagepreview._setImage=function(a){var b=this.GetImgNode();b&&(b.src="",String.isString(a)&&(b.src=a))};bbbfly.imagepreview._onCreated=function(a){String.isString(a.ImgUrl)&&a.SetImage(a.ImgUrl);return!0};
bbbfly.ImagePreview=function(a,b,c){a=a||{};ng_MergeDef(a,{ParentReferences:!1,Data:{ImgUrl:null},OnCreated:bbbfly.imagepreview._onCreated,Controls:{Image:{Type:"bbbfly.Frame",L:0,R:0,T:0,B:0}},Methods:{GetImgHolder:bbbfly.imagepreview._getImgHolder,GetImgNode:bbbfly.imagepreview._getImgNode,SetImage:bbbfly.imagepreview._setImage}});return ngCreateControlAsType(a,"bbbfly.Frame",b,c)};ngUserControls=ngUserControls||[];
ngUserControls.bbbfly_image={OnInit:function(){ngRegisterControlType("bbbfly.ImagePreview",bbbfly.ImagePreview)}};
