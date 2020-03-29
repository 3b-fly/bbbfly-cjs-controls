/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/

var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,c,b){a!=Array.prototype&&a!=Object.prototype&&(a[c]=b.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,c,b,d){if(c){b=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var f=a[d];f in b||(b[f]={});b=b[f]}a=a[a.length-1];d=b[a];c=c(d);c!=d&&null!=c&&$jscomp.defineProperty(b,a,{configurable:!0,writable:!0,value:c})}};$jscomp.polyfill("Number.isFinite",function(a){return a?a:function(a){return"number"!==typeof a?!1:!isNaN(a)&&Infinity!==a&&-Infinity!==a}},"es6","es3");
$jscomp.polyfill("Number.isInteger",function(a){return a?a:function(a){return Number.isFinite(a)?a===Math.floor(a):!1}},"es6","es3");$jscomp.polyfill("Object.is",function(a){return a?a:function(a,b){return a===b?0!==a||1/a===1/b:a!==a&&b!==b}},"es6","es3");$jscomp.polyfill("Array.prototype.includes",function(a){return a?a:function(a,b){var c=this;c instanceof String&&(c=String(c));var f=c.length;for(b=b||0;b<f;b++)if(c[b]==a||Object.is(c[b],a))return!0;return!1}},"es7","es3");
$jscomp.checkStringArgs=function(a,c,b){if(null==a)throw new TypeError("The 'this' value for String.prototype."+b+" must not be null or undefined");if(c instanceof RegExp)throw new TypeError("First argument to String.prototype."+b+" must not be a regular expression");return a+""};$jscomp.polyfill("String.prototype.includes",function(a){return a?a:function(a,b){return-1!==$jscomp.checkStringArgs(this,a,"includes").indexOf(a,b||0)}},"es6","es3");var bbbfly=bbbfly||{};bbbfly.fileuploader={};
bbbfly.fileuploader._getRPC=function(){this._RPC||(this._RPC=this.CreateRPC());return this._RPC};bbbfly.fileuploader._getForm=function(){return this._Form};bbbfly.fileuploader._getIframe=function(){return this._Iframe};
bbbfly.fileuploader._updateForm=function(){var a=this.GetForm();if(a&&(a=a["files[]"])){var c="",b=!0;Array.isArray(this.AllowedExtensions)&&0<this.AllowedExtensions.length&&(c=this.AllowedExtensions.join(",."),""!==c&&(c="."+c));Number.isInteger(this.MaxFilesCount)&&(b=2>this.MaxFilesCount);a.accept=c;a.multiple=b}};
bbbfly.fileuploader._createRPC=function(){var a=new ngRPC("UploadFiles");a.nocache=!0;a.Type=rpcJSONPOST;a.OnHTTPRequest=bbbfly.fileuploader._onRPCUpload;a.OnReceivedJSON=bbbfly.fileuploader._onRPCUploaded;a.OnHTTPRequestFailed=bbbfly.fileuploader._onRPCUploadFailed;a.FileFormData=null;a.Owner=this;return a};
bbbfly.fileuploader._createForm=function(){var a=ngOpera&&12>ngOperaVersion;a=!(ngFireFox&&22>ngFireFoxVersion)&&!a;var c=document.createElement("form");c.setAttribute("id",this.ID+"_FO");c.setAttribute("target",this.ID+"_IF");c.setAttribute("action","");c.setAttribute("method","POST");c.setAttribute("enctype","multipart/form-data");c.style.cssText="position:absolute;margin:0px;padding:0px;left:0px;top:0px;width:100%;height:100%;filter: progid:DXImageTransform.Microsoft.Alpha(opacity=0);opacity:0;-moz-opacity:0;z-index:4;";
var b=document.createElement("input");b.setAttribute("id",this.ID+"_FO_I");b.setAttribute("name","files[]");b.setAttribute("type","file");b.setAttribute("size","100");b.style.cssText="position:absolute;margin:0px;padding:0px;left:-100%;top:0px;height:100%;width:"+(a?"100%":"200%")+";font-size:10000px;cursor:pointer !important;";var d=this;b.onchange=function(){bbbfly.fileuploader._onFormFilesChange(c,d)};c.appendChild(b);a&&(a=document.createElement("label"),a.setAttribute("id",this.ID+"_FO_L"),a.setAttribute("for",
this.ID+"_FO_I"),a.style.cssText="position:absolute;margin:0px;padding:0px;left:0px;top:0px;width:100%;height:100%;cursor:pointer !important;",c.appendChild(a));return this._Form=c};
bbbfly.fileuploader._createIframe=function(){var a=document.createElement("iframe");a._initialized=!1;a.setAttribute("id",this.ID+"_IF");a.setAttribute("name",this.ID+"_IF");a.setAttribute("scrolling","no");a.setAttribute("frameborder","0");a.style.cssText="position:absolute;width:1px;height:1px;left:-1px;top:-1px;overflow:hidden;border:0px;";var c=this;a.onload=function(){bbbfly.fileuploader._onIframeLoad(a,c)};return this._IFrame=a};
bbbfly.fileuploader._onCreated=function(a){var c=a.Elm();c&&(a=a.CreateIframe())&&c.appendChild(a)};bbbfly.fileuploader._onUpdated=function(){this.UpdateForm()};bbbfly.fileuploader._reset=function(){var a=this.Controls.FilesList;a&&a.Clear();a=0<this._Files.length;this._Files=[];this.Update();this.HideProgress();a&&Function.isFunction(this.OnFilesChanged)&&this.OnFilesChanged()};
bbbfly.fileuploader._isValid=function(){var a=this.GetUploadedFiles(),c=this.MinFilesCount,b=this.MaxFilesCount;return Number.isInteger(c)&&a.length<c||Number.isInteger(b)&&a.length>b?!1:!0};bbbfly.fileuploader._getUploadedFiles=function(){return Array.isArray(this._Files)?this._Files:[]};
bbbfly.fileuploader._getSelectedFiles=function(){var a=this.GetUploadedFiles(),c=this.Controls.FilesList,b={};if(1===this.MaxFilesCount&&1===a.length){var d=a[0];b[d.Id]=d;return b}if(c&&(a=c.GetSelected(),0<a.length)){for(d in a)(c=a[d])&&c.File&&(b[c.File.Id]=c.File);return b}return null};
bbbfly.fileuploader._onFormFilesChange=function(a,c){a||(a=c.GetForm());if(a){var b=[],d=a["files[]"];if(Array.isArray(d.files)){if(c.ValidateFiles(d.files))for(var f in d.files){var e=d.files[f];e.name&&b.push(e.name)}}else e=d.value,d=e.lastIndexOf("\\")+1,(e=e.substring(d,e.length))&&b.push(e);0<b.length&&c.UploadFiles(a);a.reset()}};
bbbfly.fileuploader._uploadFiles=function(a){a||(a=this.GetForm());if(a&&String.isString(this.UploadURL)){var c={id:this.FileUploadID,ts:(new Date).getTime()};Function.isFunction(this.OnGetRequestParams)&&this.OnGetRequestParams(c);var b="",d;for(d in c)b+=b?"&":"?",b+=encodeURIComponent(d)+"=",b+=encodeURIComponent(c[d]);if(window.FormData){var f=this.GetRPC();if(f){f.clearParams();f.FileFormData=new FormData(a);for(d in c)f.SetParam(d,c[d]);f.sendRequest(this.UploadURL+b);return}}this.ShowProgress(!0);
a.action=this.UploadURL+b;a.submit()}};bbbfly.fileuploader._onRPCUpload=function(a,c){if(!a.FileFormData)return!0;var b=this.Owner;c.XMLHttp.upload&&(b.ShowProgress(!1),c.XMLHttp.onload=function(){b.UpdateProgress(100)},c.XMLHttp.upload.onprogress=function(a){a.lengthComputable&&a.total&&b.UpdateProgress(a.loaded/a.total*100)});delete c.ReqHeaders["Content-type"];delete c.ReqHeaders["Content-length"];c.PostParams=a.FileFormData;return!0};
bbbfly.fileuploader._onRPCUploaded=function(a,c){Object.isObject(c)||Array.isArray(c)?(a=a.Owner,a.AddUploadedFiles(c),a.HideProgress()):bbbfly.fileuploader._onRPCUploadFailed(a)};bbbfly.fileuploader._onRPCUploadFailed=function(a){a=a.Owner;a.AddUploadedFiles({Error:bbbfly.FileUploader.errortype.main});a.HideProgress()};
bbbfly.fileuploader._onIframeLoad=function(a,c){if(c&&(a||(a=c.GetIframe()),a)){var b=a.contentDocument||a.contentWindow.document;if(b&&b.body)if(b=b.body.innerText,String.isString(b)||(b=""),""!==b||a._initialized){a=null;try{a=JSON.parse(b)}catch(d){}a||(a={Error:bbbfly.FileUploader.errortype.main});c.AddUploadedFiles(a);c.HideProgress()}else a._initialized=!0}};
bbbfly.fileuploader._validateFiles=function(a){var c=Number.isInteger(this.MaxFilesCount),b=Number.isInteger(this.MaxFileSize),d=Number.isInteger(this.MaxBatchSize),f=Array.isArray(this.AllowedExtensions),e=[];c&&this.GetUploadedFiles().length+a.length>this.MaxFilesCount&&e.push({Error:{Type:bbbfly.FileUploader.errortype.count,Data:this.MaxFilesCount}});if(1>e.length){c=0;if(b||d||f)for(var g in a){var h=a[g];if(Object.isObject(h)){var k=h.name;if(String.isString(k)&&(k=k.toLowerCase(),f)){var l=
k.lastIndexOf(".");l=0<=l?k.substr(l+1):null;if(!this.AllowedExtensions.includes(l)){e.push({Name:k,Error:{Type:bbbfly.FileUploader.errortype.extension,Data:this.AllowedExtensions.join(", ")}});continue}}(b||d)&&"undefined"!==typeof h.size&&(h=parseInt(h.size,10),d&&(c+=h),b&&h>this.MaxFileSize&&e.push({Name:k,Error:{Type:bbbfly.FileUploader.errortype.size,Data:this.MaxFileSize}}))}}1>e.length&&d&&c>this.MaxBatchSize&&e.push({Error:{Type:bbbfly.FileUploader.errortype.batch,Data:this.MaxBatchSize}});
if(0<e.length)return this.ShowError(e),!1}return!0};
bbbfly.fileuploader._addUploadedFiles=function(a){Object.isObject(a)&&(a=[a]);if(Array.isArray(a)){var c=this.GetUploadedFiles().length,b=[],d;for(d in a){var f=a[d];if(Object.isObject(f))if(a.Error)b.push({Name:f.Name,Error:f.Error});else if(Number.isInteger(this.MaxFilesCount)&&c+1>this.MaxFilesCount)b.push({Name:f.Name,Error:{Type:bbbfly.FileUploader.errortype.count,Data:this.MaxFilesCount}});else{var e={Id:f.Id,Name:f.Name};this._Files.push(e);var g=this.Controls.FilesList;g&&g.Add({ID:f.Id,File:e},
g);c+=1}}0<b.length&&this.ShowError(b);Function.isFunction(this.OnFilesChanged)&&this.OnFilesChanged();this.Update()}};
bbbfly.fileuploader._showError=function(a){if(Function.isFunction(this.DoShowError)){var c="";switch(this.ErrorLevel){case bbbfly.FileUploader.errorlevel.minimal:if(Object.isObject(a))c+=ngTxt("bbbfly_fileuploader_error_min_main");else if(Array.isArray(a)&&0<a.length){var b=ngTxt("bbbfly_fileuploader_error_min_general");c+=b.replace("%errs%",a.length+"x")}break;case bbbfly.FileUploader.errorlevel.grouped:Array.isArray(a)||(a=[a]);var d={},f;for(f in a){var e=a[f];if(Object.isObject(e)&&(b=e.Error,
Number.isInteger(b)&&(b={Type:b}),Object.isObject(b))){var g=e.Name;String.isString(g)||(g="?");b&&Number.isInteger(b.Type)&&(d[b.Type]||(d[b.Type]=[]),d[b.Type].push(g))}}for(f in d)switch(a=0<d[f].length?""+d[f].length+"x":"",f){case bbbfly.FileUploader.errortype.main:b=ngTxt("bbbfly_fileuploader_error_grp_main");c+=b+"\n";break;case bbbfly.FileUploader.errortype.general:b=ngTxt("bbbfly_fileuploader_error_grp_general");c+=b.replace("%errs%",a)+"\n";break;case bbbfly.FileUploader.errortype.extension:a=
bbbfly.fileuploader._fileNameExtsToString(d[f]);b=ngTxt("bbbfly_fileuploader_error_grp_extension");c+=b.replace("%exts%",a)+"\n";break;case bbbfly.FileUploader.errortype.size:e=bbbfly.fileuploader._maxSize(this.MaxFileSize);b=ngTxt("bbbfly_fileuploader_error_grp_maxsize");c+=b.replace("%size%",e).replace("%errs%",a)+"\n";break;case bbbfly.FileUploader.errortype.batch:e=bbbfly.fileuploader._maxSize(this.MaxBatchSize);b=ngTxt("bbbfly_fileuploader_error_grp_batch");c+=b.replace("%size%",e).replace("%errs%",
a)+"\n";break;case bbbfly.FileUploader.errortype.count:e=bbbfly.fileuploader._maxCnt(this.MaxFilesCount),b=ngTxt("bbbfly_fileuploader_error_grp_maxcnt"),c+=b.replace("%cnt%",e).replace("%errs%",a)+"\n"}break;case bbbfly.FileUploader.errorlevel.fulllog:for(f in Array.isArray(a)||(a=[a]),a)if(e=a[f],Object.isObject(e)&&(b=e.Error,Number.isInteger(b)&&(b={Type:b}),Object.isObject(b)))switch(g=e.Name,String.isString(g)||(g="?"),b.Type){case bbbfly.FileUploader.errortype.main:b=ngTxt("bbbfly_fileuploader_error_full_main");
c+=b+"\n";break;case bbbfly.FileUploader.errortype.general:b=ngTxt("bbbfly_fileuploader_error_full_general");c+=b.replace("%file%",g)+"\n";break;case bbbfly.FileUploader.errortype.extension:b=ngTxt("bbbfly_fileuploader_error_full_extension");c+=b.replace("%file%",g)+"\n";break;case bbbfly.FileUploader.errortype.size:e=bbbfly.fileuploader._maxSize(this.MaxFileSize);b=ngTxt("bbbfly_fileuploader_error_full_maxsize");c+=b.replace("%file%",g).replace("%size%",e)+"\n";break;case bbbfly.FileUploader.errortype.batch:e=
bbbfly.fileuploader._maxSize(this.MaxBatchSize);b=ngTxt("bbbfly_fileuploader_error_full_batch");c+=b.replace("%size%",e)+"\n";break;case bbbfly.FileUploader.errortype.count:e=bbbfly.fileuploader._maxCnt(this.MaxFilesCount),b=ngTxt("bbbfly_fileuploader_error_full_maxcnt"),c+=b.replace("%cnt%",e)+"\n"}}this.DoShowError(c)}};
bbbfly.fileuploader._fileNameExtsToString=function(a){var c=[],b;for(b in a){var d=a[b];d=String.isString(d)?d.substring(d.indexOf(".")):"";c[d]?c[d]++:c[d]=1}a="";for(var f in c)a+=(a?", ":"")+c[f]+"x "+f;return a};bbbfly.fileuploader._maxSize=function(a){if(Number.isInteger(a)){var c=["B","kB","MB","GB"],b;for(b in c){if(1E3>a)return"("+Math.floor(10*a)/10+c[b]+")";a/=1E3}}return""};bbbfly.fileuploader._maxCnt=function(a){return Number.isInteger(a)?" ("+Math.floor(a)+")":""};
bbbfly.fileuploader._showProgress=function(a){var c=this.Controls.ProgressPanel,b=c.Controls.ProgressBar;a?b.StartProcess():this.UpdateProgress(0);c.SetVisible(!0)};bbbfly.fileuploader._updateProgress=function(a){var c=this.Controls.ProgressPanel.Controls.ProgressBar;Number.isNumber(a)||(a=0);c.EndProcess();c.SetProgress(a)};bbbfly.fileuploader._hideProgress=function(){this.Controls.ProgressPanel.SetVisible(!1);this.UpdateProgress(0)};
bbbfly.fileuploader._canAddFiles=function(){if(!Number.isInteger(this.MaxFilesCount))return!0;var a=this.GetUploadedFiles();return this.MaxFilesCount>a.length};bbbfly.fileuploader._canRemoveFiles=function(){var a=this.GetSelectedFiles();return Object.isObject(a)};bbbfly.fileuploader._onAddBtnUpdate=function(){this.Enabled=this.ParentControl.ParentControl.CanAddFiles();return!0};bbbfly.fileuploader._onRemoveBtnUpdate=function(){this.Enabled=this.ParentControl.ParentControl.CanRemoveFiles();return!0};
bbbfly.fileuploader._onRemoveBtnClick=function(){var a=this.ParentControl.ParentControl,c=a.GetSelectedFiles();if(!Object.isObject(c))return!1;for(var b=a.GetUploadedFiles(),d=b.length;0<d;d--){var f=d-1;c[b[f].Id]&&b.splice(f,1)}if(b=a.Controls.FilesList){b.BeginUpdate();for(var e in c)(c=b.FindItemByID(e))&&b.Remove(c);b.need_update=0;b.EndUpdate();Function.isFunction(a.OnFilesChanged)&&a.OnFilesChanged();a.Update()}};
bbbfly.fileuploader._onFilesListUpdate=function(){this.Invalid=!this.ParentControl.ParentControl.IsValid();return!0};bbbfly.fileuploader._onGetFilesListText=function(a,c,b){return"name"===b.ID&&c.File?c.File.Name:this.OnGetText.callParent(a,c,b)};bbbfly.fileuploader._onFilesListSelectChanged=function(){var a=this.ParentControl.ParentControl.Controls.ButtonsPanel;a&&a.Update()};
bbbfly.fileuploader._doUpdateAddBtn=function(a){var c=this.ParentControl.ParentControl,b=c.GetForm();!b&&a&&(b=c.CreateForm())&&a.appendChild(b);b&&(b.style.display=this.Enabled?"block":"none");this.DoUpdate.callParent(a)};bbbfly.fileuploader._getAddBtnText=function(){return 1<this.ParentControl.ParentControl.MaxFilesCount?ngTxt("bbbfly_fileuploader_add_more"):ngTxt("bbbfly_fileuploader_add_one")};
bbbfly.fileuploader._getRemoveBtnText=function(){return 1<this.ParentControl.ParentControl.MaxFilesCount?ngTxt("bbbfly_fileuploader_remove_more"):ngTxt("bbbfly_fileuploader_remove_one")};bbbfly.fileuploader._getProgressText=function(){return 1===this.ParentControl.ParentControl.MaxFilesCount?ngTxt("bbbfly_fileuploader_upload_one"):ngTxt("bbbfly_fileuploader_upload_more")};
bbbfly.FileUploader=function(a,c,b){a=a||{};ng_MergeDef(a,{ParentReferences:!1,Data:{UploadURL:null,FileUploadID:null,MaxFileSize:void 0,MaxBatchSize:void 0,MinFilesCount:void 0,MaxFilesCount:void 0,AllowedExtensions:void 0,ErrorLevel:bbbfly.FileUploader.errorlevel.grouped,_Files:[],_RPC:null,_Form:null,_IFrame:null},Controls:{ButtonsPanel:{Type:"bbbfly.Panel",style:{zIndex:1},ParentReferences:!1,Controls:{AddFiles:{Type:"bbbfly.Button",Events:{OnUpdate:bbbfly.fileuploader._onAddBtnUpdate},Methods:{GetText:bbbfly.fileuploader._getAddBtnText,
DoUpdate:bbbfly.fileuploader._doUpdateAddBtn}},RemoveFiles:{Type:"bbbfly.Button",Events:{OnUpdate:bbbfly.fileuploader._onRemoveBtnUpdate,OnClick:bbbfly.fileuploader._onRemoveBtnClick},Methods:{GetText:bbbfly.fileuploader._getRemoveBtnText}}}},ContentPanel:{Type:"bbbfly.Panel",Controls:{FilesList:{Type:"bbbfly.List",style:{zIndex:1},Data:{SelectType:a.Data&&1===a.Data.MaxFilesCount?nglSelectNone:nglSelectMultiExt,ShowHeader:!1,Invalid:!0,Columns:{name:{TextRes:"bbbfly_fileuploader_file"}}},Events:{OnUpdate:bbbfly.fileuploader._onFilesListUpdate,
OnSelectChanged:bbbfly.fileuploader._onFilesListSelectChanged},OverrideEvents:{OnGetText:bbbfly.fileuploader._onGetFilesListText}}}},ProgressPanel:{Type:"bbbfly.Panel",L:0,R:0,T:0,B:0,style:{zIndex:3},ParentReferences:!1,Data:{Visible:!1},Controls:{ProgressBar:{Type:"bbbfly.ProgressBar"},ProgressMessage:{Type:"bbbfly.Text",Methods:{GetText:bbbfly.fileuploader._getProgressText}}}}},OnCreated:bbbfly.fileuploader._onCreated,Events:{OnUpdated:bbbfly.fileuploader._onUpdated,OnGetRequestParams:null,OnFilesChanged:null},
Methods:{GetRPC:bbbfly.fileuploader._getRPC,GetForm:bbbfly.fileuploader._getForm,GetIframe:bbbfly.fileuploader._getIframe,UpdateForm:bbbfly.fileuploader._updateForm,CreateRPC:bbbfly.fileuploader._createRPC,CreateForm:bbbfly.fileuploader._createForm,CreateIframe:bbbfly.fileuploader._createIframe,ValidateFiles:bbbfly.fileuploader._validateFiles,AddUploadedFiles:bbbfly.fileuploader._addUploadedFiles,Reset:bbbfly.fileuploader._reset,IsValid:bbbfly.fileuploader._isValid,UploadFiles:bbbfly.fileuploader._uploadFiles,
GetUploadedFiles:bbbfly.fileuploader._getUploadedFiles,GetSelectedFiles:bbbfly.fileuploader._getSelectedFiles,ShowError:bbbfly.fileuploader._showError,ShowProgress:bbbfly.fileuploader._showProgress,UpdateProgress:bbbfly.fileuploader._updateProgress,HideProgress:bbbfly.fileuploader._hideProgress,CanAddFiles:bbbfly.fileuploader._canAddFiles,CanRemoveFiles:bbbfly.fileuploader._canRemoveFiles,DoShowError:null}});return ngCreateControlAsType(a,"bbbfly.Frame",c,b)};
bbbfly.FileUploader.errortype={main:1,general:2,extension:3,size:4,count:5,batch:6};bbbfly.FileUploader.errorlevel={minimal:1,grouped:2,fulllog:4};ngUserControls=ngUserControls||[];ngUserControls.bbbfly_fileuploader={OnInit:function(){ngRegisterControlType("bbbfly.FileUploader",bbbfly.FileUploader)}};
