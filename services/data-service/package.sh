#!/usr/bin/env bash

PKG_VERSION=$(node -p "require('./package.json').version")
PKG_NAME=$(node -p "require('./package.json').name")


if [[ -d build ]] ; then
    echo "Build folder exists. Removing it"
    rm -r build
fi

mkdir "build"

cp ecosystem.config.json app/
cp .env.example app/

BUNDLE_NAME="$PKG_NAME-$PKG_VERSION.zip"
cd app/  || return
bestzip "$BUNDLE_NAME" ./* .env.example
mv "$BUNDLE_NAME" ../build/

cd ../../

echo "Done!"
