#!/usr/bin/env python
import os.path
import sys
import time


#
# Try to load the ply module, if not, then assume it is in the third_party
# directory.
#
try:
  # Disable lint check which fails to find the ply module.
  # pylint: disable=F0401
  from ply import lex
  from ply import yacc
except ImportError:
  module_path, module_name = os.path.split(__file__)
  third_party = os.path.join(module_path, os.par, os.par, 'third_party')
  sys.path.append(third_party)
  # pylint: disable=F0401
  from ply import lex
  from ply import yacc


from idl_lexer import IDLLexer
from idl_parser import IDLParser, ParseFile

class CPPCompiler:
    def __init__(self, parser):
        self.parser = parser

    def CompileText(self, text):
        return self.flatten(self.CompileNode(self.parser.ParseText('',text)))

    def CompileFile(self, filename):
        return self.flatten(self.CompileNode(ParseFile(self.parser, filename)))

    def flatten(self, tokenList):
        def recursiveStringify(x):
            if type(x) is list:
                return self.flatten(x)
            else:
                return str(x)

        out = ''
        for token in tokenList:
            out += ' ' + recursiveStringify(token)

        return out


    def CompileNode(self, node):
        cls = node._cls
        if cls == 'File':
            out = []
            for child in node.GetChildren():
                out.append(self.CompileNode(child))
            return out
        elif cls == 'Interface':
            out = ['/* interface: '+str(node.GetName())+'*/\n']
            for child in node.GetChildren():
                out.append(self.CompileNode(child))
            return out
        elif cls == 'Operation':
            return self.CompileOperation(node)

    def CompileOperation(self, node):
        out = []
        children = node.GetChildren()
        # get type and arguments
        type = None
        arguments = None
        for child in children:
            if child._cls == 'Type':
                type = child.GetChildren()
            elif child._cls == 'Arguments':
                arguments = child.GetChildren()

        # compile return type
        out.append(self.CompileType(type))

        # compile operation name
        out.append(' '+str(node.GetName()))

        # compile arguments
        out.append('(')
        if arguments is not None:
            for (i, arg) in enumerate(arguments):
                out.append((', ' if i>0 else '') + self.CompileArgument(arg))

        out.append(');\n')

        return out

    def CompileType(self, type):
        if type is None:
            return 'void'
        else:

            primitiveType = 'void'
            isArray = ''
            for child in type:
                if child._cls == 'PrimitiveType':
                    primitiveType = child.GetName()
                if child._cls == 'Array':
                    isArray = '*'
                    temp = child
                    while len(temp.GetChildren()) > 0:
                        isArray += '*'
                        temp = temp.GetChildren()[0]
            return str(primitiveType) + str(isArray)

    def CompileArgument(self, arg):
        if arg is None:
            return ''
        else:
            out = ''

            # get argument type
            children = arg.GetChildren()

            for child in children:
                if child._cls == 'Type':
                    out += (self.CompileType(child.GetChildren()))

            out += (' '+str(arg.GetName()))
            return out



# compiler = CPPCompiler(IDLParser(IDLLexer()))
# print(compiler.CompileText('interface NaClAMTest {float sumFloatArray(float[] floats, long length);void subFloatArrays(float[] src1_dst, float[] src2, long length);};'))


def main(argv):
    compiler = CPPCompiler(IDLParser(IDLLexer()))
    for filename in argv:
        print(compiler.CompileFile(filename))

    return 0

if __name__ == '__main__':
  sys.exit(main(sys.argv[1:]))