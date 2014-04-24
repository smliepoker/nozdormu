;(function (ns) {
  'use strict';
  ns.SmartForm = dianjoy.view.DataSyncView.extend({
    $router: null,
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
    createUploader: function (sibling) {
      var data = $(sibling).data()
        , accept = 'accept' in data ? 'accept="' + data.accept + '"' : ''
        , uploader = $('<input type="file" class="hidden" ' + accept + '>');
      uploader.insertAfter(sibling);
      return uploader;
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
    setModel: function (model) {
      this.model.off(null, null, this);
      this.model = model;
    },
    errorInput_focusHandler: function(event) {
      $(event.currentTarget).tooltip('destroy')
        .closest('.form-group').removeClass('error');
    },
    fileUploader_changeHandler: function(event) {
      var input = $(event.currentTarget)
        , button = input.siblings('.upload-button')
        , progress = input.siblings('.progress').removeClass('hide')
        , data = button.data()
        , preview = $(data.preview)
        , field = $(data.field)
        , validate = data.validate;
      if (!input[0].hasOwnProperty('files') || input[0].files.length === 0) {
        return;
      }

      // 校验文件类型
      var spec = data.accept
        , file = input[0].files[0];
      if (spec && file) {
        var reg = new RegExp(spec, 'i');
        if (!reg.test(file.type) && !reg.test(file.name)) {
          var types = spec.slice(3, -2).split('|');
          button.addClass('btn-danger')
            .find('i').addClass('fa-times');
          alert('文件类型不匹配，请上传扩展名为' + types.join('，') + '的文件\n（手工修改不算哦）');
          return;
        }
      }
      button
        .prop('disabled', true)
        .addClass('disabled')
        .removeClass('btn-success btn-danger')
        .find('i')
          .removeClass('fa-times fa-check')
          .addClass("fa-spin fa-spinner");
      this.$el.addClass('loading');
      
      if (!dianjoy.service.Manager.autoUpload) {
        return;
      }
      var uploader = dianjoy.service.Manager.upload(file, {
        id: this.model.id,
        type: data.type
      }, this);
      uploader.bar = progress;
      uploader.button = button;
      uploader.preview = preview.length ? preview : null;
      uploader.field = field;
      uploader.filename = file.name;
      uploader.isSrc = /image|video/i.test(file.type);
      uploader.on('success', this.fileUpload_successHandler, uploader);
      uploader.on('progress', this.fileUpload_progressHandler, uploader);

      // 是否需要md5和大小校验
      if (validate) {
        var spark = new SparkMD5.ArrayBuffer()
          , reader = new FileReader();
        reader.onload = function () {
          spark.append(this.result);
          uploader.md5 = spark.end();
        };
        uploader.size = file.size;
        reader.readAsArrayBuffer(file);
      }
    },
    fileUpload_progressHandler: function(loaded, total) {
      var progress = (loaded / total * 100 >> 0) + '%';
      this.bar.find('.bar, .progress-bar')
        .width(progress)
        .text(progress);
    },
    fileUpload_successHandler: function(response) {
      // 校验MD5
      if (this.md5 && (this.size !== response.size || this.md5 !== response.md5)) {
        alert('上传后文件校验未通过，请重新上传');
        return;
      }

      // 隐藏进度条
      this.bar.fadeOut(function () {
        $(this).addClass('hide');
      });

      // 生成缩略图或链接
      if (this.preview) {
        if (this.isSrc) {
          this.preview.attr('src', response.url);
        } else {
          this.preview.html('<a href="' + src + '">' + this.filename + '</a>已上传');
        }
      }

      if (this.field.hasClass('multiple')) {
        var imgs = this.field.val() === '' ? [] : _.filter(this.field.val().split(','));
        if (imgs.indexOf(response.url) === -1) {
          imgs.push(response.url);
        }
        this.field.val(imgs.join(','));
      } else {
        this.field.val(response.url);
      }

      this.button
        .prop('disabled', false)
        .removeClass('disabled')
        .addClass('btn-success')
        .find('i')
          .removeClass("fa-spin fa-spinner")
          .addClass('fa-check');
      this.button.closest('form').removeClass('loading');
      this.off();
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
      this.displayResult(true, response.msg, 'smile-o');
    },
    submit_errorHandler: function(xhr, status, error) {
      this.displayResult(false, xhr.msg || error, 'frown-o');
    },
    uploadButton_clickHandler: function(event) {
      var uploader = this.createUploader(event.currentTarget);
      uploader.click();
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
        this.displayProcessing();
        event.preventDefault();
        return false;
      }

      // 跳转类型的
      if (action.indexOf('#') !== -1) {
        action = action.substr(action.indexOf('#'));
        action = action.replace(/\/:(\w+)/g, function(str, key) {
          return '/' + form.elements[key].value;
        });
        this.$router.navigate(action);
        return false;
      }

      // 防止多次提交
      this.displayProcessing();

      // ajax提交类型的
      var isPass = dianjoy.form.checkForm(this.el);
      if (this.$el.hasClass('ajax') && isPass) {
        var data = this.$el.serialize();
        dianjoy.service.Manager.call(action, data, {
          success: this.submit_successHandler,
          error: this.submit_errorHandler,
          context: this,
          method: this.$el.attr('method')
        });
        return false;
      }

      // 原则上当然尽量都整成ajax的
      // 不过暂时改不过来，所以需要上传图片的表单都直接提交
      return isPass;
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));