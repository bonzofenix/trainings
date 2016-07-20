class: center, middle, inverse

# Diego

---

# Agenda

- Current elastic runtime limitations
- Components
- Runtime strategy comparison
- Security concerns on Diego with docker
- CF installation with coexistent runtimes
- Transition and migration of apps from DEAs to Diego

---
class: center, middle, inverse

# Current CF runtime limitations

---
background-image: url(images/cf_components.png)

---
# Current elastic runtime limitations


--

* Tight coupling and poor separation of concerns

--

  - Too much responsability on CC

  - DEA and CC orchestration is not always reallistic

--

* Triangular Dependency

--

  - Health Manager + CC + DEAs

  - This components hold an implicit relationship.

  - This makes it difficult to try and add new features.

--

* App Domain Specific

--

  - Current apprach only support Apps

???

what about cron jobs, errands

--

* Hard to add new features, hard to mantain

--

* Plataform specific

  - DEAs tight to linux

???
originally LXC , now subset of the functionality that LXC offers

---

## Why Go?

### Ruby crashes with long-lived processes
### Tons of concurrency and low-level interactions

---

background-image: url(images/diego-overview.png)

---

# CC Bridge

- Interface with the Receptor
- App-specific messages from CC turn into:
  * Tasks
  * LRPs

---
# Doppler

- Aggregates and streams logs to developers

---

# Stager

- receives staging requests from CC
- Staging request >> Task
- Sends task request to the Receptor

---

# Nsync

- Listen for the desiredApp requests
- Talks to the receptor
- Updates or creates the DesiredLRT
- Periodically checks whats CC desire state

---
# TPS (the process status reporter)

- Provides the CC with info of LRPs

Example:

```
$ cf apps
```

---

# File-Server

Mediates CC expected Multipart-form upload
- Lets executor keep POST for sending blobs
- Lets CC receive blobs though http

Serves static assets from Diego domain
- App Lifecycle binaries

---
class: center, middle, inverse
# Components on the Cell

---
# Receptor 

## REST API

Lets consumers:

- Request Task
- Request LRPs

Fetch information about:

- Current running tasks
- Current LRP instances

---

# Rep

Represents a Cell
* Mediates communication with the BBS (runtime schema-common orchestration tool) by:
  - Ensuring Tasks and ActualLRPs in the runtime schema are in sync with containers on that cell
  - Mantaining the precence of the cell in the runtime schema

* Participate in the auction
* Ask the executor to create the container and run the task or the LRPs

---

# Executor

- HTTP API to create container with their generic action receipt, also deletes containers
- No concept of task or LRPs
- Implements a generic execution action
- Streams stdout and Stderr to metron-agent

---

# Garden

- plataform independent server/client to manage garden containers.
- Defines interface to implement container runners


???
if cells fails the converger will move the missing instances to other cells


---
class: center, middle
# Runtime strategy comparison

---
# Logging

## DEA

* Doppler
* Traffic Controller
* Metron Agent

## Diego

* Doppler
* Traffic Controller
* Metron Agent

---

# Routing

## DEA

* gorouter

## Diego

* gorouter
* route-emitter

---

# Testing

## DEA

* Smoke
* CATs

## Diego

* inigo
* DATs

---

# Container Technology

## DEA

* Warden

## Diego

* Garden
  - Garden linux
  - Garden Docker

---

# Container Management

## DEA

* DEA
* Cloud Controller
* Health Manager

## Diego

* Cell: receptor, rep, executor
* Brain: auctioneer, converger
* Cloud Controller
* CC-Bridge

---

# User Management

## DEA

* UAA

## Diego

* UAA
* login

---
class: center, middle

# Security concerns on Diego with docker

---

## Security concerns for pure docker

---
class: middle

Applications in containers can always do syscalls, so if syscall is buggy (vmsplice, for example) and lets you execute arbitrary code, you can control entire host.

---
class: middle

Sebastian Krahmer [showed][3] how to copy files from underlying file system and send to third-parties

[3]: http://stealth.openwall.net/xSports/shocker.c

---
class: middle

Normal app may escalate from non-root to root using SUID binary

---
class: middle

Application may leak to the other container using the same UID

---
class: middle

A lot of Docker images are shared without signing, 
so admin may run malicious container

---
class: middle, center

[Is it safe to run applications in Linux Containers?][2]

---

## How Security Groups work in Diego vs DEA

garden-linux enforces security group complaince through [iptables][4] filter

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


???

# Diego release
- Metron agen
- Garden
  - Garden-linux
- Executor
- Receptor
- Rep
- etcd
- metrics-server
- converger
- auctionner







nats sourvives, gnats, doppler metris loggregator traffic controller,

Cloud Controller, Cloudfountroller bridge

cc bridge
Stager, generate doppler by default, if you indicate to use docker, If 

Garden is warden replacement
only an interface that has 2 backends
 linux garden
 dropplet, garden-linux
 rootfs, go instead of warden
 nsync 
 ask cloud controller the desire state
 indicate when it has to run an app
 tps 
 Does the retriving of stats to cc
 of real ps that are executing
 file-server
 http blobstore, 
 server in go lang

 CC does not know about tasks and lrp

 eg in tasks , errand,

 LRPs - app

 Brain
 Metric server, 
 converger y actioner
 keep things running according how it should be, 
 they also do load balancing and  sums metrics.
 3 components talk though etc,
 they do dynamic load balancing
 cell expose an api though recepton

 BBS
 storage adapter
 the sndar they use to strore and retrieve info of etcd


 \


 cell expose api though receptor

 Receptor
 expone la api to other components that are not diego cells
 log 
 router
 cloud controller

 Rep
  -recepts internal petitions though auctioners and checks with the bbs
  depending on this petition it send orders to the executor
  intermediate between the petitions and wh actually does the work

  auction
  direct petition
  though bbs it responds if the action 
  it checks if rep 
  converged 
  check the orders from that arrive from receptors
  or what rep return (because for example executor could not handle it)

  Garden 
  garden docker

  metron agent makes push of logs to doppler

  route-emitter
  the only thing that is does is a query to the api, it checks the LRPs runnings and introduce the routes for the LRPs
  check apps activas and all its routes
  Diego has routes in etcd


  indigo

