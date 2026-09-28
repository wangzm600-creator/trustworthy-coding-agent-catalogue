# 发布到 GitHub Pages

建议使用项目站：仓库名设为 `trustworthy-coding-agent-catalogue`，发布后的网址为：

`https://<GitHub用户名>.github.io/trustworthy-coding-agent-catalogue/`

## 首次发布

1. 在 GitHub 新建一个公开的空仓库 `trustworthy-coding-agent-catalogue`，不要勾选自动生成 README、`.gitignore` 或 license。
2. 在本目录打开 PowerShell，并依次执行：

```powershell
git init -b main
git add .
git commit -m "Publish study catalogue"
git remote add origin https://github.com/<GitHub用户名>/trustworthy-coding-agent-catalogue.git
git push -u origin main
```

3. 打开仓库的 **Settings → Pages**。
4. 在 **Build and deployment** 中选择 **Deploy from a branch**。
5. 选择 `main` 和 `/(root)`，然后保存。
6. GitHub 完成首次部署后，使用仓库设置页显示的 Pages 地址访问网站。

## 后续更新

替换网站或数据文件后执行：

```powershell
git add .
git commit -m "Update catalogue data"
git push
```

GitHub Pages 会自动重新发布。

如果希望网站显示返回 GitHub 仓库的按钮，可在 `data/catalogue.json` 的 `meta` 对象中加入：

```json
"repository_url": "https://github.com/<GitHub用户名>/trustworthy-coding-agent-catalogue"
```
