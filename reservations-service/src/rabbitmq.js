import amqp from "amqplib";

let channel;

export const connectRabbit = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
    channel = await connection.createChannel();
    console.log("🐇 Conectado ao RabbitMQ");
  } catch (err) {
    console.error("❌ Erro ao conectar RabbitMQ:", err.message);
  }
};


async function publishToQueue(queueName, message) {
  const ch = await connectRabbitMQ();

  // Garante que a fila existe (persistente)
  await ch.assertQueue(queueName, {
    durable: true
  });

  ch.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );

  console.log(`📤 Enviado ao RabbitMQ:`, message);
}



export const publishEvent = async (queue, message) => {
  if (!channel) {
    console.error("⚠️ Canal RabbitMQ não inicializado");
    return;
  }
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`📤 Evento publicado em '${queue}':`, message);
};
