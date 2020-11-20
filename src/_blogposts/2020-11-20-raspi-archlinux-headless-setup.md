---
slug: raspi-archlinux-headless-setup
category: programming
tag: [programming, linux, archlinux, arm, raspberrypi, systemd, systemd-networkd, wpa_supplicant]
date: 2020-11-20
---

# RasPi向けArch Linux ARMのheadlessセットアップ

## はじめに

[先週の記事](/blog/run-raspi-sd-on-qemu/)で触れたようにRaspberry Pi(初代Type B Rev.2)を更新することにしたが、それに際しOSとしてこれまで使ってきた(Raspbian改め)[Raspberry Pi OS](https://www.raspberrypi.org/software/)ではなく[Arch Linux ARM](https://archlinuxarm.org/)を選択した。このインストールについてSDカードを挿入するだけで使用可能になるように構成する。

## 具体的なゴール

- sshdの自動起動
- ネットワーク及びwifi接続に関連する設定

を行えれば同一ネットワーク内からからssh接続が可能になる。これを目指す。

## 公式ドキュメントにおけるheadless setupについて

headless setupというキーワードは[公式ドキュメント](https://www.raspberrypi.org/documentation/configuration/wireless/headless.md)に登場し、まさにこの記事でやりたいことを達成する方法が記載されている。ただしこれはRaspberry Pi OSに限った設定方法のため、他のOSではそのままでは適用できないことに注意する(具体的には各設定を実現するsystemdサービスはRasPiOSにしか含まれていないことによる)。

## Arch Linux ARMのインストール

様々なハードについて[公式にやり方が丁寧に紹介されている](https://archlinuxarm.org/platforms)。今回は自分の環境に合わせ[armv6向けRaspberry Piの設定](https://archlinuxarm.org/platforms/armv6/raspberry-pi)に従いSDカードを準備する。ただしこれからファイルシステムの中身を覗くために`umount`はしないでおく。

以降、セットアップしたいSDカードのルートファイルシステムが`/mnt`にマウントされているとする。

## `systemctl enable`について

systemdで管理されているサービスを有効にするサブコマンドとして`enable`があるが、これが本質的に何をしているのかを雑に言うと`/etc/systemd/`以下の適切な場所にサービスファイルを指すsymlinkを作成している。つまり手作業で`systemd enable`をしたければその適切な場所に適切なsymlinkを貼ればいいということになる。

適切な場所というのはまあもちろんサービスによるんだけど、今回登場するものに関しては`/etc/systemd/system/multi-user.target.wants/`について考えればいい。

## デフォルトのサービス

現在Archのルートファイルシステムが`/mnt`にマウントされているから、Archでインストール時点で有効になっているサービスを調べるには

```sh
$ ls /mnt/etc/systemd/system/multi-user.target.wants/
remote-fs.target sshd.service systemd-networkd.service systemd-resolved.service
```

とすればよい。これによりすでにsshdが有効になっていることがわかる。

## ネットワーク及びwifi接続に関連する設定

RasPiOSのデフォルトはdhcpcdだが、先の結果からArchではsystemd-networkdがデフォルトで有効になっていることがわかるので、それに乗っかる形で設定をするのが良い。

### systemd-networkd

デフォルトで含まれる接続設定は

```sh
$ ls /mnt/etc/systemd/network
eth.network
```

```ini
# cat /mnt/etc/systemd/network/eth.network
[Match]
Name=eth0

[Network]
DHCP=yes
DNSSEC=no
```

となっている。これはraspiにくっついてるEthernetポートに対応する設定だが、今回は無線LANアダプタに固定IPを割り当てたいので以下のようなnetworkファイルを作成した。

```ini
[Match]
Name=wlan0

[Network]
# 環境により適切に設定を読み替える
Address=192.168.1.100/24
Gateway=192.168.1.1
DNS=192.168.1.1
# Cloudflare派
DNS=1.1.1.1
DNS=1.0.0.1
```

ところでデバイスに名前を対応させるudevは最近のバージョンではもはや`wlanN`という命名を行わず`wlpNsM`みたいな名前を使うらしい。armv6のArchでは`wlanN`の形式がまだ使われているっぽいけどもしそれ以降のものを使うなら`Name=wl*`とかにしたほうがいいかもしれない。

### `wpa_supplicant`

無線LANに関する設定をしておかなければならない。例えば`wpa_supplicant`や`iwd`などが知られているが

```sh
$ ls /mnt/usr/bin/wpa_*
wpa_cli wpa_passphrase wpa_supplicant

$ ls /mnt/usr/bin/iw*
iw iwconfig iwevent iwgetid iwlist iwpriv iwspy
```

と、`wpa_supplicant`はあるが`iwd`は無いので前者を使うのが良い。

上で書いたように`wlan0`向けの設定を行う。`wpa_supplicant-wlan0.conf`を用意し、`/etc/wpa_supplicant`の下に置く。

```sh
# wpa_supplicant-wlan0.confは手書きでもいい
wpa_passphrase $SSID $passphrase > wpa_supplicant-wlan0.conf
chmod 0600 wpa_supplicant-wlan0.conf
cp wpa_supplicant-wlan0.conf /etc/wpa_supplicant/wpa_supplicant-wlan0.conf
```

続いてサービスを有効化する。systemdとしての操作は`systemctl enable wpa_supplicant@wlan0.service`であるため、`wpa_supplicant@.service`を`wpa_supplicant@wlan0.service`としてsymlinkを張ることに注意する。

```sh
ln -s \
    /usr/lib/systemd/system/wpa_supplicant@.service \
    /mnt/etc/systemd/system/multi-user.target.wants/wpa_supplicant@wlan0.service
```

## 結果

SDカードを差してしばらく待ってからsshで接続できた。めでたしめでたし。

```sh
$ ssh alarm@192.168.1.100
# ok
```

接続できたら公式マニュアルの残り部分をやっておこう。

```sh
$ su -
# Password: root

$ pacman-key --init
$ pacman-key --populate archlinuxarm
# ...
```

## 参考文献

- [Arch Linux ARM](https://archlinuxarm.org/)

    Arch Linux ARM 公式。ここから全てが始まる。

- [Setting up a Raspberry Pi headless - Raspberry Pi Documentation](https://www.raspberrypi.org/documentation/configuration/wireless/headless.md)

    [Raspbian の起動時の仕掛け](https://qiita.com/kounoike/items/446bb1d9e0ee9b689c1e)

    Raspberry Pi OSでheadless設定をする手法と、なぜできるのかについて。これを見てなぜできないかも理解できる。

- [systemd-networkd - Arch Wiki](https://wiki.archlinux.jp/index.php/Systemd-networkd)

    [wpa_supplicant - Arch Wiki](https://wiki.archlinux.jp/index.php/Wpa_supplicant)

    ネットワーク関連の基本設定について。

- [Systemd入門(4) - serviceタイプUnitの設定ファイル - めもめも](https://enakai00.hatenablog.com/entry/20130917/1379374797)

    `systemctl enable`の中身について。
