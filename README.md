## SiYuan Chrome 扩展

[English](https://github.com/siyuan-note/siyuan-chrome/blob/main/README.md)

### 💡 简介

思源笔记 Chrome 浏览器扩展。

### 🛠️ 安装

* Chrome：[SiYuan - Chrome Web Store](https://chrome.google.com/webstore/detail/siyuan/hkcgjbeblifaincobbcfiffbpgoafepk)
* Edge：[SiYuan - Microsoft Edge Addons](https://microsoftedge.microsoft.com/addons/detail/siyuan/lclhdlhleinlppggbbgimbekofanbkcf)
* GitHub：[siyuan-note/siyuan-chrome](https://github.com/siyuan-note/siyuan-chrome)

### ✨  使用

1. 安装扩展，在扩展的选项中配置 API token（token 可在思源设置 - 关于中查看）
2. 在 Web 页面上选择需要剪藏的内容，然后在右键菜单中选择 “Copy to SiYuan”
3. 在思源中粘贴

### 🔒 隐私条款

* 所有数据都保存在用户自己完全控制的设备上
* 不会收集任何使用数据

## change

集成SingleFile

https://github.com/gildas-lormeau/SingleFile?utm_source=ld246.com

思源自带的网页爬虫不好用，通过引入 `SingleFile` 将网页内容爬取成单独的html文件放入assets/spider_html目录下，然后创建同名文档将html链接写入，点击即可浏览器打开。使用前先创建spider_html目录。