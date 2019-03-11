//

$(function(){
	
});

function update_events() {
	
	let ptr = emulator._resolveSymbol('gSaveBlock1Ptr');
	emulator
		.queryEmulator(`/ReadByteRange/*${ptr.addr}+C70/${(300+(256*2)).toString(16)}`, 'data')
		.then(fillFromFlagBlock);
}