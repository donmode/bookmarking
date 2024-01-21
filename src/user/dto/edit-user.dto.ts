import {
  IsOptional,
  IsString,
} from "class-validator";

export class EditUserDto {
  @IsString()
  @IsOptional()
  firstname?: string;
  @IsString()
  @IsOptional()
  middlename?: string;
  @IsString()
  @IsOptional()
  lastname?: string;
}
