#!/bin/bash
set -e

echo "Removing existing"
rm -rf Bullet

echo "Generating RPC Library..."
node ../../generator/generator-cli.js --package=Bullet Bullet.idl

echo "Removing generated Makefile"
rm -f Bullet/Makefile

echo "Linking implementation"
ln -s $(pwd)/BulletImplementation/* $(pwd)/Bullet/

echo "Making..."
cd Bullet && make