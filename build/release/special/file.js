/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
 */
var bbbfly=bbbfly||{};bbbfly.fileuploader={};bbbfly.fileuploader._onItemsChanged=function(a,c){a=this.ParentControl;var b=0<c.length;this.SetInvalid(!b);this.Owner.BtnRemoveFiles.SetEnabled(b);"function"===typeof a.OnFilesChanged&&a.OnFilesChanged(c)};bbbfly.fileuploader._onShowWaiting=function(a){a=a.Controls.ProgressPanel;a.Controls.ProgressBar.SetPosition(0);a.SetVisible(!0)};bbbfly.fileuploader._onHideWaiting=function(a){(a=a.Controls.ProgressPanel)&&a.SetVisible(!1)};
bbbfly.fileuploader._onUploadProgress=function(a,c){a=a.Controls.ProgressPanel.Controls.ProgressBar;"number"!==typeof c&&(c=0);a.SetPosition(c)};bbbfly.fileuploader._onGetAddBtnText=function(){return 1<this.Owner.Owner.MaxFilesCount?ngTxt("bbbfly_fileuploader_add_more"):ngTxt("bbbfly_fileuploader_add_one")};bbbfly.fileuploader._onGetRemoveBtnText=function(){return 1<this.Owner.Owner.MaxFilesCount?ngTxt("bbbfly_fileuploader_remove_more"):ngTxt("bbbfly_fileuploader_remove_one")};
bbbfly.fileuploader._onGetProgressText=function(){return 1===this.ParentControl.ParentControl.MaxFilesCount?ngTxt("bbbfly_fileuploader_upload_one"):ngTxt("bbbfly_fileuploader_upload_more")};
bbbfly.fileuploader._showError=function(a){if("function"===typeof this.DoShowError){Array.isArray(a)||(a=Array(a));var c="";switch(this.ErrorLevel){case bbbfly.FileUploader.error.minimal:a=0<a.length?""+a.length+"x":"";var b=ngTxt("bbbfly_fileuploader_error_min_general");c+=b.replace("%errs%",a);break;case bbbfly.FileUploader.error.grouped:var d={},e;for(e in a)if(b=a[e],"object"===typeof b){var f=b.Name;b=b.Error;f&&b&&b.Message&&(d[b.Message]||(d[b.Message]=[]),d[b.Message].push(f))}for(e in d)switch(a=
0<d[e].length?""+d[e].length+"x":"",e){case "ngfup_Error_General":b=ngTxt("bbbfly_fileuploader_error_grp_general");c+=b.replace("%errs%",a)+"\n";break;case "ngfup_Error_Extension":a=bbbfly.fileuploader._fileNameExtsToString(d[e]);b=ngTxt("bbbfly_fileuploader_error_grp_extension");c+=b.replace("%exts%",a)+"\n";break;case "ngfup_Error_Size":var g=bbbfly.fileuploader._maxSize(this.MaxFileSize);b=ngTxt("bbbfly_fileuploader_error_grp_maxsize");c+=b.replace("%size%",g).replace("%errs%",a)+"\n";break;case "ngfup_Error_MaxBatch":g=
bbbfly.fileuploader._maxSize(this.MaxBatchSize);b=ngTxt("bbbfly_fileuploader_error_grp_batch");c+=b.replace("%size%",g).replace("%errs%",a)+"\n";break;case "ngfup_Error_MaxFiles":f=bbbfly.fileuploader._maxCnt(this.MaxFilesCount),b=ngTxt("bbbfly_fileuploader_error_grp_maxcnt"),c+=b.replace("%cnt%",f).replace("%errs%",a)+"\n"}break;case bbbfly.FileUploader.error.fulllog:for(e in a)if(b=a[e],"object"===typeof b&&(f=b.Name,b=b.Error,f&&b&&b.Message))switch(b.Message){case "ngfup_Error_General":b=ngTxt("bbbfly_fileuploader_error_full_general");
c+=b.replace("%file%",f)+"\n";break;case "ngfup_Error_Extension":b=ngTxt("bbbfly_fileuploader_error_full_extension");c+=b.replace("%file%",f)+"\n";break;case "ngfup_Error_Size":g=bbbfly.fileuploader._maxSize(this.MaxFileSize);b=ngTxt("bbbfly_fileuploader_error_full_maxsize");c+=b.replace("%file%",f).replace("%size%",g)+"\n";break;case "ngfup_Error_MaxBatch":g=bbbfly.fileuploader._maxSize(this.MaxBatchSize);b=ngTxt("bbbfly_fileuploader_error_full_batch");c+=b.replace("%size%",g)+"\n";break;case "ngfup_Error_MaxFiles":f=
bbbfly.fileuploader._maxCnt(this.MaxFilesCount),b=ngTxt("bbbfly_fileuploader_error_full_maxcnt"),c+=b.replace("%cnt%",f)+"\n"}}this.DoShowError(c)}};bbbfly.fileuploader._fileNameExtsToString=function(a){var c=[],b;for(b in a){var d=a[b];d="string"===typeof d?d.substring(d.indexOf(".")):"";c[d]?c[d]++:c[d]=1}a="";for(var e in c)a+=(a?", ":"")+c[e]+"x "+e;return a};bbbfly.fileuploader._hasFilesToRemove=function(){if(this.SelectFileType===ngFupSelect_None){var a=this.Controls.ListFiles;return a&&0<a.Items.length}return this.HasFilesToRemove.callParent()};
bbbfly.fileuploader._getFilesToRemove=function(){if(this.SelectFileType===ngFupSelect_None){var a=this.Controls.ListFiles;return a?a.Items:[]}return this.GetFilesToRemove.callParent()};bbbfly.fileuploader._maxSize=function(a){if("number"===typeof a){var c=["B","kB","MB","GB"],b;for(b in c){if(1E3>a)return"("+Math.floor(10*a)/10+c[b]+")";a/=1E3}}return""};bbbfly.fileuploader._maxCnt=function(a){return"number"===typeof a?" ("+Math.floor(a)+")":""};
bbbfly.FileUploader=function(a,c,b){a=a||{};ng_MergeDef(a,{Data:{ErrorLevel:bbbfly.FileUploader.error.grouped,SelectFileType:a.Data&&1===a.Data.MaxFilesCount?ngFupSelect_None:ngFupSelect_Select},Controls:{Buttons:{style:{zIndex:1},Controls:{BtnAddFile:{Events:{OnGetText:bbbfly.fileuploader._onGetAddBtnText}},BtnRemoveFiles:{Events:{OnGetText:bbbfly.fileuploader._onGetRemoveBtnText}}}},ListFiles:{Type:"bbbfly.List",style:{zIndex:1},Data:{Invalid:!0},Events:{OnItemsChanged:bbbfly.fileuploader._onItemsChanged}},
DragAndDropPanel:{style:{zIndex:2}},ProgressPanel:{Type:"ngPanel",L:0,R:0,T:0,B:0,style:{zIndex:3},ParentReferences:!1,Data:{Visible:!1},Controls:{ProgressBar:{Type:"ngProgressBar"},ProgressMessage:{Type:"ngText",Events:{OnGetText:bbbfly.fileuploader._onGetProgressText}}}}},Events:{OnShowWaiting:bbbfly.fileuploader._onShowWaiting,OnHideWaiting:bbbfly.fileuploader._onHideWaiting,OnUploadProgress:bbbfly.fileuploader._onUploadProgress,OnFilesChanged:null},Methods:{ShowError:bbbfly.fileuploader._showError,
HasFilesToRemove:bbbfly.fileuploader._hasFilesToRemove,GetFilesToRemove:bbbfly.fileuploader._getFilesToRemove,DoShowError:null}});return ngCreateControlAsType(a,"ngFileUploader",c,b)};bbbfly.FileUploader.error={minimal:1,grouped:2,fulllog:4};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_fileuploader={OnInit:function(){ngRegisterControlType("bbbfly.FileUploader",bbbfly.FileUploader)}};
