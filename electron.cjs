const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");

let server;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "StoryForge"
  });

  win.loadURL("http://localhost:5174");
}

app.whenReady().then(() => {
  server = spawn("npm", ["run", "dev"], {
    shell: true,
    stdio: "inherit"
  });

  setTimeout(createWindow, 5000);
});

app.on("window-all-closed", () => {
  if (server) server.kill();
  app.quit();
});