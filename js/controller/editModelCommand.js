/**
 * Created by meathill on 14-3-19.
 */
;(function (ns) {
  'use strict';

  var collection
    , params
    , popup
    , isFirstTime = true;

  function apply(attr) {
    params.model.save(attr, {
      patch: true,
      wait: true,
      success: onSuccess,
      error: onError
    });
  }
  function callPopup(model, options) {
    popup = dianjoy.popup.Manager.popupEditor(model, options);
    if (isFirstTime) {
      popup.on('submit', onSubmit);
      isFirstTime = false;
    }
  }
  function clear() {
    if (collection) {
      collection.off();
    }
    collection = params = null;
  }
  function collection_addHandler(model) {
    if (model.get('code') !== 0) {
      onError(model.get('msg'));
    } else {
      apply(_.omit(model.toJSON(), 'id', 'code'));
    }
  }
  function collection_resetHandler(collection) {
    params.options.options = collection.toJSON();
    callPopup(params.model, params.options);
  }
  function onSubmit() {
    var value = popup.value()
      , attr = {};
    popup.displayProcessing();
    // 没有选项集，就不需要转化
    if (!collection) {
      attr[params.prop] = value;
      apply(attr);
    }
    // 用户选择了集合里有的
    if (collection.get(value)) {
      attr[params.prop] = value;
      attr[params.options.display] = collection.get(value).get('label');
      apply(attr);
      return;
    }
    // 用户输入了集合里有的
    var model = collection.find(function (model) {
      return model.get('label') === value;
    });
    if (model) {
      attr[params.prop] = model.id;
      attr[params.options.display] = value;
      apply(attr);
      return;
    }
    // 娘滴，真没有，只好新建了
    attr[params.options.display] = value;
    collection.create(attr, {wait: true});
  }
  function onError(error) {
    console.log(error);
    clear();
    popup.displayResult(false, '修改失败，请稍后重试', 'fa-frown-o');
    popup.reset();
  }
  function onSuccess () {
    clear();
    popup.displayResult(true, '修改成功', 'fa-smile-o');
    popup.hide();
  }

  ns.editModelCommand = function (model, prop, options) {
    options.prop = prop;
    options.value = model.get(prop);
    params = {
      model: model,
      prop: prop,
      options: options
    };
    // 有可能需要从远程取数据
    if (options.url) {
      if (collection) {
        collection.off();
      }
      collection = new Backbone.Collection();
      collection.url = options.url;
      collection.on('reset', collection_resetHandler, this);
      collection.on('add', collection_addHandler, this);
      collection.fetch({reset: true});
      callPopup(model);
      return;
    }
    callPopup(model, options);
  }
}(Nervenet.createNameSpace('dianjoy.controller')));