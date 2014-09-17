/*global Dianjoy,Handlebars,Backbone,Nervenet,jQuery,moment,ga*/
;(function (ns, $) {
  'use strict';

  ns.Spotlight = Backbone.View.extend({
    events: {
      'textInput input': 'input_textInputHandler',
      'focus input': 'input_focusHandler',
      'click .dropdown-menu a': 'menu_clickHandler'
    },
    initialize: function () {
      this.dropdown = this.$('.dropdown-menu');
      this.template = Handlebars.compile(this.$('script').remove().html());
      this._query = this.query.bind(this);
      var self = this;
      $(document).on('click', function (event) {
        if (!$.contains(self.el, event.target)) {
          self.hideMenu();
        }
      });
    },
    hideMenu: function() {
      this.dropdown.hide();
    },
    showMenu: function() {
      if (this.queryString && this.queryString.length > 1) {
        this.dropdown.show();
      }
    },
    query: function() {
      this.$el.addClass('loading');
      this.queryString = this.$('input').val();
      dianjoy.service.Manager.call('api/search.php', {
        query: this.queryString
      }, {
        context: this,
        success: this.successHandler,
        error: this.errorHandler
      });
    },
    input_blurHandler: function () {
      this.hideMenu();
    },
    input_focusHandler: function () {
      this.showMenu();
    },
    input_textInputHandler: function(e) {
      var str = e.target.value.trim();
      if (str.length < 2) {
        return this.hideMenu();
      }
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this._query, 1000);
    },
    menu_clickHandler: function(e) {
      var target = $(e.target)
        , href = target.attr('href')
        , label = target.data('label');
      ga('send', 'event', {
        'eventCategory': 'Spotlight',
        'eventAction': 'click',
        'eventLabel': label,
        'eventValue': href
      });
    },
    successHandler: function (response) {
      this.$el.removeClass('loading');
      this.dropdown.html(this.template(response));
      this.showMenu();
    },
    errorHandler: function (response) {
      response.error = true;
      this.$el.removeClass('loading');
      this.dropdown.html(this.template(response));
      this.showMenu();
    }
  });
}(Nervenet.createNameSpace('dianjoy.view'), jQuery));
