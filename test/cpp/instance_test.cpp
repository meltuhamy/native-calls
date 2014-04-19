#include "gtest/gtest.h"
#include "ppapi/cpp/instance.h"
#include "NaClRPCInstance.h"
#include "ppapi/cpp/var.h"
#include "ppapi/cpp/var_array.h"
#include <string>


class TestInstance: public NaClRPCInstance {
public:
  TestInstance(PP_Instance instance) : NaClRPCInstance(instance) {}
  virtual ~TestInstance(){}

  virtual void HandleRPC(std::string name, pp::VarArray params, int id){
    // do nothing
  }

};

TEST(RPCInstanceCase, ConstructorTest) {
  NaClRPCInstance* i = new TestInstance(123);

  // should return false
  std::string s;
  int id;
  pp::VarArray p;
  bool actual = i->VerifyRPC(pp::Var("hello"), s, p, id);
  ASSERT_EQ(false, actual);
}

