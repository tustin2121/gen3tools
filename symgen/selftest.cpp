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

#define ASSERT_VALEQ(val1, val2, message) \
if (val1 != val2) \
{ \
   res++; \
   std::cout << message << std::endl; \
   std::cout << "\tExpected: " << val1 << std::endl; \
   std::cout << "\tActual  : " << val2 << std::endl; \
}

#define ASSERT_STREQ(str1, str2, len, message) \
if (strncmp(reinterpret_cast<const char*>(str1), reinterpret_cast<const char*>(str2), len) != 0) \
{ \
   res++; \
   std::cout << message << std::endl; \
   std::cout << "\tExpected: " << str1 << std::endl; \
   std::cout << "\tActual  : " << str2 << std::endl; \
}

///////////////////////////////////////////////////////////////////////////////

DEFINE_TEST(ExpressionParser_parseConstant10)
{
   constexpr unsigned long VAL = 12;
   string expr("12");

   ExpressionParser parser(&expr);
   parser.parse();
   unsigned long val = parser.resolve();
   ASSERT_TRUE(parser.getErrorState() == nullptr, "Error state set!" << parser.getErrorState());
   ASSERT_VALEQ(VAL, val, "Value is not correct!");
}

DEFINE_TEST(ExpressionParser_parseConstant10_2)
{
   constexpr unsigned long VAL = 706728;
   string expr("706728");

   ExpressionParser parser(&expr);
   parser.parse();
   unsigned long val = parser.resolve();
   ASSERT_TRUE(parser.getErrorState() == nullptr, "Error state set!" << parser.getErrorState());
   ASSERT_VALEQ(VAL, val, "Value is not correct!");
}

DEFINE_TEST(ExpressionParser_parseConstant16)
{
   constexpr unsigned long VAL = 0x12A;
   string expr("0x12A");

   ExpressionParser parser(&expr);
   parser.parse();
   unsigned long val = parser.resolve();
   ASSERT_TRUE(parser.getErrorState() == nullptr, "Error state set!" << parser.getErrorState());
   ASSERT_VALEQ(VAL, val, "Value is not correct!");
}

DEFINE_TEST(ExpressionParser_parseSymbol)
{
   constexpr unsigned long VAL = 0x03002C38;
   string expr("gHello");

   ExpressionParser parser(&expr);
   parser.parse();
   unsigned long val = parser.resolve();
   ASSERT_TRUE(parser.getErrorState() == nullptr, "Error state set!" << parser.getErrorState());
   ASSERT_VALEQ(VAL, val, "Symbol replace failure!");
}

DEFINE_TEST(ExpressionParser_parseSymbolSize)
{
   constexpr unsigned long VAL = 240;
   string expr("gWorld&");

   ExpressionParser parser(&expr);
   parser.parse();
   unsigned long val = parser.resolve();
   ASSERT_TRUE(parser.getErrorState() == nullptr, "Error state set!" << parser.getErrorState());
   ASSERT_VALEQ(VAL, val, "Symbol replace failure!");
}

DEFINE_TEST(ExpressionParser_testBasicArtithmitic)
{
   constexpr unsigned long VAL = 20;
   string expr("8+12");

   ExpressionParser parser(&expr);
   parser.parse();
   unsigned long val = parser.resolve();
   ASSERT_TRUE(parser.getErrorState() == nullptr, "Error state set!" << parser.getErrorState());
   ASSERT_VALEQ(VAL, val, "Value is not correct!");
}

DEFINE_TEST(ExpressionParser_testSymbolArtithmitic)
{
   constexpr unsigned long VAL = 0x03002C38 + 32;
   string expr("gHello + 32");

   ExpressionParser parser(&expr);
   parser.parse();
   unsigned long val = parser.resolve();
   ASSERT_TRUE(parser.getErrorState() == nullptr, "Error state set!" << parser.getErrorState());
   ASSERT_VALEQ(VAL, val, "Value is not correct!");
}

DEFINE_TEST(ExpressionParser_testSymbolArtithmiticHex)
{
   constexpr unsigned long VAL = 0x03002C38 + 0x1A;
   string expr("gHello + 0x1A");

   ExpressionParser parser(&expr);
   parser.parse();
   unsigned long val = parser.resolve();
   ASSERT_TRUE(parser.getErrorState() == nullptr, "Error state set!" << parser.getErrorState());
   ASSERT_VALEQ(VAL, val, "Value is not correct!");
}

DEFINE_TEST(ExpressionParser_testComplicatedGroups)
{
   constexpr unsigned long VAL = (240 / 2) + 0x23;
   string expr("(gWorld& / 2) + 0x23");

   ExpressionParser parser(&expr);
   parser.parse();
   unsigned long val = parser.resolve();
   ASSERT_TRUE(parser.getErrorState() == nullptr, "Error state set!" << parser.getErrorState());
   ASSERT_VALEQ(VAL, val, "Value is not correct!");
}

DEFINE_TEST(ExpressionParser_testComplicatedGroups2)
{
   constexpr unsigned long VAL = (240 / 4) - (0x23 * 3) + 5;
   string expr("(gWorld& / 4) - (0x23 * 3) + 5");

   ExpressionParser parser(&expr);
   parser.parse();
   unsigned long val = parser.resolve();
   ASSERT_TRUE(parser.getErrorState() == nullptr, "Error state set!" << parser.getErrorState());
   ASSERT_VALEQ(VAL, val, "Value is not correct!");
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
   
   {
	   symbolMap.emplace("gHello", 0x03002C38);
	   symbolMap.emplace("gWorld", 0x03025ABC);
	   symbolMap.emplace("gWorld&", 240);
   }

   RUN_TEST(ExpressionParser_parseConstant10);
   RUN_TEST(ExpressionParser_parseConstant10_2);
   RUN_TEST(ExpressionParser_parseConstant16);
   RUN_TEST(ExpressionParser_parseSymbol);
   RUN_TEST(ExpressionParser_parseSymbolSize);
   RUN_TEST(ExpressionParser_testBasicArtithmitic);
   RUN_TEST(ExpressionParser_testSymbolArtithmitic);
   RUN_TEST(ExpressionParser_testSymbolArtithmiticHex);
   RUN_TEST(ExpressionParser_testComplicatedGroups);
   RUN_TEST(ExpressionParser_testComplicatedGroups2);

   std::cout << "Selftest complete: " << success << "/" << total << " tests succeeded." << std::endl;
   std::cout << std::flush;
   return res;
}
