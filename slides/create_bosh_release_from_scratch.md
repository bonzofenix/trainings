class: center, middle, inverse

# Creating BOSH release from scratch
# Elasticsearch

---

# why elasticsearch?

 - It has Simple dependencies (java and elasticsearch)
 - Minimal configuration
 - Cluster capability

---

# whats a release?
- versioned collection of configuration properties, configuration templates, startup scripts, sources, binaries, etc.
- basically anything you might need to build a software in a reproducible way.


---

# Initializing empty release for elasticseach

`$ bosh init release elasticsearch-boshrelease `


```
○ → tree
 .
├── blobs
├── config
│   └── blobs.yml
├── jobs
├── packages
└── src
```


---

# creating job for elasticsearch

whats a job?
- set of processes 
- Rules for deploying and running a process
- Resources that the process need(e.g. configuration files)

---

# creating job for elasticsearch

`$ bosh generate job elasticsearch `

```
  ○ → tree
  .
  ├── blobs
  ├── config
  │   └── blobs.yml
  ├── jobs
  │   └── elasticsearch
  │       ├── monit
  │       ├── spec
  │       └── templates
  ├── packages
  └── src

  8 directories, 4 files
```

---
# creating job for elasticsearch

monit!!! yes the agent it relays on monit.
we will need to program start and stop script.

---
#Updating elasticsearch monit sartup file

what does monit file lets us do?
- Specify the process id(pid) file for the job 
- references each command provided by the template for the job
- Specifies that the job belongs to the `vcap` group

---

#Updating elasticsearch monit sartup file

As you see we reference to a config file that does not exist yet…
so we will need to create it inside templates.

---

# creating elasticseach config file.

`$ vim jobs/elasticsearch/templates/elasticsearch.yml.erb`

```yaml
  ---
  path:
    logs: /var/vcap/sys/log/elasticsearch
    data: /var/vcap/store/elasticsearch
    work: /var/vcap/data/elasticsearch

  node.name: es-node-<%= spec.index %>

  cluster.name: <%= p('elasticsearch.cluster') %>

  discovery.zen.ping:
    multicast.enabled: false
    unicast.hosts:
    <% p('elasticsearch.ping_hosts').each do |host| %>
    - <%= host %>
    <% end %>
```

---

# creating elasticseach job specs

what does the spec file of a job lets you do?
- Reference templates to their final destination in the VM after they get compile
- Transfer other pieces of metadata
- Name of the job
- Reference packages dependencies of the job
- job properties defaults and descriptions

---

# creating elasticseach job specs

`$ vim jobs/elasticsearch/spec`


```
name: elasticsearch
templates:
  elasticsearch_ctl: bin/elasticsearch_ctl
  elasticsearch.yml.erb: config/elasticsearch.yml

packages:
- java
- elasticsearch

properties:
  elasticsearch.cluster:
    description: The name of the cluster
  elasticsearch.ping_hosts:
    description: The hosts used for cluster discovery
    default: []
```

---

# creating missing packages: elasticsearch

Whats a package?
- bosh release component that holds compiling logic
- reference to pre compiled sources.

---

#creating missing packages: elasticsearch

`$ bosh generate package elasticsearch`

```yaml
○ → tree
.
├── blobs
├── config
│   └── blobs.yml
├── creating_this_bosh_release.md
├── jobs
│   └── elasticsearch
│       ├── monit
│       ├── spec
│       └── templates
│           ├── elasticsearch.yml.erb
│           └── elasticsearch_ctl
├── packages
│   └── elasticsearch
│       ├── packaging
│       ├── pre_packaging
│       └── spec
└── src
```

---

#creating missing packages: elasticsearch


`$ vim packages/elasticsearch/packaging`


```
# abort script on any command that exit with a non zero value
set -e

VERSION=1.2.0

tar xvf elasticsearch/elasticsearch-${VERSION}.tar.gz

cp -a elasticsearch-${VERSION}/. $BOSH_INSTALL_TARGET
```

---

#creating missing packages: elasticsearch

`$ vim packages/elasticsearch/spec`


```yaml
---
name: elasticsearch

files:
- elasticsearch/elasticsearch-1.2.0.tar.gz
```


---
# creating missing packages: java 

`$ bosh generate package java`

```yaml
○ → tree
.
├── blobs
├── config
│   └── blobs.yml
├── creating_this_bosh_release.md
├── jobs
│   └── elasticsearch
│       ├── monit
│       ├── spec
│       └── templates
│           ├── elasticsearch.yml.erb
│           └── elasticsearch_ctl
├── packages
│   └── elasticsearch
│       ├── packaging
│       ├── pre_packaging
│       └── spec
│   └── java
│       ├── packaging
│       ├── pre_packaging
│       └── spec
└── src
```

---

# creating missing packages: java 

`$ vim packages/java/packaging`

```
# abort script on any command that exit with a non zero value
set -e

tar -xvf java/jre-7u25-linux-x64.tar.gz

cp -a jre1.7.0_25/. $BOSH_INSTALL_TARGET
```

---

#creating missing packages: java

`$ vim packages/java/spec`

```yaml
---
name: java

files:
- java/jre-7u25-linux-x64.tar.gz
```

---

# Src and blobs folder

Releases depend on binary files such as tar.
this are not recommened to be in the repository with the code.
This is why 
- For dev releases it uses local copies of blobs
- For final it uploads the blobs to a blobstore where bosh will consult directly

---

# Configuring blobstore

there are 1 required config file to use local blobstore for dev:

**final.yml**

```yaml
---
final_name: elasticsearch
blobstore:
  provider: local
  options:
    blobstore_path: /tmp/elasticsearch
```

---

# Deploying release with BOSH

```
$ cd ~/workspace/elasticsearch-boshrelease
$ bosh add blob tmp/elasticseach/elasticsearch-1.2.0.tar.gz
$ bosh add blob tmp/java/jre-7u25-linux-x64.tar.gz
$ bosh create release
$ bosh upload release --rebase
$ bosh deployment elasticsearch.yml 
$ bosh -n deploy
```

---
# SSH into VMs with bosh-lite

```
$ bosh ssh --gateway_identity_file=bosh.pem /
  --gateway_host=AWS_IP --gateway_user=ubuntu --public_key bosh.pem
```

???
 bosh ssh --gateway_identity_file=bosh.pem  --gateway_host=AWS_IP --gateway_user=ubuntu --public_key bosh.pem

NOTES:

At compile time bosh turns templates into files.
this templates name, like source and destiny on the vm where is going to run and other metadata resides in the spec file.

2 packages were mentioned on the spec file.
this are part of our dependencies.


OTHER NOTES:

When your release is deployed bosh places compiled code in /var/vcap/

jobs, packages, src and blogs are all set respectively in /var/vcap/jobs, /var/vcap/packages, /var/vcap/src and /var/vcap/blobs

2 type of dependencies 
runtime dependency(e.g. elasticsearch depends on java)
compile dependencies(eg ruby depends on YAML library)

Dependency rules with bosh:
jobs don’t depend on other jobs 
jobs may depend on packages
packages may depend on other package

use your engineering powers (Reading stuff in google) to see if those packages have any external dependencies
