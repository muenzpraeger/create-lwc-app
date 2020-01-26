#!/bin/bash

# Set local registry
npm set registry http://localhost:4873

# Publish all packages
cd packages
cd create-lwc-app
npm publish --registry=http://localhost:4873 --tag beta
cd ../@muenzpraeger/lwc-services
npm publish --registry=http://localhost:4873 --tag beta
cd ../lwc-services-core
npm publish --registry=http://localhost:4873 --tag beta
cd ../lwc-services-express
npm publish --registry=http://localhost:4873 --tag beta
cd ../lwc-services-jest
npm publish --registry=http://localhost:4873 --tag beta
cd ../lwc-services-parcel
npm publish --registry=http://localhost:4873 --tag beta
cd ../lwc-services-rollup
npm publish --registry=http://localhost:4873 --tag beta
cd ../lwc-services-webpack
npm publish --registry=http://localhost:4873 --tag beta
