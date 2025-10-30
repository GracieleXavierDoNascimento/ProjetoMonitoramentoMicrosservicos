import express from "express";
import { Reservation } from "../models/reservation.model.js";
import { publishEvent } from "../rabbitmq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { user_id, accommodation_id, start_date, end_date } = req.body;
    const reservation = await Reservation.create({
      user_id,
      accommodation_id,
      start_date,
      end_date,
      status: "CREATED",
    });

    await publishEvent("reservations.created", {
      reservation_id: reservation.id,
      user_id,
      accommodation_id,
      start_date,
      end_date,
      status: "CREATED",
      trace_id: `trace-${Date.now()}`,
    });

    res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar reserva" });
  }
});

router.get("/", async (_, res) => {
  const reservations = await Reservation.findAll();
  res.json(reservations);
});

router.get("/:id", async (req, res) => {
  const reservation = await Reservation.findByPk(req.params.id);
  if (!reservation) return res.status(404).json({ message: "Não encontrada" });
  res.json(reservation);
});

export default router;
