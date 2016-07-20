class: center, middle, inverse

# Bosh
# Manifest

---
# Contents of a BOSH deployment manifest:

* [Deployment Identification](#deployment): Deployment name + director UUID


Example:

```yaml
name: elasticsearch

director_uuid: cf8dc1fc-9c42-4ffc-96f1-fbad983a6ce6
```
--

* [Releases Block](#releases): Name and version of each release in a deployment

Example:

```yaml
release:
  name: elasticsearch
  version: latest
```
---
# Contents of a BOSH deployment manifest:

* [Networks Block](#networks): Network configuration information

```yaml
networks:
- name: compile
  subnets:
  - range: 10.244.4.248/30
    reserved: [ '10.244.4.249 - 10.244.4.249' ]
    cloud_properties:
      name: random
  - range: 10.244.4.252/30
    reserved: [ '10.244.4.253 - 10.244.4.253' ]
    cloud_properties:
      name: random
- name: default
  subnets:
  - range: 10.244.4.128/30
    reserved: [ '10.244.4.129 - 10.244.4.129' ]
    static:   [ '10.244.4.130 - 10.244.4.130' ]
    cloud_properties:
      name: random
```

---
# Contents of a BOSH deployment manifest:

* [Resource Pools Block](#resource-pools): Properties of VMs that BOSH creates and manages

```yaml
resource_pools:

- name: infrastructure
  network: default
  size: 1
  stemcell:
    name: bosh-warden-boshlite-ubuntu-lucid-go_agent
    version: latest
  cloud_properties:
    cpu: 1
```
---
# Contents of a BOSH deployment manifest:

* [Disk Pools Block](#disk-pools): Properties of disk pools that BOSH creates and manages

Example:

```yaml
# Not from elasticsearch warden deployment
disk_pools:
- name: default
  disk_size: 2
  cloud_properties:
    type: gp2
```

---
# Contents of a BOSH deployment manifest:

* [Compilation Block](#compilation): Properties of compilation VMs

Example:

```yaml
compilation:
  workers: 2
  network: compile
  cloud_properties:
    ram: 2048
    disk: 8096
    cpu: 2
```
---
# Contents of a BOSH deployment manifest:

* [Update Block](#update): Defines how BOSH updates job instances during deployment

Example:

```yaml
update:
  canaries: 1
  canary_watch_time: 1000-30000
  update_watch_time: 30000
  max_in_flight: 1
  max_errors: 1
```

???
**update** [Hash, required]: This specifies instance update properties. These properties control how BOSH updates job instances during the deployment.

* **canaries** [Integer, required]: The number of [canary](./terminology.html#canary) instances.
* **canary\_watch\_time** [Integer or Range, required]: The time to wait for canary instances to declare an updated job healthy or unhealthy.
  * If the `canary_watch_time` is an integer, the BOSH Director sleeps for that many seconds, then checks whether the canary instances are healthy.
  * If the `canary_watch_time` is a range (low-high), the Director:
    * Sleeps for `low` milliseconds
    * Checks whether the canary instances are healthy, sleeps until `high` milliseconds pass if they are not, then checks again
* **update\_watch\_time** [Integer or Range, required]: The time to wait for non-canary instances to declare an updated job healthy or unhealthy.
* **max\_in\_flight** [Integer, required]: The maximum number of non-canary instances to update in parallel.

---
# Contents of a BOSH deployment manifest:

* [Jobs Block](#jobs): Configuration and resource information for jobs

Example:

```yaml
jobs:
- name: elasticsearch
  template: elasticsearch
  persistent_disk: 2048
  instances: 1
  resource_pool: infrastructure
  networks:
  - name: default
    static_ips: &ping_hosts
    - 10.244.4.130
```

---
# Contents of a BOSH deployment manifest:

* [Properties Block](#properties): Describes global properties and generalized configuration information

```yaml
properties:
  elasticsearch:
    cluster: my-awesome-cluster
    ping_hosts: *ping_hosts
```
