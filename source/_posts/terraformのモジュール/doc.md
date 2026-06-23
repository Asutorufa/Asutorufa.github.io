---
title: terraformのモジュール
tags:
  - Kubernetes
  - Terraform
  - container
  - インフラ
categories:
  - Kubernetes
language: ja
abbrlink: 3395bae7
date: 2025-02-27 19:29:27
updated: 2025-02-27 19:29:27
---

**WIP**
---

```md
- +
  + project1 -+
  |           +- main.tf
  |           +- variables.tf
  |           +- pro.tfvars
  |           +- debug.tfvars
  |
  +- modules -+
              +- module1 -+
              |            +- main.tf
              |            +- variables.tf
              |            +- outputs.tf
              |
              +- module2 -+
                           +- main.tf
                           +- variables.tf
                           +- outputs.tf
```

<!--more-->

root-variable.tf

```t
variable "storageClass" {
  type    = string
  default = "nfs-provisioner-sc"
}

variable "imageDockerhubRegistryPrefix" {
  type    = string
  default = "harborpro.secvision.local/dockerhub"
}

variable "imageQuayRegistryPrefix" {
  type    = string
  default = "harborpro.secvision.local/quay"
}

variable "minioReplicas" {
  type    = number
  default = 3
}
```

redis.tf

```t
resource "kubernetes_stateful_set" "redis" {
  metadata {
    name      = "redis"
    namespace = var.namespace

    labels = {
      app = "redis"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "redis"
      }
    }

    template {
      metadata {
        name = "redis"

        labels = {
          app = "redis"
        }
      }

      spec {
        container {
          name  = "redis"
          image = var.image

          port {
            name           = "redis"
            container_port = 6379
          }
        }
      }
    }

    service_name = "redis"
  }
}

resource "kubernetes_service" "redis" {
  metadata {
    name      = "redis"
    namespace = var.namespace
  }

  spec {
    port {
      name        = "redis"
      port        = 6379
      target_port = kubernetes_stateful_set.redis.spec.0.template.0.spec.0.container.0.port.0.container_port
    }

    selector = {
      app = "redis"
    }

    type = "ClusterIP"
  }
}
```

outputs.tf

```t
output "metricsAccessKey" {
  value = var.metricsAccessKey
}

output "metricsSecretKey" {
  value = var.metricsSecretKey
}

output "lokiBucket" {
  value = var.lokiBucket
}

output "tempoBucket" {
  value = var.tempoBucket
}

output "host" {
  value = "minio.metrics.svc.cluster.local:9000"
}
```

main.tf

```t
provider "kubernetes" {
  config_path = "${path.module}/../config.yaml"
}


module "redis" {
  source = "../modules/redis"
}
```

apply

```shell
terraform init
terraform apply --var-file=debug.tfvars 
```

## 再利用ダメ

module1.tf

```t
resource "kubernetes_service" "module1" {
  ...
}
```

modules2.tf

```t
module "module1" {
  source = "../module1"
}
```

modules3.tf

```t
module "module1" {
  source = "../module1"
}
```

root-main.tf

```t
module "module1" {
  source = "../modules/module1"
}

module "module2" {
  source = "../modules/module2"
}

module "module3" {
  source = "../modules/module3"
}
```

```mermaid
graph TD;
  module2 --> module1;
  module3 --> module1;
  root --> module1;
  root --> module2;
  root --> module3;
```
