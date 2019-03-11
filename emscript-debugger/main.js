// main.js

const { app, BrowserWindow } = require('electron');
const { randomBytes } = require('crypto');
const { EmulatorApi } = require('./emulatorapi');
const path = require('path');

let windowList = [];

const generateId = ()=>Math.floor(Math.random()*Math.pow(36,5)).toString(36);

global.emulator = new EmulatorApi();

function createWindow() {
	let wid = generateId();
	let win = new BrowserWindow({ 
		width: 1000, height: 800,
		webPreferences: {
			webSecurity: false,
			backgroundThrottling: false,
			nodeIntegration: true,
		},
		show: false,
	});
	win.once('ready-to-show', ()=>win.show());
	win.loadFile('debugger.html');
	win.on('closed', ()=> {
		windowList = windowList.filter(x=>x!=win);
		emulator.cleanupCallbacks(wid);
	});
	win.on('unresponsive', ()=>win.reload());
	windowList.push(win);
	win.__window_id__ = wid;
	// win.webContents.__window_id__ = wid;
	// win.webContents.openDevTools();
	return win;
}

app.on('ready', createWindow);
app.on('window-all-closed', ()=>{
	emulator.destroy();
	app.quit();
});
