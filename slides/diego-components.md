class: center, middle, inverse

# Diego: Components 

---

# Agenda

- BBS Components
- Cloud Foundry integration components:
  * CC-Bridge
  * Route-emitter
- Brain

---
class: center, middle, inverse

# Diego: BBS (Bulletin Board system/store)

- Works as a shared goland schema for diego runtime
- All comunications go through this store system
- It makes use of etcd for storage
- It works as a DB for Diego

---
class: center, middle, inverse

# Diego: Cells

- Cells are where the tasks and LRPs are run
- They are generally allocated one per VM

---

# Diego: Cell components

- Garden 
- Executor
- Rep
- Receptor
- Metron Agent

---

# Garden

- Plataform independent server/client to manage garden containers.
- Defines interface to implement container runners


???
if cells fails the converger will move the missing instances to other cells

---

# Executor

- HTTP API that lets you:
  * create container 
  * Deletes containers
  * Run actions in them
- No task vs LRPs distinction
- Streams stdout and Stderr to metron-agent

--- 
# Executor
 
Its Primarily responsible for implementing the following actions:
- Run a process in the container
- Fetch an archive (.tgz or .zip) and extracts it into the container
- Uploads a single file, in the container, to a URL via POST
- Runs multiple actions in parallel
- Runs multiple actions in order
- Wraps another action and logs messages when the weapped action begins and ends
- Runs wrapped actions with timeout
- Runs wrapped action ignoring generated errors 

---

# Rep

Represents a Cell
* Mediates communication with the BBS (runtime schema-common orchestration tool) by:
  - Ensuring Tasks and ActualLRPs in the runtime schema are in sync with containers on that cell
  - Maintaining the presence of the cell in the runtime schema

* Participate in the auction by accepting Tasks and LRPs
* Ask the executor to create the container and run the task or the LRPs

---

# Receptor

## RESTful HTTP API

Lets consumers:

- Request Task
- Request LRPs

Fetch information about:

- Current running tasks
- Current LRP instances

---

# Metron-agent

- Client side process that collets logs and foward them to loggregator

---

class: center, middle, inverse

# Cloud Foundry integration components

- In charge of making the integration with current Cloud Foundry components possible
- Allows DEA and Diego to share a Cloud Foundry installation
- They transform Apps (Cloud Foundry domain specifics) into Tasks and LRPs

---

# CC Bridge

Itself compose by 4 subcomponents:
- The stager
- Nsync
- TPS
- File-server

---

# CC Bridge components: Stager

- Receives staging requests from the CC to be translate into Diego specific Tasks.
- Interface with the Receptor
- Informs exit status of staging process to CC

---

# CC Bridge components: Nsync

- Transmits desired states of apps into LRPs and sends those to the receptor
- Periodically checks the desired state of apps in CC and makes sure Diego holds the right information

???

- Listen for the desiredApp requests
- Talks to the receptor
- Updates or creates the DesiredLRT
- Periodically checks whats CC desire state

---

# CC Bridge components: TPS

- Provides the CC with info of LRPs

Example:

```
$ cf apps
```

---

# CC Bridge components: File-server

Mediates CC expected Multipart-form upload to maintain compatibility
- Lets executor keep SIMPLE POST for sending blobs
- Lets CC receive blobs though http

Serves static assets from Diego domain
- App Lifecycle binaries

---

# Route-emitter
 
- Monitors difference between the DesiredLRP and the ActualLRP via the Receptor
- Detect changes and it emits regristration/unregistration messages to the router

???

Diego has routes in etcd

---

# Diego: Brain components

- Auctioneer
- Converger
- Metrics-server

---

# Auctioneer

- holds Tasks and LRPs auctions
- Locks BBS such that only one auctioneer may handle auctions

---

# Converger

- Locks BBS such that only one converger may performs convergence
- Looks for differences between the desiredLRPs and the ActualLRPs for fixing them
- if an instance is missing, a start auction is sent.
- if an extra instance is identified, a stop message is sent to the Rep on the Cell hosting the instance

---

# Metrics-server

Read metrics from the BBS and publishes them to doppler






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

