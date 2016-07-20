class: center, middle, inverse

# Bosh
# Purpose

---
class: center, middle, inverse
# What would we cover?

--
## * Whats is bosh

???
Responsabilities, what it can do

--
## * Architectural goals

???
Under which principles it was built

--
## * Why it was built

???
Which were the resasons and why not a bit of history of why it was build

--
## * When is it used

???
common use cases of bosh

---
# What is bosh?

- An open source tool for large-scale distributed systems

Takes care of:
- Release engineering
- Deployments
- Lifecycle management

???
RE: versioning, dev vs final, orchestration, Snapshot of whats actually happening in your IaaS

---

#Bosh principles

Designed using modern release engineering principles:
- IDENTIFIABILITY
- REPRODUCIBILITY
- CONSISTENCY
- AGILITY

---
# PRINCIPLES: Identifiability

Being able to determine all sources, tools, environment and other components that make a particular release.

???
by holding sources and having the same process for creating a release. Struture of a bosh release, tools it uses to process it and create a release.


---
# PRINCIPLES: Reproducibility

Guarantee operation stability by integrating third party components, sources, data, and deployment externals of your system.

???
Olds source and compilation process in release to be able to be Plataform and infrastructure agnostic.


---
# GOALS: Consistency

Providing consistent framework for develpment, deployment, audit, and accountability for software components

???
managing lifecycle, preserving andmanaging lifecycle, preserving and accounting the state of its deployment

---
# GOALS: Agility

Ongoing Research into what are the repercussions of modern software engineering practices on the productivity in the software cycle.

???
helps with environment stability, was develop by pivotal.

---
# Why create tool?

We already have:
- Ansible
- Chef
- Juju
- Docker
- Puppet
- Vagrant
- Packer

---
# Why create tool?

- Other tools are not necessarily well integrated
- They can solve individual parts:
  * versioning, packaging, deploying software reproducibly.
  

---

# When do we use BOSH?

- We want to avoid coupling with IaaS
- We are working with a distributed system
- We want lifecycle management
- We want to manage and test deployments upgrades/rollbacks on different environments

