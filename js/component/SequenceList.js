/**
 * 排序列表
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @since 2013-08-14
 */
;(function (ns) {
  'use strict';
  var length = 0;
  ns.SequenceList = Backbone.View.extend({
    events: {
      'click .top.btn': 'topButton_clickHandler',
      'click .bottom.btn': 'bottomButton_clickHandler'
    },
    initialize: function () {
      this.$el.sortable({
        placeholder: "ui-state-highlight"
      });
      this.$el.disableSelection();
      length = this.$el.children().length;
      
      this.aside = this.$el.prev();
      this.aside.on('click', '.btn-primary', _.bind(this.submitButton_clickHandler, this));
    },
    remove: function () {
      this.aside.off('click').remove();
      Backbone.View.prototype.remove.call(this);
    },
    showResult: function (type) {
      this.aside.find('.alert-' + type)
        .slideDown()
        .delay(4000)
        .slideUp();
      this.aside.find('.btn-primary')
        .prop('disabled', false)
          .end().find('.icon-spinner').remove();
    },
    bottomButton_clickHandler: function (event) {
      var target = $(event.target).closest('li');
      this.$el.append(target);
    },
    submitButton_clickHandler: function (event) {
      var seq = [];
      this.$el.children().each(function (i) {
        seq.push({
          pack_name: this.title,
          seq_rmb: length - i
        });
      });
      dianjoy.service.Manager.call('ad/action_ad.php', {
        seq: seq,
        m: 'adjust_seq'
      }, this.successHandler, this.errorHandler, this);
      
      var button = $(event.currentTarget);
      button
        .prop('disabled', true)
        .prepend('<i class="icon-spinner icon-spin"></i>');
    },
    topButton_clickHandler: function (event) {
      var target = $(event.target).closest('li');
      this.$el.prepend(target);
    },
    errorHandler: function () {
      this.showResult('error');
    },
    successHandler: function () {
      this.showResult('success');
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));

