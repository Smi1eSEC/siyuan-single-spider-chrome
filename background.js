chrome.contextMenus.removeAll(function () {
  chrome.contextMenus.create({
    id: 'copy-to-siyuan',
    title: 'Copy to SiYuan',
    contexts: ['selection', 'image'],
  })

  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === 'copy-to-siyuan') {
      chrome.tabs.sendMessage(tab.id, {
        'func': 'copy',
        'tabId': tab.id,
        'srcUrl': info.srcUrl,
      })
    }
  })
})

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.func !== 'upload-copy') {
    return
  }

  const jsonBlob = await fetch(request.dataURL).then(r => r.blob())
  const requestData = JSON.parse(await jsonBlob.text())
  const fetchFileErr = requestData.fetchFileErr
  const dom = requestData.dom
  const files = requestData.files
  const formData = new FormData()
  formData.append('dom', dom)
  for (const key of Object.keys(files)) {
    const data = files[key].data
    const base64Response = await fetch(data)
    const blob = base64Response.blob()
    formData.append(key, await blob)
  }
  formData.append("notebook", requestData.notebook)

  await fetch(requestData.api + '/api/extension/copy', {
    method: 'POST',
    headers: {
      'Authorization': 'Token ' + requestData.token,
    },
    body: formData,
  }).then((response) => {
    if (response.redirected) {
      chrome.tabs.sendMessage(requestData.tabId, {
        'func': 'tip',
        'msg': 'Invalid API token',
        'tip': 'tip',
      })
    }
    return response.json()
  }).then((response) => {
    if (response.code < 0) {
      chrome.tabs.sendMessage(requestData.tabId, {
        'func': 'tip',
        'msg': response.msg,
        'tip': requestData.tip,
      })
      return
    }

    chrome.tabs.sendMessage(requestData.tabId, {
      'func': 'copy2Clipboard',
      'data': response.data.md,
    })

    if ('' !== response.msg && requestData.type !== 'article') {
      chrome.tabs.sendMessage(requestData.tabId, {
        'func': 'tip',
        'msg': response.msg,
        'tip': requestData.tip,
      })
    }

    if (requestData.type === 'article') {
      let title = requestData.title ? ('/' + requestData.title) : 'Untitled'
      title = title.replaceAll("/", "")


     const fileBlob = new Blob([requestData.singefile_content.replace('<div style="line-height:20px;border-radius:4px;padding:8px 16px;color:#fff;font-size:inherit;background-color:#4285f4;box-sizing:border-box;box-shadow:0 3px 5px -1px rgba(0,0,0,0.2),0 6px 10px 0 rgba(0,0,0,0.14),0 1px 18px 0 rgba(0,0,0,0.12);transition:transform 0.15s cubic-bezier(0,0,0.2,1) 0ms;transform:scale(0.8);top:16px;position:absolute;word-break:break-word;max-width:80vw">Clipping, please wait a moment...</div></div>',"")], { type: 'text/plain' });
     const formData = new FormData();
     formData.append('file[]', fileBlob, title+'.html');
     formData.append("assetsDirPath","assets/spider_html")
     let html_filename = "";

     (async () => {
      try {
        await fetch(requestData.api + '/api/asset/upload', {
            method: 'POST',
            headers: {
              'Authorization': 'Token ' + requestData.token,
            },
            body: formData,
          }).then((response) => {
            return response.json();
          }).then((response) => {
            if (0 === response.code) {
              html_filename = Object.values(response.data.succMap)[0];
            } else {
              chrome.tabs.sendMessage(requestData.tabId, {
                'func': 'tip',
                'msg': response.msg,
                'tip': requestData.tip,
              })
            }

                 const siteName = requestData.siteName
      const excerpt = requestData.excerpt
      const href = requestData.href
      let linkText = href
      if ("" !== siteName) {
        linkText += " - " + siteName
      }
      let markdown = "---\n\n* " + "本地镜像: [" + title+'.html' + "](" + html_filename + ")\n"
      markdown += "\n* " + "url: [" + linkText + "](" + href + ")\n"
      if ("" !== excerpt) {
        markdown += "* " + excerpt + "\n"
      } else {
        markdown += "\n"
      }
     markdown += "* " + getDateTime() + "\n\n---\n\n" 
     // + response.data.md

    fetch(requestData.api + '/api/filetree/createDocWithMd', {
        method: 'POST',
        headers: {
          'Authorization': 'Token ' + requestData.token,
        },
        body: JSON.stringify({
          'notebook': requestData.notebook,
          'path': title,
          'markdown': markdown,
        }),
      }).then((response) => {
        return response.json()
      }).then((response) => {
        if (0 === response.code) {
          chrome.tabs.sendMessage(requestData.tabId, {
            'func': 'tip',
            'msg': "Create article successfully",
            'tip': requestData.tip,
          })

          if (fetchFileErr) {
            // 可能因为跨域问题导致下载图片失败，这里调用内核接口 `网络图片转换为本地图片` https://github.com/siyuan-note/siyuan/issues/7224
            fetch(requestData.api + '/api/format/netImg2LocalAssets', {
              method: 'POST',
              headers: {
                'Authorization': 'Token ' + requestData.token,
              },
              body: JSON.stringify({
                'id': response.data,
                'url': requestData.href, // 改进浏览器剪藏扩展转换本地图片成功率 https://github.com/siyuan-note/siyuan/issues/7464
              }),
            })
          }
        } else {
          chrome.tabs.sendMessage(requestData.tabId, {
            'func': 'tip',
            'msg': response.msg,
            'tip': requestData.tip,
          })
        }
      })
          })
      } catch (error) {
        // 处理错误
        console.error(error);
      }
    })();
     


    }
  }).catch((e) => {
    console.warn(e)
  })
})

function getDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();
  if (month.toString().length === 1) {
    month = '0' + month;
  }
  if (day.toString().length === 1) {
    day = '0' + day;
  }
  if (hour.toString().length === 1) {
    hour = '0' + hour;
  }
  if (minute.toString().length === 1) {
    minute = '0' + minute;
  }
  if (second.toString().length === 1) {
    second = '0' + second;
  }
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}