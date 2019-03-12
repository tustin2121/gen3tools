// pgegen.cpp : Defines the entry point for the console application.
//

#include "global.hpp"
#include "optparse.hpp"
#include "symbols.hpp"
#include "elfread.hpp"

using namespace std;

string *gamecode = new string("????");
string *templateFilename = nullptr;
string *symFilename = nullptr;
string *outFilename = nullptr;

vector<pair<string, string>> templateMap;
unordered_map<string, uint64_t> symbolMap;
bool gQuiet = false;

void cleanup()
{
	delete symFilename;
	delete templateFilename;
	templateMap.clear();
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

	string line, key, val;
	size_t pos, pos2;
	bool headerFound = false;
	while (getline(tFile, line))
	{
		if (line.length() == 0) continue; //skip
		if (line[0] == ';' || line[0] == '#')
			continue; //comment character, skip
		if (line[0] == '[')
		{
			headerFound = true;
			continue;
		}
		pos = line.find_first_of(";#");
		if (pos != string::npos) //remove comment
		{
			line = line.substr(0, pos);
		}
		pos = line.find_first_of("=");
		if (pos == string::npos) continue; //skip line, no equals...

		key = line.substr(0, pos);
		val = line.substr(pos + 1);
		templateMap.push_back(make_pair(key, val));

		// Find symbols in the values
		pos = 0;
		while ((pos = val.find("${", pos)) != string::npos)
		{
			pos2 = val.find_first_of("}", pos);
			key = val.substr(pos + 2, pos2 - pos - 2);
			findSymbolsInExpression(key);
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

	out << "[" << gamecode << "]\n";

	string line, expr, val;
	size_t pos, pos2;
	for (const auto &n : templateMap) {
		val = n.second;
		pos = 0;
		while ((pos = val.find("${", pos)) != string::npos)
		{
			pos2 = val.find_first_of("}", pos);
			expr = val.substr(pos + 2, pos2 - pos - 2);
			val = resolveExpression(expr);
			pos++;
		}

		out << n.first << " = " << val << endl;
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
	
	cout << "Template:" << endl;
	for (const auto &n : templateMap) {
		cout << n.first << " = " << n.second << endl;
	}
	cout << "\nLooking for:" << endl;
	for (const auto &n : symbolMap) {
		cout << "Symbol " << n.first << endl;
	}

	cleanup();
	return 0;
}

