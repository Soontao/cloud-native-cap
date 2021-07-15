# cloud-native-cap

> build SAP CAP project with cloud native architecture

## build images

> You can use your own docker registry.

```bash
docker build -t quay.io/cloud-native-public/cloud-native-cap-srv -f cap-srv.Dockerfile .
docker push quay.io/cloud-native-public/cloud-native-cap-srv
docker build -t quay.io/cloud-native-public/cloud-native-cap-db -f cap-db.Dockerfile .
docker push quay.io/cloud-native-public/cloud-native-cap-db
```

## prepare secrets

* create `hdi-container` in SAP BTP CF Runtime
* create secret key & convert them fields to base64, and fill the values to `deployment-config-dev.yml`

## deploy

> Simply use the `kubectl` to deploy the artifacts.

```bash
# create and use namespace
kubectl create ns cloud-native-cap
kubectl config set-context --current --namespace=cloud-native-cap
# deploy to the namespace
kubectl apply -f deployment-config-dev.yml
kubectl apply -f deployment.yml
```

## other topics

* docker image version
* static resources

