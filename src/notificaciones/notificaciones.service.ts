import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { CrearNotificacionDto } from './dto/crear-notificacion.dto.js';
import { Notificacion } from './schemas/notificacion.schema.js';

// Código de Mongo cuando se viola un índice único
const LLAVE_DUPLICADA = 11000;

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectModel(Notificacion.name)
    private readonly notificacionModel: Model<Notificacion>,
  ) {}

  async crear(dto: CrearNotificacionDto): Promise<{ id: string }> {
    try {
      const notificacion = await this.notificacionModel.create(dto);
      return { id: notificacion.id };
    } catch (error) {
      if ((error as { code?: number }).code !== LLAVE_DUPLICADA) throw error;

      // Mismo evento repetido (ej. un reintento de Polly): devolvemos la que ya existe
      const existente = await this.notificacionModel
        .findOne({ evento_id: dto.evento_id })
        .select('_id')
        .lean();
      return { id: String(existente!._id) };
    }
  }

  async listarPorUsuario(usuarioId: number) {
    const notificaciones = await this.notificacionModel
      .find({ usuario_id: usuarioId })
      .sort({ fecha_creacion: -1 })
      .limit(50)
      .lean();

    return notificaciones.map(({ _id, usuario_id, ...resto }) => ({
      id: String(_id),
      ...resto,
    }));
  }

  async marcarLeida(id: Types.ObjectId, usuarioId: number): Promise<void> {
    const resultado = await this.notificacionModel.updateOne(
      { _id: id, usuario_id: usuarioId },
      { leida: true },
    );

    if (resultado.matchedCount === 0) {
      throw new NotFoundException('Notificación no encontrada');
    }
  }
}