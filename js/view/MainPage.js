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
    subPage: null,
    events: {
      'click .popup': 'popupButton_clickHandler',
      'click .logout': 'logout_clickHandler',
      'click .iframe': 'iframeButton_clickHandler',
      'change input[type=range]': 'range_changeHandler',
      'click .to-top-button': 'topButton_clickHandler'
    },
    initialize: function () {
      this.subPage = new Dianjoy.view.SubPage({
        el: '#sub-page',
        model: this.model
      });
      this.subPage.on('load:complete', this.subpage_loadCompleteHandler, this);
    },
    openSubPage: function (url) {
      if (url) {
        var self = this;
        this.$('.page-loading').removeClass('hide');
        this.subPage.load(url);
        timeout = setTimeout(function () {
          self.$('.page-loading').addClass('hide');
          self.subPage.showOvertimeAlert();
        }, 60000); // 60s后认为超时
        if ('ga' in window) {
          ga('send', 'pageview', url);
        } else if (_gaq) {
          _gaq.push(['_trackPageview', url]);
        }
      }
    },
    openIframe: function (url) {
      if (url) {
        this.clear();
        this.$('.page-loading').removeClass('hide');
        this.subPage.loadIframe(url);
        if ('ga' in window) {
          ga('send', 'pageview', url);
        } else if (_gaq) {
          _gaq.push(['_trackPageview', url]);
        }
      }
    },
    setBreadcrumb: function() {
      var nav = this.$('#main-nav'),
        target = location.hash,
        button = nav.find('[href="' + target + '"]'),
        className = target.substring(2).split('/').slice(0, 2).join('-');
      // 给subpage加样式
      this.model.cid = this.subPage.el.className = className;
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
    iframeButton_clickHandler: function (event) {
      R.router.navigate('#/iframe/' + encodeURIComponent(event.currentTarget.getAttribute('href')));
      event.preventDefault();
    },
    logout_clickHandler: function (event) {
      return window.confirm('您确定要退出登录么？');
    },
    popupButton_clickHandler: function (event) {
      if ('ga' in window) {
        ga('send', 'event', 'popup', 'popup', event.currentTarget.href);
      } else if (_gaq) {
        _gaq.push(['_trackEvent', 'popup', 'popup', event.currentTarget.href]);
      }
    },
    range_changeHandler: function (event) {
      $(event.currentTarget).siblings('.help-inline').text(event.currentTarget.value);
    },
    subpage_loadCompleteHandler: function (title) {
      clearTimeout(timeout);
      this.$('.page-loading').addClass('hide');
      if (title) {
        this.setIframeBreadcrumb(title);
      }
    },
    topButton_clickHandler: function (event) {
      document.body.scrollTop = 0;
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('Dianjoy.view'), jQuery));
