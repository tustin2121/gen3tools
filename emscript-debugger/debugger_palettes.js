//

let gPlttBufferUnfaded, gPlttBufferFaded, gPaletteUpdated;
let palettes;
// let $gPlttBufferUnfaded, $gPlttBufferFaded;

$(function(){
	let $tab = $('main > [name=palettes]');
	
	gPlttBufferUnfaded = new Uint16Array(0x200);
	gPlttBufferFaded = new Uint16Array(0x200);
	gPaletteUpdated = new Array(32);
	palettes = new Array(32);
	for (let i = 0; i < 32; i++) {
		let $parent = $tab.find(`#swatch${i<16?1:2}`);
		let $pt = $(`<swatch>`).attr('name', `${i}`);
		$pt.append('<span>U</span>');
		$pt.append('<span>F</span>');
		let $canvas = $(`<canvas width="${16*16}" height="${16*2+1}"></canvas>`).appendTo($pt);
		palettes[i] = $canvas[0].getContext('2d');
		$pt.appendTo($parent);
	}
	
	$tab.find('button[name=applyColors]').on('click', function(){
		let start = $tab.find('[name=paletteStart]').val() * 16;
		let end = $tab.find('[name=paletteEnd]').val() * 16;
		switch ($tab.find('input[name=paletteType]:checked').val()) {
			case 'gray1': TintPalette_GrayScale(start, end); break;
			case 'gray2': TintPalette_GrayScale2(start, end); break;
			case 'sepia': TintPalette_SepiaTone(start, end); break;
			case 'custom': {
				let rgb = $tab.find('input[name=paletteTint]').val();
				TintPalette_CustomTone(start, end, rgb); 
			} break;
			case 'blend': {
				let coeff = $tab.find('input[name=paletteCoeff]').val();
				let rgb = $tab.find('input[name=paletteTint]').val();
				BlendPalette(start, end, coeff, rgb); 
			} break;
		}
		applyPaletteChanges();
	});
	BuildGammaShiftTables();
});

function convertToRGB(u16Val) {
	let r = ((((u16Val >>  0) & 0x1F) / 32) * 0xFF) & 0xFF;
	let g = ((((u16Val >>  5) & 0x1F) / 32) * 0xFF) & 0xFF;
	let b = ((((u16Val >> 10) & 0x1F) / 32) * 0xFF) & 0xFF;
	return `rgb(${r}, ${g}, ${b})`;
}

function update_palettes() {
	emulator.readSymbols(
		'gPlttBufferUnfaded', 'gPlttBufferFaded', 
	).then(palettes_fillInSymbols);
}

function palettes_fillInSymbols(dataList) {
	for (let data of dataList) {
		switch (data.name) {
			case 'gPlttBufferUnfaded':
				for (let i = 0; i < 0x200; i++) {
					let x = data.data.readUInt16LE(i*2);
					if (x !== gPlttBufferUnfaded[i]) {
						gPlttBufferUnfaded[i] = x;
						gPaletteUpdated[Math.floor(i/16)] = true;
					}
				}
				break;
			case 'gPlttBufferFaded':
				for (let i = 0; i < 0x200; i++) {
					let x = data.data.readUInt16LE(i*2);
					if (x !== gPlttBufferFaded[i]) {
						gPlttBufferFaded[i] = x;
						gPaletteUpdated[Math.floor(i/16)] = true;
					}
				}
				break;
		}
	}
	for (let i = 0; i < 32; i++) {
		if (!gPaletteUpdated[i]) continue;
		let ctx = palettes[i];
		for (let x = 0; x < 16; x++) {
			ctx.fillStyle = convertToRGB(gPlttBufferUnfaded[i*16+x]);
			ctx.fillRect(x*16, 0, 16, 16);
		}
		for (let x = 0; x < 16; x++) {
			ctx.fillStyle = convertToRGB(gPlttBufferFaded[i*16+x]);
			ctx.fillRect(x*16, 17, 16, 16);
		}
	}
	gPaletteUpdated.fill(false);
}

