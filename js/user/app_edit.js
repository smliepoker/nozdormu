/**
 * 检查表单
 * 暂时不检查HTML5包含部分
 * @param {Object} event
 */
function check (event) {
  // 上传中，不能提交
  if (isUploading) {
    alert('文件上传中，请耐心等候');
    return false;
  }
}

$(function () {
  var settings = {
    flash_url : "swf/swfupload.swf",
    upload_url: "upload.php",
    post_params: {
      "type" : "upload_app",
      "id" : $('#id').val()
    },
    file_size_limit : "200 MB",
    file_types : "*.apk;*.ipa;*.pxl",
    file_types_description : "APK,IPA,PXL File",
    file_upload_limit : 10,
    file_queue_limit : 1,
    file_post_name : "file",

    // Button settings
    button_image_url: "img/bg_upload.png",
    button_width: "96",
    button_height: "30",
    button_placeholder_id: "uploadButtonApk",
    button_text: '<span class="t">上传安装包</span>',
    button_text_style: ".t { color: #FFFFFF; font-size: 14px; font-weight: bold; font-family: Simhei }",
    button_text_left_padding: 10,
    button_text_top_padding: 6,

    // The event handler functions are defined in handlers.js
    file_dialog_complete_handler : fileDialogComplete,
    upload_start_handler : uploadStart,
    upload_progress_handler : uploadProgress,
    upload_success_handler : uploadSuccessUser
  };
  var swfu_apk = new SWFUpload(settings);

  settings.post_params.type = "appicon";
  settings.file_size_limit = "1MB";
  settings.file_types = "*.jpg;*.jpeg;*.gif;*.png";
  settings.file_types_description = "Image Files";
  settings.button_width = "180";
  settings.button_placeholder_id = "uploadButtonLogo";
  settings.button_text = '<span class="t">上传图标</span>';
  settings.button_text_left_padding = 16;
  var swfu_logo = new SWFUpload(settings);

  settings.post_params.type = "app_pic";
  settings.button_placeholder_id = "uploadButtonShoot";
  settings.button_text = '<span class="t">上传截图</span>';
  var swfu_shoot = new SWFUpload(settings);

  // 添加各种事件
  $(document)
    // 上传按钮事件
    .on('click', '.upload-button', function (event) {
      $(this).siblings('input[type=file]').click();
    })
    // ad_url切换，显示按钮或文本框
    .on('click', '.upload_app button', function (event) {
      if (isUploading) {
        event.stopPropagation();
        return false;
      }
      $(this).closest('.help-block').siblings('object, input[type=text], span').each(function (i) {
        if ($(this).attr('style')) {
          $(this).removeAttr('style');
        }else if($(this).hasClass('hide')) {
          $(this).removeClass('hide');
        }else {
          $(this).toggle();
        }
      });
    })
    .on('click', '.multiple img', function (event) {
      var parent = $(this).parent(),
          input = parent.siblings('[type=text], [type=hidden]'),
          urls = '';
      $(this).remove();
      parent.children().each(function (i) {
        urls += this.src.substr(this.src.indexOf('upload')) + ',';
      });
      input.val(urls.slice(0, -1));
    })
    // 范围选择
    .on('change', 'input[type=range]', function (event) {
      $(this).next().text(this.value);
    })
    // 缩略图
    .on({
      'mouseover': function () {
        $("#im").attr("src", this.src);
        var offset = $(this).offset();
        $("#proper")
            .show()
            .css({
              left: offset.left - 240 + this.width + 5,
              top: offset.top - 160
            });
      },
      'mouseout': function () {
        $("#proper").hide();
      }
    }, '.preview');
});
var URL = window.URL || window.webkitURL,
    isUploading = false;
