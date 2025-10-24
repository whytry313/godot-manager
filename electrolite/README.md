# ⚡️ Electrolite
Abstraction library for Electron.
Sets a standard `preload` file, handles `ipcMain` bridge, adds a global router and window specific router and simplifies window creation

<br>

## What to expect?
Difference by example:

<details>
  <summary>🔽 Classic electron main.js</summary>

```javascript
// main.js
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
  if (process.env.ENV === "dev") {
    mainWindow.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


ipcMain.on("event", (event) => {
  evet.retrunValue = "myValue";
  return event;
});

ipcMain.on("another-event", (event) => {
  evet.retrunValue = "mySecondValue";
  return event;
});

/// preload.js
const { contextBridge, ipcRenderer } = require('electron');
// etc

```
</details>


<details>
  <summary>🔽 main.js using electrolite + express routes</summary>

```javascript
const electrolite = require("./electrolite/index.js");

// access via index.html: window._API_.get, window._API_.post
electrolite.get("/event", () => "myValue");
electrolite.get("/another-event", () => "mySecondValue");
electrolite.init({ apiKey: "_API_" });

const win = electrolite.createWindow({ width: 800, height: 600, src: "index.html" });
// access via index.html: window._API_.emit(event, data)
win.on("window-specific-event", () => "value for this window only");
win.get("/path", () => "only this window has access to this route");
electrolite.on("global-event", () => "value for all windows");

// access via index.html: window._API_.on(event, handler)
win.emit("window-specific-event", "myData");
electrolite.meit("global-event", "globalData");

```
</details>

<br>

## Installation

- Clone or copy the project inside your project
- Import `electrolite` in your electron entry script: <br>`const electrolite = require("path/to/electrolite/index.js")`
  - Set global routes following `express` schema (see express notes)
    ```javascript
     electrolite.use(authFunction)
     electrolite.get("/api/", () => { return { id: req.params.id } }); 
     electrolite.get("/api/:id", async (req) => { return { id: req.params.id } }); 
     electrolite.post("/api/:id", (req) => { return { id: req.params.id, data: req.body } });
    ```
