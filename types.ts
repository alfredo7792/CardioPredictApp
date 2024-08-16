import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  FormNewUser: undefined;
  FormEditUser: { userId: number }; // Aquí defines el parámetro que acepta la ruta
};