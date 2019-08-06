---
slug: format-vuepress-project
date: 2019-08-06
category: programming
tag: [ programming, javascript, vuepress, eslint, prettier, stylus, vscode ]
description: |
    VSCode上のVuePressプロジェクトでESLint+PrettierをStylusをサポートしつつもうまく走らせるためにいろいろ頑張った話
---

# VuePressプロジェクトのためのlinter設定

## はじめに

[最初の記事](/blog/first-post/)で書いたようにこのサイトは[VuePress](https://v1.vuepress.vuejs.org/)で構築されており、基本的にVSCode上で編集しています。
このようなコードの可読性やらなんやらを良い状態で保つために各言語にlinter+formatterが存在する(ことが多い)んですが、JavaScriptのそれがやたら入り組んでいたり落とし穴に引っ掛かったりしたのでそれをまとめておきます。

結果だけ知りたい方は[こちら](#結果)。

## 目標設定

VuePressプロジェクトに含まれる主要ファイルの種類はおおよそ

* `*.js, *.ts` : JavaScript, TypeScriptのファイル

    `.vuepress/config.js`とかプラグインとか

* `*.vue` : Vuejsの単一コンポーネントファイル

    テーマとか

* `*.md, *.html` : Markdown, HTML

    コンテンツ

のいずれかであると言っていいと思います。このうち`*.js`と`*.vue`の文法チェック+フォーマットができる状態にまでもっていくのを目標とします。またVSCodeで保存時に自動的にフォーマットできるように設定もします。

## 前準備

[EditorConfig](https://editorconfig.org/)でフォーマットに関するごく基本的な設定だけしておきます。まあこの辺はお好みで。

```ini
# .editorconfig
root = true

[*]
indent_style = space
indent_size = 4

end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

## ライブラリのインストール・設定

### インストール

JSのlinter+formatterの記事は少し調べればわかるように既に市井にあふれています。その中で比較的使っている人が多そうなESLint+Prettierを基準にやっていきます。これはJSのlinterであるESLintのプラグインとしてJSのフォーマッターであるPrettierを登録し、ESLint経由でフォーマットを行う設定となります。

```sh
yarn add -D eslint prettier eslint-plugin-prettier eslint-config-prettier
```

vueファイルも扱いたいのでそのプラグインもいれます。

```sh
yarn add -D eslint-plugin-vue
```

必要なものはこれだけです。

### 基本設定

ここまで済んだら`.eslintrc`を作りましょう。jsとしても書けますが凝ったものは必要なさそうなのでjsonで大丈夫です。

```json
// .eslintrc
{
    "root": true,
    "env": {
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/essential",
        "plugin:prettier/recommended"
    ],
    "plugins": ["prettier", "vue"],
    // お好みで
    "rules": {
        // フォーマットされてないと警告
        "prettier/prettier": 1,
        // 未使用変数はエラー(_から始まる変数は例外的に許可)
        "no-unused-vars": [2, { "argsIgnorePattern": "^_" }]
    }
}
```

これで基本的な設定まで終わりました。概観する分には楽ですね。

### VuePress固有の設定

この時点で`yarn eslint --ext .js,.vue .`とかすればそれぞれの拡張子を持つファイルをフォーマットしてくれるはずですが、何故だか上手くいきません。ここで最初に引っかかりました。

```sh
yarn eslint --ext .js,.vue .

# Oops! Something went wrong! :(
#
# ESLint: 6.1.0.
#
# No files matching the pattern "." were found.
# Please check for typing mistakes in the pattern.
```

いや普通にファイルたくさんあるけど。

こちらの原因はESLintそのものの仕様にあります。簡潔に言うと**dotfilesはデフォルトで無視されるっぽくしかもundocumentedらしい**。えー。

[do not ignore files started with \`.\` by default · Issue #10341 · eslint/eslint · GitHub](https://github.com/eslint/eslint/issues/10341)

VuePressで使えない!って報告している人もいたみたい。

仕方がないので`.eslintignore`にホワイトリストを書くことでチェックできるようにしました。

```sh
# .eslintignore
!.vuepress
```

これでコマンドラインでちゃんと動くようになった。

```sh
yarn eslint --ext .js,.vue .

# Done in 2.31s.
```

## VSCodeの設定

### 基本設定

VSCodeには[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)及び[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)と連携するための拡張機能があるため、基本的にはそれに乗っかるようにすればうまくいきます。ファイル保存時にESLintが有効なファイルをフォーマットするためには`.vscode/settings.json`に以下の設定を足せば十分。これも調べるとすぐ出てくる設定です。

```json
// .vscode/settings.json
{
    // 競合を防ぐためVSCode全体の自動フォーマットは無効化しておく
    "editor.formatOnSave": false,
    // ESLintが有効なファイルでは自動フォーマット
    "eslint.autoFixOnSave": true,
    // ESLint経由でPrettierを使用
    "prettier.eslintIntegration": true,
}
```

### vueファイル

ESLintの機能をvueファイルにも適用するために`eslint.validate`にvueに関する設定を追加します。

```json
// .vscode/settings.json
{
    // フォーマット対象にvueを追加
    "eslint.validate": [
        "javascript",
        {
            "language": "vue",
            "autoFix": true
        }
    ],
}
```

また、シンタックスハイライトのためには[Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur)という拡張機能が必要です。ただこの拡張機能はこの拡張機能でPrettierと連携してフォーマットする機能があるので、それを無効にしてあげる必要があります。さて、ここで重要なのが

* PrettierはStylusをフォーマットしてくれない

* Veturは拡張機能[Manta's Stylus Supremacy](https://marketplace.visualstudio.com/items?itemName=thisismanta.stylus-supremacy)を経由してStylusをフォーマット可能

* Veturのフォーマット機能は*vueファイルそのもの*のフォーマットは**行わない**

* ESLint+Prettierは*vueファイルそのもの*のフォーマットも行う

という点です。VuePressはStylusを主に使用しているためフォーマットできるようにしておくのが無難でしょう(というか自分がStylusしかわからない)。ファイルそのもののフォーマットとは何かというと、例えば以下の自明なvueファイルを考えます。

```vue
<!-- Sample.vue -->
<template>
    <div></div>
</template>



<script></script>



<style></style>
```

この内容に対しVSCode上でVeturによるフォーマットをかけても内容が変化しないのに対し、Eslint+Prettierによるフォーマットを行うと以下のように改行の数が調整されます。

```vue
<!-- Sample.vue (Eslint+Prettier) -->
<template>
    <div></div>
</template>

<script></script>

<style></style>
```

つまり、ESLint+Prettierはvueファイルに含まれる基本的なタグ`<template>, <script>, <style>`の配置を含めてフォーマットするのに対し、Veturはこれらのタグの中身のみをフォーマットするということが分かります。以上を踏まえると、Stylusを使いつつなるべく良い出力にするためにはESLint+PrettierとVetur、両方のフォーマット機能を有効にしつつ衝突しないように設定する必要があります。

```json
{
    // Veturのフォーマット機能自体は有効化
    "vetur.format.enable": true,
    // Stylus以外のフォーマット機能を全部無効に
    "vetur.format.defaultFormatter.html": "none",
    "vetur.format.defaultFormatter.js": "none",
    "vetur.format.defaultFormatter.ts": "none",
    "vetur.format.defaultFormatter.css": "none",
    "vetur.format.defaultFormatter.scss": "none",
    "vetur.format.defaultFormatter.less": "none",
    "vetur.format.defaultFormatter.postcss": "none",
    "vetur.format.defaultFormatter.stylus": "stylus-supremacy",
    // EditorConfigに合わせる
    "vetur.format.options.tabSize": 4,
    // お好みで
    "stylusSupremacy.insertBraces": false,
    "stylusSupremacy.insertColons": false,
    "stylusSupremacy.insertSemicolons": false,
    // *.vueに対してのみVSCodeの自動フォーマットを有効化
    // これによってVeturによるStylusのフォーマットのみ行われる
    "[vue]": {
        "editor.formatOnSave": true
    }
}
```

これにより、vueファイル保存時に

* `eslint.autoFixOnSave`で着火されるESLint+Prettierによるフォーマット(Stylus以外)

* `[vue]: editor.formatOnSave`で着火されるVetur+StylusSupremacyによる`<style lang="stylus">`のフォーマット

が走ることになりますが、これまでの構成によりこれら2処理は互いに競合せず、またフォーマットに関する警告・エラーも吐きません。めでたしめでたし。

## npm scripts (ついで)

linterとformatterに対応するコマンドをnpm scriptとして用意しておくと何かと楽できます。

```json
// package.json
{
    // ...
    "scripts": {
        // ...
        "lint": "eslint --ext .js,.vue .",
        "fix": "eslint --fix --ext .js,.vue ."
    }
}
```

ところで[`.eslintrc`の`rules`で`prettier/prettier`を`1`(warning)に設定した](#基本設定)のはエディタで編集中に文法的に正しいものにエラー出すのはおかしくね?という個人的な意見によるものなのですが、完成品を文法チェックする際にはwarningでなくerrorにしたい気がします。そういう時には`--rule`オプションでルールを上書きすることができます。

```json
// package.json
{
    // ...
    "scripts": {
        // ...
        "lint": "eslint --rule \"prettier/prettier: 2\" --ext .js,.vue .",
        "fix": "eslint --fix --ext .js,.vue ."
    }
}
```

## 結果

以下に示すような設定になりました。少し別の設定も足してるけど。

* [.editorconfig](https://github.com/GNQG/website/blob/52f0f1b15ec21231639e3d56eb6b01a1bb5723b3/.editorconfig)

* [.eslintrc](https://github.com/GNQG/website/blob/52f0f1b15ec21231639e3d56eb6b01a1bb5723b3/.eslintrc)

* [.eslintignore](https://github.com/GNQG/website/blob/52f0f1b15ec21231639e3d56eb6b01a1bb5723b3/.eslintignore)

* [.vscode/settings.json](https://github.com/GNQG/website/blob/52f0f1b15ec21231639e3d56eb6b01a1bb5723b3/.vscode/settings.json)

* [.vscode/extensions.json](https://github.com/GNQG/website/blob/52f0f1b15ec21231639e3d56eb6b01a1bb5723b3/.vscode/extensions.json)

CIの文法チェックも今のところ普通に通っているので多分問題なさそう。

## まとめ

この言語面倒すぎない?Rustのrustfmt+rlsが神々しく見えてくる。
