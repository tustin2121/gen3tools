// main.js

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let windowList = [];

function createWindow() {
	let win = new BrowserWindow({ 
		width: 1000, height: 800,
		webPreferences: {
			webSecurity: false,
			backgroundThrottling: true,
			nodeIntegration: true,
		},
		show: false,
	});
	win.once('ready-to-show', ()=>win.show());
	win.loadFile('editor.html');
	win.on('closed', ()=> {
		windowList = windowList.filter(x=>x!=win);
	});
	// win.on('unresponsive', ()=>win.reload());
	windowList.push(win);
	// win.webContents.openDevTools();
	return win;
}

function createMenubar() {
	let template = [];
	const isMac = process.platform === 'darwin';
	if (isMac) {
		template.push({ role: 'appMenu' });
	}
	template.push({
		label: 'File',
		submenu: [
			{ label: 'New', accelerator: 'CmdOrCtrl+N', click: null }, //TODO
			{ label: 'Open', accelerator: 'CmdOrCtrl+O', click: null }, //TODO
			{ label: 'Save', accelerator: 'CmdOrCtrl+S', click: null }, //TODO
			{ type: 'separator' },
			{ label: 'Resize', click: null }, //TODO
		],
	});
	template.push({
		label: 'Edit',
		submenu: [
			{ label: 'Undo', accelerator: 'CmdOrCtrl+Z', },
			{ label: 'Redo', accelerator: 'CmdOrCtrl+Y', },
			// { type: 'separator' },
			// { role: 'cut' },
			// { role: 'copy' },
			// { role: 'paste' },
			// { type: 'separator' },
			
		],
	});
	template.push({ role:'viewMenu' });
	
	let menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

createMenubar();
app.on('ready', createWindow);
app.on('window-all-closed', ()=>{
	app.quit();
});

