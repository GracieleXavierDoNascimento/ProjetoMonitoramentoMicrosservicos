import { connect } from "amqplib";

async function startConsumer() {
  try {
    const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5673/";

    // Cria conexão e canal
    const connection = await connect(RABBIT_URL);
    const channel = await connection.createChannel();

    // Garante que a fila existe e é persistente
    await channel.assertQueue("reservas_criadas", { durable: true });
    console.log("✅ Conectado ao RabbitMQ");
    console.log("👂 Aguardando mensagens na fila 'reservas_criadas'...");

    // Consome mensagens
    channel.consume("reservas_criadas", (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        console.log("📥 Nova reserva recebida:");
        console.log(data);

        // Aqui você pode processar — salvar em outro banco, enviar e-mail, etc.
        // Exemplo:
        // sendEmail(data.user_id, data.status);

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("❌ Erro no consumidor:", error);
    setTimeout(startConsumer, 5000); // Tenta reconectar automaticamente
  }
}

startConsumer();
