;(function (ns, $) {
  'use strict';
  var timeout = 0
    , isScroll = false
    , requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function (callback) {
            window.setTimeout(callback, 1000 / 30);
          };
      }());

  function update() {
    var theads = document.getElementsByClassName('scroll-fix')
      , tables = document.getElementsByClassName('smart-table')
      , container = document.getElementById('fix-header-container');
    for (var i = 0, len = theads.length; i < len; i++) {
      var thead = theads[i]
        , top = Number(thead.getAttribute('data-top'))
        , index = Number(thead.getAttribute('data-index'))
        , table = tables[index];
      if (document.body.scrollTop > top && table.offsetWidth > 0 && !$.contains(container, thead)) {
        container.appendChild(thead);
      } else if (document.body.scrollTop < top && $.contains(container, thead)) {
        document.body.appendChild(thead);
      }
    }
    isScroll = false;
  }

  $(window).on('scroll', function () {
    if (!isScroll) {
      isScroll = true;
      requestAnimFrame(update);
    }
  });

  ns.MainPage = Backbone.View.extend({
    $context: null,
    events: {
      'click .popup': 'popupButton_clickHandler',
      'click .logout': 'logout_clickHandler',
      'change input[type=range]': 'range_changeHandler',
      'click .to-top-button': 'topButton_clickHandler'
    },
    removeLoading: function () {
      clearTimeout(timeout);
      this.$('.page-loading').addClass('hide');
    },
    showErrorAlert: function () {
      this.$('.error').removeClass('hide');
    },
    showLoading: function () {
      var self = this;
      this.setBreadcrumb();
      this.$('.overtime, .error').addClass('hide');
      this.$('.page-loading').removeClass('hide');
      timeout = setTimeout(function () {
        self.$('.page-loading').addClass('hide');
        self.showOvertimeAlert();
      }, 60000); // 60s后认为超时
    },
    showOvertimeAlert: function () {
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
      var breadcrumbs = [button.text()],
        ul = button.closest('ul');
      button.parent().addClass('active');
      while (ul.length) {
        if (!ul.is('#main-nav')) {
          breadcrumbs.unshift(ul.siblings('a').text());
          ul.parent().addClass('active');
        }
        ul = ul.parent().closest('ul');
      }
      this.$('#content-header h1').text(breadcrumbs.join(' / '));

      if (this.$el.filter('#sidebar').hasClass('in')) {
        $('#sidebar-toggle').click();
      }

      return this;
    },
    logout_clickHandler: function () {
      return window.confirm('您确定要退出登录么？');
    },
    popupButton_clickHandler: function (event) {
      ga('send', 'event', 'popup', 'popup', event.currentTarget.href);
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
