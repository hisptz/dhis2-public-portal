echo "Packaging NextJS application for standalone deployment"

PKG_VERSION=$(node -p "require('./package.json').version")
PKG_NAME=$(node -p "require('./package.json').name")

if [[ -d build ]] ; then
    echo "Build folder exists. Removing it"
    rm -r build
fi


mkdir "build"
mkdir "build/app"
mkdir "build/bundle"

cp -r .next/standalone/apps/portal/.next build/app
cp .next/standalone/apps/portal/package.json build/app
cp -r .next/standalone/apps/portal/node_modules build/app
cp .next/standalone/apps/portal/server.js build/app
cp  -r .next/static build/app/.next/
cp ../../yarn.lock build/app

BUNDLE_NAME="$PKG_NAME-$PKG_VERSION.zip"
cd build/app  || return
bestzip "$BUNDLE_NAME" ./* .next
mv "$BUNDLE_NAME" ../bundle/

cd ../../

echo "Done!"


