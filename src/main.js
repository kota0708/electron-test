// アプリケーション作成用のモジュールを読み込み
const { app, BrowserWindow } = require("electron");
const exec = require("child_process").exec;

// メインウィンドウ
let mainWindow;

const onExec = cmd => {
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      { cwd: "/Users/kota/project/kanebo-ihope/docker-test" },
      (err, stdout, stderr) => {
        if (err) {
          console.error("しっぱいだよー");
          onExec("make start");
          reject();
        }

        console.log(stdout);
        exec(
          "open /Applications/Google Chrome.app --args --kiosk --disable-background-mode http://localhost:3000",
          (err, stdout, stderr) => {
            if (err) {
              console.error("しっぱいだよー");
            }

            app.quit();
            resolve();
          }
        );
      }
    );
  });
};

function createWindow() {
  // メインウィンドウを作成します
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 800,
    height: 600
  });

  // メインウィンドウに表示するURLを指定します
  // （今回はmain.jsと同じディレクトリのindex.html）
  // mainWindow.loadFile("index.html");

  // デベロッパーツールの起動
  mainWindow.webContents.openDevTools();

  (async () => {
    await onExec("make start");
  })();

  // メインウィンドウが閉じられたときの処理
  mainWindow.on("closed", () => {
    mainWindow = null;
    (async () => {
      await onExec("make kill");
    })();
  });
}

//  初期化が完了した時の処理
app.on("ready", createWindow);

// 全てのウィンドウが閉じたときの処理
app.on("window-all-closed", () => {
  // macOSのとき以外はアプリケーションを終了させます
  if (process.platform !== "darwin") {
    app.quit();

    (async () => {
      await onExec("make kill");
    })();
  }
});
// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
app.on("activate", () => {
  // メインウィンドウが消えている場合は再度メインウィンドウを作成する
  if (mainWindow === null) {
    createWindow();
  }
});