function applyPaletteChanges() {
	let buf = Buffer.alloc(0x200*2);
	for (let i = 0; i < 0x200; i++) {
		buf.writeUInt16LE(gPlttBufferFaded[i], i*2);
	}
	let ptr = emulator._resolveSymbol('gPlttBufferFaded');
	console.log(`/WriteByteRange/${ptr.addr}/${buf.toString('hex')}`);
	emulator.postToEmulator(`/WriteByteRange/${ptr.addr}`, buf.toString('hex').toUpperCase());
	
	// let buf = Buffer.alloc(16*2);
	// for (let i = 0; i < 16; i++) {
	// 	buf.writeUInt16LE(gPlttBufferFaded[i], i*2);
	// }
	// let ptr = emulator._resolveSymbol('gPlttBufferFaded');
	// console.log(`/WriteByteRange/${ptr.addr}/${buf.toString('hex')}`);
	// emulator.queryEmulator(`/WriteByteRange/${ptr.addr}/${buf.toString('hex').toUpperCase()}`, 'command');
	// emulator.postToEmulator(`/WriteByteRange/${ptr.addr}`, buf.toString('hex'));
}


///////////////////////////////////////////////////////////////////////////////
// Copied from the ROM source:

const GAMMA_NONE = 0;
const GAMMA_NORMAL = 1;
const GAMMA_ALT = 2;

let altGammaSpritePalIndex = 0;
const gammaShifts = [];
const altGammaShifts = [];
for (let i = 0; i < 19; i++) {
	gammaShifts[i] = new Array(32);
	altGammaShifts[i] = new Array(32);
}

let sPaletteGammaTypes = [
	// background palettes
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NONE,
    GAMMA_NONE,
    // sprite palettes
    GAMMA_ALT,
    GAMMA_NORMAL,
    GAMMA_ALT,
    GAMMA_ALT,
    GAMMA_ALT,
    GAMMA_ALT,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_ALT,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
    GAMMA_NORMAL,
]

// Builds two tables that contain gamma shifts for palette colors.
// It's unclear why the two tables aren't declared as const arrays, since
// this function always builds the same two tables.
function BuildGammaShiftTables()
{
    let v0;
    let gammaTable;
    let v2;
    let v4;
    let v5;
    let gammaIndex;
    let v9;
    let v10;
    let v11;
    let dunno;

    // sPaletteGammaTypes = sBasePaletteGammaTypes;
    for (v0 = 0; v0 <= 1; v0++)
    {
        if (v0 == 0)
            gammaTable = gammaShifts;
        else
            gammaTable = altGammaShifts;

        for (v2 = 0; v2 < 32; v2++)
        {
            v4 = v2 << 8;
            if (v0 == 0)
                v5 = (v2 << 8) / 16;
            else
                v5 = 0;
            for (gammaIndex = 0; gammaIndex <= 2; gammaIndex++)
            {
                v4 = (v4 - v5);
                gammaTable[gammaIndex][v2] = v4 >> 8;
            }
            v9 = v4;
            v10 = 0x1f00 - v4;
            if ((0x1f00 - v4) < 0)
            {
                v10 += 0xf;
            }
            v11 = v10 >> 4;
            if (v2 < 12)
            {
                for (; gammaIndex < 19; gammaIndex++)
                {
                    v4 += v11;
                    dunno = v4 - v9;
                    if (dunno > 0)
                        v4 -= (dunno + (dunno >> 15)) >> 1;
                    gammaTable[gammaIndex][v2] = v4 >> 8;
                    if (gammaTable[gammaIndex][v2] > 0x1f)
                        gammaTable[gammaIndex][v2] = 0x1f;
                }
            }
            else
            {
                for (; gammaIndex < 19; gammaIndex++)
                {
                    v4 += v11;
                    gammaTable[gammaIndex][v2] = v4 >> 8;
                    if (gammaTable[gammaIndex][v2] > 0x1f)
                        gammaTable[gammaIndex][v2] = 0x1f;
                }
            }
        }
	}
	console.log(`BuildGammaShiftTables: `, gammaShifts, altGammaShifts);
}


