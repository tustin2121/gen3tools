//

#include "global.hpp"
#include "symbols.hpp"

#include <iostream>
#include <string>
#include <unordered_map>

using namespace std;

#define DEFINE_TEST(name) \
void name(int &res)

#define ASSERT_TRUE(condition, message) \
if (!(condition)) \
{ \
   res++; \
   std::cout << message << std::endl; \
}

#define ASSERT_STREQ(str1, str2, len, message) \
if (strncmp(reinterpret_cast<const char*>(str1), reinterpret_cast<const char*>(str2), len) != 0) \
{ \
   res++; \
   std::cout << message << std::endl; \
   std::cout << "Expected: " << str1 << std::endl; \
   std::cout << "Actual  : " << str2 << std::endl; \
}

///////////////////////////////////////////////////////////////////////////////

DEFINE_TEST(ExpressionParser_testBasicReplace)
{
	constexpr unsigned long VAL = 0x03002C38;
	unordered_map<string, uint64_t> map;
	string expr("gHello");
	map.emplace("gHello", 0x03002C38);
	
	ExpressionParser parser(&expr, &map);
	parser.parse();
	unsigned long val = parser.resolve();
	ASSERT_TRUE(val == VAL, "Symbol replace failure!");
}



///////////////////////////////////////////////////////////////////////////////

#define RUN_TEST(method) \
std::cout << "Running " #method " ... " << std::flush; \
total++; res=0; method(res); \
if (res == 0) \
{ \
   success++; \
   std::cout << "[SUCCESS]" << std::endl; \
} \
else \
{ \
   std::cout << "[FAILED]" << std::endl; \
}

int runSelfTest(void) {
   std::cout << "Starting selftest..." << std::endl;
   int success = 0, total = 0;
   int res = 0;

   RUN_TEST(ExpressionParser_testBasicReplace);

   std::cout << "Selftest complete: " << success << "/" << total << " tests succeeded." << std::endl;
   std::cout << std::flush;
   return res;
}
