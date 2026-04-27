echo "Packaging NextJS application for standalone deployment"

PKG_VERSION=$(node -p "require('./package.json').version")
PKG_NAME=$(node -p "require('./package.json').name")

mkdir -p "build"
mkdir -p "build/app"
mkdir -p "build/bundle"

# Ensure bun is available for the adapter build
if ! command -v bun &>/dev/null; then
    echo "Installing bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

echo "Pruning portal app for building"
turbo prune portal --out-dir apps/portal/build

cp pm2.config.js build/app
cp .env build/apps/portal || echo ".env file not found. Will assume the app will run at the root"

BUNDLE_NAME="$PKG_NAME-$PKG_VERSION.zip"
cd build  || return
pnpm install --no-frozen-lockfile
echo "Building the app"
pnpm build --filter portal

echo "Copying files"
cp apps/portal/next.config.ts app/
cp apps/portal/package.json app/

mkdir -p app/apps/portal
cp -r apps/portal/bun-dist/ app/apps/portal/bun-dist/
cp -r apps/portal/.next/static/ app/apps/portal/.next/static/
cp -r apps/portal/public/ app/apps/portal/public/

echo "Zipping the app"
cd app || return
bestzip "$BUNDLE_NAME" ./*
mv "$BUNDLE_NAME" ../bundle/

cd ../../

echo "Done!"
