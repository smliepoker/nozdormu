(function (ns) {
  'use strict';

  var uri = 'data:application/vnd.ms-excel;base64'
    , template = Handlebars.compile('<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{{worksheet}}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{{#each tables}}<table>{{{this}}}</table>{{/each}}</body></html>');
  
  function base64(string) {
    return window.btoa(decodeURIComponent(encodeURIComponent(string)));
  }

  function getTables(el) {
    var tables = el.find('table')
      , table = null
      , smartTables = dianjoy.component.Manager.find(el, '.smart-table');
    tables.each(function () {
      var t = $('<table><thead></thead><tbody></tobdy></table>')
        , content = $(this).hasClass('smart-table') ? smartTables.shift() : null;
      content = content && 'visibleItems' in content ? $(content.visibleItems).clone() : $(this.tBodies).children(':visible').clone();
      t.find('thead').html(this.tHead.innerHTML);
      t.find('tbody').append(content);
      t.find('.not-print, .btn-group').remove();
      t.find('a').replaceWith(function (i) {
        return this.innerHTML;
      });
      table = table ? table.add(t) : t;
    });
  }
  
  ns.createExcelCommand = function (el, name, a) {
    var tables = []
      , tableList = getTables(el);

    for (var i = 0; i < tableList.length; i++) {
      tables.push(tableList[i].innerHTML);
    }
    var data = {
      worksheet: name || 'Worksheet',
      tables: tables
    };
    a.href = uri + base64(template(data));
  };
}(Nervenet.createNameSpace('dianjoy.controller')));
