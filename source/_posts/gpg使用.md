---
title: gpg使用
tags:
  - linux
  - encrypt
categories:
  - linux
language: zh-Hans
abbrlink: 7d547224
date: 2020-10-02 14:00:01
updated: 2020-10-02 14:00:01
---
生成一个密钥

```bash
gpg --full-gen-key
```

之后会选择加密方式, 有效期, 用户名及邮箱, 密码, 按自己需求填就行了.

创建一个子密钥

```bash
gpg --edit-key [key hash]

gpg> addkey
#只有与前面是相同的, 按需求选择.

gpg> save
# 保存
```

导出密钥

```bash
gpg -o /path/gpg_key --export-secret-keys [key hash]
```

导出子密钥

```bash
gpg -o /path/gpg_key.sub --export-secret-subkeys [key hash]
```

导出吊销证书

```bash
gpg --generate-revocation [key hash]
# 输出是文本内容, 复制保存下来就行了
```
<!--more-->
删除密钥

```bash
gpg --delete-secret-keys [key hash]
gpg --delete-keys [key hash]
```

导入子密钥

```bash
gpg --import /path/gpg_key.sub
```

查看密钥

```bash
gpg -k
gpg -K
```

加密文件

```bash
gpg -r [user name] -o [output file] -e [filename]
```

解密

```bash
gpg -o [output file] -d [filename] # 输出到文件
gpg -d [filename] # 直接输出到终端
```

***
[GPG 加密解密简明教程](https://gist.github.com/jhjguxin/6037564)
[GPG 的正确使用姿势](https://mogeko.me/2019/068/)
