export interface Notification {
  id_notifications: number;
  user_id: number | undefined;
  text: string;
  flag: boolean;
  datetime: string;
}