function Q_8_8(n) { return (n * 256) & 0xFFFF; }
function CpuFastCopy(src, srcOff, dst, destOff, size) {
	for (let i = 0; i < size; i++) {
		dst[destOff] = src[srcOff+i];
	}
}

function TintPalette_GrayScale(start, end)
{
	let r, g, b;
	let gray;
	for (let i = start; i <= end; i++)
	{
		r = (gPlttBufferUnfaded[i] >>  0) & 0x1F;
		g = (gPlttBufferUnfaded[i] >>  5) & 0x1F;
		b = (gPlttBufferUnfaded[i] >> 10) & 0x1F;
		gray = (r * Q_8_8(0.3) + g * Q_8_8(0.59) + b * Q_8_8(0.1133)) >> 8;
		gPlttBufferFaded[i] = (gray << 10) | (gray << 5) | (gray << 0);
		gPaletteUpdated[Math.floor(i/16)] = true;
	}
}

function TintPalette_GrayScale2(start, end)
{
	const sRoundedDownGrayscaleMap = [
		0,  0,  0,  0,  0,
		5,  5,  5,  5,  5,
		11, 11, 11, 11, 11,
		16, 16, 16, 16, 16,
		21, 21, 21, 21, 21,
		27, 27, 27, 27, 27,
		31, 31
	];
	
	let r, g, b;
	let gray;
	for (let i = start; i <= end; i++)
	{
		r = (gPlttBufferUnfaded[i] >>  0) & 0x1F;
		g = (gPlttBufferUnfaded[i] >>  5) & 0x1F;
		b = (gPlttBufferUnfaded[i] >> 10) & 0x1F;
		gray = (r * Q_8_8(0.3) + g * Q_8_8(0.59) + b * Q_8_8(0.1133)) >> 8;
		
		if (gray > 0x1F) gray = 0x1F;
		gray = sRoundedDownGrayscaleMap[gray];
		
		gPlttBufferFaded[i] = (gray << 10) | (gray << 5) | (gray << 0);
		gPaletteUpdated[Math.floor(i/16)] = true;
	}
}

function TintPalette_SepiaTone(start, end)
{
	let r, g, b;
	let gray;
	for (let i = start; i <= end; i++)
	{
		r = (gPlttBufferUnfaded[i] >>  0) & 0x1F;
		g = (gPlttBufferUnfaded[i] >>  5) & 0x1F;
		b = (gPlttBufferUnfaded[i] >> 10) & 0x1F;
		gray = (r * Q_8_8(0.3) + g * Q_8_8(0.59) + b * Q_8_8(0.1133)) >> 8;
		
		r = (Q_8_8(1.2) * gray) >> 8;
        g = (Q_8_8(1.0) * gray) >> 8;
		b = (Q_8_8(0.94) * gray) >> 8;
		if (r > 31) r = 31;
		
		gPlttBufferFaded[i] = (b << 10) | (g << 5) | (r << 0);
		gPaletteUpdated[Math.floor(i/16)] = true;
	}
}

function TintPalette_CustomTone(start, end, toneHex)
{
	let rTone = Number.parseInt(toneHex.slice(1,3), 16);
	let gTone = Number.parseInt(toneHex.slice(3,5), 16);
	let bTone = Number.parseInt(toneHex.slice(5,7), 16);
	
	let r, g, b;
	let gray;
	for (let i = start; i <= end; i++)
	{
		r = (gPlttBufferUnfaded[i] >>  0) & 0x1F;
		g = (gPlttBufferUnfaded[i] >>  5) & 0x1F;
		b = (gPlttBufferUnfaded[i] >> 10) & 0x1F;
		gray = (r * Q_8_8(0.3) + g * Q_8_8(0.59) + b * Q_8_8(0.1133)) >> 8;
		
		r = (rTone * gray) >> 8;
        g = (gTone * gray) >> 8;
		b = (bTone * gray) >> 8;
		
		if (r > 31) r = 31;
		if (g > 31) g = 31;
		if (b > 31) b = 31;
		
		gPlttBufferFaded[i] = (b << 10) | (g << 5) | (r << 0);
		gPaletteUpdated[Math.floor(i/16)] = true;
	}
}

