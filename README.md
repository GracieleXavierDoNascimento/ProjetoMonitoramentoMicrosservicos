# ProjetoMonitoramentoMicrosservicos

Sistema completo para monitoramento e análise de microsserviços, com foco em desempenho, disponibilidade e observabilidade. Inclui coleta de métricas, visualização em tempo real e alertas automáticos para falhas ou degradação de serviços.

## 📋 Visão Geral

Este projeto implementa uma arquitetura completa de monitoramento de microsserviços utilizando tecnologias modernas e práticas recomendadas da indústria:

- **Microsserviços Simulados**: Três serviços Python/Flask com endpoints variados
- **Coleta de Métricas**: Prometheus para scraping e armazenamento de métricas
- **Visualização**: Grafana com dashboards pré-configurados e dashboard web customizado
- **Alertas**: AlertManager integrado com webhook para notificações
- **Containerização**: Docker e Docker Compose para fácil deployment

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Monitoring System                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Service A   │  │  Service B   │  │  Service C   │      │
│  │  :5000       │  │  :5001       │  │  :5002       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┴──────────────────┘               │
│                            │                                  │
│                    ┌───────▼────────┐                        │
│                    │  Prometheus    │                        │
│                    │  :9090         │                        │
│                    └───────┬────────┘                        │
│                            │                                  │
│              ┌─────────────┼─────────────┐                   │
│              │             │             │                   │
│      ┌───────▼──────┐ ┌───▼───────┐ ┌──▼─────────┐         │
│      │ AlertManager │ │  Grafana  │ │ Dashboard  │         │
│      │ :9093        │ │  :3000    │ │ :8080      │         │
│      └──────────────┘ └───────────┘ └────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Funcionalidades

### Microsserviços
- **Service A, B, C**: Serviços Python/Flask com:
  - Endpoints de health check
  - Endpoints de processamento de dados
  - Simulação de latência variável
  - Geração de métricas customizadas
  - Monitoramento de CPU e memória

### Métricas Coletadas
- **CPU Usage**: Percentual de uso da CPU por serviço
- **Memory Usage**: Percentual de uso de memória
- **Request Count**: Total de requisições HTTP por endpoint
- **Request Duration**: Tempo de resposta das requisições
- **Service Health**: Status de saúde dos serviços (1=saudável, 0=não-saudável)

### Alertas Configurados
- **HighCPUUsage**: Alerta quando CPU > 80% por 2 minutos
- **HighMemoryUsage**: Alerta quando memória > 80% por 2 minutos
- **ServiceDown**: Alerta quando serviço está offline por 1 minuto
- **HighResponseTime**: Alerta quando p95 > 1 segundo por 5 minutos
- **HighErrorRate**: Alerta quando taxa de erro > 10% por 2 minutos
- **ServiceUnhealthy**: Alerta quando health check falha por 1 minuto

### Dashboard Web
- Visualização em tempo real do status dos serviços
- Métricas agregadas (CPU média, memória, requisições totais)
- Histórico de alertas recebidos
- Auto-refresh a cada 5 segundos
- API REST para consulta de métricas e alertas

## 📦 Pré-requisitos

- Docker (20.10+)
- Docker Compose (1.29+)
- 4GB RAM disponível
- Portas disponíveis: 3000, 5000-5002, 8080, 9090, 9093

## 🔧 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/GracieleXavierDoNascimento/ProjetoMonitoramentoMicrosservicos.git
cd ProjetoMonitoramentoMicrosservicos
```

### 2. Inicie o sistema

```bash
docker-compose up -d
```

### 3. Aguarde a inicialização

Aguarde aproximadamente 30-60 segundos para todos os serviços inicializarem completamente.

### 4. Verifique o status

```bash
docker-compose ps
```

Todos os serviços devem estar com status "Up".

## 🌐 Acesso aos Componentes

### Dashboard Web (Principal)
- **URL**: http://localhost:8080
- **Descrição**: Interface web customizada com visualização em tempo real
- **Funcionalidades**:
  - Status dos serviços
  - Métricas do sistema
  - Alertas recentes
  - Links rápidos para outras ferramentas

### Prometheus
- **URL**: http://localhost:9090
- **Usuário**: N/A (sem autenticação)
- **Descrição**: Sistema de coleta e armazenamento de métricas
- **Principais endpoints**:
  - `/graph`: Interface de consulta de métricas
  - `/alerts`: Visualização de alertas ativos
  - `/targets`: Status dos targets monitorados

### Grafana
- **URL**: http://localhost:3000
- **Usuário**: admin
- **Senha**: admin
- **Descrição**: Plataforma de visualização com dashboards pré-configurados
- **Dashboard**: "Microservices Monitoring Dashboard"

### AlertManager
- **URL**: http://localhost:9093
- **Descrição**: Gerenciamento e roteamento de alertas
- **Funcionalidades**:
  - Visualização de alertas
  - Silenciamento de alertas
  - Roteamento para webhooks

### Serviços Individuais
- **Service A**: http://localhost:5000
- **Service B**: http://localhost:5001
- **Service C**: http://localhost:5002

Endpoints disponíveis em cada serviço:
- `/`: Informações básicas
- `/health`: Health check
- `/api/data`: Processamento de dados
- `/api/slow`: Endpoint com latência
- `/api/error`: Endpoint com erros aleatórios
- `/metrics`: Métricas Prometheus

## 📊 Exemplos de Uso

### Consultar métricas via Prometheus

```bash
# CPU usage de todos os serviços
curl 'http://localhost:9090/api/v1/query?query=cpu_usage_percent'

