import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  sub: string;

  @Prop()
  name: string;

  @Prop()
  givenName: string;

  @Prop()
  familyName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  picture: string;

  @Prop()
  emailVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
