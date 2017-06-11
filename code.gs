function doPost(e) {
    var rowData = {};

    if (e.parameter == undefined) {
        // パラメータエラーの場合
        var getvalue = "undefined"

        rowData.value = getvalue;
        // JSON に変換
        var result = JSON.stringify(rowData);

        // レスポンス
        return ContentService.createTextOutput(result);

    }else{

        // SpreadSheet ID (https://docs.google.com/spreadsheets/d/<SheetID>/edit)
        var id = 'XXXX';

        // シート名
        var sheet = SpreadsheetApp.openById(id).getSheetByName('XXXX');

        var id = e.parameter.id; // JVNID
        var product = e.parameter.product; // 影響をうける製品
        var problem = e.parameter.problem; // 問題
        var url = e.parameter.url; // JVN url
        var date = e.parameter.date; // 最終更新日

        var writeData = [[id, '',product, problem, '起票無', '製品と直接的な関係が無いと思われる', url, date]];
        
        //シートに配列を書き込み
        sheet.insertRowBefore(1);
        var range = sheet.getRange('A1:H1');
        range.setValues(writeData);

        var getvalue = "ok"

        rowData.value = getvalue;

        // JSON に変換
        var result = JSON.stringify(rowData);

        // レスポンス
        return ContentService.createTextOutput(result);

    }
}
