---
name: devops-infra
description: 'DevOps and infrastructure-as-code skill for legacy modernization. Optional Phase 4h. Act as a senior DevOps platform engineer. Use when: producing Kubernetes manifests, Helm charts, Terraform/Pulumi cloud infrastructure modules, GitHub Actions / GitLab CI pipelines, Prometheus alerting rules, Grafana dashboards, secret management with HashiCorp Vault or External Secrets Operator, Docker image security, container registry setup, environment configuration.'
argument-hint: 'Project name or path to target architecture and backend development artifacts'
---

# DevOps & Infrastructure-as-Code — SKILL.md

## Role
**Phase 4h — Infrastructure Engineer**

You are a senior DevOps/platform engineer responsible for producing production-grade infrastructure-as-code, CI/CD pipelines, secret management, and monitoring configuration for the modernized system. All IaC is version-controlled, idempotent, and follows least-privilege principles.

---

## Prerequisites (Preflight)
Before starting, verify the following artifacts exist:

| Artifact | Expected Path | Required? |
|---|---|---|
| Target architecture | `ai-driven-development/docs/target_architecture/target_architecture.md` | Always |
| Tech stack selections | `ai-driven-development/docs/tech_stack_selections.md` | Always |
| Backend code | `ai-driven-development/development/backend_development/` | If backend in scope |

**If any required artifact is missing**: Stop. Report which artifact is missing, which phase produces it (Phase 3: `target-architecture`, Phase 2.5: Tech Stack Selection Gate, Phase 4b: `backend-development`), and offer: (a) Run the prerequisite phase now, (b) Provide the artifact path manually.

---

## Output Directory
`ai-driven-development/development/infra/`

```
infra/
├── infra_todo.md                        ← Phase tracker
├── kubernetes/                          ← K8s manifests (if K8s target)
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── hpa.yaml
├── helm/                                ← Helm chart (if Helm preferred over raw manifests)
│   └── {project-name}/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-staging.yaml
│       ├── values-prod.yaml
│       └── templates/
├── terraform/                           ← Terraform modules (if cloud infra)
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── modules/
│       ├── network/
│       ├── database/
│       └── compute/
├── ci-cd/                               ← CI/CD pipeline definitions
│   └── {pipeline}.yml
├── monitoring/                          ← Prometheus + Grafana
│   ├── prometheus-rules.yaml
│   ├── alertmanager.yaml
│   └── grafana-dashboard.json
└── secrets/                             ← Secret management (no actual secrets — templates only)
    ├── vault-policy.hcl
    └── external-secrets.yaml
```

---

## Procedure

### Step 1 — Read Target Architecture & Tech Stack

Read `target_architecture.md` and `tech_stack_selections.md` to extract:
- Deployment target: Kubernetes / ECS / App Service / Fly.io / bare-metal VM
- Cloud provider: AWS / Azure / GCP / self-hosted
- Number of services and their names
- Database type and whether managed (RDS, CloudSQL, Azure Database) or self-hosted
- Message broker (if any): Kafka, RabbitMQ, SQS, etc.
- Observability stack: Prometheus + Grafana / Datadog / CloudWatch / Elastic

Use this information to decide which of Steps 2–6 apply.

---

### Step 2 — Kubernetes Manifests *(skip if not deploying to Kubernetes)*

Produce one manifest file per resource type. All resources go in a dedicated namespace.

#### namespace.yaml
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: {project-name}
  labels:
    app.kubernetes.io/managed-by: helm   # or kubectl
```

#### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {service-name}
  namespace: {project-name}
  labels:
    app: {service-name}
    version: "1.0.0"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: {service-name}
  template:
    metadata:
      labels:
        app: {service-name}
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: {service-name}
          image: {registry}/{project-name}/{service-name}:${IMAGE_TAG}
          imagePullPolicy: Always
          ports:
            - containerPort: 8080
              protocol: TCP
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {service-name}-secrets
                  key: database-url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: {service-name}-secrets
                  key: jwt-secret
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "1000m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 3
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
```

#### hpa.yaml (Horizontal Pod Autoscaler)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {service-name}-hpa
  namespace: {project-name}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {service-name}
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

**Security requirements for all K8s manifests**:
- `runAsNonRoot: true` on every pod spec — mandatory
- `readOnlyRootFilesystem: true` where possible
- `allowPrivilegeEscalation: false` on every container
- `capabilities.drop: ["ALL"]` on every container
- No `hostNetwork: true`, no `privileged: true`
- Resource `requests` and `limits` set on every container (no unbounded pods)
- Liveness and readiness probes on every container

