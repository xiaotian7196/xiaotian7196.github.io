# koten.top 个人主页

这是 `xiaotian7196` 的个人主页，部署在 `koten.top`。

## 页面

- `index.html`：个人主页
- `anime.html`：看番记录单
- `livery.html`：模拟飞行涂装站

页面整体复用同一套视觉风格，支持：

- 深色 / 浅色主题切换
- 中文、英文、日文界面切换
- 响应式布局
- 页面滚动动画
- Sakana Widget 组件

## 模拟飞行涂装站

涂装站页面位于 `livery.html`，对应样式和交互代码为：

- `livery.css`
- `livery.js`

涂装站提供以下功能：

- 从 LiveryAPI 获取涂装列表
- 按模拟器筛选 MSFS、X-Plane 或全部
- 按涂装名称、描述和机型搜索
- 分页浏览涂装
- 查看涂装详情
- 查看国内下载地址和全球下载地址
- 显示涂装图片、模拟器、机型、版本和数据编号
- API 在线 / 离线状态提示

主页中的“模拟飞行涂装区”链接会跳转到 `livery.html`。

### API 地址

涂装站使用以下接口：

```text
https://api.xn--3ckue.jp/api/v1/liveries
```

请求示例：

```text
GET /api/v1/liveries?page=1&page_size=20&search=737&game=MFS%202020
```

支持的参数：

| 参数 | 说明 |
| --- | --- |
| `page` | 页码，默认为 `1` |
| `page_size` | 每页数量，前端默认使用 `20` |
| `search` | 搜索涂装名称、描述或机型 |
| `game` | 按模拟器筛选，例如 `MFS 2020`、`Xplane 11/12` |

返回数据格式示例：

```json
{
  "items": [
    {
      "id": 1,
      "name": "示例航空公司涂装",
      "description": "涂装说明",
      "game": "MFS 2020",
      "aircraft": "Boeing 737",
      "image_url": "https://raw.githubusercontent.com/xiaotian7196/LiveryAPI/photo/photo/images/mfs2020-pmdg-737-89p-china-eastern-b5838-2024.png",
      "download_url_cn": "https://example.com/livery-cn.zip",
      "download_url_global": "https://example.com/livery-global.zip",
      "version": "1.0.0"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1,
  "total_pages": 1
}
```

API 项目仓库：

<https://github.com/xiaotian7196/LiveryAPI>

API 项目的详细部署和接口说明请参考该仓库中的 README。

### API 不可用时

当 API 请求失败或返回错误状态码时，涂装站不会显示虚构或示例涂装数据，而是：

- 顶部状态显示 `API OFFLINE`
- 列表区域显示 API 不可用提示
- 不显示涂装卡片
- 不显示虚假的涂装数量和分页

当 API 正常恢复后，刷新页面或重新执行搜索、筛选操作即可重新加载真实数据。

## 本地预览

这是一个静态网站，可以使用任意静态文件服务器预览。例如：

```bash
npx serve .
```

然后访问：

```text
http://localhost:3000/livery.html
```

直接双击 HTML 文件也可以查看静态内容，但部分 `fetch` 请求可能会受到浏览器跨域或本地文件安全策略限制，推荐使用静态服务器打开。
