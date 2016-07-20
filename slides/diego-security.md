
class: center, middle, inverse

# Diego

---


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

