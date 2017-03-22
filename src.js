'use strict'

/* modules */
const client = require('cheerio-httpcli');
const async = require('async');
const fs = require('fs');

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

                $('.vuln_table_clase').each(function(){
                    if($(this).children('tr').eq(0).text().trim() == '[English]'){
                        ids.push($(this).children('tr').eq(1).text().trim());
                        products.push($(this).children('tr').eq(10).text().trim());
                        problems.push($(this).children('tr').eq(4).text().trim());
                    }else{
                        ids.push($(this).children('tr').eq(0).text().trim());
                        products.push($(this).children('tr').eq(9).text().trim());
                        problems.push($(this).children('tr').eq(3).text().trim());
                    }
                });
                dates.push($('.vuln_table_clase_footer').children('tr').eq(3).children('td').eq(1).text().trim());

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
                console.log('create' + filename);
                callback();
            });
        }
        for(let i = 1; i < ids.length; i++){
            writeFile[i] = function(callback){
                fs.appendFile(filename, '"' + ids[i] + '"' + ','  + ',' + '"' + products[i] + '"' + ',' + '"' + problems[i] + '"' + ',' + '起票無' + ',' + '"' + '製品と直接的な関係が無いと思われる' + '"' + ',' + '"' + detailURL[i] +'"' + ',' + '"' + dates[i] + '"' + '\n', function(hoge){
                    callback();
                });
            }
        }
        async.series(writeFile);
    });
});

/*
var getDetail = [];
for(let i = 0; i < accessDetail.length; i++){
    getDetail[i] = function(callback){
        accessDetail[i].then(function(data){
            var $ = data.$;

            var id = '';
            var product = '';
            var probrem = '';
            var date = '';

            $('.vuln_table_clase').each(function(){
                if($(this).children('tr').eq(0).text().trim() == '[English]'){
                    id = $(this).children('tr').eq(1).text().trim();
                    product = $(this).children('tr').eq(10).text().trim();
                    probrem = $(this).children('tr').eq(4).text().trim();
                }else{
                    id = $(this).children('tr').eq(0).text().trim();
                    product = $(this).children('tr').eq(9).text().trim();
                    probrem = $(this).children('tr').eq(3).text().trim();
                }
            });
            date = $('.vuln_table_clase_footer').children('tr').eq(3).children('td').eq(1).text().trim();
            console.log('aaa');
            callback();
        });
    }
}
*/

/*
var jvca = [];
console.log('getURL' + getURL.length);
for(let i = 0; i < getURL.length; i++){
    jvca[i] = getURL[i];
}
console.log('getDetail' + getDetail.length);
for(let i = getURL.length; i < getDetail.length; i++){
    jvca[i] = getDetail[i];
}
console.log(jvca);
async.series(jvca);
*/



/*
function getDetail(url){
    client.fetch(url, function(error, $, res, body){
        var id = '';
        var product = '';
        var probrem = '';
        var date = '';

        $('.vuln_table_clase').each(function(){
            if($(this).children('tr').eq(0).text().trim() == '[English]'){
                id = $(this).children('tr').eq(1).text().trim();
                product = $(this).children('tr').eq(10).text().trim();
                probrem = $(this).children('tr').eq(4).text().trim();
            }else{
                id = $(this).children('tr').eq(0).text().trim();
                product = $(this).children('tr').eq(9).text().trim();
                probrem = $(this).children('tr').eq(3).text().trim();
            }
        });
        date = $('.vuln_table_clase_footer').children('tr').eq(3).children('td').eq(1).text().trim();


        console.log(id);
        console.log(product);
        console.log(probrem);
        console.log(date);
    });
}
*/
