CXX := g++
CXXFLAGS := -std=c++11 -O2

.PHONY: clean

SRCS := optparse.cpp symbols.cpp selftest.cpp pgegen.cpp

pgegen: $(SRCS)
	$(CXX) $(CXXFLAGS) $(SRCS) -o $@ $(LDFLAGS)

clean:
	$(RM) pgegen pgegen.exe *.o