# qt-core

## Contribution

此專案 commit message 使用 [angular format](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines) ，並使用 [commitizen](http://commitizen.github.io/cz-cli/) 輔助產生 commit message

- 加入修改的檔案 `git add .`
- 產生 commit message `npm run commit`

Commit message 各種 Type

- build: 更改 build/bundle system
- ci: 更改 CI/CD script
- docs: 更改 Documentation
- feat: 實作新的 feature
- fix: 修改 bug
- perf: 改進 performance
- refactor: 重構
- style: 改變 coding style
- test: 更新測試

## Release

此專案使用 [standard-version](https://github.com/conventional-changelog/standard-version) 輔助 release 流程，自動產生 `CHANGELOG.md` 和 提升版本號（提升 major version 依據是否有 `feat` 來判斷）

- `npm run release`

可以自己決定 提升 patch, minor or major

- `npm run release -- --release-as minor`

**Warning**: 第一次 release 請下

- `npm run release -- --first-release`
