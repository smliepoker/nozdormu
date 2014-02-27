;(function (ns, $) {
  'use strict';
  var _super = Dianjoy.view.MainPage,
      isScroll = false,
      requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function (callback) {
            window.setTimeout(callback, 1000 / 30);
          };
      }());

  function update() {
    var theads = document.getElementsByClassName('scroll-fix'),
        tables = document.getElementsByClassName('smart-table'),
        container = document.getElementById('fix-header-container');
    for (var i = 0, len = theads.length; i < len; i++) {
      var thead = theads[i],
          top = Number(thead.getAttribute('data-top')),
          index = Number(thead.getAttribute('data-index')),
          table = tables[index];
      if (document.body.scrollTop > top && table.offsetWidth > 0 && !$.contains(container, thead)) {
        container.appendChild(thead);
      } else if (document.body.scrollTop < top && $.contains(container, thead)) {
        document.body.appendChild(thead);
      }
    }
    isScroll = false;
  }

  ns.MainPage = _super.extend({
    events: _.extend(_super.prototype.events, {
      'click .to-top-button': 'topButton_clickHandler'
    }),
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
    setIframeBreadcrumb: function(title) {
      var levels = title.split(' ');
      this.$('.breadcrumb').children(':gt(0)').remove();
      for (var i = 0, len = levels.length - 1; i < len; i++) {
        this.$('.breadcrumb').append('<li class="active">' + levels[i] + '</li>');
      }
      this.$('.breadcrumb').append(' <li class="active">' + levels.pop() + '</li>');
    },
    subpage_loadCompleteHandler: function(title) {
      _super.prototype.subpage_loadCompleteHandler.call(this);
      if (title) {
        this.setIframeBreadcrumb(title);
      }
    },
    topButton_clickHandler: function (event) {
      document.body.scrollTop = 0;
      event.preventDefault();
    }
  });

  $(window).on('scroll', function () {
    if (!isScroll) {
      isScroll = true;
      requestAnimFrame(update);
    }
  });
}(Nervenet.createNameSpace('Dianjoy.admin.view'), jQuery));
