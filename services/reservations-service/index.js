import amqplib from "amqplib";
import express from "express";
import { connectDB } from "./src/db.js";
import { Reservation } from "./src/model/reservationModel.js";

const app = express();
app.use(express.json());

const RABBIT_URL = "amqp://localhost:5672";
const QUEUE_NAME = "reservations_queue";

let channel;

// conecta ao RabbitMQ
async function connectRabbit() {
  const connection = await amqplib.connect(RABBIT_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  console.log("🐇 Conectado ao RabbitMQ!");
}

// cria uma nova reserva
app.post("/reservations", async (req, res) => {
  try {
    const data = req.body;
    const reservation = await Reservation.create(data);

    // envia mensagem para RabbitMQ
    const event = {
      reservation_id: reservation.id,
      user_id: reservation.user_id,
      accommodation_id: reservation.accommodation_id,
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      trace_id: `trace-${Date.now()}`
    };

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(event)));
    console.log("📤 Evento publicado no RabbitMQ:", event);

    res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar reserva" });
  }
});

// lista todas as reservas
app.get("/reservations", async (req, res) => {
  const reservations = await Reservation.findAll();
  res.json(reservations);
});

// busca reserva por id
app.get("/reservations/:id", async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada" });
  res.json(reservation);
});

// inicializa servidor e conexões
const PORT = 3002;
app.listen(PORT, async () => {
  await connectDB();
  await Reservation.sync();
  await connectRabbit();
  console.log(`🚀 Reservations service rodando na porta ${PORT}`);
});
