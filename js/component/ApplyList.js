/**
 * 申请提现页面
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @since 2013-09-02
 */
;(function (ns) {
  ns.ApplyList = Backbone.View.extend({
    initialize: function () {
      if (this.model.has('init')) {
        var init = this.model.get('init');
        this.$el.prev().find('.nav').children().eq(init.status).addClass('active');
        this.$el.prev().find('select').val(init.searchType);
        this.$el.next().find('a[title=' + init.pn + ']').parent().addClass('active');
      }
      
      dianjoy.service.Manager.on('complete:call', this.changeHandler, this);
    },
    changeHandler: function (response) {
      var tr = this.$('#' + response.aid);
      tr
        .removeClass('status-0 status-1 status-2')
        .addClass('status-' + response.to)
        .find('.status .label').text(response.description)
        .end().find('.remark').text(function(i, text) {
          return response.remark || text;
        })
        .end().children().last().removeClass();
      if (response.to === 1 || response.to === -1) {
        tr.children().last().html('已处理');
      }
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));

