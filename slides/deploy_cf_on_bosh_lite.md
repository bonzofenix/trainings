class: center, middle, inverse

# Deploying CF
# On Bosh-lite

---
# Cloning Bosh-lite

```
  $ git clone https://github.com/cloudfoundry/bosh-lite
```

---

# Edit deployment Manifest

```yaml
  $ cd ~/workspace/bosh-lite
  $ # add domain under properties `{your.public.ip}.xip.io`.
  $ # for AWS use public IP BOSH_LITE_PUBLIC_IP.xip.io
  $ # Example:
  $ # ...
  $ # properties:
  $ #   domain: IP.xip.io
  $ vim manifests/cf-stub-spiff.yml
```

---

# Uploading CF Release

```
bosh upload release /
https://community-shared-boshreleases.s3.amazonaws.com/boshrelease-cf-203.tgz
```
---

# Manifest generation
## What does spiff do ?

- Helps with bosh manifest generation
- Provides a template solution for bosh manifest
- Works with YAML

---

# Manifest generation: Using the provided script


```
  $ vim make_manifest_spiff # to understand its content
  $ cd ~/workspace/bosh-lite
  $ ./bin/make_manifest_spiff
```

---

# Deploy CF to bosh-lite

```
$ bosh deployment manifests/cf-manifest.yml #Just generated file
$ bosh -n deploy
```

---

# Try your Cloud Foundry deployment


```
cf api --skip-ssl-validation https://api.BOSH_LITE_PUBLIC_IP.xip.io
cf auth admin admin
cf create-org training
cf target -o dev
cf create-space development
cf target -s development
```

Now you are ready to run commands such as `cf push`.

# Deploying vanilla app on CF

```
git clone https://github.com/bonzofenix/vanilla-node
cd vanilla-node
cf push vanilla-node
```
