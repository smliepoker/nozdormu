(function (ns) {
  'use strict';
  var eventsMap = {
        'click .face': 'face_clickHandler',
        'click .alert .close': 'alert_closeHandler',
        'click .print-button': 'printHandler',
        'click .export-button': 'exportHandler',
        'change .check-all': 'checkAll_changeHandler',
        'change .check-other': 'checkOther_clickHandler',
        'change .toggle': 'toggle_changeHandler'
      },
      classMap = {
        '.smart-table': 'dianjoy.component.SmartTable',
        '.smart-navbar': 'dianjoy.component.SmartNavbar',
        '.search-result': 'dianjoy.component.SearchResult',
        '.morris-chart': 'dianjoy.component.MorrisChart',
        '.article-editor': 'dianjoy.component.ArticleEditor',
        '.smart-info': 'dianjoy.component.SmartInfo',
        'form': 'dianjoy.component.SmartForm'
      },
      components = [];
  function getPath(str, isCustom) {
    var arr = str.split('.');
    if (isCustom) {
      return custom + arr.join('/') + '.js';
    }
    if (arr[0] === 'dianjoy') {
      arr = arr.slice(1);
    }
    return webURL + 'js/' + arr.join('/') + '.js';
  }

  ns.SubPage = Backbone.View.extend({
    $context: null,
    events: eventsMap,
    initialize: function () {
      this.model.on('change:form', this.modelForm_changeHandler, this);
    },
    clear: function () {
      dianjoy.popup.Manager.off();
      this.destroyComponents();
      this.model.clear({silent: true});
      this.$el.empty();
    },
    destroyComponents: function () {
      this.$el.popover('destroy');

      // 移除组件
      for (var i = 0, len = components.length; i < len; i++) {
        components[i].remove();
      }
      components.length = 0;
    },
    initComponents: function () {
      this.$el.popover({
        html: true,
        selector: '.has-popover'
      });

      this.model.load();
      // 自动初始化组件
      var self = this;
      for (var selector in classMap) {
        var dom = this.$(selector);
        if (dom.length) {
          var init = {
            model: this.model
          };
          var component = Nervenet.parseNamespace(classMap[selector]);
          if (component) {
            dom.each(function () {
              init.el = this;
              components.push(self.$context.createInstance(component, init));
            });
          } else {
            this.loadMediatorClass(classMap[selector], init, dom); // mediator pattern
          }
        }
      }
      // 初始化非本库的自定义组件
      this.$('[data-mediator-class]').each(function (i) {
        var className = $(this).data('mediator-class')
          , component = Nervenet.parseNamespace(className)
          , init = {
            model: self.model
          };
        if (component) {
          init.el = this;
          components.push(self.$context.createInstance(component, init));
        } else {
          self.loadMediatorClass(className, init, $(this), true);
        }
      });
    },
    load: function (url, data) {
      this.setDisabled(true);
      this.clear();
      this.$el.load(url, _.bind(this.loadCompleteHandler, this));
      if (_.isObject(data)) {
        this.model.set(data);
      } else {
        this.model.id = data;
      }
      this.trigger('load:start', url);
      ga('send', 'pageview', url);
    },
    loadMediatorClass: function (className, init, dom, isCustom) {
      var self = this
        , script = document.createElement("script");
      script.async = true;
      script.src = getPath(className, isCustom);
      script.onload = function() {
        this.onload = null;
        var component = Nervenet.parseNamespace(className);
        dom.each(function () {
          init.el = this;
          components.push(self.$context.createInstance(component, init));
        });
      };
      document.head.appendChild(script);
    },
    preCheck: function () {
      for (var i = 0, len = components.length; i < len; i++) {
        if ('preCheck' in components[i] && !components[i].preCheck()) {
          return false;
        }
      }
      return true;
    },
    setDisabled: function (bl) {
      this.$('a.btn').addClass('disabled');
      this.$('button').prop('disabled', bl);
    },
    alert_closeHandler: function (event) {
      var target = $(event.currentTarget).parent();
      if (target.hasClass('media')) {
        var data = {
          m: 'read_all_message',
          id: $(target).attr('id')
          };
        dianjoy.service.Manager.call('user/action_user.php', data);
        return;
      }
      if (!target.hasClass('ad')) {
        return;
      }
      var flag = target.attr('className').match(/noad-\d+/)[0];
      dianjoy.component.model.Cookie.getInstance().add('no-ad', flag);
    },
    checkAll_changeHandler: function (event) {
      var target = event.currentTarget;
      this.$('[type=checkbox][name="' + target.alt + '[]"]').prop('checked', target.checked);
    },
    checkOther_clickHandler: function (event) {
      var table = this.$($(event.currentTarget).attr('data-target'));
      table.find('input[type=checkbox]').not('.check-all').prop('checked', function (i, checked) {
        return !checked;
      });
    },
    face_clickHandler: function(event) {
      var img = $(event.currentTarget).clone();
      img.removeClass('preview img-polaroid');
      dianjoy.popup.Manager.popup(img.attr('alt'), img[0].outerHTML, false);
    },
    modelForm_changeHandler: function (model, value) {
      if (!value) {
        return;
      }
      this.$('.alert')
        .hide()
        .removeClass('alert-success alert-danger')
        .addClass('alert-' + value.className)
        .text(value.msg)
        .slideDown();
      this.$('input, select, button').prop('disabled', false);
    },
    toggle_changeHandler: function (event) {
      var target = $(event.currentTarget),
          classes = target.data('toggle-class').split(' ');
      this.$('.' + classes.join(', .')).toggleClass('hide');
      dianjoy.component.model.Cookie.getInstance().toggle('toggle', classes);
    },
    loadCompleteHandler: function (response, status) {
      if (status === 'error') {
        this.trigger('load:failed');
      } else {
        this.initComponents();
      }
      this.trigger('load:complete');
    },
    exportHandler: function (event) {
      var tables = this.$('table'),
          table = null,
          smartTables = _.filter(components, function (item) {
            return item instanceof dianjoy.component.SmartTable;
          });
      tables.each(function () {
        var t = $('<table><thead></thead><tbody></tobdy></table>'),
            content = $(this).hasClass('smart-table') ? smartTables.shift() : null;
        content = content && 'visibleItems' in content ? $(content.visibleItems).clone() : $(this.tBodies).children(':visible').clone();
        t.find('thead').html(this.tHead.innerHTML);
        t.find('tbody').append(content);
        t.find('.not-print, .btn-group').remove();
        t.find('a').replaceWith(function (i) {
          return this.innerHTML;
        });
        table = table ? table.add(t) : t;
      });
      this.$context.trigger('create-excel', table, '广告数据', event.currentTarget);
    },
    printHandler: function (event) {
      window.print();
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('dianjoy.view')));
