;(function (ns, $) {
  'use strict';
  var SIDEBAR_OFFSET = 60,
      _super = Dianjoy.view.MainPage;
  ns.MainPage = _super.extend({
    events: _.extend(_super.prototype.events, {
      'click .accordion-inner a': 'sideNav_clickHandler',
      'click .home-button': 'homeButton_clickHandler'
    }),
    clearSubNavi: function() {
      this.$('.accordion-inner').find('.active').removeClass('active');
    },
    openSubNavi: function(url) {
      this.$('.accordion-inner a').each(function(i) {
        if (this.href.indexOf(url) !== -1) {
          $(this).parent().addClass('active')
              .closest('.accordion-body').addClass('in');
        }
      });
    },
    homeButton_clickHandler: function(event) {
      this.clearSubNavi();
    },
    sideNav_clickHandler: function(event) {
      this.$('.accordion-inner').find('.active').removeClass('active');
      $(event.currentTarget).closest('li').addClass('active');
    },
    window_scrollHandler: function (event) {
      if (window.scrollY > SIDEBAR_OFFSET) {
        $('#sidebar').css({
          position: 'fixed',
          top: '60px'
        });
      } else {
        $('#sidebar').attr('style', '');
      }

      _super.prototype.window_scrollHandler.call(this);
    }
  });
}(Nervenet.createNameSpace('Dianjoy.publisher.view'), jQuery));