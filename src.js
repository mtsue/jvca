'use strict'

/* modules */
const client = require('cheerio-httpcli');
const async = require('async');
const fs = require('fs');
const request = require('request');

/* URL */
const mainURL = 'http://jvndb.jvn.jp';
const searchURL = mainURL + '/search/index.php';

/* 検索ページアクセス */
var param = []; // URLパラメータ
var access = []; // アクセス関数

for(let i = 0; i < 5; i++){ // 5ページ分
    param[i] = {
        mode: '_vulnerability_search_IA_VulnSearch',
        lang: 'ja',
        keyword: '',
        dateLastPublishedFromYear: '2017',
        dateLastPublishedFromMonth: '02',
        datePublicFromYear: '2017',
        datePublicFromMonth: '02',
        skey: 'd5',
        pageNo: i + 1
    };
    access[i] = client.fetch(searchURL, param[i]);
}

/* 詳細ページのURLを取得 */
var detailURL = []; // 詳細ページURL
var n = 0; // detailURL[]　用
var getURL = []; // アクセス関数

for(let i = 0; i < access.length; i++){
    getURL[i] = function(callback){
        access[i].then(function(data){
            var $ = data.$;

            // 該当件数取得
            var total = 0;
            total = $('.result_class').children('tr').length;

            // 該当件数分繰り返し
            for(let i = 0; i < total; i++){
                var severity = 0; // 深刻度
                $('.result_class').children('tr').eq(i+1).each(function(){
                    severity = parseFloat($(this).children('td').eq(2).text().trim());
                    if(severity >= 5.0){ // 深刻度5.0以上
                        detailURL[n] = mainURL + $(this).children('td').eq(0).children('a').attr('href').trim();
                        n++;
                    }
                });
            }
            callback();
        });
    }
}

var accessDetail = [];
/* getURL async処理 */
async.series(getURL,function(callback){

    for(let i = 0; i < detailURL.length; i++){
        accessDetail[i] = client.fetch(detailURL[i]);
    }
    var getDetail = [];

    var ids = [];
    var products = [];
    var problems = [];
    var dates = [];

    for(let i = 0; i < accessDetail.length; i++){
        getDetail[i] = function(callback){
            accessDetail[i].then(function(data){
                var $ = data.$;

                ids.push($('.vuln_table_clase_td_header').eq(0).parent('tr').prev().prev().text().trim());
                problems.push($('.vuln_table_clase_td_header').eq(0).parent('tr').next().text().trim());
                products.push($('.vuln_table_clase_td_header').eq(2).parent('tr').next().next().text().replace(/\t/g, '').trim());
                dates.push($('.vuln_table_clase_date_header_td').eq(2).next().text().trim());

                callback();
            });
        }
    }

    /* getDetail async処理 */
    async.series(getDetail, function(callback){

        var filename = 'output' + Math.random() + '.csv';
        var writeFile = [];
        writeFile[0] = function(callback){
            fs.writeFile(filename, '', function(hoge){
                console.log('create: ' + filename);
                callback();
            });
        }
        for(let i = 1; i < ids.length; i++){
            writeFile[i] = function(callback){
                fs.appendFile(filename, '"' + ids[i] + '"' + ','  + ',' + '"' + products[i] + '"' + ',' + '"' + problems[i].replace(/"/g, '\'') + '"' + ',' + '起票無' + ',' + '"' + '製品と直接的な関係が無いと思われる' + '"' + ',' + '"' + detailURL[i] +'"' + ',' + '"' + dates[i] + '"' + '\n', function(hoge){
                    callback();
                });
            }
        }
        async.series(writeFile, function(callback){

            var formdata = [];
            var options = [];
            var writeSheet = [];
            for(let i = 0; i < ids.length; i++){
                formdata[i] = {
                    id: ids[ids.length - (i+1)],
                    product: products[products.length - (i+1)],
                    problem: problems[problems.length - (i+1)],
                    url: detailURL[detailURL.length - (i+1)],
                    date: dates[dates.length - (i+1)]
                };
                options[i] = {
                    url: 'https://script.google.com/macros/s/AKfycbyg8DgXgjn3vzulpkZIs8jFRZcx8Z7EMY8mzyva2lP9mQMz_14/exec',
                    form: formdata[i]
                }
                writeSheet[i] = function(callback){
                    request.post(options[i], function(err, res, body){
                        callback();
                    });
                }
            }

            async.series(writeSheet);
        });
    });
});