---
slug: flakehell
category: programming
tag: [python, poetry, flake8, flakehell, vscode]
date: 2020-12-21
description: |
    flake8の設定をpyproject.tomlに記述できるようにするラッパーライブラリflakehellを試してみる
---

# flakehellを使ってflake8の設定をpyproject.tomlに統合する

## 概要

pythonのlinterとしてよく挙げられる[flake8](https://flake8.pycqa.org/en/latest/)だが、最近ちょくちょく聞くようになったpyproject.tomlには対応していない([なんか対応しないような雰囲気がある](https://gitlab.com/pycqa/flake8/-/issues/428))。少し調べると[flakehell](https://flakehell.readthedocs.io/)というflake8をpyproject.tomlに対応させるラッパーライブラリが存在するらしいので、poetry+vscodeな環境で使ってみる。

## インストール

何も難しいことはない。poetryを使っている環境であれば

```sh
$ poetry add -D flakehell
```

とすればいいだけ。
flake8のcliに相当するコマンドを利用するには例えば

```sh
$ poetry run flakehell lint filename
```

あるいは

```sh
$ poetry run flake8helled filename
```

とする。

## 実行例

以下のようなファイルを用意する。

```python
# asdf.py
import re



def test():
    pass



```

未使用importがあったりあからさまに余分な改行が多い。

これをflakehellに食わせてみると、

```sh
$ poetry run flakehell lint asdf.py
$
```

何も警告が出ない。ちなみにflake8では

```sh
$ poetry run flake8 asdf.py
asdf.py:1:1: F401 're' imported but unused
asdf.py:5:1: E303 too many blank lines (3)
asdf.py:9:1: W391 blank line at end of file
$
```

という感じになる。これはなぜかというとflakehellはデフォルトではどのプラグインも有効にされていないからである。

flake8のデフォルトに合わせるにはpyproject.tomlに

```toml
# pyproject.toml 抜粋
[tool.flakehell.plugins]
pyflakes = ["+*"]
pycodestyle = ["+*"]
```

のようにプラグインを記述すればいい(はず)。
再度試すと

```sh
$ poetry run flakehell lint asdf.py
asdf.py:5:1: E303 too many blank lines (3) [pycodestyle]
asdf.py:9:1: W391 blank line at end of file [pycodestyle]
asdf.py:1:1: F401 're' imported but unused
$
```

と出てくる。若干順番が違ったりしているが問題なさそう。

この他の`.flake8`に書くタイプの設定についても[ドキュメント](https://flakehell.readthedocs.io/config.html)を見る限り簡単に移植できそう。

## VSCodeで使う

vscodeのpython拡張は何も指定しなければ確かpylintを使うので、flake8を使っている人は次のような設定になっているんじゃないかと思う。

```json
// .vscode/settings.json 抜粋
{
    // ...
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    // ...
}
```

このままだと`flakehell`ではなく`flake8`が実行されることになるので、`"python.linting.flake8Path"`を使ってそれを書き換える。とりあえずLinux+ディレクトリ内venvで動かすことだけを考えるなら

```json
// .vscode/settings.json 抜粋
{
    // ...
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "python.linting.flake8Path": ".venv/bin/flake8helled",
    // ...
}
```

みたいにすれば動いてくれると思う。

## まとめ

flakehell自体には特に不満ないし良いプロダクトだと思うんだけどやっぱり理想としてはflake8がちゃんとpyproject.tomlをサポートしてくれることだよなあ。

## 参考文献

- [Using Flake8 and pyproject.toml with FlakeHell](https://dev.to/bowmanjd/using-flake8-and-pyproject-toml-with-flakehell-1cn1)

    flake8+pyprojectで検索すると即出てくる記事。これで知った。

- [FlakeHell](https://flakehell.readthedocs.io/)

    flakehell公式。困ったらまず見よう。

- [Flake8: Your Tool For Style Guide Enforcement](https://flake8.pycqa.org/)

    flake8公式。困ったらこっちも見よう。
