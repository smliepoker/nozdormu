/**
 * Created by meathill on 14-3-19.
 */
;(function (ns) {
  'use strict';

  var params
    , popup;

  function callPopup(model, options) {
    popup = dianjoy.popup.Manager.popupEditor(model, options);
    popup.on('submit', onSubmit);
  }
  function collection_syncHandler(collection) {
    params.options.options = collection.toJSON();
    callPopup(params.model, params.options);
  }
  function onSubmit() {
    var attr = {};
    attr[params.prop] = popup.value();
    params.model.save(attr, {
      patch: true,
      wait: true,
      success: onSuccess,
      error: onError
    });
    popup.displayProcessing();
  }
  function onError(error) {
    console.log(error);
    popup.displayResult(false, '修改失败，请稍后重试', 'fa-frown-o');
    popup.reset();
  }
  function onSuccess () {
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
      if (this.collection) {
        this.collection.off();
      }
      this.collection = new Backbone.Collection({
        url: options.url
      });
      this.collection.on('sync', collection_syncHandler, this);
      return;
    }
    callPopup(model, options);
  }
}(Nervenet.createNameSpace('dianjoy.controller')));