import amqplib from "amqplib";

const RABBIT_URL = "amqp://localhost:5673";
const QUEUE_NAME = "reservations_queue";

async function startConsumer() {
  const connection = await amqplib.connect(RABBIT_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  console.log("📩 Notificações aguardando eventos...");

  channel.consume(QUEUE_NAME, (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      console.log("📨 Mensagem recebida:", data);

      // Simula envio de notificação
      console.log(`✅ Notificação enviada ao usuário ${data.user_id} sobre reserva ${data.reservation_id}`);

      // Confirma processamento
      channel.ack(msg);
    }
  });
}

startConsumer().catch(console.error);
