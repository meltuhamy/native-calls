#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "RPCType.h"
#include <string>
#include <vector>
#include <stdio.h>
using namespace pprpc;


// TODO write a test for each type

TEST(RPCType, ConvertUnsignedLong){
	ULongType twentyThree(23);
	pp::Var ulongVar = twentyThree.AsVar();
	EXPECT_TRUE(ulongVar.is_int()==true);
	EXPECT_TRUE(ulongVar.AsInt() == 23);
	EXPECT_TRUE(twentyThree.getTypeString() == "unsigned long");
}
