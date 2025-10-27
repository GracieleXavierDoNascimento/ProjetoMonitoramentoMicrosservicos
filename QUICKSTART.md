# 🚀 Guia de Início Rápido

## 1. Iniciar o Sistema

```bash
# No diretório raiz do projeto
docker-compose up -d
```

Aguarde cerca de 30 segundos para todos os serviços inicializarem.

## 2. Verificar Status

```bash
docker-compose ps
```

Você deve ver todos os serviços com status "Up":
- monitoring-service-a
- monitoring-service-b
- monitoring-service-c
- monitoring-prometheus
- monitoring-alertmanager
- monitoring-grafana
- monitoring-dashboard

## 3. Acessar o Dashboard

Abra seu navegador em: **http://localhost:8080**

Você verá:
- ✅ Status dos 3 microsserviços
- 📊 Métricas em tempo real (CPU, memória, requisições)
- 🔔 Alertas recentes
- 🔗 Links rápidos para Prometheus, Grafana e AlertManager

## 4. Explorar Outras Interfaces

### Prometheus (Métricas)
- URL: http://localhost:9090
- Use a aba "Graph" para consultas
- Exemplos de queries:
  - `cpu_usage_percent`
  - `rate(http_requests_total[1m])`
  - `memory_usage_percent`

### Grafana (Visualização)
- URL: http://localhost:3000
- Login: `admin` / `admin`
- Dashboard: "Microservices Monitoring Dashboard"

### AlertManager (Alertas)
- URL: http://localhost:9093
- Visualize alertas ativos e histórico

## 5. Gerar Carga para Testes

Execute o script de geração de carga:

```bash
# Gerar carga por 60 segundos
./test-load.sh 60

# Ou manualmente
for i in {1..100}; do
  curl http://localhost:5000/api/data &
  curl http://localhost:5001/api/data &
  curl http://localhost:5002/api/data &
done
```

## 6. Observar Métricas em Tempo Real

1. No Dashboard (http://localhost:8080):
   - Atualizações automáticas a cada 5 segundos
   - Observe CPU e memória aumentando
   - Contador de requisições subindo

2. No Grafana:
   - Gráficos de séries temporais
   - Diferentes visualizações

## 7. Testar Alertas

Gerar carga alta para disparar alertas:

```bash
# Loop contínuo (Ctrl+C para parar)
while true; do
  curl http://localhost:5000/api/data &
  curl http://localhost:5000/api/slow &
  curl http://localhost:5001/api/data &
  curl http://localhost:5002/api/data &
  sleep 0.01
done
```

Aguarde alguns minutos e verifique:
- Dashboard → Seção "Recent Alerts"
- Prometheus → http://localhost:9090/alerts
- AlertManager → http://localhost:9093

## 8. API do Dashboard

### Status dos Serviços
```bash
curl http://localhost:8080/api/services/status | jq
```

### Alertas Recebidos
```bash
curl http://localhost:8080/api/alerts | jq
```

### Consultar Métricas
```bash
curl -X POST http://localhost:8080/api/metrics/query \
  -H 'Content-Type: application/json' \
  -d '{"query": "cpu_usage_percent"}' | jq
```

## 9. Parar o Sistema

```bash
# Parar containers
docker-compose down

# Parar e remover volumes (limpar todos os dados)
docker-compose down -v
```

## 10. Troubleshooting Rápido

### Serviço não responde
```bash
docker-compose restart service-a
```

### Ver logs
```bash
docker-compose logs -f service-a
docker-compose logs -f prometheus
```

### Reconstruir tudo
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Próximos Passos

- Explore as queries do Prometheus
- Customize os dashboards do Grafana
- Configure alertas personalizados
- Adicione novos microsserviços
- Integre com sistemas de notificação (email, Slack, etc.)

## 🆘 Ajuda

Consulte o README.md completo para:
- Arquitetura detalhada
- Configurações avançadas
- Troubleshooting completo
- Exemplos de uso da API
