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

