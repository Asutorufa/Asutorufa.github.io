---
title: TUF GAMING B550M-PLUS WIFI II lm_sensors
categories:
  - linux
abbrlink: fe953398
date: 2022-11-11 10:17:44
updated: 2022-11-11 10:17:44
tags:
language:
---

the sensors not show fan and voltage  
it's a kernel bug now [Hardware monitoring sensor nct6798d doesn't work unless acpi_enforce_resources=lax is enabled](https://bugzilla.kernel.org/show_bug.cgi?id=204807)  
need wait add the motherboard name to linux kernel code list [linux/drivers/hwmon/nct6775-platform.c](https://github.com/torvalds/linux/blob/4bbf3422df78029f03161640dcb1e9d1ed64d1ea/drivers/hwmon/nct6775-platform.c#L1044)  

## temporary measure

add

```md
acpi_enforce_resources=lax
```

to linux boot parameter  

load nct6775 kernel module  

```bash
modprobe -v nct6775
```

run `sensors-detect --auto`.  

finally, you will see nct6798-isa-* in sensors.
