#include "gtest/gtest.h"
#include "ppapi/cpp/instance.h"
class ExternalInstance : public pp::Instance
{
public:
  ExternalInstance(PP_Instance instance) : Instance(instance){}
  virtual ~ExternalInstance(){}
  virtual bool myTest(bool in){
    return !in;
  }
};


TEST(TestCase, SimpleTest) {
  EXPECT_EQ(4, 2);
}

TEST(TestCase, AnotherTest) {
  EXPECT_EQ(4, sizeof(void*));
}

TEST(TestCase, ExternalInstanceTest) {
  ExternalInstance *i = new ExternalInstance(1234);
  EXPECT_EQ(i->myTest(true), false);
  EXPECT_EQ(i->myTest(false), true);
}

TEST(TestCase, SittingAcrossThereTest){
  EXPECT_EQ(0,1);
}