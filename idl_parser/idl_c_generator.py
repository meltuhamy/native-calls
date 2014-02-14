#!/usr/bin/env python
import sys

from idl_lexer import IDLLexer
from idl_parser import IDLParser
from idl_generator import Generator


class CGenerator(Generator):
    def CompileNode(self, node):
        if node.IsA('File'):
            out = ''
            for child in node.GetChildren():
                out += self.CompileNode(child)
            return out
        elif node.IsA('Interface'):
            out = '/* interface: ' + str(node.GetName()) + '*/\n'
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

        # compile return type
        out += self.CompileType(type)

        # compile operation name
        out += str(node.GetName())

        # compile arguments
        out += '('
        if arguments is not None:
            for (i, arg) in enumerate(arguments):
                out += (', ' if i > 0 else '') + self.CompileArgument(arg)

        out += ');\n'

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
                    isArray = '*'
                    temp = child
                    while len(temp.GetChildren()) > 0:
                        isArray += '*'
                        temp = temp.GetChildren()[0]
            return str(primitiveType) + str(isArray) + ' '

    def CompileArgument(self, arg):
        if arg is None:
            return ''
        else:
            out = ''

            # get argument type
            children = arg.GetChildren()

            for child in children:
                if child.IsA('Type'):
                    out += (self.CompileType(child.GetChildren()))

            out += (str(arg.GetName()))
            return out


def main(argv):
    compiler = CGenerator(IDLParser(IDLLexer()))
    for filename in argv:
        print(compiler.CompileFile(filename))

    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))