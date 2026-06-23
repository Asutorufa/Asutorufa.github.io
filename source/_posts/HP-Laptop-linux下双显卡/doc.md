---
title: HP Laptop linux 下intel&amd双显卡
tags:
  - bios
  - computer
categories:
  - linux
language: Zh-Hans
abbrlink: 34615c2d
date: 2020-06-05 15:12:33
updated: 2020-06-05 15:12:33
---

查看`双显卡`切换情况，正常情况下如果没有在用独显应该显示是`DynOff`，但是我这里即使是不开桌面也是`DynPwr`

```bash
[ ~ ] cat /sys/kernel/debug/vgaswitcheroo/switch
0:DIS-Audio: :DynPwr:0000:01:00.1
1:IGD:+:Pwr:0000:00:02.0
2:DIS: :DynPwr:0000:01:00.0
```

查看`dmesg`找到

```log
[    3.495606] [drm] amdgpu kernel modesetting enabled.
[    3.495628] vga_switcheroo: detected switching method \_SB_.PCI0.GFX0.ATPX handle
[    3.495741] ATPX version 1, functions 0x00000033
[    3.495873] ATPX Hybrid Graphics
```

找到了调用的方法，网上搜了一圈都没有使用方法，然后使用`acpi_call`尝试了几个参数，最后找到

```bash
echo "\_SB_.PCI0.GFX0.ATPX 2 0" >  /proc/acpi/call
```

嗯，确实有用，但是实在是太暴力了，直接把整个显卡移除，可以看一下日志<!--more-->

