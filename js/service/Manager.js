/*
 * @overview 负责服务器数据交互
 */
;(function (ns) {
  'use strict';
  var manager = {
    $subPage: null,
    api: 'upload.php',
    autoUpload: false,
    maxUploadSize: 209715200, // 上传文件上限
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
    upload: function (file, data, context) {
      if (!file) {
        return;
      }
      if (file.size > this.maxUploadSize) {
        alert('上传文件体积过大，请使用别的方式上传。');
        return;
      }
      var dispatcher = _.extend({}, Backbone.Events)
        , formData = new FormData()
        , onProgress = this.onProgress;
      //上传文件
      formData.append('file', file);
      formData.append('type', data.type);
      formData.append('id', data.id);
      $.ajax({
        url: data.url || this.api,
        type: 'post',
        data: formData,
        dataType: 'json',
        cache: false,
        contentType: false,
        context: this,
        processData: false,
        xhr: function() {
          var xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', function(event) {
            onProgress(event.loaded, event.total);
            dispatcher.trigger('progress', event.loaded, event.total, dispatcher);
          });
          return xhr;
        },
        success: function (response) {
          if (response.code === 0) {
            dispatcher.trigger('success', response, dispatcher);
            this.onSuccess(response);
          } else {
            dispatcher.trigger('error', response, dispatcher);
            this.onError(response);
          }
        },
        error: function (xhr, status, err) {
          dispatcher.trigger('error', xhr, status, err, dispatcher);
          this.onError(xhr, status, err);
        }
      });
      return dispatcher;
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
      console.log(xhr, status, error);
      if (status === 401) {
        this.$subPage.load(webURL + 'page/permission_error.html');
      }
    },
    onProgress: function (loaded, total) {
      console.log(loaded / total);
    },
    onSuccess: function (response) {
      this.trigger('complete:upload', response);
      console.log('success', response);
    }
  };
  manager = _.extend(manager, Backbone.Events);
  ns.Manager = manager;
}(Nervenet.createNameSpace('dianjoy.service')));

