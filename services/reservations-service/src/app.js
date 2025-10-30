import amqp from "amqplib";
import express from "express";
import { Client } from "pg";
import { Sequelize } from "sequelize";

const app = express();
app.use(express.json());

// Banco de dados PostgreSQL
const sequelize = new Sequelize("reservasdb", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres",
  port: 5432,
});


// Cria o banco se não existir
const ensureDatabaseExists = async () => {
  const client = new Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "postgres", // conecta ao banco padrão para criar outro
  });

  await client.connect();

  const result = await client.query("SELECT 1 FROM pg_database WHERE datname = 'reservasdb'");
  if (result.rowCount === 0) {
    console.log("🆕 Criando banco de dados reservasdb...");
    await client.query('CREATE DATABASE "reservasdb"');
  } else {
    console.log("✅ Banco reservasdb já existe.");
  }

  await client.end();
};

await ensureDatabaseExists();


// Modelo simples
const Reservation = sequelize.define("Reservation", {
  user_id: { type: Sequelize.INTEGER, allowNull: false },
  accommodation_id: { type: Sequelize.INTEGER, allowNull: false },
  start_date: { type: Sequelize.DATE, allowNull: false },
  end_date: { type: Sequelize.DATE, allowNull: false },
  status: { type: Sequelize.STRING, defaultValue: "CREATED" },
});

// Endpoint: criar reserva
app.post("/reservas", async (req, res) => {
  try {
    const { user_id, accommodation_id, start_date, end_date } = req.body;
    const reservation = await Reservation.create({
      user_id,
      accommodation_id,
      start_date,
      end_date,
    });

    // Publicar no RabbitMQ
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertExchange("reservations", "fanout", { durable: false });
    channel.publish("reservations", "", Buffer.from(JSON.stringify(reservation)));
    console.log("📤 Enviado ao RabbitMQ:", reservation.toJSON());

    res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar reserva" });
  }
});

// Inicialização
const PORT = 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.sync();
    console.log(`🚀 Reservations Service rodando na porta ${PORT}`);
  } catch (err) {
    console.error("Erro ao conectar ao banco:", err);
  }
});

