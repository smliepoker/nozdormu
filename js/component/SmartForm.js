;(function (ns) {
  'use strict';
  ns.SmartForm = Backbone.View.extend({
    events: {
      "blur input[type=text]": "input_blurHandler",
      "click .upload-button": "uploadButton_clickHandler",
      "change input[type=file]": "fileUploader_changeHandler",
      'change [name=province]': 'province_changeHandler',
      'focus .error input[type=text]': 'errorInput_focusHandler',
      'submit': 'submitHandler'
    },
    initialize: function () {
      var province = this.el.elements.province;
      if (province && province.getAttribute('value')) {
        province.value = province.getAttribute('value');
        this.province_changeHandler({
          currentTarget: province
        });
        this.el.elements.city.value = this.el.elements.city.getAttribute('value');
      } else {
        this.fillCitiesSelect(0);
      }
    },
    remove: function () {
      this.model.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    fillCitiesSelect: function (index) {
      if (!('CITIES' in window) || index === -1) {
        return;
      }
      var target = this.el.elements.city,
          html = '';
      if (!target) {
        return;
      }
      for (var i = 0, len = CITIES[index].length; i < len; i++) {
        html += '<option value="' + CITIES[index][i] + '">' + CITIES[index][i] + '</option>';
      }
      target.innerHTML = html;
    },
    addLoading: function () {
      this.$el.addClass('loading');
      $(this.el.elements).filter('[type=submit], button').not('button[type]')
        .prop('disabled', true)
        .prepend('<i class="icon-spinner icon-spin fa fa-spin fa-spinner"></i> ');
    },
    removeLoading: function (className, msg) {
      this.$('.loading, .processing, .icon-spin, .fa-spin').remove();
      $(this.el.elements).filter('[type=submit], button').not('button[type]')
        .prop('disabled', false)
        .find('.icon-spin, .fa-spin').remove();
      this.$el.removeClass('loading');
      this.model.set('form', {
        className: className,
        msg: msg
      });
    },
    errorInput_focusHandler: function(event) {
      $(event.currentTarget).tooltip('destroy')
        .closest('.form-group').removeClass('error');
    },
    fileUploader_changeHandler: function(event) {
      var target = event.currentTarget,
          button = $(target).siblings('.upload-button'),
          validate = $(target).data('validate');
      if (!target.hasOwnProperty('files') || target.files.length === 0) {
        return;
      }
      button
        .removeClass('btn-success btn-danger btn-inverse btn-default')
        .find('.icon-ok, .icon-remove, .fa-check, .fa-times').remove();
      var spec = $(target).data('accept'),
          file = target.files[0];
      if (spec && file) {
        var reg = new RegExp(spec, 'i');
        if (!reg.test(file.name)) {
          var types = spec.slice(3, -2).split('|');
          button
            .addClass('btn-danger')
            .append(' <i class="icon-remove fa fa-times"></i>');
          alert('文件类型不匹配，请上传扩展名为' + types.join('，') + '的文件\n（手工修改不算哦）');
          return;
        }
      }

      if (file.type) {
        if (/image/i.test(file.type)) {
          var img = target.img = document.createElement('img'),
              list = $(target).siblings('.help-block');
          img.className = "preview img-polaroid";
          img.alt = $('label[for=' + target.id + ']').text();
          img.src = URL.createObjectURL(file);
          if (list.hasClass('multiple')) {
            img.title = '单击移除';
          } else {
            list.empty();
          }
          list.append(img);
        } else if (/video/i.test(file.type)) {
          var video = target.video = document.createElement('video'),
              list = $(target).siblings('.help-block');
          video.controls = true;
          video.width = 480;
          video.height = 270;
          video.onerror = function (e) { console.log(e); };
          list.empty().append(video);
        }
      }

      // 是否需要md5和大小校验
      if (validate) {
        var spark = new SparkMD5.ArrayBuffer(),
            reader = new FileReader(),
            model = this.model;
        reader.onload = function () {
          spark.append(this.result);
          model.set('file-validate-' + file.name, {
            size: file.size,
            md5: spark.end()
          });
        };
        reader.readAsArrayBuffer(file);
      }

      button
        .addClass('btn-success')
        .append(' <i class="icon-ok fa fa-check"></i>');
      
      if (!dianjoy.service.Manager.autoUpload) {
        return;
      }
      var bar = target.bar = $('<div class="progress"><div class="bar progress-bar"></div></div>');
      target.filename = file.name;
      dianjoy.service.Manager.upload(file, {
        type: target.id || 'ad_url',
        id: $('#adid').val(),
        uploader: target,
        url: $(target).attr('upload_url')
      }, this.fileUpload_successHandler, null, this.fileUpload_progressHandler, this);

      // 将按钮变成取消
      button
        .prop('disabled', true)
        .after(bar);
      $(target).closest('form').addClass('uploading');
    },
    fileUpload_progressHandler: function(loaded, total, uploader) {
      var progress = (loaded / total * 100 >> 0) + '%';
      uploader.bar.find('.bar, .progress-bar')
        .width(progress)
        .text(progress);
    },
    fileUpload_successHandler: function(response, uploader) {
      var parent = $(uploader).parent(),
          input = parent.find('[type=text], [type=hidden]'),
          src = '../' + response.url;
      // 校验
      var record = this.model.get('file-validate-' + response.filename);
      if (record) {
        if (record.size !== response.size || record.md5 !== response.md5) {
          alert('上传后文件校验未通过，请重新上传');
          $(uploader).closest('form').removeClass('uploading');
          return;
        }
      }

      uploader.bar.fadeOut(function() {
        $(this).remove();
        // 生成缩略图或链接
        parent.find('button').prop('disabled', false);
        if (uploader.img) {
          uploader.img.src = src;
        } else if (uploader.video) {
          uploader.video.src = src;
        } else {
          var preview = ' <span class="help-inline file"><a href="' + src + '">' + uploader.filename + '</a>已上传</span>';
          parent.find('span').remove();
          parent.find('.upload-button').after(preview);
        }
      });

      if (input.hasClass('multiple')) {
        var imgs = input.val() === '' ? [] : input.val().split(',');
        if (imgs.indexOf(response.url) === -1) {
          imgs.push(response.url);
        }
        input.val(imgs.join(','));
      } else {
        input.val(response.url);
      }
      $(uploader).closest('form').removeClass('uploading');
      this.model.set(response);
    },
    input_blurHandler: function(event) {
      var target = event.currentTarget,
          msgs = dianjoy.form.checkInput(target);
      target = $(target);
      if (msgs.length > 0) {
        target.closest('.form-group').addClass('has-error');
        target.tooltip({
          title: msgs[0],
          placement: 'bottom',
          trigger: 'click'
        }).tooltip('show');
        return;
      }
      target.closest('.form-group').addClass('has-success');
    },
    province_changeHandler: function(event) {
      this.fillCitiesSelect(event.currentTarget.selectedIndex);
    },
    submit_successHandler: function(response) {
      this.model.set(_.omit(response, 'code', 'msg'));
      this.removeLoading('success', response.msg);
    },
    submit_errorHandler: function(xhr, status, error) {
      this.removeLoading('danger', xhr.msg || error);
    },
    uploadButton_clickHandler: function(event) {
      $(event.currentTarget).siblings('input[type=file]').click();
    },
    submitHandler: function(event) {
      var form = this.el,
          action = form.action;
      // 不需要提交的表单
      if (this.$el.hasClass('fake') || this.$el.hasClass('loading')) {
        event.preventDefault();
        return false;
      }

      // 筛选类型的
      if (this.$el.hasClass('keyword-form')) {
        this.model.set('keyword', form.elements.query.value);
        event.preventDefault();
        return false;
      }

      // 跳转类型的
      if (action.indexOf('#') !== -1) {
        action = action.substr(action.indexOf('#'));
        action = action.replace(/\/:(\w+)/g, function(str, key) {
          return '/' + form.elements[key].value;
        });
        R.router.navigate(action);
        return false;
      }

      // 防止多次提交
      this.addLoading();

      // ajax提交类型的
      var isPass = dianjoy.form.checkForm(this.el);
      if (this.$el.hasClass('ajax') && isPass) {
        var data = this.$el.serialize();
        dianjoy.service.Manager.call(action, data, this.submit_successHandler, this.submit_errorHandler, this);
        return false;
      }

      // 原则上当然尽量都整成ajax的
      // 不过暂时改不过来，所以需要上传图片的表单都直接提交
      return isPass;
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));