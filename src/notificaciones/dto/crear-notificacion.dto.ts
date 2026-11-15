import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearNotificacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  evento_id: string;

  @IsInt()
  usuario_id: number;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @IsOptional()
  @IsInt()
  referencia_id?: number;
}