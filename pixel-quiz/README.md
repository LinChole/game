# Pixel Quiz 闖關問答遊戲 🕹️

這是一個基於 **React + Vite** 開發的像素風（Pixel Art）闖關問答遊戲。
遊戲特色包含：
- 🎨 復古像素藝術風格 UI
- 🎮 5 關卡挑戰模式（可調整）
- 🤖 使用 DiceBear 生成像素風關主
- 📊 **Google Sheets** 作為後端資料庫（題目與成績記錄）
- ☁️ **Google Apps Script** 作為 API 中介層

---

## 🚀 快速開始 (本地開發)

### 1. 安裝依賴
確保你已經安裝 [Node.js](https://nodejs.org/) (建議 v20+)，然後執行：
```bash
npm install
```

### 2. 設定環境變數
複製範例檔並建立 `.env`：
```bash
cp .env.example .env
```
在 `.env` 中填入你的設定 (GAS URL 需在完成後端部署後填入)：
```properties
VITE_GOOGLE_APP_SCRIPT_URL=你的GAS網頁應用程式網址
VITE_PASS_THRESHOLD=3
VITE_QUESTION_COUNT=5
```

### 3. 啟動開發伺服器
```bash
npm run dev
```
打開瀏覽器訪問 `http://localhost:5173`。

---

## 📝 Backend 設定 (Google Sheets + GAS)

本遊戲依賴 Google Sheets 存放題目與記錄成績。請依照以下步驟設定：

### 步驟 1：建立 Google Sheet
建立一個新的 Google Sheet，並重新命名兩個工作表（Tabs）：

#### 工作表 1: `Questions` (題目)
請依照以下順序設定欄位標題 (Row 1)：
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| **ID** | **Question** | **OptionA** | **OptionB** | **OptionC** | **OptionD** | **Answer** |

- **Answer** 欄位請填寫正確選項的代號 (A, B, C, 或 D)。

#### 工作表 2: `Results` (成績)
請依照以下順序設定欄位標題 (Row 1)：
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| **UserID** | **PlayCount** | **TotalScore** | **HighScore** | **FirstClearScore** | **Attempts** | **LastPlayed** |

### 步驟 2：設定 Google Apps Script (GAS)
1. 在 Google Sheets 中，點選選單 **擴充功能 (Extensions)** > **Apps Script**。
2. 清空 `Code.gs` 的內容，貼上以下完整程式碼：

```javascript
/* Google Apps Script for Pixel Quiz */
const SHEET_QUESTIONS = 'Questions';
const SHEET_RESULTS = 'Results';

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  
  // CORS Header for browser access
  const headers = {
    'Access-Control-Allow-Origin': '*'
  };
  
  if (action === 'getQuestions') {
    return ContentService.createTextOutput(JSON.stringify(getQuestions(params)))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: "Invalid action"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'submitResult') {
      const result = submitResult(data);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({error: "Invalid action"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getQuestions(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_QUESTIONS);
  const rows = sheet.getDataRange().getValues();
  rows.shift(); // Remove header
  
  // Randomly shuffle and pick N questions
  const count = parseInt(params.count) || 5;
  const shuffled = rows.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  
  // Return questions without the answer column (Index 6)
  const questions = selected.map(row => ({
    id: row[0],
    question: row[1],
    options: {
      A: row[2],
      B: row[3],
      C: row[4],
      D: row[5]
    }
  }));
  
  return { questions: questions };
}

function submitResult(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const qSheet = ss.getSheetByName(SHEET_QUESTIONS);
  const rSheet = ss.getSheetByName(SHEET_RESULTS);
  
  // 1. Calculate Score Server-Side
  const qRows = qSheet.getDataRange().getValues();
  qRows.shift(); // Remove header
  // Create a map of Question ID -> Correct Answer
  const answerMap = {};
  qRows.forEach(row => {
    answerMap[row[0]] = row[6]; // Column G is Answer
  });
  
  let score = 0;
  data.answers.forEach(ans => {
    if (answerMap[ans.questionId] === ans.selected) {
      score++;
    }
  });
  
  // 2. Save/Update Result
  const userId = data.userId;
  const timestamp = new Date();
  
  const rData = rSheet.getDataRange().getValues();
  let rowIndex = -1;
  
  // Search for existing user (skip header)
  for (let i = 1; i < rData.length; i++) {
    if (rData[i][0] == userId) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }
  
  if (rowIndex > 0) {
    // Existing User: Update
    const currentCount = rSheet.getRange(rowIndex, 2).getValue();
    const currentTotal = rSheet.getRange(rowIndex, 3).getValue();
    const currentHigh = rSheet.getRange(rowIndex, 4).getValue();
    
    rSheet.getRange(rowIndex, 2).setValue(currentCount + 1); // PlayCount
    rSheet.getRange(rowIndex, 3).setValue(currentTotal + score); // TotalScore
    if (score > currentHigh) {
      rSheet.getRange(rowIndex, 4).setValue(score); // HighScore
    }
    // Attempts logic or history tracking could be added to column F
    rSheet.getRange(rowIndex, 7).setValue(timestamp); // LastPlayed
    
  } else {
    // New User: Append
    // UserID, PlayCount, TotalScore, HighScore, FirstClearScore, Attempts, LastPlayed
    rSheet.appendRow([userId, 1, score, score, score, 1, timestamp]);
  }
  
  return { success: true, score: score, message: "Score saved" };
}
```

### 步驟 3：部署 API
1. 點擊右上角 **部署 (Deploy)** > **新增部署 (New deployment)**。
2. 點擊齒輪圖示，選擇 **網頁應用程式 (Web app)**。
3. 設定如下：
   - **執行身分 (Execute as)**: **我 (Me)**
   - **誰可以存取 (Who has access)**: **所有人 (Anyone)** (重要！否則跨域會失敗)
4. 點擊 **部署 (Deploy)**。
5. 複製產生的 **網頁應用程式網址 (Web app URL)**。
6. 回到專案 `.env` 檔案，貼上到 `VITE_GOOGLE_APP_SCRIPT_URL`。

---

## 🧪 測試題庫 (生成式 AI 基礎知識)

如果您需要測試資料，可以直接複製以下 10 題到 Google Sheets 的 `Questions` 工作表 (從 A2 開始貼上)：

| A (ID) | B (Question) | C (OptionA) | D (OptionB) | E (OptionC) | F (OptionD) | G (Answer) |
|---|---|---|---|---|---|---|
| Q001 | 什麼是「生成式 AI」(Generative AI) 的核心特徵？ | 只能分析現有數據 | 能夠創造新的內容 (如文本、圖像) | 只能進行數學運算 | 只能用於自動駕駛 | B |
| Q002 | ChatGPT 背後使用的已訓練模型架構是什麼？ | RNN | CNN | Transformer | LSTM | C |
| Q003 | AI 模型產生與事實不符或無中生有的內容，這種現象稱為什麼？ | 夢遊 (Sleepwalking) | 幻覺 (Hallucination) | 遺忘 (Forgetting) | 漂移 (Drift) | B |
| Q004 | 在 Prompt Engineering 中，「Zero-shot」是指什麼？ | 給模型 0 個範例直接提問 | 給模型 0.5 秒思考 | 模型準確率為 0 | 不使用 GPU 運算 | A |
| Q005 | 下列哪一個是用於生成「圖像」的知名 AI 模型？ | GPT-4 | Midjourney | BERT | LLaMA | B |
| Q006 | LLM 中的「Token」通常指的是什麼？ | 區塊鏈代幣 | 文本處理的最小單位 (如字詞片段) | 登入憑證 | 模型的權重 | B |
| Q007 | 「溫度」(Temperature) 參數如何影響 AI 的輸出？ | 越高越固定保守 | 越低越隨機 | 越高越具隨機性與創造力 | 不影響輸出 | C |
| Q008 | 什麼是 RAG (Retrieval-Augmented Generation)？ | 隨機增強生成 | 檢索增強生成 (結合外部知識庫) | 遞歸演算法生成 | 機器人自動生成 | B |
| Q009 | 目前訓練大型語言模型 (LLM) 最依賴硬體組件是什麼？ | CPU | GPU (圖形處理器) | 硬碟 | 網路卡 | B |
| Q010 | 以下哪個不是常見的生成式 AI 應用？ | 撰寫電子郵件草稿 | 生成 Excel 巨集 | 物理搬運貨物 | 總結長篇文章 | C |

---

## 🌐 部署至 GitHub Pages

本專案已設定好 GitHub Actions 自動部署。

1. 將程式碼 Push 到 GitHub Repository。
2. 進入 Repo 的 **Settings > Secrets and variables > Actions**。
3. 點擊 **New repository secret**，新增以下 Secret (對應 `.env` 內容)：
   - `GOOGLE_APP_SCRIPT_URL`
   - `PASS_THRESHOLD`
   - `QUESTION_COUNT`
4. 進入 **Settings > Pages**，將 Source 改為 **GitHub Actions**。
5. 下次 Push `main` 分支時，將自動觸發部署。

---

## 📜 專案結構
```
src/
├── components/   # React 元件 (Game, Home, LevelMaster...)
├── context/      # 遊戲狀態管理 (GameContext)
├── services/     # API 服務 (與 Apps Script 溝通)
└── utils/        # 工具函式 (DiceBear Avatar 生成)
```

Have fun! 👾
