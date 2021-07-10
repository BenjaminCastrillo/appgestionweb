export interface UsersResponse {
  result:  boolean;
  data:    User[];
  message: null;
}

export interface User {
  id:               number;
  name:             string;
  surname:          string;
  lastAccess:       null;
  notes:            null;
  email:            string;
  password:         null;
  customerUserList: CustomerUserList[];
  relationship:     null | string;
  rol:              Rol;
  sitesLists:       SitesList[];
  categories:       Category[];
}

export interface Category {
  id: number;
  description: string;
}
export interface Rol {
  id_category: number;
  description: string;
  color:       string;
}

export interface CustomerUserList {
  id:          number;
  id_customer: number;
  name:        string;
  exception:   number;
}

export interface SitesList {
  id_site: number;
}
