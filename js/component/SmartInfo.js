/**
 * Created by 路佳 on 14-3-22.
 * 这个mediator主要帮助元素加载远程数据并填充到内部
 * 元素的默认内容应写在元素内
 * 加载到数据之后，渲染出来的HTML会替换各占位符
 */
;(function (ns) {
  ns.SmartInfo = Backbone.View.extend({
    spec: null,
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());
      this.spec = this.$el.data();
      if ('infoId' in this.spec) {
        this.model.once('change:' + this.spec.infoId, this.idReadyHandler, this);
      } else {
        this.model.urlRoot = this.spec.url;
        this.model.once('sync', this.render, this);
        this.model.fetch();
      }
    },
    render: function (model) {
      this.$el.html(this.template(model.toJSON()));
    },
    idReadyHandler: function (model, id) {
      var Model = Backbone.Model.extend({
        urlRoot: this.spec.url
      });
      this.model = new Model({id: id});
      this.model.once('sync', this.render, this);
      this.model.fetch();
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));