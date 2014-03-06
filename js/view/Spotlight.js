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
      'input input[name="query"]': 'query_handler',
      'focus input[name="query"]': 'show_menu',
      'click a': 'item_click'
    },
    initialize: function () {
      var script = this.$('script').remove();
      this.dropdown = this.$('.dropdown-menu');
      this.template = Handlebars.compile(script.html());
      this._query = debounce(this.query, 200);
      this.spin = this.$('.spin');
      $(document).on('click', function(e) {
        var el = $(e.target).parents('#search');
        if (!el.length) {
          this.hide_menu();
        }
      }.bind(this));
    },
    item_click: function(e) {
      var href = $(e.target).attr('href');
      var label = $(e.target).attr('data-label');
      ga('send', 'event', {
        'eventCategory': 'Spotlight',
        'eventAction': 'click',
        'eventLabel': label,
        'eventValue': href
      });
      this.hide_menu();
    },
    hide_menu: function() {
      this.dropdown.hide();
    },
    show_menu: function() {
      if (this.queryString && this.queryString.length > 1) {
        this.dropdown.show();
      }
    },
    query_handler: function(e) {
      var str = $(e.target).val().trim();
      this.queryString = str;
      if (str.length < 2) {
        this.dropdown.html('');
        return this.hide_menu();
      }
      this._query();
    },
    query: function() {
      this.spin.css('display', 'block');
      this.load(this.queryString, function(err, data) {
        this.spin.hide();
        this.dropdown.html('');
        if (!this.queryString) return this.hide_menu();
        var html;
        if (err) {
          html = this.template({
            empty: true
          })
          $(html).appendTo(this.dropdown);
        } else {
          data.end_date = moment().subtract('days', 1).format('YYYY-MM-DD');
          data.start_date = moment().subtract('days', 8).format('YYYY-MM-DD');
          $(this.template(data)).appendTo(this.dropdown);
        }
        this.show_menu();
      }.bind(this));
    },
    load: function(query, done) {
      dianjoy.service.Manager.call('api/search_result.php', {
        param: query
      }, function(res) {
        if (res.code != 0) return done(new Error('Not found!'));
        done(null, res);
      }, function() {
        done(new Error('Not found!'));
      });
    }
  });
}(Nervenet.createNameSpace('dianjoy.view'), jQuery));
