---
slug: beatoraja-lightweight-jre
date: 2021-01-09
category: programming
tag: [ programming, java, gradle, jdk, jre, bms, beatoraja ]
description: |
    gradleのプラグインを活用しつつ軽量JREを楽に作る。ただし落とし穴っぽいのもちょくちょくある。
---

# beatoraja向けの軽量JREを生成する

## 概要

Javaアプリケーションを配布する方法はいくつか考えられるが、アプリケーションで使用する機能のみを抽出した軽量なJREを作成し同梱、配布する方法がその一つとして存在する。[昨日の記事](/blog/beatoraja-gradle/)で構成したbeatoraja向けのgradleビルド環境を利用してこの軽量JREを作成し配布するまでのプロセスを簡略化したい。

## `gradle-badass-jlink`と`gradle-badass-runtime`

[`gradle-badass-jlink`](https://badass-jlink-plugin.beryx.org/releases/latest/)と[`gradle-badass-runtime`](https://badass-runtime-plugin.beryx.org/releases/latest/)はともにgradle用のプラグインで、プロジェクトに適した軽量JREを自動生成してくれる。両者の違いはJava 9で導入されたモジュール化の有無によるもので、beatorajaはモジュール化されていないためそれに対応する後者を利用することになる。gradleプラグインとしての名前は`org.beryx.runtime`でプロジェクト名と若干違っているので注意。

```groovy
// build.gradle
// 前回から追記
plugins {
    id 'java'
    id 'application'
    id 'org.openjfx.javafxplugin' version '0.0.9'
    id 'org.beryx.runtime' version '1.12.1'
}
```

## プラグインの設定とJREの生成

### 初期の設定

まずは最低限の設定を記述する。先に書いておくけどこれだと生成は成功するがうまく起動できない。

```groovy
// build.gradle
jar {
    manifest {
        attributes('Main-Class': 'bms.player.beatoraja.MainLoader')
    }
}

runtime {
    // とりあえずdocsに書いてあるやつ
    options = ['--strip-debug', '--compress', '2', '--no-header-files', '--no-man-pages']
}
```

この状態で`./gradlew runtime`を実行すると`build/image`配下にJRE付きのbeatorajaが生成される。実行するには`./build/image/bin/beatoraja`を叩く。

### JavaFXへの対応

生成したはいいがこれは実行時に蹴られる。

```sh
$ ./build/image/bin/beatoraja
Error: JavaFX runtime components are missing, and are required to run this application
```

JavaFX周りでコケていることがわかる。少し調べると[Main-Classが`javafx.application.Application`を継承しているとよくない](https://stackoverflow.com/a/52654791)らしい。

ベストアンサーほぼコピペで以下のようなクラスを作る。

```java
// src/bms/player/beatoraja/Main.java
package bms.player.beatoraja;

public class Main {
    public static void main(String[] args) {
        // 元のmainを実行するだけ
        MainLoader.main(args);
    }
}
```

```groovy
// build.gradle
jar {
    manifest {
        attributes('Main-Class': 'bms.player.beatoraja.Main') // 修正
    }
}
```

この設定で再生成すると今度こそ起動できるようになる。

### 証明書関連

実はまだ操作がたりていない。

実行時ログを見ると新たに以下のような例外が送出されていることがわかる。

```sh
$ ./build/image/bin/beatoraja
Jan 10, 2021 12:04:33 AM bms.player.beatoraja.launcher.PlayConfigurationView initialize
情報: 初期化時間(ms) : 5
Jan 10, 2021 12:04:34 AM bms.player.beatoraja.MainLoader$GithubVersionChecker getInformation
警告: 最新版URL取得時例外:Received fatal alert: handshake_failure
```

GitHubと通信しようとしたけどハンドシェイクが失敗、あたりの情報が読み取れる。実際起動した設定画面左上のバージョンチェックは失敗していることからも何らかの問題が起きていることがわかるし、IRに繋ぐときもおそらく問題が起こるだろう。

これも少し調べると[`jdk.crypto.ec`モジュールが足りていない](https://stackoverflow.com/a/54785281)ことが原因であろうことがわかる。

プラグインにより自動で追加されるモジュールとは別に他のモジュールを追加するには[`additive`と`modules`を使えば良い](https://badass-runtime-plugin.beryx.org/releases/latest/#_properties)。

```groovy
// build.gradle
runtime {
    options = ['--strip-debug', '--compress', '2', '--no-header-files', '--no-man-pages']
    additive = true
    modules = ['jdk.crypto.ec']
}
```

ここまで設定するとおそらく動作に問題がないJREを生成できたと言える。

## まとめ

### サイズ

未圧縮状態の`build/image/`の容量は約175MB、zipに圧縮(deflate)したら約140MBだった。fat jarのサイズが80MBとかなので環境込み+本来必要ないネイティブライブラリ群(他プラットフォーム向けのffmpeg-nativeとか)込みでこの大きさだったら十分実用的じゃないかな?そういうのをを真面目に削れば100MB切りくらいは行けそうな気がする。

ちなみに[beatoraja 0.8.1](https://mocha-repository.info/download.php)のLiberica JDK丸ごとバンドル版(多分)は558MB。厳しい。

### 実際の配布

もちろんこれだけではそのまま配布できないので必要なファイル(READMEとかskinとか)を適切な場所にコピーしたりする操作も必要な気がする。本来そっち側を先に考えるべきな気もするけどまあ面白そうな方を先にやっててもいいよね。やるか知らんけど。
