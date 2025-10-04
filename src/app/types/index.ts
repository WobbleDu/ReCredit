export interface Notification {
  id_notifications: number;
  user_id: number | undefined;
  text: string;
  flag: boolean;
  datetime: string;
}
export interface UserData {
  id_user: number;
  login: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  phonenumber: string;
  inn: string;
  passportserie: number;
  passportnumber: number;
  income: number;
  country: string;
  dti: number
}

export interface Offer {
  id_offer: number;
  type: string;
  creditsum: number;
  interestrate: number;
  state: number;
  datestart: string | null;
  dateend: string | null;
  owner_id: number | null;
  guest_id: number | null;
  owner_firstname: string | null;
  owner_lastname: string | null;
}