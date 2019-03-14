CXX := g++
CXXFLAGS := -std=c++11 -O2

.PHONY: clean

SRCS := optparse.cpp symbols.cpp elfread.cpp selftest.cpp symgen.cpp

symgen: $(SRCS)
	$(CXX) $(CXXFLAGS) $(SRCS) -o $@ $(LDFLAGS)

clean:
	$(RM) symgen symgen.exe *.o