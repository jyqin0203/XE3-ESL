# SpeakUp Practice Edition 沉浸式本地原型

这是基于 Shopify Editions Winter '26 本地学习镜像制作的 SpeakUp 沉浸式叙事原型。
页面保留原镜像的场景、构图和滚动系统，通过 `speakup-overrides.css`、
`speakup-overrides.js` 与 `assets/speakup/` 替换品牌、人物、文案、导航和产品入口。

## 启动

```bash
cd shopify-winter2026-local
node server.mjs
```

然后打开：

`http://127.0.0.1:18086/editions/winter2026`

也可以双击 `start.command`。使用其他端口：

```bash
PORT=18087 node server.mjs
```

## 说明

- `assets/speakup/` 是 SpeakUp 自有或为本原型生成的素材，会进入 Git。
- `assets/remote/` 约 390MB，包含 Shopify 第三方镜像资源，只保留在本地并由
  项目内 `.gitignore` 排除，不进入 XE3-ESL 的 Git 历史。
- 页面、图片、视频、字体、3D/Rive/WASM 资源均尽量保存到本地。
- 广告、统计、登录态和通知表单端点不属于镜像范围。
- SpeakUp 的下载和 GitHub 入口指向当前产品地址；尚未替换的深层参考卡片仍可能
  保留 Shopify 外链。
- 必须通过本地 HTTP 服务运行，不能直接双击 `index.html`。
- Shopify 的商标、文案和媒体素材归其权利人所有；本镜像仅供本地学习与技术研究，请勿公开发布或用于商业用途。
