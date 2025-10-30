import amqp from "amqplib";

export const startConsumer = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
    const channel = await connection.createChannel();
    const queue = "reservations.created";

    await channel.assertQueue(queue, { durable: true });

    console.log(`📥 Aguardando mensagens na fila '${queue}'...`);

    channel.consume(queue, (msg) => {
      const data = JSON.parse(msg.content.toString());
      console.log(`📧 Notificação enviada ao usuário ${data.user_id} da reserva ${data.reservation_id}`);
      console.log("Trace:", data.trace_id);
      channel.ack(msg);
    });
  } catch (err) {
    console.error("❌ Erro ao consumir RabbitMQ:", err.message);
  }
};