```log
[drm:amdgpu_pci_remove [amdgpu]] *ERROR* Hotplug removal is not supported
[11499.551786] [drm] amdgpu: finishing device.
[11499.554123] CP HQD IQ timer status time out
[11499.554442] CP HQD dequeue request time out
[11503.557688] cp queue preemption time out.
[11503.557729] Creating topology SYSFS entries
[11503.557800] amdgpu: [powerplay]
                    .....
                    .....
                    .....
                failed to send message 84 ret is 65535 
[11503.793030] amdgpu: [powerplay] Failed to force to switch arbf0!
[11503.928787] amdgpu 0000:01:00.0: [drm:amdgpu_ring_test_helper [amdgpu]] *ERROR* ring kiq_2.1.0 test failed (-110)
[11503.928865] [drm:gfx_v8_0_hw_fini [amdgpu]] *ERROR* KCQ disable failed
[11504.164622] cp is busy, skip halt cp
[11504.282335] rlc is busy, skip halt rlc
[11504.421048] ------------[ cut here ]------------
[11504.421115] WARNING: CPU: 3 PID: 167022 at drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c:3170 amdgpu_vm_manager_fini+0x1e/0x50 [amdgpu]
[11504.421115] Modules linked in: acpi_call(OE) ccm rfcomm cmac algif_hash algif_skcipher af_alg bnep btusb btrtl btbcm btintel bluetooth snd_hda_codec_realtek snd_hda_codec_generic ledtrig_audio hid_generic usbhid hid ecdh_generic ecc mousedev amdgpu uvcvideo videobuf2_vmalloc videobuf2_memops videobuf2_v4l2 videobuf2_common x86_pkg_temp_thermal intel_powerclamp coretemp videodev kvm_intel mc kvm nls_iso8859_1 nls_cp437 vfat fat i915 iwlmvm fuse irqbypass mac80211 crct10dif_pclmul gpu_sched crc32_pclmul snd_hda_codec_hdmi libarc4 ghash_clmulni_intel snd_hda_intel ttm hp_wmi snd_intel_dspcfg i2c_algo_bit snd_hda_codec mei_hdcp intel_rapl_msr wmi_bmof sparse_keymap iTCO_wdt iTCO_vendor_support aesni_intel crypto_simd joydev iwlwifi cryptd snd_hda_core glue_helper snd_hwdep intel_cstate snd_pcm drm_kms_helper intel_uncore intel_rapl_perf snd_timer cfg80211 input_leds psmouse pcspkr snd i2c_i801 cec r8169 rc_core intel_gtt realtek syscopyarea sysfillrect processor_thermal_device sysimgblt mei_me
[11504.421137]  libphy intel_rapl_common rfkill int340x_thermal_zone soundcore intel_pch_thermal fb_sys_fops intel_soc_dts_iosf mei wmi battery hp_accel evdev lis3lv02d mac_hid hp_wireless int3400_thermal acpi_thermal_rel ac vboxnetflt(OE) vboxnetadp(OE) drm vboxdrv(OE) crypto_user agpgart ip_tables x_tables ext4 crc32c_generic crc16 mbcache jbd2 rtsx_pci_sdmmc serio_raw mmc_core atkbd libps2 crc32c_intel xhci_pci xhci_hcd rtsx_pci i8042 serio
[11504.421149] CPU: 3 PID: 167022 Comm: kworker/u8:0 Tainted: G        W  OE     5.6.15-arch1-1 #1
[11504.421150] Hardware name: HP OMEN by HP Laptop/82EA, BIOS F.53 12/12/2019
[11504.421153] Workqueue: kacpi_hotplug acpi_hotplug_work_fn
[11504.421221] RIP: 0010:amdgpu_vm_manager_fini+0x1e/0x50 [amdgpu]
[11504.421222] Code: c7 83 a0 4e 00 00 00 00 00 00 eb 87 0f 1f 44 00 00 55 48 89 fd 48 81 c7 a8 4e 00 00 48 83 ec 08 48 83 bd b0 4e 00 00 00 74 14 <0f> 0b e8 4b 3d a3 d5 48 89 ef 48 83 c4 08 5d e9 ce 96 00 00 31 f6
[11504.421223] RSP: 0018:ffffb45703ae3c90 EFLAGS: 00010286
[11504.421225] RAX: 0000000000000000 RBX: ffff8c0f0cdc0000 RCX: 0000000000000000
[11504.421225] RDX: ffff8c0f1c718000 RSI: ffff8c0f0cb53000 RDI: ffff8c0f0cdc4ea8
[11504.421226] RBP: ffff8c0f0cdc0000 R08: 0000000000000040 R09: 0000000000000000
[11504.421227] R10: 0000000000000000 R11: ffff8c0f08056438 R12: 0000000000000001
[11504.421228] R13: ffff8c0f0cdd5020 R14: ffff8c0f1c0de800 R15: ffff8c0f1c09f740
[11504.421229] FS:  0000000000000000(0000) GS:ffff8c0f1ed80000(0000) knlGS:0000000000000000
[11504.421230] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
[11504.421230] CR2: 00007f5a4f135fd8 CR3: 00000001a020a001 CR4: 00000000003606e0
[11504.421231] Call Trace:
[11504.421300]  gmc_v8_0_sw_fini+0x16/0x60 [amdgpu]
[11504.421386]  amdgpu_device_fini+0x255/0x46f [amdgpu]
[11504.421446]  amdgpu_driver_unload_kms+0x47/0x90 [amdgpu]
[11504.421463]  drm_dev_unregister+0x4b/0xb0 [drm]
[11504.421521]  amdgpu_pci_remove+0x2e/0x50 [amdgpu]
[11504.421525]  pci_device_remove+0x3b/0xa0
[11504.421528]  __device_release_driver+0x15c/0x210
[11504.421529]  device_release_driver+0x24/0x30
[11504.421532]  pci_stop_bus_device+0x68/0x90
[11504.421534]  pci_stop_and_remove_bus_device+0xe/0x20
[11504.421536]  disable_slot+0x49/0x90
[11504.421538]  acpiphp_check_bridge.part.0+0xba/0x140
[11504.421540]  acpiphp_hotplug_notify+0x170/0x280
[11504.421541]  ? acpiphp_post_dock_fixup+0xe0/0xe0
[11504.421544]  acpi_device_hotplug+0x9e/0x410
[11504.421547]  acpi_hotplug_work_fn+0x3d/0x50
[11504.421549]  process_one_work+0x1da/0x3d0
[11504.421551]  worker_thread+0x4d/0x3e0
[11504.421553]  ? rescuer_thread+0x3f0/0x3f0
[11504.421555]  kthread+0x117/0x130
[11504.421556]  ? __kthread_bind_mask+0x60/0x60
[11504.421559]  ret_from_fork+0x35/0x40
[11504.421562] ---[ end trace 9fc85d768333e4aa ]---
[11504.434382] Move buffer fallback to memcpy unavailable
[11504.434384] [TTM] Buffer eviction failed
[11504.434384] [TTM] Cleanup eviction failed
[11504.434402] [TTM] Finalizing pool allocator
[11504.434881] [TTM] Finalizing DMA pool allocator
[11504.434971] [TTM] Zone  kernel: Used memory at exit: 4312 KiB
[11504.434974] [TTM] Zone   dma32: Used memory at exit: 0 KiB
[11504.434976] [drm] amdgpu: ttm finalized
[11504.434989] vga_switcheroo: disabled
[11504.435496] i915 0000:00:02.0: vgaarb: changed VGA decodes: olddecodes=none,decodes=io+mem:owns=io+mem
```

所以买笔记本一定要买有`linux`认证的电脑，即使不是也尽量不要买双显卡了，我买的这个显卡基本闲置，我也不喜欢打游戏，反而耗电。
