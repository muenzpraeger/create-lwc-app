#!/bin/bash

# Set local registry
npm set registry http://localhost:4873

# Publish all packages
cd packages
cd create-lwc-app
rm -f tsconfig.tsbuildinfo
tsc -b
npm publish --registry=http://localhost:4873 --tag beta
cd ../lwc-services
yarn build
npm publish --registry=http://localhost:4873 --tag beta
