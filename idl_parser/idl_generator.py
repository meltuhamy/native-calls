#!/usr/bin/env python

class Generator:
    def __init__(self, parser):
        self.parser = parser

    def CompileText(self, text):
        return self.flatten(self.CompileNode(self.parser.ParseText('', text)))

    def CompileFile(self, filename):
        return self.flatten(self.CompileNode(self.parser.ParseFile(filename)))

    def flatten(self, tokenList):
        def recursiveStringify(x):
            if type(x) is list:
                return self.flatten(x)
            else:
                return str(x)

        out = ''
        for token in tokenList:
            out += recursiveStringify(token)

        return out

    # Over-ride this in your own generator
    def CompileNode(self, node):
        return node.Tree()
