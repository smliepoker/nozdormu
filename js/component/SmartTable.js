;(function (ns) {
  'use strict';

  var PREFIX = 'o';
  var FixedHeader = Backbone.View.extend({
    className: 'table table-bordered table-header scroll-fix',
    tagName: 'table',
    top: 0,
    events: {
      'click .label': 'label_clickHandler',
      'click .order': 'order_clickHandler',
      'DOMNodeInsertedIntoDocument': 'insertHandler'
    },
    initialize: function (options) {
      this.body = options.body;
      this.isInit = options.body.el.offsetWidth > 0;

      var thead = options.body.$('thead'),
          ths = thead.find('th');
      this.render();
      this.$el
        .appendTo(document.body)
        .append(thead.clone())
        .find('th').each(function (i) {
          this.width = ths[i].offsetWidth;
        });

      var position = options.body.$el.position();
      this.$el.attr('data-top', position.top + 50);
      this.$el.attr('data-index', $('.smart-table').index(options.body.$el));

      this.model.on('change:order', this.order_changeHandler, this);
      this.model.on('change:ad change:ch change:owner change:pub change:status', this.model_filterChangeHandler, this);
    },
    remove: function () {
      this.model.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$el = $('<' + this.tagName + '>', {
        'class': this.className
      });
    },
    model_filterChangeHandler: function () {
      this.$('.label').remove();
      this.$('.filter').append(this.body.$('.filter').find('.label').clone());
    },
    label_clickHandler: function (event) {
      var href = event.currentTarget.href.substr(event.currentTarget.href.indexOf('#'));
      this.body.$('thead a.label[href=' + href + ']').click();
      $(event.currentTarget).remove();
    },
    order_changeHandler: function (index, order) {
      this.$('.fa-sort-amount-asc, .fa-sort-amount-desc').remove();
      this.$('th').eq(index).append('<i class="fa fa-sort-amount-' + order + '"></i>');
    },
    order_clickHandler: function (event) {
      var index = $(event.currentTarget).parent().index();
      this.body.$('th').eq(index).find('a.order').click();
    },
    insertHandler: function () {
      if (!this.isInit) {
        var ths = this.body.$('th');
        this.$('th').each(function (i) {
          this.width = ths[i].offsetWidth;
        });
        this.isInit = true;
      }
      this.$el.off('DOMNodeInsertedIntoDocument');
    }
  });

  var Pager = Backbone.View.extend({
    events: {
      'click a': 'clickHandler'
    },
    initialize: function (options) {
      var total = Math.ceil(options.length / options.perpage);
      this.template = this.$('script').remove().html() || '';
      this.template = this.template ? Handlebars.compile(this.template) : false;
      this.total = total;
      this.length = options.length;
      this.perpage = options.perpage;
      this.render();
      this.displayPageNum(0);
    },
    render: function (page) {
      if (!this.template) {
        return;
      }
      page = page || 0;
      var arr = [],
          start = page - 5 > 0 ? page - 5 : 0,
          end = start + 10 < this.total ? start + 10 : this.total,
          length = end - start;
      for (var i = 0; i < length; i++) {
        arr[i] = i + start + 1;
      }
      this.$el.html(this.template({
        pages: arr,
        prev: page,
        next: page + 2,
        total: this.total,
        total_num: this.length,
        perpage: this.perpage
      }));
    },
    displayPageNum: function (index) {
      this.$('[href="#/to/' + (index + 1) + '"]').parent('.hidden-xs').addClass('active')
        .siblings().removeClass('active');
      var last = this.total - 1;
      this.$el.each(function () {
        $(this).children().first().toggleClass('disabled', index === 0)
          .end().last().toggleClass('disabled', index >= last);
      });
    },
    setTotal: function (total) {
      this.total = Math.ceil(total / this.perpage);
      this.length = total;
    },
    turnToPage: function (index) {
      this.trigger('turn', index);
      this.render(index);
      this.displayPageNum(index);
    },
    clickHandler: function (event) {
      if ($(event.currentTarget).parent().hasClass('disabled')) {
        return false;
      }
      var href = event.currentTarget.href,
          index = Number(href.substr(href.lastIndexOf('/') + 1)) - 1;
      this.turnToPage(index);
      event.preventDefault();
    }
  });

  ns.SmartTable = Backbone.View.extend({
    events: {
      'click tbody .label-ch, tbody .label-ad, tbody .label-pub': 'labelFilter_addHandler',
      'click thead .label': 'labelFilter_removeHandler',
      'click .order': 'order_clickHandler',
      'modified': 'value_modifiedHandler'
    },
    initialize: function () {
      // 重置数据记录
      this.order = [];
      this.sortArray = [];
      this.lastOrder = '';
      var ms = window.location.hash.match(/channel=(.*)$|&/);
      if (ms) {
        this.model.set('ch-label', decodeURIComponent(ms[1]));
      }

      this.model.set({
        ch: this.translate('ch'),
        ad: this.translate('ad')
      });

      // 实现高亮和大类筛选
      this.originClass = this.el.className;
      this.model.on('change:show', this.model_showChangeHandler, this);
      this.model.on('change:keyword', this.model_keywordChangeHandler, this);
      this.model.on('change:ad change:ch change:owner change:pub change:country change:status change:jt change:tt', this.model_filterChangeHandler, this);
      this.model.on('change:id', this.model_changeHandler, this);

      // 遍历全部行，执行筛选和排序的准备工作
      this.travelAll();

      // 固定头部、翻页、编辑器
      var spec = this.$el.data();
      if ('fixHead' in spec) {
        this.header = new FixedHeader({
          body: this,
          model: this.model
        });
      }
      if ('pagesize' in spec && spec.pagesize > 0) {
        this.isPaged = true;
        this.items = this.$('tbody').children();
        this.$('tbody').empty();
        this.pagination = new Pager({
          el: spec && 'pagination' in spec ? spec.pagination : this.$('.pager'),
          perpage: spec.pagesize,
          length: this.items.length
        });
        this.pagination.on('turn', this.pagination_turnHandler, this);
        this.$('.waiting').remove();
      }
      this.filterRows();
    },
    remove: function () {
      if (this.header) {
        this.header.remove();
      }
      if (this.pagination) {
        this.pagination.off();
        this.pagination.remove();
      }
      this.model.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    applySortArray: function (children, row) {
      var obj = {ad: row},
          len = this.order.length - 1;
      for (; len > -1; len--) {
        obj[PREFIX + this.order[len]] = Number(children[this.order[len]].innerText.replace(/[\s\-:\u5143\u00a5%,]/g, ''));
      }
      this.sortArray.push(obj);
    },
    filterRows: function() {
      // TODO: 这个函数很丑陋的保留了两种筛选机制，将来 http://whale.dianjoy.com:3000/issues/12270 的时候一并处理掉
      var filters = this.model.getFilters(),
          isShowAll = _.all(filters, function (value) {
            return value === undefined || value === -1;
          }),
          classes = _.map(filters, function (element, key) {
            return element === -1 ? '' : '.' + key + '-' + element;
          }),
          show = this.model.get('show'),
          keyword = this.model.get('keyword');
      classes = classes.join('');

      if (this.isPaged) {
        if (isShowAll && !show && !keyword) {
          this.visibleItems = this.items;
        } else {
          classes += show ? '.' + show.split(' ').join('.') : '';
          this.visibleItems = _.filter(this.items, function (item) {
            return (!classes || $(item).is(classes)) && (!keyword || item.innerText.indexOf(keyword) !== -1);
          }, this);
        }
        this.pagination.setTotal(this.visibleItems.length);
        this.pagination.turnToPage(0);
        this.model.set('table-items', this.visibleItems);
        return;
      }

      var list = this.$('tbody');
      if (isShowAll && !show) {
        list.removeClass('hide hide-all');
      } else if (show) {
        this.$el.addClass(show);
      } else {
        list.addClass('hide hide-all')
          .children('.show').removeClass('show')
          .end().children(classes).addClass('show');
        list.removeClass('hide');
      }
    },
    setFrameHeight: function () {
      if (frameElement) {
        frameElement.height = document.body.offsetHeight;
      }
    },
    translate: function (key) {
      var id = -1,
          selected = this.model.get(key + '-label'),
          parent = this.$('.filter');
      parent = parent.hasClass(key) ? parent.filter('.' + key) : parent;
      if (selected !== '-') {
        this.$('.label-' + key).each(function () {
          if (this.innerText === selected) {
            id = Number(this.href.substr(this.href.lastIndexOf('-') + 1));
            $(this).clone().appendTo(parent);
            return false;
          }
        });
      }
      return id;
    },
    travelAll: function () {
      var self = this,
          all = [];
      if (this.$('.order').length) {
        this.$('a.order').each(function (i) {
          self.order.push($(this).parent().index());
        });
        all.push(this.applySortArray);
      }
      this.$('tbody tr').not('.amount').each(function (i) {
        var children = $(this).children(),
            len = all.length - 1;
        for (; len > -1; len--) {
          all[len].call(self, children, this);
        }
      });
    },
    turnToPage: function (index) {
      this.visibleItems = this.visibleItems || this.items;
      if (this.visibleItems.length === 0) {
        this.$('tbody').empty();
        return;
      }
      var start = this.$('th.desc').length === 0 ? 0 : this.visibleItems.length - 1,
          dir = this.$('th.desc').length === 0 ? 1 : -1,
          end = this.pagination.perpage < this.visibleItems.length - index * this.pagination.perpage ? this.pagination.perpage : this.visibleItems.length - index * this.pagination.perpage,
          fragment = document.createDocumentFragment();
      for (var i = 0; i < end; i++) {
        fragment.appendChild(this.visibleItems[start + dir * (i + index * this.pagination.perpage)]);
      }
      this.$('tbody').removeClass('hide hide-all').html(fragment);
    },
    labelFilter_addHandler: function (event) {
      var filter = event.target.hash.match(/#(\w+)\-(\d+)/);
      this.model.set(filter[1], Number(filter[2]));
      this.model.set(filter[1] + '-label', event.currentTarget.innerText);
      event.preventDefault();
    },
    labelFilter_removeHandler: function (event) {
      var filter = event.target.hash.match(/#(\w+)\-(\d+)/);
      this.model.set(filter[1], -1);
      this.model.set(filter[1] + '-label', '-');
      event.preventDefault();
    },
    model_changeHandler: function (model, value) {
      var status = this.$el.data('status'),
          ids = '#' + value.split(',').join(',#');
      this.$(ids).removeClass(status).addClass(status.split(' ')[this.model.get('to')]);
      this.model.unset('id', {silent: true});
    },
    model_filterChangeHandler: function (model, value) {
      for (var prop in model.changed) {
        value = model.get(prop);
        if (!_.isNumber(value)) {
          continue;
        }
        this.$('.filter').find('[href^=#' + prop + ']').remove();
        if (value !== -1) {
          var head = this.$('.filter');
          if (head.length > 1) {
            head = head.filter('.' + prop);
          }
          head.append(this.$('[href=#' + prop + '-' + value + ']').first().clone());
        }
      }
      this.filterRows();
      this.setFrameHeight();
    },
    model_keywordChangeHandler: function () {
      this.filterRows();
    },
    model_showChangeHandler: function (model, value) {
      // TODO: issues/12270 要改
      if (this.isPaged) {
        this.filterRows();
      } else {
        $('.amount').addClass('hide');
        this.$('tbody').removeClass('hide hide-all').children('.show').removeClass('show');
        this.$el.attr('class', this.originClass + ' ' + value);
      }
      this.setFrameHeight();
    },
    order_clickHandler: function (event) {
      var parent = $(event.currentTarget).parent(),
          key = PREFIX + parent.index(),
          list = this.$('tbody'),
          amount = list.find('.amount').remove(),
          order = parent.hasClass('asc') ? 'desc' : 'asc';
      var func = order === 'asc' ? 'append' : 'prepend';

      // 显示图标
      parent.siblings().andSelf()
        .removeClass('asc desc')
        .find('.fa-sort-amount-asc, .fa-sort-amount-desc').remove();
      parent
        .addClass(order)
        .append('<i class="fa fa-sort-amount-' + order + '"></i>');

      // 键值一样就不需要再排序了
      if (this.lastOrder !== key) {
        this.sortArray.sort(function (a, b) {
          return a[key] - b[key];
        });
        this.lastOrder = key;
        this.items = this.isPaged ? _.map(this.sortArray, function (obj) {
          return obj.ad;
        }) : null;
      }
      if (this.isPaged) {
        this.filterRows();
      } else {
        // 正序排列或倒序排列
        this.$el.addClass('hide');
        _.each(this.sortArray, function (obj) {
          list[func](obj.ad);
        });
        this.$el.removeClass('hide');
        list.append(amount);
      }

      this.trigger('change:order', parent.index(), order);
      event.preventDefault();
    },
    pagination_turnHandler: function (index) {
      this.turnToPage(index);
    },
    value_modifiedHandler: function (event, value) {
      var index = $(event.target).closest('td').index(),
          order = this.$('th').eq(index).find('.order');
      if (order.length) {
        var row = $(event.target).closest('tr')[0];
        for (var i = 0, len = this.sortArray.length; i < len; i++) {
          if (this.sortArray[i]['ad'] === row) {
            this.sortArray[i][PREFIX + index] = value;
            break;
          }
        }
      }
    }
  });
}(Nervenet.createNameSpace('Dianjoy.component')));
