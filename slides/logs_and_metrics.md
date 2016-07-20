class: center, middle, inverse

# Logs and Metrics

---

# Agenda

- Logging system architecture

- Using logging and metrics system

- Integrating with 3rd-party products 

---

# Logging System Architecture

- Components and Their Functions

- High Availability

- Security

---

# Components and Their Functions

* __Sources__ are logging agents that run on the CF components

* __Metron__ collects logs and forward them to doppler

???

__NOTES__

Metron
- Rebranded from loggregator to ‘doppler’
- Its functionality has been extended to support metrics data as well as application logs. 
- Data itself is formated to protocol-buffer

---
# Components and Their Functions

* __Doppler__ gathers logs from the Metron, stores them in temporary buffers, and forward logs to 3rd party syslog drains

* __Traffic Controller__ handles client requests for logs and gathers and collates messages from all Doppler servers

---

background-image: url(./images/logs_and_metrics.png)

# Components and Their Functions

---

# High Availability

* Source emits logs to doppler in the same AZ

* No doppler replication

* Traffic controller connects dopplers in all AZ

---
background-image: url(./images/loggregator_multizone.png)

# High Availability

---

# Security


* Through plain Websocket

```
logging_endpoint: 
"ws://cf.domain.com:80"
```

* Through Websocket secure

```
logging_endpoint: 
"wss://cf.domain.com:4443"
```

???
How transfer logs using HTTPS and TLS?

---
# Using Logging and metrics System

- Deploying via BOSH
- Emitting Messages
- Tailing App Logs
- Get Recent Logs from App
- Consuming Firehose Data

---

# Deploying via BOSH

1. Add `metron_agent` template to all jobs

2. Add loggregator job instance

3. Add traffic controller job instance

4. Configure endpoints security

---

# metron_agent template

```yaml
jobs:
- name: dea_next
  templates:
  - name: dea_next
    release: cf
*  - name: metron_agent
*    release: cf
```

---

# Add loggregator job instance

```yaml
jobs:
- name: loggregator
  templates: 
  - name: doppler
    release: cf
  instances: 1
  # Scale out as neccessary
```
---

# Add traffic controller job instance

```yaml
jobs:
- name: loggregator_trafficcontroller
  templates: 
  - name: loggregator_trafficcontroller
    release: cf
  - name: metron_agent
    release: cf
  instances: 1
```

---

# Configure endpoints

```yaml
properties:
...
  doppler_endpoint:
    shared_secret: secret
  loggregator_endpoint: 
    shared_secret: secret 
  metron_endpoint:
    shared_secret: secret
```

---
# Emitting Messages

