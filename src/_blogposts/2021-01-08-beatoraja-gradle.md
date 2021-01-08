---
slug: beatoraja-gradle
date: 2021-01-08
category: programming
tag: [ programming, java, gradle, bms, beatoraja ]
description: |
    beatorajaのビルドスクリプトをよりわかりやすい形に書き直す
---

# gradleでbeatorajaをビルドする

## 概要

beatorajaはjavaで実装されたオープンソースのBMSプレイヤーである。beatorajaは成果物の作成のためにantを使用しているが正直見づらいし依存しているjarは直置きされているしであれなのでもう少し現代的なgradleを使ってビルド操作を見通しの良いものにする。

なおjavaに関しては自分自身まともに触った経験がないので細かいところはご了承を。

## 環境

Manjaro Linux x64上のAdoptOpenJDK15(AURで入るやつ)

## gradleプロジェクトの作成

リポジトリのルートで`gradle init`すると。

```sh
.gradle/
gradle/
gradlew
gradlew.bat
build.gradle
settings.gradle
```

あたりが生成される。このうち`build.gradle`を編集していく。

今回ビルド対象となるのはjavaのアプリケーションなのでそれを認識させるためにまず以下を記入する。

```groovy
// build.gradle
plugins {
    id 'java'
    id 'application'
}

mainClassName = 'bms.player.beatoraja.MainLoader'
```

次にソースを認識させるんだけど、まずbeatorajaのソースコードディレクトリ構造は普通のjavaプロジェクトとはちょっと違うらしい(おそらく普通は`src/main/java`配下にアプリのコード、`src/test/java`配下にテスト用コードか?)。ディレクトリを教えるために以下を追記する。

```groovy
// build.gradle
sourceSets {
    main {
        java {
            srcDir 'src'
        }
        resources {
            srcDir 'src'
        }
    }
}
```

さらに文字コードも指定しておく(Windowsに持っていったらコケたため)。

```groovy
// build.gradle
tasks.withType(JavaCompile) {
    options.encoding = 'UTF-8'
}
```

## 依存ライブラリ

### JavaFX

JavaFXはJava8くらいまでは同梱されていたUIライブラリで、beatoraja起動時の設定画面に使用されている。

gradleではJavaFXをうまく使うためのプラグインがopenjfxから公開されているのでそれを使うのが良さそう。

```groovy
// build.gradle
plugins {
    id 'java'
    id 'application'
    // 追加
    id 'org.openjfx.javafxplugin' version '0.0.9'
}

javafx {
    // 使うモジュールだけ書く
    modules = ['javafx.controls', 'javafx.fxml', 'javafx.graphics']
}
```

### JavaFX以外

今のbeatorajaが依存しているjarの一覧は[ここ](https://github.com/exch-bms2/beatoraja/tree/master/lib)にあるが、これには依存の依存も含まれているので可能な限りそれらを削ぎ落としたい。

[これ](https://mocha-repository.info/beatoraja/2018/07/05/beatoraja%E3%81%A7%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA/)によると少なくとも2年半前時点では

- LibGDX
- JavaCV
- SQLite-JDBC
- PortAudio
- luaj

に依存していたらしい。[Maven Central](https://search.maven.org/)で地道にパッケージ名を調べつつ、

```groovy
// build.gradle
repositories {
    google()
    mavenCentral()
    jcenter()
}

ext {
    gdxVersion = '1.9.10'
    ffmpegVersion = '4.3.1'
    javacppVersion = '1.5.4'
}

dependencies {
    // Apache Commons
    implementation 'commons-dbutils:commons-dbutils:1.7'
    implementation 'org.apache.commons:commons-compress:1.20'

    // libGDX
    implementation "com.badlogicgames.gdx:gdx:${gdxVersion}"
    implementation "com.badlogicgames.gdx:gdx-platform:${gdxVersion}:natives-desktop"
    implementation "com.badlogicgames.gdx:gdx-controllers:${gdxVersion}"
    implementation "com.badlogicgames.gdx:gdx-controllers-desktop:${gdxVersion}"
    implementation "com.badlogicgames.gdx:gdx-controllers-lwjgl:${gdxVersion}"
    implementation "com.badlogicgames.gdx:gdx-controllers-platform:${gdxVersion}:natives-desktop"
    implementation "com.badlogicgames.gdx:gdx-freetype:${gdxVersion}"
    implementation "com.badlogicgames.gdx:gdx-freetype-platform:${gdxVersion}:natives-desktop"
    implementation "com.badlogicgames.gdx:gdx-backend-lwjgl:${gdxVersion}"

    // JavaCPP ( FFmpeg + OpenCV )
    implementation "org.bytedeco:ffmpeg:${ffmpegVersion}-${javacppVersion}"
    implementation "org.bytedeco:ffmpeg:${ffmpegVersion}-${javacppVersion}:windows-x86"
    implementation "org.bytedeco:ffmpeg:${ffmpegVersion}-${javacppVersion}:windows-x86_64"
    implementation "org.bytedeco:ffmpeg:${ffmpegVersion}-${javacppVersion}:macosx-x86_64"
    implementation "org.bytedeco:ffmpeg:${ffmpegVersion}-${javacppVersion}:linux-x86"
    implementation "org.bytedeco:ffmpeg:${ffmpegVersion}-${javacppVersion}:linux-x86_64"
    implementation "org.bytedeco:javacv:${javacppVersion}"

    implementation 'org.jflac:jflac-codec:1.5.2'
    implementation 'org.luaj:luaj-jse:3.0.1'
    implementation 'org.twitter4j:twitter4j-core:4.0.7'
    implementation 'org.xerial:sqlite-jdbc:3.34.0'

    implementation files('lib/jbms-parser.jar')
    implementation files('lib/jbmstable-parser.jar')
    implementation files('lib/jportaudio.jar')

    testImplementation 'junit:junit:4.12'
}
```

とした。`repositories`は適当だけどみんなこうしてるし多分きっとおそらく大丈夫。`ext`は設定しとくと色々便利。

jportaudioは[PortAudio公式がjava向けに公開しているバインディング](https://github.com/PortAudio/portaudio/tree/master/bindings/java/jportaudio)らしいけどmaven centralには見当たらなかったのでとりあえず`lib/`配下のものを使用。[このissue](https://github.com/exch-bms2/beatoraja/issues/320)を見る限り主要3環境でなんとかなりそうだから同時にビルドするのもありな気がする。

ちなみにlibgdxの最新版は1.9.13だが、1.9.10から破壊的変更があるらしく少しいじらないといけないのでとりあえず1.9.10で保留。microの更新でそういう変更するのは正直やめてほしい。

## 実行

`./gradlew run`でビルド、実行できる。beatorajaの設定画面が表示されたらOK。
