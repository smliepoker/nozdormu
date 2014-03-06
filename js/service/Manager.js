/*
 * @overview 负责服务器数据交互
 */
;(function (ns) {
  'use strict';
  var manager = {
    autoUpload: false,
    
    call: function (url, data, onSuccess, onError, context) {
      var self = this;
      onSuccess = onSuccess || this.onSuccess;
      onError = onError || this.onError;
      $.ajax({
        url: url,
        data: data,
        dataType: 'json',
        type: 'post',
        cache: false,
        success: function (response) {
          if (response.code === 0) {
            onSuccess.call(context, response);
            self.postHandle(response);
            self.trigger('complete:call', response);
          } else {
            onError.call(context, response);
          }
        },
        error: function (xhr, status, err) {
          onError.call(context, xhr, status, err);
        }
      });
    },
    upload: function (file, data, onSuccess, onError, onProgress, context) {
      if (!file) {
        return;
      }
      if (file.size > 209715200) { // 不能上传大于200m的文件
        alert('不能通过后台上传大于200M的文件，请使用别的方式上传。');
        return;
      }
      var self = this,
          uploader = data.uploader,
          formdata = new FormData();
      //上传文件
      formdata.append('file', file);
      formdata.append('type', data.type);
      formdata.append('id', data.id);
      onSuccess = onSuccess || this.onSuccess;
      onError = onError || this.onError;
      onProgress = onProgress || this.onProgress;
      $.ajax({
        url: data.url || "../upload.php",
        type: 'post',
        data: formdata,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        xhr: function() {
          var xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', function(event) {
            onProgress.call(context, event.loaded, event.total, uploader);
          });
          return xhr;
        },
        success: function (response) {
          if (response.id) {
            onSuccess.call(context, response, uploader);
            self.trigger('complete:upload', response);
          } else {
            onError.call(context, response, uploader);
          }
        },
        error: function (xhr, status, err) {
          onError.call(context, xhr, status, err);
        }
      });
    },
    postHandle: function (response) {
      if (!'method' in response) {
        return;
      }
      switch (response.method) {
        case 'remove':
          $('#' + response.id).remove();
          break;

        case 'setText':
          $('.' + response.class).text(response.value);
          break;

        case 'refresh':
          Backbone.history.loadUrl(Backbone.history.fragment);
          break;
      }
    },
    onError: function (xhr, status, error) {
      console.log(error);
      console.log(xhr, status);
    },
    onProgress: function (loaded, total) {
      console.log(loaded / total);
    },
    onSuccess: function (response) {
      console.log('success', response);
    }
  };
  manager = _.extend(manager, Backbone.Events);
  ns.Manager = manager;
}(Nervenet.createNameSpace('dianjoy.service')));

