# TSG 小游戏宇宙

一个纯静态、离线单机的 TSG 主题小游戏合集。

## 游戏列表

1. 合成tsg
2. TSG 2048
3. TSG 打地鼠
4. TSG 打砖块
5. TSG 记忆翻牌
6. TSG 扫雷
7. TSG 贪吃蛇
8. TSG 俄罗斯方块
9. TSG 五子棋
10. TSG 消消乐
11. TSG 颜色大挑战
12. TSG 一跳

## 本地运行

解压后直接打开根目录的 `index.html` 即可进入游戏大厅。所有游戏资源均随包提供，不依赖登录、云服务、CDN 或远程 API。

如果浏览器对本地 `file://` 页面有额外限制，也可以在目录中启动任意本地静态服务器，例如：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

## GitHub Pages

本仓库已按 GitHub Pages 的静态站点结构整理。将仓库根目录中的 `index.html`、`assets/`、`games/`、`.nojekyll`、`.gitignore` 和 `README.md` 上传到 GitHub 仓库根目录即可。

对于仓库 `gcctkh5sky-ui/TSG`：

1. 将上述文件和文件夹放到 `main` 分支根目录。
2. 在仓库 **Settings → Pages** 中，将 **Build and deployment** 的 Source 设为 **Deploy from a branch**。
3. Branch 选择 `main`，目录选择 `/ (root)`，保存。
4. 发布后站点地址为 `https://gcctkh5sky-ui.github.io/TSG/`。

所有页面均使用相对路径，因此可同时兼容本地打开和 GitHub Pages 的项目子路径。

## 说明

- 游戏为离线单机版。
- 不包含登录系统、联网排行榜、云存档、多主题、音乐播放器或成就系统。
- 各游戏最高分/偏好如有保存，使用浏览器本地 `localStorage`。
