# Card switch animation reference

保存自原镜像的 `article#shop-minis-sdk` 卡片动效，供后续 SpeakUp 页面复用。

## 结论

浏览器中的实际降级实现不是 CSS 轮播：源设计是 Rive，运行时在当前环境选择预生成视频。

- Rive artboard：`u200main`
- Rive 源文件：`rive-assets/source.riv`
- 画布比例：`562 / 451`
- 视频循环：`3.0s`
- 当前桌面浏览器选择：AV1 WebM，`650×522`
- 播放方式：`muted`、`loop`、`playsInline`，进入视口后播放，离开视口后暂停
- 静态 fallback：`media/poster.png`

视觉节奏是三张竖向卡片形成浅景深堆叠：当前卡片向上抛出并轻微旋转，后一张从下方进入主位并弹性回正，离场卡回收到队尾。完整三卡循环为 3 秒，约每秒切换一次。

## 保存内容

- `media/`：原始桌面/移动、1x/2x、MP4/WebM 降级视频及 poster。
- `rive-assets/`：原始 `.riv`、背景和三组桌面/移动卡片图片。
- `card-switch.js`：不依赖 Rive 的通用 DOM 卡片栈控制器。
- `card-switch.css`：堆叠、上抛离场、轻微旋转和弹簧回正的样式。
- `demo.html`：原始参考与可复用实现的并排演示。

## 预览

启动本地服务后打开：

```text
http://127.0.0.1:18086/references/card-switch-animation/demo.html
```

需要查看删除前的原始镜像时，可使用本地只读参考模式：

```text
http://127.0.0.1:18086/practice?reference=1#download
```

## 在其他页面复用

```html
<link rel="stylesheet" href="/references/card-switch-animation/card-switch.css" />

<div class="card-switch" data-card-switch data-interval="1000" data-duration="520">
  <div class="card-switch__stage" data-card-switch-stage>
    <article class="card-switch__card" data-card-switch-card>...</article>
    <article class="card-switch__card" data-card-switch-card>...</article>
    <article class="card-switch__card" data-card-switch-card>...</article>
  </div>
  <button type="button" data-card-switch-next>下一张</button>
</div>

<script type="module" src="/references/card-switch-animation/card-switch.js"></script>
```

可调参数：

- `data-interval`：两次切换的间隔，参考值 `1000ms`。
- `data-duration`：单次过渡时长，参考值 `520ms`。
- `--card-switch-exit-ease`：离场曲线。
- `--card-switch-enter-ease`：入场弹簧曲线。

组件会在视口外暂停，尊重 `prefers-reduced-motion`，并提供手动下一张、暂停和 `aria-live` 状态。

## Rive 文案映射

原始 Rive 文案包括：

- `Daily Fits` / `Track your outfits`
- `FoodSocial` / `Explore recipes`
- `Rate my fit` / `Outfit feedback`

后续 SpeakUp 实现应替换这些第三方内容，只复用动作节奏和组件结构。原始 Shopify 素材仅供本地研究与动作参考，不用于公开发布。
