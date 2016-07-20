class: center, middle, inverse

# Deploying service broker
# github-service-broker-ruby


---
## Repo Contents

`https://github.com/cloudfoundry-samples/github-service-broker-ruby`

* two applications
  - Service broker
  - Example app

---
# github-service-broker-ruby


Function | Resulting action |
-------- | :--------------- |
catalog | Advertises the GitHub repo services and the plans offered.
create | Creates a public repository inside the account. This repository can be thought of as a service instance.
bind | Generates a GitHub deploy key which gives write access to the repository, and makes the key and repository URL available to the application bound to the service instance.
unbind | Destroys the deploy key bound to the service instance.
delete | Deletes the service instance (repository).

