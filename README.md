# JVN Vulnerability Check Application #

## Description ##
http://jvndb.jvn.jp のデータ持ってきてcsvファイルに書き込む  
また、GoogleAppsScriptを使用して GoogleSpreadSheet に自動書込

## How to use ##
### 下準備 ###
* GoogleSpreadSheet
    1. Googleスプレッドシートを開き、`ツール -> スクリプトエディタ` からスクリプトエディタを開く
    2. code.gs の内容をコピペ
    3. `シートID`と`シート名`をそれぞれ `XXXXX` となってる部分に入力
    4. `公開 -> ウェブアプリケーションとして導入`
    5. `次のユーザーとしてアプリケーションを実行` から、 `自分` を選択
    6. `アプリケーションにアクセスできるユーザー` を `全員（匿名ユーザーを含む）` を選択
    7. `更新` を押す

* Node.js
    1. src.js の `spreadURL = XXXXX;` に ウェブアプリケーションとして導入した際に発行された URL を記入
    2. `$ npm install` で、必要なモジュールをインストール

### 実行 ###
`$ npm start`