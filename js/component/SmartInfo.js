/**
 * Created by 路佳 on 14-3-22.
 * 这个mediator主要帮助元素加载远程数据并填充到内部
 * 元素的默认内容应写在元素内
 * 加载到数据之后，渲染出来的HTML会替换各占位符
 */
;(function (ns) {
  ns.SmartInfo = Backbone.View.extend({
    $context: null,
    spec: null,
    events: {
      'click .edit': 'edit_clickHandler',
      'click .process-button': 'processButton_clickHandler',
      'change .stars input': 'star_changeHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html().replace(/\s{2,}|\n/g, ''));
      this.spec = this.$el.data();
      if ('infoId' in this.spec) {
        this.model.on('change:' + this.spec.infoId, this.idReadyHandler, this);
      } else {
        this.model.urlRoot = this.spec.url;
        this.model.once('sync', this.render, this);
        if (this.model.id && !this.spec.wait) {
          this.model.fetch();
        } else {
          this.render();
        }
      }
      this.$el.popover({
        selector: '.process-button',
        delay: {hide: 3000}
      });
    },
    remove: function () {
      this.model.off(null, null, this);
      if (this.page) {
        this.page.off(null, null, this);
      }
      this.$el.popover('destroy');
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      this.model.on('change', this.model_changeHandler, this);
      this.$('time').text(function () {
        return moment(this.innerHTML).fromNow();
      });
      this.$('[name=remark][value=' + this.model.get('remark') + ']').prop('checked', true);
    },
    idReadyHandler: function (model, id) {
      // 把页面公用model保存到page里
      if (this.page) {
        this.model.id = id;
        this.model.fetch();
        return;
      }
      var Model = Backbone.Model.extend({
        idAttribute: this.spec.infoId,
        urlRoot: this.spec.url
      });
      var data = {};
      data['infoId' in this.spec ? this.spec.infoId : 'id'] = id;
      this.page = this.model;
      this.model = new Model(data);
      this.model.on('sync', this.render, this);
      this.model.fetch();
    },
    edit_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , options = target.data()
        , prop = event.currentTarget.hash.substr(1);
      options.type = options.type || 'short-text';
      this.$context.trigger('edit-model', this.model, prop, options);
      event.preventDefault();
    },
    model_changeHandler: function (model) {
      for (var prop in model.changed) {
        var target = this.$('[href=#' + prop + ']')
          , type = target.data('type')
          , key = target.data('display') ? target.data('display') : prop;
        switch (type) {
          case 'img':
            target.find('img').attr('src', model.changed[key]);
            break;

          default:
            if (target.data('refresh')) {
              var info = $(this.template(model.toJSON()));
              target.replaceWith(info.find('[href=#' + prop + ']'));
            } else {
              target.text(model.changed[key]);
            }
            break;
        }
      }
    },
    processButton_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , pick = target.data('pick')
        , href = target.attr('href')
        , json = JSON.stringify(pick ? this.model.pick(pick.split(',')) : this.model.toJSON());
      href = href.replace(':json', encodeURIComponent(json));
      $.get(href);
      target.addClass('disabled')
        .find('i').addClass('fa-spin fa-spinner');
      event.preventDefault();
      setTimeout(function () {
        target.popover('hide');
      }, 5000);
    },
    star_changeHandler: function (event) {
      this.model.save({
        remark: event.currentTarget.value
      }, {
        wait: true,
        patch: true
      });
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));