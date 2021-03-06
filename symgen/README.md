# symgen

Takes a file with references to internal symbol names and replaces those symbols with the addresses of them read out of an ELF file. This allows a small subset of symbols to be pulled, rather than trying to sift through the whole program.

symgen requires a template file, so that it knows what symbols to look for and pull out of the .elf file generated by the compilation process of a gen 3 rom. The template file can be of any format, as symgen treats the file as if it was a black box and reproduces the file wholesale with any expression tags replaced.

Expression tags are anything inside `${` and `}`. Expression tags can contain symbol names, constants (in decimal form or `0x` hex form), and basic arithmitic (addition, subtraction, multiplication, division). Expression tags always output in hexidecimal format. (Options for this may be added later)

To build: run `make` or build from the Visual Studio project.

To use:
```
symgen -t /path/to/template.file -s /path/to/pokeemerald.elf > outputfile
```

## Examples
```ini
[BPEE]
ROMName=Pokemon HackName (English)
; Use the scripting deliniators to look up symbols and perform basic arithmitic.
ItemData=${gItems}
AttackNames=${gMoveNames + 1}
TMData=${gTMHMMoves - 0x5}
; Use & after a symbol name to look up the size of the symbol
; (Not every symbol has a size.)
TotalTMsPlusHMs=${gTMHMMoves& / 2}
TotalTMs=50
```

```
{
	"ROMNAME" : "Pokemon Emerald",
	"ItemData": "${gItems}",
	"MapBank0": {
		"location": 0x${gMapGroup0},
		"numMaps": 0x${(gMapGroup1 - gMapGroup0) / 4},
	}
}
```
