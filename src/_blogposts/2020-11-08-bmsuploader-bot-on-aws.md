---
slug: bmsuploader-bot-on-aws
category: programming
tag: [programming, aws, aws/lambda, aws/dynamodb, twitter, bms]
date: 2020-11-08
description: |
    @bmsuploaderをAWSに移行したときの話
---

# twitter bot(@bmsuploader)をAWS上に移行した

## 要約

BMS差分アップローダー新着通知bot([@bmsuploader](http://twitter.com/bmsuploader))というtwitter botをしばらく昔から運用している。これは今までの間自宅に設置している[Raspberry Pi](https://www.raspberrypi.org/)の上のcronで動かしていたが、様々な理由からクラウド上に移行する気になった。移行に際しての格闘記録をこの記事にまとめる。

## 実際なぜ移行したのか

メインの理由はRaspbian 8のサポート終了(EOL)に始まる。大元であるDebian 8 Jessieのサポート終了に合わせてRaspbian 8のサポートも[今年の6月いっぱいで終了した](https://www.debian.org/News/2020/20200709)。なので更新しないとなーと思ってたんだけど一回botを止めるならいっそのことクラウドで完結させちゃおうかな?と考えたのが始まり。ちなみに普段のraspiの用途は主にプライベートなgitリポジトリのホスティングやちょっとした実験くらい。

## AWS or GCP or Azure? IaaS or PaaS or FaaS?

てなわけでこいつらで実現できるかを調べたんだけど選定の軸として

- 無料枠でできる範疇に収めたい
- リソースをあまり持て余したくない

というのがあった。前者はいいとして後者は例えばbotを1つ動かすためにVMを24時間起動みたいなのはあまりやりたくないなあという意味。なので自然にFaaS+定期実行するためのサービスという形が理想になる。

ということで調べるとまずAzureはよくわからなくて(?????)他2つは

- GCP: Scheduler -> PubSub -> Functions
- AWS: EventBridge -> Lambda

という感じでできるらしいということがわかった。このうちGCPは1ステップ多い & Schedulerに無料枠で3つまでしか登録できないらしいということでAWSを使うことにした。

## 引っかかった場所一覧

LambdaをPythonで書くことに決めたわけだがまあそれなりに躓いたのでそれをメモ。AWSの各種サービスを使うライブラリとして[boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)を使用している。

### 冪等性の魔物

AWS Lambdaに限らず各種Functionは一回の呼び出しで複数回実行されるケースがあるらしい。これを根本的に避ける方法は存在しないらしく、自前で適当に回避しなくてはならないのがなかなか面倒だった。今回やってみたのはDynamoDBに特定の値が存在するかどうかで多重実行を防ぐやつ。

```python
dynamodb.put_item(
    Item={
        "label": {"S": "meta"},
        "key": {"S": "lock-rosx-notifier"},
        "value": {"S": "lock"},
    },
    TableName="bmsuploader",
    ConditionExpression="attribute_not_exists(label)",
)
```

`ConditionExpression`で引っかかったら何もせず関数を終了させればいい。終了時に`delete_item`を忘れずに。

### `get_parameters`の返り値の順番は引数で指定した順番と無関係

実行に際し必要なパラメーターはAWS Systems ManagerのParameter Storeに置いておくことにした。取り出すには`get_parameter`、`get_parameters`といったメソッドを使えば良い。

それで見出しの通りだけど、

```python
ssm.get_parameters(Names=["qwer", "asdf", "zxcv"])
```

と書いたとしても、返り値の`Items`要素は`Names`の順番と無関係である。`["zxcv", "qwer", "asdf"]`みたいになってくるのでチェックが必要。ドキュメントはちゃんと読もう。

### DynamoDBのqueryのキーに対する条件は1キーあたり1つまで

DynamoDBのqueryで「ソートキーが`head`で始まり、かつ`somekey`より後になるようなもの」を条件にしようと以下のようにした。

```python
dynamodb.query(
    TableName="bmsuploader",
    KeyConditionExpression="label = :lbl AND begins_with ( #k , :head ) AND #k > :somekey",
    ExpressionAttributeNames={"#k": "key"},
    ExpressionAttributeValues={
        ":lbl": {"S": "rosx-entry"},
        ":head": {"S": head},
        ":somekey": {"S": somekey},
    },
)
```

これを実行するとエラーになる。エラー文の`when calling the Query operation: KeyConditionExpressions must only contain one condition per key`にある通りソートキーである`key`に対する条件は複数個繋げられないらしい(まあ当然っちゃ当然かも)。後半2条件のうち1つを削ってあとは関数側で対処する他ない。いやテーブル設計時点でどうにかするべきなのかもしれないけれども…。

### デプロイ

これは別件で知っていたから詰まったわけではないけどC Extensionを使ったPythonライブラリに依存する場合そのライブラリはAmazon Linux 2上でビルドしたものを使う必要がある。[公式イメージ](https://hub.docker.com/search?q=amazon%2Faws-sam-cli-build&type=image)を使うなり[serverless](https://www.serverless.com/)に[serverless-python-requirements](https://github.com/UnitedIncome/serverless-python-requirements)あたりを組み合わせて使うのがいい。

## 定期実行

Lambdaの定期実行について調べるとCloudWatch Eventsというのが大量に引っかかるがこれは今EventBridgeに改名されているらしい。まあ特になにか変わるということもなくcron式のようなものを定義してやればその時間に関数を実行できる。今回は

- 昼間は毎時00分: `0 * * * ? *`
- 夜は毎時00分と30分: `0/30 * * * ? *`

に関数が走るように2つのスケジュールを設定した。普通のcron式よりも1つ枠が多いのに注意する(最後の1枠は年を表す)。

## 運用とフィードバック

CloudWatch Logsで見る限り関数はだいたい指定時刻から45秒位遅れて実行されているらしい。許容範囲ということでいいと思うが、発火時刻の制約が厳しい処理には向かないと言える。

今回は一つの関数で全て済ませているが、いろいろ調べてみるとSQS FIFOというFIFOメッセージキューを使って処理を分割するとすっきりした構造にできるかもしれないということに気づいた。これは近いうちに試してみたい。
