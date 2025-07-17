# NCHC 可信賴雲平台

使用 [Vue 3](https://vuejs.org/guide/introduction.html) 搭配 [Vite](https://vitejs.dev/guide/) 進行專案建置，語法為 TypeScript，使用 [yarn](https://yarnpkg.com/) 管理相關套件，搭配常用套件如 vue-router、vue-i18n、pinia 等，使用 Vuetify 3 作為 UI Library。

## Vue 3 相關套件

- [Vuetify 3](https://vuetifyjs.com/en/getting-started/installation/#installation) - Vue 3 UI Library
- [vue-router](https://router.vuejs.org/) - 頁面 Routing
- [vue-i18n](https://vue-i18n.intlify.dev/) - i18n 字串管理
- [vue-cookies](https://github.com/cmp-cc/vue-cookies) - 支援 Vue 的 cookie 管理與編輯工具
- [pinia](https://pinia.vuejs.org/) - 跨元件狀態管理

## 其他第三方套件

- [aws-sdk](https://github.com/aws/aws-sdk-js-v3) - AWS 提供的 JavaScript SDK 函式，用以操作 AWS 相關服務函式庫
- [axios](https://axios-http.com/docs/intro) - 用於處理 API Request
- [chart.js](https://highlightjs.readthedocs.io/en/latest/) - 繪製圖表相關元件
- [dayjs](https://github.com/iamkun/dayjs) - 轉換日期格式函式庫
- [downloadjs](https://github.com/rndme/download) - 用於在瀏覽器產生下載檔案功能
- [jwt-decode](https://github.com/auth0/jwt-decode) - JWT 解碼工具
- [loadsh](https://lodash.com/) - JavaScript 的 Library，提供實用簡便且高效的函式
- [qrcode.vue](https://github.com/scopewu/qrcode.vue) - 提供解讀 QRCode 的函式
- [Web Font Loader](https://github.com/typekit/webfontloader) - 動態管理與載入網路字型
- [Material Icon](https://pictogrammers.com/library/mdi/?welcome) - Google Material Design 系列的圖示

## 基本使用方式

### Windows平臺

安裝 Node.js，官方下載頁面 [Download Node.js®](https://nodejs.org/en/download) 。
選擇 18.20.5 以上之 LTS 版本，點擊 Windows Installer (.msi) 下載並安裝。

Node.js 安裝完成後，安裝套件管理工具 [Yarn](https://yarnpkg.com/) \
`npm install --global yarn`

使用 yarn 建置，clone 專案後，於 package.json 同層目錄下指令安裝套件 \
`yarn install`

以指令安裝相關套件後，接著將網站運行起來。下為不同環境的 serve，build 和 preview 指令介紹

### 開發工具

專案可用多種整合開發環境工具 (Integrated Development Environment, IDE) 開啟專案，常見的 IDE 有

- [Visual Studio Code](https://code.visualstudio.com/Download)
- [IntelliJ IDEA WebStorm](https://www.jetbrains.com/webstorm/download/#section=windows)

### 環境變數

.env 文件用於應用程式的環境變數，這些環境變數包含定義功能、API路徑…等，方便在不同環境在切換配置而不用修改程式。 \
以指令 `yarn serve:public` 為例 `"serve:public": "vite --port 5173 --mode public --host"` 會讀取檔名為 `.env.public` 的檔案

### serve 指令

yarn server 之目的在於讓開發者在本機端快速驗證邏輯與畫面，程式會啟動一個臨時的模擬網站於本機端

| Command              | Description | 環境變數檔案 |
| -------------------- | ----------- | ------------ |
| `yarn serve:public`  | serve 公區  | .env.public  |
| `yarn serve:private` | serve 私區  | .env.private |

serve 成功後應會顯示**本機網址**為 http://localhost:5173/ ，修改 host port 等資訊可在 `vite.config.ts` 內進行修改

### build 指令

yarn build 之目的在於將網站程式碼編譯轉換為可在生產環境(production)運行的形式

| Command              | Description | 環境變數檔案 |
| -------------------- | ----------- | ------------ |
| `yarn build:public`  | build 公區  | .env.public  |
| `yarn build:private` | build 私區  | .env.private |

編譯結果會放置在環境變數中定義之路徑 `VITE_APP_OUTPUT_PATH`，以公區環境變數為例，會放置於 `dist-pub` 資料夾內

### preview 指令

yarn preview 會啟動一個本地端的網頁伺服器，將編譯好之網站程式運行在其之上，而不是模擬的方式。環境更接近最終部署，以用檢查在生產環境中網站運作是否符合預期。

:warning: 務必跑過 yarn build:[public|private] 才能執行 yarn preview:[public|private]

| Command                | Description  | 環境變數檔案 |
| ---------------------- | ------------ | ------------ |
| `yarn preview:public`  | preview 公區 | .env.public  |
| `yarn preview:private` | preview 私區 | .env.private |

## 資料夾與功能介紹

- `/api`：各類 api 服務以及 api call function，統一以 index.ts 導出
- `/assets`：靜態檔案，如 icon 檔案等
- `/views`：各頁面的檔案，在 router.ts 中引用
- `/components`：頁面中會用到的各種元件
- `/composables`：將各 api 依照相關服務做分類供給頁面 call 的函式集合
- `/constants`：各類常數定義
- `/i18n`：en 與 tw 語系的設定檔
- `/interfaces`：typescript 型態宣告
- `/plugins`：第三方套件會用到的設定檔
- `/store`：pinia 套件用於跨頁面狀態共享相關檔案
- `/styles`：Css 定義，分為一般定義與覆蓋 vuetify 3 套件的宣告
- `/utils`：比較 pure 不牽扯到狀態的 function 定義
- `/views`：各頁面的檔案會放在這裡，會在 router.ts 內 import 進來使用

## 主要服務

### 虛擬平台服務

- `虛擬機器`：提供一般型虛擬機解決方案，讓您輕鬆部署及管理虛擬機器，彈性調配虛擬機器的儲存空間及運算資源，並擁有彈性 IP、負載平衡及備份等機制，為智算兼備、節省成本的最佳選擇。
- `虛擬磁碟`：為虛擬機器擴充儲存空間，透過建立虛擬磁碟，再連結至虛擬機器、將磁碟初始化後即可使用。
- `虛擬網路`：提供安全彈性的虛擬網路功能，協助您輕鬆存取資源和應用程式。
- `負載平衡`：提供虛擬負載平衡器功能，當服務的流量變大時，可以將流量分配到不同的伺服器或資源，以維持服務的靈活性、擴充能力及高可用性。
- `自動擴展`：為一種自動彈性調整的監控機制，能夠在指定條件下動態新增或移除虛擬機器的數量，以因應負載增加所造成的資源不足、服務中斷的問題，提升服務品質與效能。
- `檔案共享`：基於 NFS 檔案系統協議，提供同一虛擬網路內的檔案共享服務。
- `安全群組`：可設定安全群組規則，管理允許連入連出的網段、協定、連接埠以控管網路安全。

### 可信賴雲服務

- `虛擬映像檔`：提供您建立映像檔或保留某一時間點虛擬運算個體的狀態、作業系統內建的硬碟的檔案與資料，以便需要時可以回復到該時間點的狀態。
- `容器映像檔`：提供私有映像檔儲存庫，透過安全可靠的管理機制、簡單好用的圖形管理介面、方便的映像檔範本並預載豐富的機器學習開發環境映像檔，協助您創建、儲存及管理容器映像檔並分享給其他專案成員使用。
- `資料交換`：提供公區和私區儲存資料的交換服務。
- `資源轉移（限公區）`：可檢視並管理資源轉移的紀錄，如虛擬機器或特定應用服務 APP。
- `資料攜出（限私區）`：可將本地檔案寫入至目標服務上之暫存空間。

### 容器與其它服務

- `K8S叢集`：提供 Kubernetes 叢集服務，方便快速部署與管理容器化應用程式。
- `應用服務APP`：提供客製化，模組化設定，組合成提供給用戶的 APP，像是 Jupyter Notebook.
- `HPC遠端派送`：提供將 HPC Jobs 派送到遠端高速計算集群（Slurm Cluster）搭配 Singularity 容器進行運算，以達到更好的資源利用率。
- `資料儲存`：本系統提供安全、可靠且與 Amazon S3 相容之資料儲存，可將程式或資料預先上傳至儲存體中，在使用本系統的其他服務時再掛載儲存體，即可快速存取儲存體中的資料。

---

# NCHC 可信賴雲平台端對端 (End-to-End) 測試

使用 [cypress](https://www.cypress.io/) 為框架進行端對端測試

## Cypress 相關套件

- [cypress](https://docs.cypress.io/app/get-started/install-cypress) - cypress framework
- [cypress-if](https://github.com/bahmutov/cypress-if) - [cypress plugin](https://docs.cypress.io/app/plugins/plugins-list#custom-commands) for Easy conditional if-else logic for your cypress tests.

## 基本使用方式

### Windows平臺

安裝 Node.js，官方下載頁面 [Download Node.js®](https://nodejs.org/en/download) 。
選擇 18.20.5 以上之 LTS 版本，點擊 Windows Installer (.msi) 下載並安裝。

Node.js 安裝完成後，安裝套件管理工具 [Yarn](https://yarnpkg.com/) \
`npm install --global yarn`

使用 yarn 建置，clone 專案後，於 package.json 同層目錄下指令安裝套件 \
`yarn install`

### 準備測試專案與帳號

1. 在可信賴雲平台 Admin Portal 上開啟測試專案與帳號
2. 將測試帳號加入測試專案中並編輯權限為 Admin

### 測試設定

```
├─cypress
    ├─e2e
    ├─fixtures
    │  ├─server.json
    │  └─user.json
    └─support
```

#### 修改 server.json 填入可信賴雲端URL

範例

```
{
  "url": "http://localhost:5173/"
}
```

#### 修改 user.json 填入測試帳號端資訊

範例

```
{
  "account": "e2e@asus.com",
  "password": "E2etest#1234"
}
```

### 執行指令

| Command              | Description | 相關連結                                                                                |
| -------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `yarn cy:open`       | cypress GUI | [open-mode](https://docs.cypress.io/app/core-concepts/open-mode)                        |
| `yarn cy:run-headed` | run headed  | [run-headed](https://docs.cypress.io/app/references/command-line#cypress-run-headed)    |
| `yarn cy:run`        | run default | [run](https://docs.cypress.io/app/references/command-line)                              |
| `yarn cy:run-noExit` | run no-exit | [run-no-exit ](https://docs.cypress.io/app/references/command-line#cypress-run-no-exit) |

### 測試項目

- [x] 登入
- [x] 建立鑰匙對
- [x] 建立虛擬磁碟
- [x] 建立虛擬網路
- [x] 建立安全性群組
- [x] 建立虛擬機器
- [x] 建立負載平衡
- [x] 建立自動擴展
- [X] 建立K8S叢集
- [X] 建立應用服務APP
- [X] 建立資料儲存
- [X] 建立HPC遠端派送
- [x] 刪除上述建立實體
