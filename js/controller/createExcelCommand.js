(function (ns) {
  'use strict';

  var uri = 'data:application/vnd.ms-excel;base64'
    , template = Handlebars.compile('<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{{worksheet}}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{{#each tables}}<table>{{{this}}}</table>{{/each}}</body></html>');
  
  function base64(string) {
    return window.btoa(decodeURIComponent(encodeURIComponent(string)));
  }
  
  ns.createExcelCommand = function (tableList, name, a) {
    var tables = [];

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