---

### Step 3 — Helm Chart *(use instead of raw manifests for multi-environment deployments)*

Structure the Helm chart to support at minimum `staging` and `prod` value overrides.

#### Chart.yaml
```yaml
apiVersion: v2
name: {project-name}
description: Helm chart for {ProjectName}
type: application
version: 0.1.0
appVersion: "1.0.0"
```

#### values.yaml (defaults)
```yaml
replicaCount: 2
image:
  repository: {registry}/{project-name}/{service-name}
  tag: latest
  pullPolicy: Always
service:
  type: ClusterIP
  port: 80
  targetPort: 8080
ingress:
  enabled: true
  className: nginx
  host: {project-name}.example.com
  tls: true
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 1000m
    memory: 512Mi
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
env:
  LOG_LEVEL: info
  APP_ENV: production
```

#### values-staging.yaml (override)
```yaml
replicaCount: 1
ingress:
  host: {project-name}-staging.example.com
env:
  LOG_LEVEL: debug
  APP_ENV: staging
```

---

### Step 4 — Terraform / Pulumi Modules *(skip if using pre-existing cloud infra)*

Choose **Terraform** (HCL, broad provider support) or **Pulumi** (TypeScript/Python, same provider coverage). Default to Terraform unless the user has specified Pulumi in `tech_stack_selections.md`.

#### main.tf structure
```hcl
terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "{project-name}-tfstate"
    key    = "prod/terraform.tfstate"
    region = "eu-west-1"
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
}
```

#### modules/database/main.tf (example: RDS PostgreSQL)
```hcl
resource "aws_db_instance" "main" {
  identifier           = "${var.project_name}-${var.env}"
  engine               = "postgres"
  engine_version       = "16.2"
  instance_class       = var.db_instance_class
  allocated_storage    = var.allocated_storage
  storage_encrypted    = true                     # mandatory
  deletion_protection  = var.env == "prod"
  skip_final_snapshot  = var.env != "prod"
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password   # sourced from Vault or AWS Secrets Manager — never hard-code

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  multi_az                = var.env == "prod"

  tags = {
    Environment = var.env
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}
```

**Terraform security requirements**:
- State stored in encrypted backend (S3 + KMS, Azure Storage, GCS) — never local state in CI
- `storage_encrypted = true` on all RDS/database resources — mandatory
- No hard-coded credentials in `.tf` files — use variables sourced from Vault or cloud secrets manager
- `deletion_protection = true` on prod databases
- Separate workspaces or state files per environment (`staging`, `prod`)
- `terraform plan` output reviewed in CI before `apply`

---

### Step 5 — CI/CD Pipeline

Choose the CI/CD platform matching the project's hosting (GitHub Actions default unless specified):

#### GitHub Actions (`.github/workflows/ci.yml`)
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up language runtime
        # Java: uses: actions/setup-java@v4 with: java-version: '21'
        # .NET: uses: actions/setup-dotnet@v4 with: dotnet-version: '9.x'
        # Python: uses: actions/setup-python@v5 with: python-version: '3.12'
        # Go: uses: actions/setup-go@v5 with: go-version: '1.23'
      - name: Run tests
        run: # language-specific test command
      - name: Check test coverage
        run: # fail if coverage < 70%

  security-scan:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - name: Dependency vulnerability scan
        # Java: run: mvn org.owasp:dependency-check-maven:check
        # .NET: run: dotnet list package --vulnerable --include-transitive
        # Python: run: pip-audit
        # Go: run: govulncheck ./...
      - name: Secret scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

  build-and-push:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          helm upgrade --install {project-name} ./infra/helm/{project-name} \
            --namespace {project-name} \
            --values ./infra/helm/{project-name}/values-staging.yaml \
            --set image.tag=${{ github.sha }} \
            --wait --timeout 5m
```

**CI/CD security requirements**:
- Secrets injected via CI environment variables or a secrets manager — never hard-coded in pipeline files
- Build artifacts scanned for vulnerabilities before push (dependency check + Trivy image scan)
- Secret scanning (truffleHog or gitleaks) on every push
- Image tagged with `git sha` (not `latest`) so every deployed version is traceable
- Deploy to staging before prod — prod deploy requires manual approval (`environment` protection rule)
- Use `actions/checkout@v4` (pinned, not floating)

---

### Step 6 — Prometheus Alerting Rules + Grafana Dashboard

#### prometheus-rules.yaml
```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: {project-name}-alerts
  namespace: monitoring
  labels:
    prometheus: kube-prometheus
    role: alert-rules
