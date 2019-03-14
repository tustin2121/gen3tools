// pgegen.cpp : Defines the entry point for the console application.
//

#include "global.hpp"
#include "optparse.hpp"
#include "symbols.hpp"
#include "elfread.hpp"

using namespace std;

string *templateFilename = nullptr;
string *symFilename = nullptr;
string *outFilename = nullptr;

vector<string> templateLines;
unordered_map<string, uint64_t> symbolMap;
bool gQuiet = false;

void cleanup()
{
	delete symFilename;
	delete templateFilename;
	templateLines.clear();
	symbolMap.clear();
}

bool readTemplate()
{
	ifstream tFile;
	tFile.open(*templateFilename, ios::in);
	if (!tFile.is_open())
	{
		cerr << "Error opening template file!" << endl;
		return false;
	}

	string line, expr;
	size_t pos, pos2;
	bool headerFound = false;
	while (getline(tFile, line))
	{
		templateLines.push_back(line);

		// Find symbols in the values
		pos = 0;
		while ((pos = line.find("${", pos)) != string::npos)
		{
			pos2 = line.find_first_of("}", pos);
			expr = line.substr(pos + 2, pos2 - pos - 2);
			findSymbolsInExpression(expr);
			pos++;
		}
	}

	tFile.close();
	return true;
}

bool writeTemplate()
{
	streambuf *buf;
	ofstream oFile;
	if (outFilename != nullptr)
	{
		oFile.open(*outFilename, ios::out | ios::trunc);
		buf = oFile.rdbuf();
	}
	else
	{
		buf = cout.rdbuf();
	}
	ostream out(buf);

	string expr;
	size_t pos, pos2;
	for (auto &line : templateLines) {
		pos = 0;
		while ((pos = line.find("${", pos)) != string::npos)
		{
			pos2 = line.find_first_of("}", pos);
			expr = line.substr(pos + 2, pos2 - pos - 2);
			expr = resolveExpression(expr);
			line.replace(pos, pos2-pos+1, expr);
			// pos++;
		}

		out << line << endl;
	}

	if (oFile.is_open())
	{
		oFile.close();
	}
	return true;
}

int main(int argc, char *argv[])
{
	if (argc <= 1)
	{
		printHelp();
		return -1;
	}
	
	if (!parseOptions(argc, argv))
	{
		printHelp();
		cleanup();
		return -1;
	}

	if (!readTemplate())
	{
		cleanup();
		return -1;
	}
	
	if (!findSymbols())
	{
		cleanup();
		return -1;
	}
	
	if (!writeTemplate())
	{
		cleanup();
		return -1;
	}
	
	// cout << "Template:" << endl;
	// for (const auto &n : templateLines) {
	// 	cout << n.first << " = " << n.second << endl;
	// }
	// cout << "\nLooking for:" << endl;
	// for (const auto &n : symbolMap) {
	// 	cout << "Symbol " << n.first << " == " << n.second << endl;
	// }

	cleanup();
	return 0;
}

