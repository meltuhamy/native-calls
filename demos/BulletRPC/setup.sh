#!/bin/bash
set -e

TARGETNAME=Bullet
IDLFILES=Bullet.idl

echo "Removing existing"
rm -rf $TARGETNAME

echo "Generating RPC Library..."
../../generator/pprpcgen.js --package=$TARGETNAME $IDLFILES

echo "Removing generated Makefile"
rm -f $TARGETNAME/Makefile

echo "Linking implementation"
ln -s $(pwd)/src/* $(pwd)/$TARGETNAME/

echo "Making..."
make -C $TARGETNAME

echo "Making NaClAMBase version..."
make -C BulletNaClAM