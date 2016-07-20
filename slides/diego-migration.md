class: center, middle

---

## Priviledged and Unprivileged Containers

* containers can be privileged and unprivileged

* stager runs inside privileged container

* user can select if his LRP and Tasks run inside privileged or unprivileged container

---

## How diego implements docker container

Diego implements docker container support through [Docker App Lifecycle](5). 

Each App Lifecycle provides a set of binaries that manage a Cloud Foundry-specific application lifecycle.

---
class: middle

The __Builder__ stages a CF application. 

The CC-Bridge runs the Builder as a Task on every staging request. 

The Builder performs static analysis on the application code and does any necessary pre-processing before the application is first run.

---
class: middle

The __Launcher__ runs a CF application. 

The CC-Bridge sets the Launcher as the Action on the CF application's DesiredLRP. 

The Launcher executes the user's start command with the correct system context (working directory, environment variables, etc).

---
class: middle

The __Healthcheck__ performs a status check of running CF application from inside the container. 

The CC-Bridge sets the Healthcheck as the Monitor action on the CF application's DesiredLRP.

[2]: http://www.slideshare.net/jpetazzo/docker-linux-containers-lxc-and-security
[4]: https://github.com/cloudfoundry-incubator/garden-linux/blob/master/network/iptables/iptables.go
[5]: https://github.com/cloudfoundry-incubator/docker_app_lifecycle

---
class: middle, center

# CF installation with coexistent runtimes

---
class: middle

You can migrate all the applications from CF to Diego using [Blue-Green deployment][1] technique in mixed DEA-diego environment

---
## Migration plan

1. Upload diego-release
2. Create diego manifest
3. Deploy diego
4. Push applications
5. Verify applications
6. Stop DEAs

---
## Migration plan #1

Upload diego-release to bosh
```
bosh create release --force
bosh -n upload release
```
---
## Migration plan #2

Create diego manifest with spiff
```
cd ~/workspace/diego-release
./scripts/generate-deployment-manifest bosh-lite ../cf-release \
    ~/deployments/bosh-lite/director.yml > \
    ~/deployments/bosh-lite/diego.yml
bosh deployment ~/deployments/bosh-lite/diego.yml
```

---
## Migration plan #3

Deploy diego cells and coordinator alongside with running DEAs
```
bosh -n deploy
```

---
## Migration plan #4

Push your application
```
cf push my-app --no-start
cf set-env my-app DIEGO_STAGE_BETA true
cf set-env my-app DIEGO_RUN_BETA true
cf start my-app
```

---
## Migration plan #5

Verify all your apps are running correctly on diego

---
## Migration plan #6

Stop all DEAs and move to pure diego setup

[1]: http://docs.pivotal.io/pivotalcf/devguide/deploy-apps/blue-green.html

