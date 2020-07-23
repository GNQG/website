---
slug: migrate-to-github-actions
category: programming
tag: [programming, github, github actions, circleci, vercel]
date: 2020-07-23
description: |
    CircleCIでビルド、デプロイしてたんだけどGitHub Actionsに移行してみてなかなかよかった。
---

# サイトの自動デプロイ環境をGitHub Actionsに移行した

## はじめに

ブログの最終投稿日がほぼ1年前で震えてる。適当にやっていきたいとは何だったのか…。

これまでCircleCIでやっていたこのサイトのビルド、デプロイをGitHub Actionsに全面移行したのでその概要を書いていきたい。
とはいえ同様の記事は市井に溢れているためポイントだけさらう感じで書いていくことにする。

## workflow, job, step

Actionsでは大きい順にworkflow、job、stepといった実行単位があり、そのうちworkflowは必ず並列に実行される。そのためbuild→deployの手順を踏まなければならない今回のケースではこの2つの操作を2つのworkflowに分けることはできない。今回はjobを使う(大抵はjobを使う)。

とはいえ[jobもそのままでは並列に実行されてしまう](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobs)。jobに実行順序を導入するためには[jobs.needs](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idneeds)を使えばよい。今回はbuild jobの後にdeploy jobを実行したいため、

```yaml
# .github/workflow/main.yml 抜粋
jobs:
  build:
    name: build website
    # 省略
  deploy:
    name: deploy website
    needs: build
    # 省略
```

みたいに書けばよい。

## 実行環境

ありがたいことにActionsは[LinuxだけでなくWindows, macosにも対応](https://docs.github.com/ja/actions/reference/virtual-environments-for-github-hosted-runners)している。また多くのプロジェクトではUbuntuを実行環境として選ぶことが多いと思うが、これにはかなり多くのツールがデフォルトで含まれている(例:[Ubuntu-18.04](https://github.com/actions/virtual-environments/blob/master/images/linux/Ubuntu1804-README.md))。このサイトはVuePressを用いて作成されており基本的にYarnを用いて操作するが、Node.js、Yarnともにデフォルトで存在するため新たにインストールする必要はない。

もっとも個人ウェブサイトだからそうしているのであって、ライブラリのテストなどをする際は[setup-node](https://github.com/actions/setup-node)あたりを使う必要が出てくるだろう。

## job間のデータの受け渡し

job間で環境はリセットされるため、データをやり取りしたい場合には[`actions/upload-artifact`](https://github.com/actions/upload-artifact)と[`actions/download-artifact`](https://github.com/actions/download-artifact)を使えばよい。

```yaml
# .github/workflow/main.yml 抜粋
jobs:
  build:
    # 省略
    steps:
      # 省略
      - name: generate contents
        run: yarn build
        env:
          TZ: Asia/Tokyo
      - name: save generated contents
        uses: actions/upload-artifact@v2
        with:
          # 適当な名前
          name: generated-contents
          # 保存したいもの
          path: |
            public/
            vercel.json
  deploy:
    steps:
      - name: checkout
        uses: actions/checkout@v2
      - name: import generated contents
        uses: actions/download-artifact@v2
        with:
          name: generated-contents # 前に指定した名前
          path: workdir # 展開先
      # 省略
```

## 様々なaction

上でさらっと使っているが`steps`内で`uses: <action name>`とすることで色々便利なactionを使うことができる。ほぼ必須なのはリポジトリをcloneしてくる[`actions/checkout`](https://github.com/actions/checkout)とキャッシュを管理する[`actions/cache`](https://github.com/actions/cache)あたりだろうか。`actions/checkout`はsubmoduleのcloneも指定すればやってくれるので便利だと思う。

これまでに出てきた4つはいずれも公式actionだが、ユーザーによるものも多数存在する。自分は[Vercel](https://vercel.com)にデプロイしたいので[`amondnet/vercel-action`](https://github.com/amondnet/vercel-action)を使っている。便利。

ところでCircleCIにもactionsに類似する機能として[Orbs](https://circleci.com/docs/ja/2.0/orb-intro/)というものがある。柔軟さで言えばOrbsのほうが若干上かな?と思うが中身へのアクセスのしやすさなどから個人的にはactionのほうが好き。

## 実行

適切にsecretsやらなんやら設定してpush(`on: push`を使用)。

大まかな実行時間は

|service|time(no cache)|time(initial cache fetch)|time(cached)|
|:-----:|:------:|:----------:|:----------:|
|GitHub Actions|1m40s|2m45s|1m05s|
|CircleCI|1m20s| - |1m05s|

といったところ。初めてキャッシュのキーがヒットしたときにキャッシュを持ってくるのが遅い?のかもしれない。あとは同じくらいか。CircleCIより遅いと聞いていたのであんまり変わらないのはなにより。重い操作とかしたらまたわからないけど。

## まとめ

実際にどんなファイルになったのかは[こちら](https://github.com/GNQG/website/tree/f1549e7f2d097ed7a758ad0461c3a7a94322de56/.github/workflows)参照。特に問題なく動いている。

思ったこと書きなぐっただけになったけど、いくつか良い点をまとめておくとすれば、

- Linux, Windows, macosという3大OS(って呼んでいいよね?)に無料での標準対応

- GitHubそのもののエコシステム(例えばissueとかPRとか)にも適合したイベントトリガー

- actionを開発するコミュニティとの連携のしやすさ、また必然的にユーザーが多くなることによる開発の活発化

あたりになるか。