function BlendPalette(start, end, coeff, blendHex)
{
	let r2 = Number.parseInt(blendHex.slice(1,3), 16);
	let g2 = Number.parseInt(blendHex.slice(3,5), 16);
	let b2 = Number.parseInt(blendHex.slice(5,7), 16);
	
	let r1, g1, b1;
	for (let i = start; i <= end; i++)
	{
		r1 = (gPlttBufferUnfaded[i] >>  0) & 0x1F;
		g1 = (gPlttBufferUnfaded[i] >>  5) & 0x1F;
		b1 = (gPlttBufferUnfaded[i] >> 10) & 0x1F;
		r1 = r1 + (((r2 - r1) * coeff) >> 4);
		g1 = g1 + (((g2 - g1) * coeff) >> 4);
		b1 = b1 + (((b2 - b1) * coeff) >> 4);
		gPlttBufferFaded[i] = (b1 << 10) | (g1 << 5) | (r1 << 0);
		gPaletteUpdated[Math.floor(i/16)] = true;
	}
}

function ApplyGammaShift(start, numPalettes, gammaIndex)
{
    let curPalIndex;
    let palOffset;
    let gammaTable;
    let i;

    if (gammaIndex > 0)
    {
        gammaIndex--;
        palOffset = start * 16;
        numPalettes += start;
        curPalIndex = start;

        // Loop through the speficied palette range and apply necessary gamma shifts to the colors.
        while (curPalIndex < numPalettes)
        {
            if (sPaletteGammaTypes[curPalIndex] == GAMMA_NONE)
            {
                // No palette change.
                CpuFastCopy(gPlttBufferUnfaded, palOffset, gPlttBufferFaded, palOffset, 16);
                palOffset += 16;
            }
            else
            {
                let r, g, b;

                if (sPaletteGammaTypes[curPalIndex] == GAMMA_ALT || curPalIndex - 16 == altGammaSpritePalIndex)
                    gammaTable = altGammaShifts[gammaIndex];
                else
                    gammaTable = gammaShifts[gammaIndex];

                for (i = 0; i < 16; i++)
                {
                    // Apply gamma shift to the original color.
                    let baseColor = { 
						r: (gPlttBufferUnfaded[palOffset] >>  0) & 0x1F,
						g: (gPlttBufferUnfaded[palOffset] >>  5) & 0x1F,
						b: (gPlttBufferUnfaded[palOffset] >> 10) & 0x1F,
					};
                    r = gammaTable[baseColor.r];
                    g = gammaTable[baseColor.g];
                    b = gammaTable[baseColor.b];
                    gPlttBufferFaded[palOffset++] = (b << 10) | (g << 5) | r;
                }
            }

            curPalIndex++;
        }
    }
    else if (gammaIndex < 0)
    {
        // // A negative gammIndex value means that the blending will come from the special Drought weather's palette tables.
        // gammaIndex = -gammaIndex - 1;
        // palOffset = start * 16;
        // numPalettes += start;
        // curPalIndex = start;

        // while (curPalIndex < numPalettes)
        // {
        //     if (sPaletteGammaTypes[curPalIndex] == GAMMA_NONE)
        //     {
        //         // No palette change.
        //         CpuFastCopy(gPlttBufferUnfaded, palOffset, gPlttBufferFaded, palOffset, 16);
        //         palOffset += 16;
        //     }
        //     else
        //     {
        //         for (i = 0; i < 16; i++)
        //         {
        //             gPlttBufferFaded[palOffset] = sDroughtWeatherColors[gammaIndex][DROUGHT_COLOR_INDEX(gPlttBufferUnfaded[palOffset])];
        //             palOffset++;
        //         }
        //     }

        //     curPalIndex++;
        // }
    }
    else
    {
        // No palette blending.
        CpuFastCopy(gPlttBufferUnfaded, start * 16, gPlttBufferFaded, start * 16, numPalettes * 16);
    }
}