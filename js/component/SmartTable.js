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
      var total = Math.ceil(options.length / options.pagesize);
      this.template = this.$('script').remove().html() || '';
      this.template = this.template ? Handlebars.compile(this.template) : false;
      this.total = total;
      this.pagesize = options.pagesize;
      this.render();
      this.displayPageNum();
    },
    render: function () {
      if (!this.template) {
        return;
      }
      var page = this.model.get('page')
        , arr = []
        , start = page - 5 > 0 ? page - 5 : 0
        , end = start + 10 < this.total ? start + 10 : this.total
        , length = end - start;
      for (var i = 0; i < length; i++) {
        arr[i] = {
          index: i + start,
          label: i + start + 1
        };
      }
      this.$el.html(this.template({
        pages: arr,
        prev: page - 1,
        next: page + 1
      }));
    },
    displayPageNum: function () {
      var page = this.model.get('page');
      this.$('[href="#/to/' + page + '"]').parent('.hidden-xs').addClass('active')
        .siblings().removeClass('active');
      this.$el.each(function () {
        $(this).children().first().toggleClass('disabled', page === 0)
          .end().last().toggleClass('disabled', page >= this.total - 1);
      });
    },
    setTotal: function (total) {
      this.total = Math.ceil(total / this.pagesize);
      this.render();
      this.displayPageNum();
    },
    clickHandler: function (event) {
      if ($(event.currentTarget).parent().hasClass('disabled')) {
        return false;
      }
      var target = $(event.currentTarget)
        , href = target.attr('href')
        , index = Number(href.substr(href.lastIndexOf('/') + 1));
      this.model.set('page', index);
      target.html('<i class="fa fa-spin fa-spinner"></i>');
      this.$el.children().addClass('disabled');
      event.preventDefault();
    }
  });

  ns.SmartTable = Backbone.View.extend({
    $context: null,
    events: {
      'click tbody .label-ch, tbody .label-ad, tbody .label-pub': 'labelFilter_addHandler',
      'click thead .label': 'labelFilter_removeHandler',
      'click .order': 'order_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'click .edit': 'edit_clickHandler',
      'sortupdate': 'sortUpdateHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').html());
      var init = this.$el.data();
      // 重置数据记录
      this.order = [];
      this.sortArray = [];
      this.lastOrder = '';

      var options = {
        url: init.url,
        pagesize: init.pagesize
      };
      if ('id' in init) {
        options.model = Backbone.Model.extend({idAttribute: init.id});
      }
      this.collection = dianjoy.model.ListCollection.createInstance(null, options);
      this.collection.on('reset', this.render, this);
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);

      // 实现大类筛选
      this.model.on('change', this.model_changeHandler, this);

      // 固定头部、翻页、编辑器
      if ('fixHead' in init) {
        this.header = new FixedHeader({
          body: this,
          model: this.model
        });
      }
      if ('pagesize' in init && init.pagesize > 0) {
        this.isPaged = true;
        this.pagination = new Pager({
          el: init && 'pagination' in init ? init.pagination : this.$('.pager'),
          model: this.model,
          pagesize: init.pagesize
        });
      }

      // 排序
      if (this.$el.hasClass('sortable')) {
        this.$('tbody').sortable();
      }

      this.collection.fetch(this.model.toJSON());
    },
    remove: function () {
      if (this.header) {
        this.header.remove();
      }
      if (this.pagination) {
        this.pagination.off();
        this.pagination.remove();
      }
      this.collection.off();
      dianjoy.model.ListCollection.destroyInstance(this.collection.url);
      this.model.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    render: function (collection) {
      this.$('.waiting').hide();
      this.$('tbody').html(this.template({list: collection.toJSON()}));
      if (this.pagination) {
        this.pagination.setTotal(this.collection.total);
      }
      this.model.trigger('load:complete');
    },
    filterRows: function() {
      // TODO: 这个函数很丑陋的保留了两种筛选机制，将来 http://whale.gamepop.com:3000/issues/12270 的时候一并处理掉
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
    collection_changeHandler: function (model) {
      var changed = model.changed
        , target;
      for (var prop in changed) {
        target = this.$('#' + model.id + ' [href="#' + prop + '"]');
        if (target.data('refresh')) {
          var tr = $(this.template({list: [model.toJSON()]}))
            , index = target.closest('td').index();
          target.parent().replaceWith(tr.children().eq(index));
        } else if (target.children().is('img')) {
          target.children('img').attr('src', changed[prop]);
        } else {
          target.text(changed[prop]);
        }
      }
    },
    collection_removeHandler: function (model) {
      this.$('#' + model.id).fadeOut(function () {
        $(this).remove();
      })
    },
    deleteButton_clickHandler: function (event) {
      if (!confirm('确定删除么？')) {
        return;
      }
      var target = $(event.currentTarget)
        , tr = target.closest('tr');
      target.prop('disabled', true)
        .find('i').addClass('fa-spin fa-spinner');
      this.collection.get(tr.attr('id')).destroy({
        wait: true,
        error: function (model, response) {
          target.prop('disabled', false)
            .find('i').removeClass('fa-spin fa-spinner');
          console.log(response.msg);
          alert('删除失败');
        }
      });
      event.preventDefault();
    },
    edit_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , data = target.data()
        , index = target.closest('td').index()
        , prop = event.currentTarget.hash.substr(1)
        , id = target.closest('tr').attr('id')
        , model = this.collection.get(id)
        , options = _.extend({
          label: this.$('thead th').eq(index).text()
        }, data);
      data.type = data.type || 'short-text';
      options[data.type] = true;
      this.$context.trigger('edit-model', model, prop, options);
      event.preventDefault();
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
    model_changeHandler: function (model) {
      if (_.intersection(_.keys(model.changed), _.keys(model.defaults)).length === 0) {
        return;
      }
      this.collection.fetch(model.toJSON());
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
    sortUpdateHandler: function (event, ui) {
      var item = ui.item
        , index = item.index()
        , id = item.attr('id')
        , model = this.collection.get(id);
      this.collection.add(model, {at: index});
      this.collection.trigger('sort', model, index);
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));
