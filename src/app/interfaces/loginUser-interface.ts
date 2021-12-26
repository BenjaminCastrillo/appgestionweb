export interface LoginResponse {
  result:  boolean;
  data:    LoginUser[];
  token?:   string;
  message: null;
}

export interface LoginUser {
  user:             string;
  password:          string;
  app:               string;
  id?:               number;
  name?:             string;
  surname?:          string;
}