- **init** the module via `await eclectrolite.init(options)`
  - set global listeners: `electrolite.on("event", handleEvent)`
  - emit global events: `electrolite.emit("event", "event-data")`
  - create a window: `const win = electrolite.createWindow(windowOptions)`
    - set window-specific listeners: `win.on("event", handleEventOnWindow)`
    - emit window-specific events: `win.emit("loaded", true)`
    - Set window-specific routes following `express` schema (see express notes)
      ```javascript
       win.get("/window/", () => { return { id: req.params.id } }); 
       win.get("/window/:id", async (req) => { return { id: req.params.id } }); 
       win.post("/window/:id", (req) => { return { id: req.params.id, data: req.body } });
       ````

<br>
<br>

<details>
  <summary>🔽 <b>Express Notes:</b></summary>

- Similarities:
  - accepts both `sync` and `async` functions
  - `get/post`, accepts functions stacking, just like `express`, `electrolite.get(Function1, Function2)`
  - accepts `electrolite.use(Function)`, just like `express`
- Diffrences:
  - `electrolite.use(Function)` doesn't accept stacking _for now_
  - only `get/post` methods accepted as communication bridge
  - **expects a `return` instead of `res.send()`**
  - **no headers**, tokens and cookies are expected to be handled on backend as this is an application, not a a web server
</details>

<br>

## In depth

<details>
  <summary>🔽 <code>electrolite</code> properties:</summary>

  | name | type | Expects | returns | description |
  | ---- | ---- | ------- | ------- | ----------- |
  | `getScreens`       | fn  | -                                 | Array  | Gets all screens info |
  | `getPrimaryScreen` | fn  | -                                 | Object | Gets main screen name |
  | `getScreenInfo`    | fn  | String WindowID                   | Object | Gets geometry, id and label of screen |
  | `get`              | fn  | String route, Function handler    | -      | Express-like method |
  | `post`             | fn  | String route, Function handler    | -      | Express-like method |
  | `use`              | fn  | Function handler                  | -      | Express-like method |
  | `protocol`         | fn  | String protocol, Function handler | -      | Registers a protocol and its handler |
  | `createWindow`     | fn  | Object options                    | Window | Creates an electron window |
  | `init`             | fn  | -                                 | -      | Builds express routes |
  | `emit`             | fn  | String event, Function handler    | -      | Event emitter |
  | `on`               | fn  | String event, Function handler    | -      | event listener |
  | `mode`             | var | "keepAlive" or "exitOnAllClose"   | -      | Sets persistence |
</details>


<details>
  <summary>🔽 <code>electrolite.init()</code> options:</summary>

  | name | Type | default value | description |
  | ---- | ---- | ------------- | ----------- |
  | `apiKey`  | String | `"_API_"` | the name that sets `window[ apiName ]` to bridge electrolite |
</details>


<details>
  <summary>🔽 <code>electrolite.createWindow()</code> options:</summary>

  | name      | Type          | default    | description                                    | options                 |
  | --------- | ------------- | ---------- | ---------------------------------------------- | ----------------------- |
  | `debug`   | bool          | false      | Enable/Disable webTools on window              | true/false              |
  | `padding` | int           | `0`        | space around the window if used with "max"     | int                     |
  | `raw`     | Object        | undefined  | Pass options to the actual [electron window](https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions)     | any property you'd pass if you didn't use `electrolite` |
  | `src`     | str           | undefined  | the url to load inside the window              | path, url to allow Vue, React, etc. servers to be rendered |
  | `type`    | str           | undefined  | Visual aspect of the window                    | undefined = classic, "background", "borderless", "glass", "borderlessGlass" |
  | `x`       | int, str      | `center`   |  horizontal position of the window             |                         |
  |           | int           |            | Value in pixels                                |                         |
  |           | str           |            | Pixels or Percent value                        | "px", "%"               |
  |           | str           |            | Literal value                                  | "center", "min", "max"  |
  | `y`       | int, str      | `center`   | vertical position of the window                |                         |
  |           | int           |            | Value in pixels                                |                         |
  |           | str           |            | Pixels or Percent value                        | "px", "%"               |
  |           | str           |            | Literal value                                  | "center", "min", "max"  |
  | `width`   | int, str      | `800`      | `width` of the window                          |                         |
  |           | int           |            | Value in pixels                                |                         |
  |           | str           |            | Pixels or Percent value                        | "px", "%"               |
  | `height`  | int, str      | `600`      | `width` of the window                          |                         |
  |           | int           |            | Value in pixels                                |                         |
  |           | str           |            | Pixels or Percent value                        | "px", "%"               |
  | `screen`  | arr, str      | undefined  | screen to spawn the window into                |                         |
  |           | str           |            | pass the ScreenID                              | use `getScreens()` to get IDs|
  |           | str           |            | literal position                               | "left", "right"         |
  |           | arr           |            | [ priority, fallback ]                         | Used in case of disconnecting screen |
</details>


<details>
  <summary>🔽 <code>Window</code> properties:</summary>

  | name | type | Expects | returns | description |
  | ---- | ---- | ------- | ------- | ----------- |
  | `on`               | fn  | String event, Function handler        | -      | event listener |
  | `get`              | fn  | String route, Function handler        | -      | Window-specific Express-like method |
  | `post`             | fn  | String route, Function handler        | -      | Window-specific Express-like method |
  | `getWindow`        | fn  | -                                     | Window | Returns the actual electron window |
  | <s>use</s>         | -   | <s>Function handler</s>               | -      | Not handled |
  | <s>emit</s>        | -   | <s>String event, Function handler</s> | -      | Handled via HTML `window[ apiKey ].emit` |
</details>

<br>

## Full Example

```javascript
  const electrolite = require("./electrolite/index.js");

  const init = async () => {
    electrolite.use((req) => {
      console.log(`LOG: ${ req.method }\t${ req.url }`); // log requests
    });

    electrolite.get("/", () => "Welcome home");
    electrolite.post("/values", (req) => { return { received: req.body } });
    electrolite.get("/page/:number", async () => { return { page: req.params.number }; });

    electrolite.init({ apiKey: "API" });
    const win = electrolite.createWindow({
      x: "min",
      y: "center",
      width: "20%",
      height: 400,
      src: "index.html",
      screen: [ "mySpecificScreenName", "left" ],
      debug: true,
      type: "borderless",
      raw: { defaultFontSize: 14, defaultEncoding: "UTF-8" }
    })

    win.on("response", (evtName, data) => console.log("Window sent a message: "+data));

    setTimeout(() => {
      win.emit("message", "hello there");
      electrolite.emit("update", "new window created");
    }, 1000);
  }
```

```HTML
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <script type="text/javascript">
        window.API.on("message", (event, data) => { alert("Message to wndow:" + data); });
        window.API.on("update", (event, data) => { alert("Message from main:" + data); });
        window.API.emit("response", "Window loaded");
      </script>
    </body>
  </html>
```

<br>
<br>
