# cloud-native-cap

> build SAP CAP project with cloud native architecture

## build images

> You can use your own docker registry.

```bash
docker build -t quay.io/cloud-native-public/cloud-native-cap-srv:0.0.2 -f cap-srv.Dockerfile .
docker push quay.io/cloud-native-public/cloud-native-cap-srv:0.0.2
docker build -t quay.io/cloud-native-public/cloud-native-cap-db:0.0.2 -f cap-db.Dockerfile .
docker push quay.io/cloud-native-public/cloud-native-cap-db:0.0.2
```

## prepare secrets

* configure the HANA instance to accept external connection from BTP Kyma Runtime
* create `hdi-container` in SAP BTP CF Runtime
* create secret key & convert them fields to base64, and fill the values to `deployment-config-dev.yml`

## deploy

> Simply use the `kubectl` to deploy the artifacts.

```bash
# create and use namespace
kubectl create ns cloud-native-cap
kubectl config set-context --current --namespace=cloud-native-cap
# deploy config to namespace
kubectl apply -f config-dev.yml
# deploy to the namespace
kubectl apply -f deployment.yml
```

## tools

### convert cf credentials to k8s secret

```bash
# login to cf firstly
cf service-key $SERVICE_INSTANCE $SERVICE_KEY_NAME | node scripts/to_secret.js > config-dev.yml 
```

### convert cds modeling to xs-security.json (manually adjustment required)

```bash
cds compile srv --to xsuaa
```

## other topics

* docker image version
* static resources
