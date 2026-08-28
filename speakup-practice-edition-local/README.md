# SpeakUp Practice Edition 本地站点

这是 SpeakUp 的沉浸式产品叙事站点。页面围绕真实英语表达训练展开，包含目标理解、表达准备、场景实战、即时反馈、练习复盘和训练记忆。

站点使用 `speakup-overrides.css`、`speakup-overrides.js` 与 `assets/speakup/` 维护 SpeakUp 的品牌、内容、交互和媒体素材。

## 启动

```bash
cd speakup-practice-edition-local
node server.mjs
```

然后打开：

`http://127.0.0.1:18086/practice`

也可以双击 `start.command`。使用其他端口：

```bash
PORT=18087 node server.mjs
```

## 页面目录

- `#ai-teacher`：AI 老师
- `#goal`：理解目标
- `#preparation`：表达准备
- `#interview`：英文面试
- `#ielts`：IELTS
- `#workplace`：职场沟通
- `#travel`：生活旅行
- `#feedback`：即时反馈
- `#review`：练习复盘
- `#memory`：训练记忆
- `#download`：下载产品

## 目录说明

- `assets/speakup/`：SpeakUp 自有或为本地站点生成的素材。
- `assets/remote/`：只为本地 3D 场景兼容保留的第三方运行资源，不进入 Git 历史。
- `index.html`、`mirror-report.json`：原始渲染壳与来源清单，仅作为兼容和溯源材料，不代表当前产品命名。
- 页面必须通过本地 HTTP 服务运行，不能直接双击 `index.html`。
- 下载和代码入口指向 SpeakUp 当前产品地址；外部参考资源只用于维持本地场景运行。
