# Core

## 環境設定

- 安裝 dependency

```
yarn
```

## 環境參數

如想環境獨立使用環境變數，可以更改 `dotenv.config({ path: '../../.env' });` 指定想要的環境變數檔案位置

## 一般開發

1. Build (會產生 web3 跟 hardhat test 用的 type definition)

```
yarn build
```

2. Test

```
yarn test
```

3. Deploy

```
yarn deploy <your deploy script> --network goerli
```

ex.

```
yarn deploy scripts/deploy.ts --network goerli
```

會回傳 deploy 成功的 contract address

4. Verify

```
yarn verify <your contract address> <args>
```

ex.

```
yarn verify 0x00a7f379FD4c6802a972398a352053862410DE51 1661616400
```

5. Connect remix

```
yarn watch
```

6. 起本地端的測試節點（使用 hardhat）

```
yarn blocknode
```
