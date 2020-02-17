#!/bin/bash

# Set local registry
npm set registry http://localhost:4873

# Publish all packages
cd packages
cd create-lwc-app
rm -f tsconfig.tsbuildinfo
tsc -b
npm publish --registry=http://localhost:4873 --tag beta
cd ../@muenzpraeger/lwc-services
rm -f tsconfig.tsbuildinfo
tsc -b
npm publish --registry=http://localhost:4873 --tag beta
cd ../lwc-services-express
rm -f tsconfig.tsbuildinfo
tsc -b
npm publish --registry=http://localhost:4873 --tag beta
cd ../lwc-services-jest
rm -f tsconfig.tsbuildinfo
tsc -b
npm publish --registry=http://localhost:4873 --tag beta
cd ../lwc-services-wdio
rm -f tsconfig.tsbuildinfo
tsc -b
npm publish --registry=http://localhost:4873 --tag beta
