# cloud-native-cap

[![node-test](https://github.com/Soontao/cloud-native-cap/actions/workflows/node-test.yml/badge.svg)](https://github.com/Soontao/cloud-native-cap/actions/workflows/node-test.yml)

> build SAP CAP project with cloud native architecture

- [cloud-native-cap](#cloud-native-cap)
  - [build images](#build-images)
  - [prepare HANA secrets](#prepare-hana-secrets)
  - [deploy](#deploy)
  - [tooltips](#tooltips)
    - [typescript support](#typescript-support)
    - [convert cf credentials to k8s secret](#convert-cf-credentials-to-k8s-secret)
    - [convert cds modeling to xs-security.json (manually adjustment required)](#convert-cds-modeling-to-xs-securityjson-manually-adjustment-required)
    - [add xsuaa authentication/authorization for service](#add-xsuaa-authenticationauthorization-for-service)
    - [built-in jest support](#built-in-jest-support)
  - [other topics](#other-topics)

## build images

> You can use your own docker registry.

```bash
docker build -t quay.io/cloud-native-public/cloud-native-cap-srv:0.0.4 -f cap-srv.Dockerfile .
docker push quay.io/cloud-native-public/cloud-native-cap-srv:0.0.4
docker build -t quay.io/cloud-native-public/cloud-native-cap-db:0.0.4 -f cap-db.Dockerfile .
docker push quay.io/cloud-native-public/cloud-native-cap-db:0.0.4
```

## prepare HANA secrets

* [configure the HANA instance to accept external connection from BTP Kyma Runtime](https://gist.github.com/Soontao/2d39877071ed0574377fcdb68a1c58df)
* create a `hdi-container` for storage in SAP BTP CF Runtime
* create secret key & convert them fields to base64, and fill the values to `config-hana-dev.yml`

## deploy

> Simply use the `kubectl` to deploy the artifacts.

```bash
# create and use namespace
kubectl create ns cloud-native-cap
kubectl config set-context --current --namespace=cloud-native-cap
# deploy hana config to namespace
kubectl apply -f config-hana-dev.yml
# deploy uaa to namespace
kubectl apply -f config-uaa.yml
# deploy to the namespace
kubectl apply -f deployment.yml
```

## tooltips

### typescript support

fresh [`typescript`](https://cap.cloud.sap/docs/get-started/using-typescript) support from SAP CAP framework 

builtin debug configuration (nodejs) and docker image example

### convert cf credentials to k8s secret

```bash
# login to cf firstly
cf service-key $SERVICE_INSTANCE $SERVICE_KEY_NAME | node scripts/to_secret.js > config-hana-dev.yml 
```

### convert cds modeling to xs-security.json (manually adjustment required)

```bash
cds compile srv --to xsuaa
```

### add xsuaa authentication/authorization for service

> MERGE following part to `package.json`

```json
{
  "cds": {
    "requires": {
      "[production]": {
        "auth": {
          "strategy": "xsuaa"
        },
        "uaa": {
          "kind": "xsuaa"
        }
      }
    }
  }
}
```

### built-in jest support

```bash
$ npm run test

> cloud-native-cap@1.0.0 test
> jest --runInBand

 PASS  test/example.test.ts
  Example Service Test Suite
    ✓ should support basic CRUD (140 ms)
```


## other topics

* static resources
* k8s Job network access failed (for HANA)
