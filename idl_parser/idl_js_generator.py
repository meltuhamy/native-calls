#!/usr/bin/env python
import sys

from idl_lexer import IDLLexer
from idl_parser import IDLParser
from idl_generator import Generator


class JSGenerator(Generator):
    def CompileNode(self, node):
        if node.IsA('File'):
            out = ''
            for child in node.GetChildren():
                out += self.CompileNode(child)
            return out
        elif node.IsA('Interface'):
            out = '/* Interface: {0} */\n\n'.format(str(node.GetName()))
            for child in node.GetChildren():
                out += self.CompileNode(child)
            return out
        elif node.IsA('Operation'):
            return self.CompileOperation(node)

    def CompileOperation(self, node):
        out = ''
        children = node.GetChildren()
        # get type and arguments
        type = None
        arguments = None
        for child in children:
            if child.IsA('Type'):
                type = child.GetChildren()
            elif child.IsA('Arguments'):
                arguments = child.GetChildren()

        paramsString = ''
        paramsTypesString = ''
        if arguments is not None:
            for (i, arg) in enumerate(arguments):
                paramsString += (', ' if i > 0 else '') + arg.GetName()
                paramsTypesString += (', ' if i > 0 else '') + arg.GetName() + ':' + self.getArgumentType(arg)

        out += ("/* Returns: {returntype} */\n"
                "function {fname}({params}) {{\n"
                "  /* TODO Check these argument types:\n"
                "   * {paramtypes}\n"
                "   */\n"
                "}}\n\n").format(returntype=self.CompileType(type),fname=str(node.GetName()), params=paramsString, paramtypes=paramsTypesString)

        return out

    def CompileType(self, type):
        if type is None:
            return 'void '
        else:

            primitiveType = 'void'
            isArray = ''
            for child in type:
                if child.IsA('PrimitiveType'):
                    primitiveType = child.GetName()
                if child.IsA('Array'):
                    isArray = '[]'
                    temp = child
                    while len(temp.GetChildren()) > 0:
                        isArray += '[]'
                        temp = temp.GetChildren()[0]
            return str(primitiveType) + str(isArray) + ' '

    def getArgumentType(self, arg):
        if arg is None:
            return ''
        else:
            out = ''

            # get argument type
            children = arg.GetChildren()

            for child in children:
                if child.IsA('Type'):
                    out += (self.CompileType(child.GetChildren()))
            return out


def main(argv):
    compiler = JSGenerator(IDLParser(IDLLexer()))
    for filename in argv:
        print(compiler.CompileFile(filename))

    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))