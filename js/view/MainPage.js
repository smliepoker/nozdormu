;(function (ns, $) {
  'use strict';

  var timeout;

  ns.MainPage = Backbone.View.extend({
    $context: null,
    events: {
      'change input[type=range]': 'range_changeHandler',
      'click .logout': 'logout_clickHandler',
      'click .disabled a': 'disabled_clickHandler',
      'click .to-top-button': 'topButton_clickHandler',
      'change .check-all': 'checkAll_changeHandler'
    },
    postConstruct: function () {
      this.$context.mapEvent('table-rendered', function () {
        this.$el.scrollTop(0);
      }, this);
    },
    removeLoading: function () {
      clearTimeout(timeout);
      this.$('.page-loading').addClass('hide');
    },
    showErrorAlert: function () {
      this.$('.error').removeClass('hide');
    },
    showLoading: function () {
      this.setBreadcrumb();
      this.$('.overtime, .error').addClass('hide');
      this.$('.page-loading').removeClass('hide');
      timeout = setTimeout(_.bind(this.showOvertimeAlert, this), 60000); // 60s后认为超时
    },
    showOvertimeAlert: function () {
      self.$('.page-loading').addClass('hide');
      this.$('.overtime').removeClass('hide');
    },
    setBreadcrumb: function() {
      var nav = this.$('#main-nav')
        , target = location.hash
        , button = nav.find('[href="' + target + '"]');
      while (button.length === 0) {
        target = target.substr(0, target.lastIndexOf('/'));
        if (target.lastIndexOf('/') < 2) {
          return this;
        }
        button = nav.find('[href="' + target + '"]');
      }

      // 取爆米花导航文本，标记当前菜单
      nav.find('.active').removeClass('active');
      var breadcrumbs = [button.text()]
        , ul = button.closest('ul');
      button.parent().addClass('active');
      while (ul.length) {
        if (!ul.is('#main-nav')) {
          breadcrumbs.unshift(ul.siblings('a').text());
          ul.parent().addClass('active');
        }
        ul = ul.parent().closest('ul');
      }
      this.$('#content-header h1').text(breadcrumbs.join(' / '));

      if (this.$('#sidebar').hasClass('in')) {
        $('#sidebar-toggle').click();
      }

      return this;
    },
    checkAll_changeHandler: function (event) {
      var target = $(event.currentTarget);
      $('[type=checkbox][name=' + target.data('target') + ']').prop('checked', target.prop('checked'));
    },
    disabled_clickHandler: function (event) {
      event.preventDefault();
    },
    logout_clickHandler: function () {
      return window.confirm('您确定要退出登录么？');
    },
    range_changeHandler: function (event) {
      $(event.currentTarget).siblings('.help-inline').text(event.currentTarget.value);
    },
    topButton_clickHandler: function (event) {
      document.body.scrollTop = 0;
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('dianjoy.view'), jQuery));
