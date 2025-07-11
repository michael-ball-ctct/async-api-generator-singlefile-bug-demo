# async-api-generator-singlefile-bug-demo

A minimal reproduction of the inconsistent behaviour of @asyncapi/generator behaviour with `singleFile` option.

## To run:
```
npm install
npm run start
```

## Test output
```
----- TEST RESULTS -----
singleFileFalseString expected index.html to be under 1MB, received 2.17MB
singleFileFalseBool expected folder length to be 3, received 1
```
Neither configuration of `singleFile: false` or `singleFile: 'false'` work entirely as expected. The API listed in the ReadMe says the value should be a string, but in this config it creates the dependencies externally and a singleFile (which has its dependencies in-document). If the value is a boolean, it does NOT create the external dependencies but does correctly create a much smaller file that relies on those dependencies.