[Dropsonde is Go library to collect and emit metric and logging data from CF components](https://github.com/cloudfoundry/dropsonde/)

---

# Application Logs

```
logs.SendAppLog
logs.ScanLogStream
```

# Application Errors

```
logs.SendAppErrorLog
logs.ScanErrorLogStream
```

---

# Metrics

```
metrics.SendValue(
  name, 
  value, 
  unit
)

metrics.IncrementCounter(name)
```

---

# Log Format

CF components emit and transmit logs in [Protocol Buffer][12] format

[cloudfoundry/dropsonde-protocol][13]

[12]: https://developers.google.com/protocol-buffers/
[13]: https://github.com/cloudfoundry/dropsonde-protocol

---
class: middle, center

# All logs are events!!!

???
__NOTES__
Metrics, log messages and heartbeats are incapsulated in the event package, so all of them should be treated like events.

---

# Tailing App Logs

```
cf logs app

2015-02-26T11:53:13.18+0000 \

[STG] \ origin code

OUT \ channel [OUT/ERR]

-----> Uploading droplet (45M)
```
---

# Origin Codes

- **API** - Cloud Controller

- **STG** - DEA stager

- **DEA** - DEA

- **RTR** - Router

- **LOG** - Doppler

- **APP** - Application itself

---

# Initiating connection

1. Request API for app ID

2. Create WebSocket (WS) to traffic controller
```
GET /tail/app=APP_ID
```

3. Traffic controller creates WS with each doppler

---

# Tailing logs

1. __Source__ component sends message to __metron__, listening on 127.0.0.1:3457

2. __metron__ aggregates multiple messages and sends them to random __doppler__

3. __doppler__ sends message to opened WS with __traffic controller__

4. __traffic controller__ sends message to __cf cli__

---

# Get Recent Logs from App

```
cf logs --recent app
```

---

# Get Recent Logs from App

1. Request API for app ID

2. Request traffic controller for app logs
```
GET /recent/app=APP_ID
```

3. Traffic controller collects logs from doppler and sends them to client

---
class: middle

# Number of log messages to retain per application

```
doppler.maxRetainedLogMessages
```

Default is 100

---
class: middle, center

# Consuming Firehose Data

---
class: middle

#[NOAA is a client library to consume metric and log messages from Doppler](https://github.com/cloudfoundry/noaa)

---

class: middle

# Consuming Firehose Data

- you must be admin user with `doppler.firehose` scope

```
connection := noaa.NewConsumer(
  DopplerAddress, 
  &tls.Config{
    InsecureSkipVerify: true
  },
  nil
)
```

???
DopplerAddress - address of the traffic controller

InsecureSkipVerify: true - skip SSL certificate verification

nil - we don't need proxy
---
class: middle


# Creating connection
```
go connection.Firehose(
  firehoseSubscriptionId, 
  authToken, 
  msgChan, 
  errorChan, 
  nil
)
```

???
firehoseSubscriptionId - all clients with the same subscription id recieve equal shares of entire streem; pool of such clients recieves full stream

authToken - OAuth Token from UAA

msgChan - here you will get messages

errorChan - here you will get errors

---
class: middle

# Reading from connection

```
for msg := range msgChan {
    fmt.Printf("%v \n", msg)
```

---

# Integration with 3rd-party products

- Logstash 
- Splunk 

Logs are in [RFC 5424](http://tools.ietf.org/html/rfc5424) format

---

# Logstash config

Differences from default parser

* `syslog5424_app` can contain `-`

* `syslog5424_proc` can contain `\`

---

# Bind Logstash Service to App

```
cf cups logstash-drain -l syslog://[logserver]:5000

cf bind-service [app-name] logstash-drain

cf restart [app-name]
```

---

# Relaying components logs to Logstash

```yaml
syslog_daemon_config:
  address: [http://logstash]
  port: 10514
  transport: tcp
```
---
# Splunk 

1. Create a Cloud Foundry Syslog Drain for Splunk

2. Prepare Splunk for Cloud Foundry

3. Verify that Integration was Successful

---
# Create a Cloud Foundry Syslog Drain for Splunk

- Create a syslog drain user-provided service instance

- Bind each app to the service instance 

- Restart the app

---
# Prepare Splunk for Cloud Foundry

  - Install [RFC 5424 Syslog Technical Add-On](http://apps.splunk.com/app/978/)

  - Patch the RFC5424 Syslog Technology Add-On

  - Create a TCP Syslog Data Input

---
# Verify that Integration was Successful

Execute Splunk query

```
sourcetype=rfc5424_syslog \
index=<the_index_you_created>
```

You should see the logs
---

class: center, middle
# Questions?

???

http://www.cloudcredo.com/cloud-foundry-firehose-and-friends/

SOURCES

[New tuning parameters for syslog_drain_binding / Cloud Controller polling][1]

[Loggregator logging issues in v198 / v199][2]

[Loggregator Docs][3]

[CF Logging and Metrics Tracker][4]

[Relay CF components logs to graylog][7]

[Firehose announcement][8]

[Aggregating Cloud Foundry component logs][9]

[Pivotal Logging Podcast #12][10]

[Go library to collect and emit metric and logging data from CF components][11]

[NOAA is a client library to consume metric and log messages from Doppler][12]

[Cloud Foundry and Logstash][13]

[Integrating Cloud Foundry with Splunk][14]

[1]: https://groups.google.com/a/cloudfoundry.org/forum/#!msg/vcap-dev/b5lwI7Jp-Cg/dhWjD-MmizIJ
[2]: https://groups.google.com/a/cloudfoundry.org/d/msg/vcap-dev/2QpANmzDthc/tPeXBP76RLUJ
[3]: https://github.com/cloudfoundry/loggregator
[4]: https://www.pivotaltracker.com/n/projects/993188
[5]: https://github.com/cloudfoundry/loggregator/wiki/Firehose-Metric-Catalog
[6]: http://www.cloudcredo.com/cloud-foundry-firehose-and-friends/
[7]: https://groups.google.com/a/cloudfoundry.org/d/msg/vcap-dev/XmAaPHhXsus/UXYn5n23h4MJ
[8]: https://groups.google.com/a/cloudfoundry.org/d/msg/vcap-dev/FE_w5xDG-dg/EPoUMY_B3JkJ
[9]: https://www.youtube.com/watch?v=WCvxSBigmog
[10]: http://pivotal.io/podcasts
[11]: https://github.com/cloudfoundry/dropsonde/
[12]: https://github.com/cloudfoundry/noaa
[13]: http://scottfrederick.cfapps.io/blog/2014/02/20/cloud-foundry-and-logstash
[14]: http://docs.pivotal.io/pivotalcf/devguide/services/integrate-splunk.html
