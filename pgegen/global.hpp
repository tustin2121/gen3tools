#pragma once

#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <fstream>

extern std::string *templateFilename;
extern std::string *symFilename;

extern std::vector<std::pair<std::string, std::string>> templateMap;
extern std::unordered_map<std::string, uint64_t> symbolMap;
extern bool gQuiet;