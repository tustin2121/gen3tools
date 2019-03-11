// debugger.js


const emulator = require('electron').remote.getGlobal('emulator');
let currTab = "setup";

let updateLoop = null;

const FLAG_BYTE_COUNT = 300;
const FLAG_COUNT = FLAG_BYTE_COUNT*8;
const VAR_COUNT = 256;
let m_flags = new Array(FLAG_COUNT);
let m_vars = new Array(VAR_COUNT);

$(function(){
	$('nav > li').on('click', function(){
		switchTabs($(this).attr('name'));
	});
	
	window.addEventListener('beforeunload', ()=>{
		emulator.cleanupCallbacks(__window_id__);
	});
	updateLoop = setInterval(update, 200);
});

function update() {
	switch (currTab) {
		case "setup": break;
		case "scripting": update_scripting(); break;
		case "events": update_events(); break;
	}
}

function switchTabs(tabName) {
	$('nav > .selected, main > .selected').removeClass('selected');
	$('nav > [name='+tabName+']').addClass('selected');
	$('main > [name='+tabName+']').addClass('selected');
	currTab = tabName;
}

function printSymbolOrAddr(num) {
	let sym = emulator.lookupSymbol(num);
	if (sym) return sym;
	return ('00000000'+num.toString(16)).slice(-8);
}
function printAddr(num) {
	return ('00000000'+num.toString(16)).slice(-8);
}