spec:
  groups:
    - name: {project-name}.availability
      interval: 30s
      rules:
        - alert: HighErrorRate
          expr: |
            sum(rate(http_server_requests_seconds_count{status=~"5..",job="{service-name}"}[5m]))
            /
            sum(rate(http_server_requests_seconds_count{job="{service-name}"}[5m])) > 0.01
          for: 2m
          labels:
            severity: critical
          annotations:
            summary: "High error rate on {{ $labels.job }}"
            description: "Error rate is {{ $value | humanizePercentage }} (threshold 1%)"

        - alert: HighLatencyP95
          expr: |
            histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket{job="{service-name}"}[5m])) by (le)) > 2
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "P95 latency > 2s on {{ $labels.job }}"

        - alert: PodCrashLooping
          expr: rate(kube_pod_container_status_restarts_total{namespace="{project-name}"}[15m]) > 0
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "Pod {{ $labels.pod }} is crash-looping"

        - alert: HighMemoryUsage
          expr: |
            container_memory_working_set_bytes{namespace="{project-name}"}
            /
            kube_pod_container_resource_limits{resource="memory",namespace="{project-name}"} > 0.85
          for: 10m
          labels:
            severity: warning
          annotations:
            summary: "Memory usage > 85% on {{ $labels.container }}"
```

#### Grafana Dashboard (`grafana-dashboard.json`)
The dashboard must include the following panels:
1. **Request Rate** (req/s per endpoint) — `sum(rate(http_server_requests_seconds_count[1m])) by (uri)`
2. **Error Rate** (% 5xx) — with red threshold at 1%
3. **P50 / P95 / P99 latency** — histogram_quantile panels
4. **Active DB connections** — pool utilization gauge
5. **JVM / runtime heap** (language-appropriate) — memory gauge
6. **Pod restarts** — counter with alert threshold
7. **Throughput vs capacity** (HPA current vs max replicas)

Export as `grafana-dashboard.json` using Grafana's dashboard export (JSON model).

---

### Step 7 — Secret Management

**Option A: HashiCorp Vault** (self-hosted or HCP Vault)
```hcl
# vault-policy.hcl
path "secret/data/{project-name}/*" {
  capabilities = ["read"]
}
path "secret/metadata/{project-name}/*" {
  capabilities = ["list"]
}
```

Kubernetes auth:
```yaml
# vault-auth.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {service-name}
  namespace: {project-name}
  annotations:
    vault.hashicorp.com/agent-inject: "true"
    vault.hashicorp.com/role: "{service-name}"
    vault.hashicorp.com/agent-inject-secret-db: "secret/data/{project-name}/database"
```

**Option B: External Secrets Operator** (cloud-native — AWS SSM / Secrets Manager / GCP Secret Manager / Azure Key Vault)
```yaml
# external-secrets.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: {service-name}-secrets
  namespace: {project-name}
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: {service-name}-secrets
    creationPolicy: Owner
  data:
    - secretKey: database-url
      remoteRef:
        key: /{project-name}/prod/database-url
    - secretKey: jwt-secret
      remoteRef:
        key: /{project-name}/prod/jwt-secret
```

**Secret management requirements**:
- No secrets in Git — ever. `git-secrets` or `truffleHog` pre-commit hooks enforced
- Secrets rotated at least every 90 days for prod (use Vault dynamic secrets or cloud rotation)
- Least-privilege policy: each service only reads its own secrets namespace
- Audit log enabled on secret access

---

## Definition of Done (DoD)

- [ ] `infra_todo.md` created with all in-scope components listed
- [ ] All K8s/Helm manifests pass `kubectl --dry-run=client` or `helm lint`
- [ ] All pods have `runAsNonRoot`, resource limits, and health probes
- [ ] Terraform plan produces no errors and is reviewed before apply
- [ ] Terraform state stored in encrypted remote backend
- [ ] CI pipeline runs tests + security scan before any build
- [ ] Image tagged with git SHA (not `latest`)
- [ ] Staging deploy automated; prod deploy requires manual approval gate
- [ ] Prometheus alert rules cover: error rate, P95 latency, pod crashes, memory saturation
- [ ] Grafana dashboard has all 7 required panels
- [ ] No secrets hard-coded anywhere — all sourced from Vault or cloud secrets manager

---

## Next Skill
Proceed to [`compare-legacy-to-new`](../compare-legacy-to-new/SKILL.md) (Phase 5) after all Phase 4 development is complete, or coordinate with other Phase 4 sub-agents that may still be in progress.
