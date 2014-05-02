#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "RPCType.h"
#include <string>
#include <vector>
using namespace pprpc;


namespace pprpc{
DEFINE_TYPE_CLASS(UnsignedLongType,unsigned long)
}



// outside
pp::Var UnsignedLongType::AsVar(ValidType<unsigned long> v){
	return pp::Var((int) v.getValue());
}

ValidType<unsigned long> UnsignedLongType::Extract(pp::Var v){
	if(v.is_int()){
		return ValidType<unsigned long>((unsigned long)v.AsInt());
	} else {
		return ValidType<unsigned long>();
	}
}


TEST(RPCType, ConvertUnsignedBool){
	UnsignedLongType twentyThree(23);
	pp::Var ulongVar = twentyThree.AsVar();
	EXPECT_TRUE(ulongVar.is_int()==true);
	EXPECT_TRUE(ulongVar.AsInt() == 23);
}
