/*global Dianjoy,Handlebars,Backbone,Nervenet,jQuery,moment,ga*/
;(function (ns, $) {
  'use strict';

  function debounce(func, threshold, execAsap){
    var timeout;

    return function debounced(){
      var obj = this, args = arguments;

      function delayed () {
        if (!execAsap) {
          func.apply(obj, args);
        }
        timeout = null;
      }

      if (timeout) {
        clearTimeout(timeout);
      } else if (execAsap) {
        func.apply(obj, args);
      }

      timeout = setTimeout(delayed, threshold || 100);
    };
  }

  ns.Search = Backbone.View.extend({
    events: {
      'textinput input': 'input_textInputHandler',
      'blur input': 'input_blurHandler',
      'focus input': 'input_focusHandler',
      'click .dropdown-menu a': 'menu_clickHandler'
    },
    initialize: function () {
      this.dropdown = this.$('.dropdown-menu');
      this.template = Handlebars.compile(this.$('script').remove().html());
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
      this.load(this.queryString, this.loadCompleteHandler.bind(this));
    },
    load: function(query, done) {
      dianjoy.service.Manager.call('api/search.php', {
        param: query
      }, {
        success: function(res) {
          if (res.code != 0) return done(new Error('Not found!'));
          done(null, res);
        },
        error: function() {
          done(new Error('Not found!'));
        }
      });
    },
    input_blurHandler: function () {
      this.hideMenu();
    },
    input_focusHandler: function () {
      this.showMenu();
    },
    input_textInputHandler: function(e) {
      var str = this.queryString = e.target.value.trim();
      if (str.length < 2) {
        return this.hideMenu();
      }
      this.query();
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
    loadCompleteHandler: function (err, data) {
      this.$el.removeClass('loading');
      this.dropdown.html(this.template(data));
      this.showMenu();
    }
  });
}(Nervenet.createNameSpace('dianjoy.view'), jQuery));
