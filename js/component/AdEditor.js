/**
 * @overview 用来处理编辑广告页的js
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @since 2013-08-08
 */
;(function (ns) {
  'use strict';
  var IOS_PREFIX = 'itms-apps://';
  
  ns.AdEditor = Backbone.View.extend({
    events: {
      'blur [name=ad_url]': 'adURL_blurHandler',
      'click .ad-sdk-type input': 'adSDKType_clickHandler',
      'click .platform label': 'platformButton_clickHandler',
      'click .domestic label, .global label': 'area_clickHandler',
      'click .ad_url button': 'adURLButton_clickHandler',
      'click .multiple img': 'multiImg_clickHandler',
      'change .push-replace': 'pushReplace_changeHandler',
      'mouseover .help-block img': 'thumb_mouseOverHandler',
      'mouseout .help-block img': 'thumb_mouseOutHandler',
      'click .simple img, .simple video': 'simple_clickHandler'
    },
    initialize: function () {
      var init = this.$el.data('init');
      if (init) {
        init = init.replace(/'/g, '"');
        init = init.replace(/(\w+):/g, '"$1":');
        init = JSON.parse(init);
        for (var prop in init) {
          this.$('input[name=' + prop + '][value=' + init[prop] + ']').prop('checked', true).click();
          $('select[name=' + prop + ']').val(init[prop]);
        }
      }
      var url = this.$('#ad_url').val();
      if (url && !/\.(ipa|apk)$/.test(url)) {
        var button = this.$('button[value=url]');
        setTimeout(function () {
          button.click();
        }, 0);
      }
      
      this.model.on('change', this.model_changeHandler, this);
    },
    remove: function () {
      Backbone.View.prototype.remove.call(this);
      this.model.off(null, null, this);
    },
    adSDKType_clickHandler: function (event) {
      this.$el
        .removeClass('ad_list push wap')
        .addClass(event.target.title);
      // 如果是wap则切换到url
      if (event.target.value === '4') {
        this.$('.ad_url button[value=text]').click();
      }
    },
    adURL_blurHandler: function (event) {
      if (this.$el.hasClass('iPhone') && event.target.value.substr(0, 12) !== IOS_PREFIX) {
        event.target.value = event.target.value.replace(/^https?:\/\//i, IOS_PREFIX);
      }
    },
    adURLButton_clickHandler: function (event) {
      $(event.target).closest('.form-group')
        .removeClass('file url')
        .addClass(event.target.value);
    },
    model_changeHandler: function (model) {
      // 自动拆包
      if ('package' in model.changed && model.get('package')) {
        this.$('#pack_name').val(model.get('package'));
        this.$('#ad_size').val((model.get('size') / 1048576 * 100 >> 0) / 100 + 'MB');
        this.$('#ad_lib').val(model.get('version'));
      }
      this.$('#adid').val(model.get('id'));
    },
    multiImg_clickHandler: function(event) {
      var target = $(event.target),
          siblings = target.siblings(),
          input = target.parent().siblings('[type=text], [type=hidden]'),
          urls = '';
      target.remove();
      siblings.each(function() {
        urls += this.src.substr(this.src.indexOf('upload')) + ',';
      });
      input.val(urls.slice(0, -1));
      if (this.preview) {
        this.preview.remove();
      }
    },
    area_clickHandler: function (event) {
      var target = $(event.currentTarget.control);
      this.$el.toggleClass(target.data('class'), target.val() === '1');
    },
    platformButton_clickHandler: function (event) {
      this.$el
        .removeClass('Android iPhone')
        .addClass(event.target.innerText);
    },
    pushReplace_changeHandler: function (event) {
      var self = $(event.currentTarget),
          target = this.$('#' + self.data('for'));
      target.val(self.val());
    },
    thumb_mouseOutHandler: function () {
      if (this.preview) {
        this.preview.remove();
      }
    },
    thumb_mouseOverHandler: function (event) {
      var target = $(event.currentTarget),
          pos = target.offset();
      this.preview = target.clone();
      this.preview
        .removeClass('preview')
        .removeAttr('height')
        .addClass('img-polaroid pos-ab')
        .appendTo(this.$el)
        .css({
          top: pos.top,
          left: pos.left + target.width() + 10
        });
    },
    simple_clickHandler: function(event) {
      var target = $(event.target),
          input = target.parent().siblings('[type=text], [type=hidden]');
      target.remove();
      input.val('');
      if (this.preview) {
          this.preview.remove();
      }
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));
