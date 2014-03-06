/**
 * Created by meathill on 13-12-27.
 */
;(function (ns) {
  "use strict";
  function showErrorPopup(target, msgs) {
    if (msgs.length === 0) {
      return;
    }
    msgs = _.isArray(msgs) ? msgs : [msgs];
    var html = msgs.join('<br />');
    $(target)
      .popover({
        trigger: 'manual',
        title: '表单填写有误',
        content: html,
        html: true
      })
      .popover('show')
      .one('focus', function () {
        $(this)
          .off('.popover')
          .removeData('popover')
          .siblings('.popover').remove()
          .end().closest('.form-group').removeClass('error');
      })
      .closest('.form-group').addClass('error');
  }

  var utils = {
    checkForm: function (form) {
      // 验证表单项是否合乎要求
      var msgs = [],
        elements = form.elements,
        error = _.find(elements, function (element) {
          // 不验证button
          if (/button/i.test(element.tagName)) {
            return;
          }
          element = $(element);
          // 不验证隐藏项
          if (element.is(':hidden')) {
            return;
          }
          msgs = msgs.concat(utils.checkInput(element));
          return msgs.length > 0;
        });
      if (/[^\s]uploading[$\s]/.test(form.className)) {
        msgs.push('上传文件中，请稍候');
      }
      if (msgs.length > 0) {
        showErrorPopup(error, msgs);
        return false;
      }
      // 验证两次输入的密码是否一致
      if ('newpassword' in elements && elements.newpassword.value !== elements.repassword.value) {
        showErrorPopup(elements.repassword, '两次密码不一致哟，麻烦检查下吧');
        return false;
      }

      return true;
    },
    checkInput: function (input) {
      var msgs = [],
        input = $(input);
      // 验证必填项
      if (input.attr('required') && input.val() === '') {
        msgs.push('此项为必填项，您好像漏掉了哟');
      }
      // 验证内容
      var pattern = input.attr('pattern');
      if (pattern && input.val() !== '' && !RegExp(pattern).test(input.val())) {
        msgs.push('填写格式有误，麻烦您检查并重新填写');
      }
      // 验证数值
      if (/number/i.test(input.attr('type')) && input.attr('min') && input.attr('max')) {
        var value = Number(input.val());
        if (isNaN(value) || value < input.attr('min') || value > input.attr('max')) {
          msgs.push('数值超出规定范围');
        }
      }
      // 验证密码
      if (input.attr('type') === 'password' && !/^[0-9a-zA-Z$!^#_@%&*.]{6,16}$/.test(input.val())) {
        msgs.push('密码应为6~16个字符，包含字母、数字、特殊符号等');
      }

      return msgs;
    }
  };
  _.extend(ns, utils);
}(Nervenet.createNameSpace('dianjoy.form')));