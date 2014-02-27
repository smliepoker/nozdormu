;(function (ns, $) {
  'use strict';
  var timeout = 0,
      fixed = null,
      TOP_OFFSET = 400;
  ns.MainPage = Backbone.View.extend({
    subPage: null,
    events: {
      'click .popup': 'popupButton_clickHandler',
      'click .logout': 'logout_clickHandler',
      'click .iframe': 'iframeButton_clickHandler',
      'change input[type=range]': 'range_changeHandler'
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
    subpage_loadCompleteHandler: function () {
      clearTimeout(timeout);
      this.$('.page-loading').addClass('hide');
    }
  });
}(Nervenet.createNameSpace('Dianjoy.view'), jQuery));