# Requisições por segundo
curl 'http://localhost:9090/api/v1/query?query=rate(http_requests_total[1m])'
```

### Testar os serviços

```bash
# Gerar tráfego para o Service A
for i in {1..100}; do curl http://localhost:5000/api/data; done

# Testar endpoint com erros
curl http://localhost:5000/api/error

# Verificar health
curl http://localhost:5000/health
```

### API do Dashboard

```bash
# Obter status dos serviços
curl http://localhost:8080/api/services/status

# Consultar alertas
curl http://localhost:8080/api/alerts

# Obter alertas ativos
curl http://localhost:8080/api/alerts/active
```

## 🧪 Testando o Sistema

### 1. Verificar métricas básicas

Acesse http://localhost:8080 e observe:
- Status dos serviços (devem estar "healthy")
- CPU e memória de cada serviço
- Métricas agregadas

### 2. Gerar carga nos serviços

```bash
# Script para gerar tráfego
while true; do
  curl http://localhost:5000/api/data &
  curl http://localhost:5001/api/data &
  curl http://localhost:5002/api/data &
  sleep 0.1
done
```

### 3. Observar alertas

Após alguns minutos de carga, você pode ver alertas sendo gerados se:
- CPU ou memória ultrapassar 80%
- Taxa de erro aumentar
- Tempo de resposta ficar alto

### 4. Visualizar no Grafana

1. Acesse http://localhost:3000
2. Login: admin/admin
3. Navegue para "Dashboards" → "Microservices Monitoring Dashboard"
4. Observe os gráficos em tempo real

## 🔄 Gerenciamento

### Parar o sistema

```bash
docker-compose down
```

### Parar e remover volumes (limpar dados)

```bash
docker-compose down -v
```

### Ver logs

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f service-a
docker-compose logs -f prometheus
docker-compose logs -f dashboard
```

### Reiniciar um serviço

```bash
docker-compose restart service-a
```

### Escalar serviços (adicionar mais instâncias)

```bash
docker-compose up -d --scale service-a=3
```

## 🛠️ Configuração

### Personalizar intervalo de scraping do Prometheus

Edite `prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s  # Altere aqui
```

### Adicionar novos alertas

Edite `prometheus/alerts.yml` e adicione novas regras no formato:

```yaml
- alert: NomeDoAlerta
  expr: metrica > threshold
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "Descrição do alerta"
```

### Configurar notificações

Edite `alertmanager/alertmanager.yml` para adicionar receivers:

```yaml
receivers:
  - name: 'email'
    email_configs:
      - to: 'seu-email@exemplo.com'
```

## 📈 Métricas Disponíveis

### Métricas de Sistema
- `cpu_usage_percent`: Uso de CPU (%)
- `memory_usage_percent`: Uso de memória (%)
- `service_health`: Saúde do serviço (0 ou 1)

### Métricas de Aplicação
- `http_requests_total`: Total de requisições HTTP
- `http_request_duration_seconds`: Duração das requisições
- `up`: Status do serviço (0=down, 1=up)

### Exemplos de Queries PromQL

```promql
# CPU médio de todos os serviços
avg(cpu_usage_percent)

# Taxa de requisições por minuto
rate(http_requests_total[1m])

# Percentil 95 do tempo de resposta
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Serviços com CPU > 80%
cpu_usage_percent > 80

# Taxa de erro
rate(http_requests_total{status=~"5.."}[5m])
```

## 🐛 Troubleshooting

### Serviços não inicializam

```bash
# Verificar logs
docker-compose logs

# Reconstruir imagens
docker-compose build --no-cache
docker-compose up -d
```

### Prometheus não encontra targets

1. Verifique se os serviços estão rodando: `docker-compose ps`
2. Acesse http://localhost:9090/targets
3. Verifique a rede Docker: `docker network inspect projetomonitoramentomicrosservicos_monitoring-network`

### Grafana não mostra dados

1. Verifique se o datasource Prometheus está configurado
2. Acesse Configuration → Data Sources
3. Teste a conexão com Prometheus
4. Certifique-se que há dados em Prometheus: http://localhost:9090

### AlertManager não envia alertas

1. Verifique se há alertas ativos em Prometheus: http://localhost:9090/alerts
2. Verifique logs do AlertManager: `docker-compose logs alertmanager`
3. Teste o webhook manualmente:

```bash
curl -X POST http://localhost:8080/api/alerts \
  -H 'Content-Type: application/json' \
  -d '{"alerts": [{"status": "firing", "labels": {"severity": "test"}}]}'
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👥 Autores

- Graciele Xavier do Nascimento

## 🙏 Agradecimentos

- Prometheus Project
- Grafana Labs
- Docker Inc.
- Comunidade Open Source
