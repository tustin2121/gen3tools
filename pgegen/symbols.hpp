#pragma once
#include <vector>

enum TokenType : unsigned char {
	Group,
	Constant10,
	Constant16,
	Symbol,
	AddOp,
	SubOp,
	MulOp,
	DivOp,
};

struct ExpressionToken {
	TokenType type;
	long value;
	std::vector<ExpressionToken*> subTokens;
	
	ExpressionToken(TokenType t) : type(t) {};
	~ExpressionToken()
	{
		for (auto val : subTokens)
		{
			delete val;
		}
	}
	bool isEmpty() const
	{
		return subTokens.size() == 0;
	}
};

class ExpressionParser {
private:
	const char* const m_expr;
	const int m_exprLength;
	
	ExpressionToken *m_mainToken;
	
	const char* m_ptr;
	const char* workingExpr = nullptr;
	ExpressionToken *workingToken = nullptr;
	
	const char* m_errorState = nullptr;
public:
	ExpressionParser(std::string *expr);
	~ExpressionParser();
	
	void parse();
   unsigned long resolve();
	const char* getErrorState();

private:
   unsigned long resolveExpression(ExpressionToken *token);
	void groupMaths(ExpressionToken *token);
	unsigned long parseInt(const char* start, const char* end, int base);
   unsigned long resolveSymbol(const char* sym, int len);
	void pushWorkingToken(ExpressionToken *group);
	ExpressionToken* parseGroup();
};


void findSymbolsInExpression(std::string expr);
std::string resolveExpression(std::string expr);
