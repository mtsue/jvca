function doPost(e) {
  //JSONオブジェクト格納用の入れ物
  var rowData = {};

  if (e.parameter == undefined) {

      //パラメータ不良の場合はundefinedで返す
      var getvalue = "undefined"

      //エラーはJSONで返すつもりなので
      rowData.value = getvalue;
      var result = JSON.stringify(rowData);
      return ContentService.createTextOutput(result);

  }else{

      //書込先スプレッドシートのIDを入力
      var id = 'XXXX';

      //スプレッドシート名指定 "シート1"
      var sheet = SpreadsheetApp.openById(id).getSheetByName('XXXX');

      var id = e.parameter.id;
      var product = e.parameter.product;
      var problem = e.parameter.problem;
      var url = e.parameter.url;
      var date = e.parameter.date;

      var writeData = [[id, '',product, problem, '起票無', '製品と直接的な関係が無いと思われる', url, date]];
      //シートに配列を書き込み
      //sheet.appendRow(array);
      sheet.insertRowBefore(1);
      var range = sheet.getRange('A1:H1');
      range.setValues(writeData);

      //書き込み終わったらOKを返す
      var getvalue = "ok"

      //エラーはJSONで返すつもりなので
      rowData.value = getvalue;
      var result = JSON.stringify(rowData);
      return ContentService.createTextOutput(result);

  }
}
